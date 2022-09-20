import createSemaphore from 'semapro';
import fs from 'fs-extra';
import parseArgs from 'minimist';
import {dirname, join, relative} from 'node:path';

const cwd = process.cwd();
const cmd = relative(cwd, process.argv[1]);

const usage = `
Usage:
  node ${cmd} <url> [options]

Options:
  --min=<zoom>        Minimum zoom level (default is 0).
  --max=<zoom>        Minimum zoom level (default is 3).
  --out=<dir>         Minimum zoom level (default is ${cwd}).
  --concurrency=<n>   Number of concurrent downloads (default is 8).

Example:
  node ${cmd} https://tile.openstreetmap.org/{z}/{x}/{y}.png --min=0 --max=2 --out=tests/rendering/data/tiles/osm
`;

function fatal(message) {
  process.stderr.write(`${message}\n${usage}\n`, () => process.exit(1));
}

async function main(args) {
  const url = args._[0];
  if (!url) {
    fatal('Missing URL');
  }
  ['z', 'x', 'y'].forEach(key => {
    const param = `{${key}}`;
    if (!url.includes(param)) {
      fatal(`Missing ${param} in URL`);
    }
  });

  const min = args.min ? parseInt(args.min, 10) : 0;
  if (isNaN(min)) {
    fatal(`Invalid minimum zoom level: ${args.min}`);
  }

  const max = args.max ? parseInt(args.max, 10) : 3;
  if (isNaN(max)) {
    fatal(`Invalid maximum zoom level: ${args.max}`);
  }

  const concurrency = args.concurrency ? parseInt(args.concurrency, 10) : 8;
  if (isNaN(max) || concurrency < 1) {
    fatal(`Invalid concurrency: ${args.concurrency}`);
  }

  const out = args.out || cwd;

  await download({url, min, max, concurrency, out});
}

async function download({url, min, max, concurrency, out}) {
  const semaphore = createSemaphore(concurrency);
  const jobs = [];

  for (let z = min; z <= max; ++z) {
    const size = Math.pow(2, z);
    for (let y = 0; y < size; ++y) {
      for (let x = 0; x < size; ++x) {
        const tileUrl = url
          .replace('{z}', z)
          .replace('{x}', x)
          .replace('{y}', y);
        const outputPath = join(out, `${z}/${x}/${y}.png`);

        jobs.push(
          semaphore(async () => {
            return downloadTile(tileUrl, outputPath);
          })
        );
      }
    }
  }

  await Promise.all(jobs);
}

async function downloadTile(url, outputPath) {
  await fs.ensureDir(dirname(outputPath));

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(buffer));
}

main(parseArgs(process.argv.slice(2))).catch(err =>
  process.stderr.write(err.stack, () => process.exit(1))
);

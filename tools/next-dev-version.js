import {dirname, join} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import fse from 'fs-extra';
import semver from 'semver';

const baseDir = dirname(fileURLToPath(import.meta.url));

async function main() {
  const pkg = await fse.readJSON(join(baseDir, '../package.json'));
  const version = pkg.version;
  const s = semver.parse(version);
  if (!s) {
    throw new Error(`Invalid version ${version}`);
  }
  return `${s.major}.${s.minor}.${s.patch}-dev.${Date.now()}`;
}

if (import.meta.main) {
  main()
    .then(version => {
      process.stdout.write(`${version}\n`);
    })
    .catch(error => {
      process.stderr.write(`${error}\n`);
      process.exit(1);
    });
}

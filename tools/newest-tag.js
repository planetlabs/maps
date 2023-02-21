import esMain from 'es-main';
import parseArgs from 'yargs-parser';
import semver from 'semver';
import {getLatestRelease} from './get-latest-release.js';

/**
 * @typedef {Object} Options
 * @property {string} tag The tag.
 */

/**
 * Check if a tag is ahead of the latest release.
 * @param {Options} options The options.
 * @return {boolean} The provided tag is ahead of or equal to the latest release.
 */
async function main(options) {
  const version = semver.valid(options.tag);
  if (!version) {
    return false;
  }

  const parsed = semver.parse(version);
  if (parsed.prerelease.length) {
    return false;
  }

  const latest = await getLatestRelease();
  return semver.gte(version, latest);
}

if (esMain(import.meta)) {
  const options = parseArgs(process.argv.slice(2));
  if (!options.tag) {
    process.stderr.write('missing --tag\n');
    process.exit(1);
  }

  main(options)
    .then(newest => {
      if (newest) {
        process.stdout.write('true\n', () => process.exit(0));
      } else {
        process.stderr.write('false\n', () => process.exit(1));
      }
    })
    .catch(err => {
      process.stderr.write(`${err.stack}\n`, () => process.exit(1));
    });
}

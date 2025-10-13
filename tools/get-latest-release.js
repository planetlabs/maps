import {Octokit} from '@octokit/rest';
import semver from 'semver';

export async function getLatestRelease() {
  const client = new Octokit();

  let latest = '0.0.0';
  await client.paginate(
    client.rest.repos.listReleases,
    {
      owner: 'planetlabs',
      repo: 'maps',
    },
    response => {
      for (const release of response.data) {
        const version = semver.valid(release.name);
        if (version && semver.gt(version, latest)) {
          latest = version;
        }
      }
    },
  );

  return latest;
}

if (import.meta.main) {
  getLatestRelease()
    .then(latest => {
      process.stdout.write(`v${latest}\n`, () => process.exit(0));
    })
    .catch(err => {
      process.stderr.write(`${err.message}\n`, () => process.exit(1));
    });
}

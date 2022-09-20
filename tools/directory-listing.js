import {readdirSync} from 'node:fs';

function include() {
  return true;
}

/**
 * A plugin for Vite that provides a directory listing.  If Vite is configured with this
 * plugin, modules can import the virtual `virtual:directory-listing` module to get a directory
 * listing.
 *
 *     import {list} from 'virtual:directory-listing'; // eslint-disable-line import/no-unresolved
 *
 * @param {string} dir Path to directory to list.
 * @param {function(Object): boolean} [filter] Optional filter called with each directory entry.
 * @return {Object} A plugin.
 */
export default function directoryListing(dir, filter = include) {
  const virtualModuleId = 'virtual:directory-listing';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'directory-listing',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const list = readdirSync(dir, {withFileTypes: true})
          .filter(filter)
          .map(entry => entry.name);

        return `export const list = ${JSON.stringify(list)};`;
      }
    },
  };
}

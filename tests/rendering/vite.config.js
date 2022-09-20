import directoryListing from '../../tools/directory-listing.js';
import {defineConfig} from 'vite';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const casesDir = join(dirname(fileURLToPath(import.meta.url)), 'cases');

export default defineConfig({
  root: 'tests/rendering',
  assetsInclude: ['data/**/*'],
  server: {
    port: 3210,
    host: true,
    strictPort: true,
  },
  plugins: [directoryListing(casesDir, entry => entry.isDirectory())],
});

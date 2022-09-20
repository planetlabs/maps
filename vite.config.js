import {defineConfig} from 'vite';

export default defineConfig({
  root: 'examples',
  envDir: '..',
  build: {
    sourcemap: true,
    outDir: '../dist',
  },
});

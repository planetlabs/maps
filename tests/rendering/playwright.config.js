import viteConfig from './vite.config.js';

const url = `http://localhost:${viteConfig.server.port}`;

export function getUrl(name) {
  return `${url}/cases/${name}/`;
}

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  webServer: {
    command: 'npm run start:rendering',
    url,
    timeout: 2 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    headless: true,
    browserName: 'chromium',
    viewport: {width: 350, height: 350},
    video: 'on-first-retry',
  },
};

export default config;

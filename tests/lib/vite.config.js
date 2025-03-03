import {defineConfig} from 'vite';

export default defineConfig({
  test: {
    browser: {
      instances: [
        {
          browser: 'chromium',
        },
      ],
      enabled: true,
      provider: 'playwright',
      headless: true,
      screenshotFailures: false,
    },
  },
});

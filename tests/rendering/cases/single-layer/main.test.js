import {expect, test} from '@playwright/test';
import {getUrl} from '../../playwright.config.js';

test('single-layer', async ({page}) => {
  await page.goto(getUrl('single-layer'), {waitUntil: 'networkidle'});
  await expect(page).toHaveScreenshot();
});

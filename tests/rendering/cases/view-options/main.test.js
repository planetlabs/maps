import {expect, test} from '@playwright/test';
import {getUrl} from '../../playwright.config.js';

test('view-options', async ({page}) => {
  await page.goto(getUrl('view-options'), {waitUntil: 'networkidle'});
  await expect(page).toHaveScreenshot();
});

import {expect, test} from '@playwright/test';
import {getUrl} from '../../playwright.config.js';

test('view-update', async ({page}) => {
  await page.goto(getUrl('view-update'), {waitUntil: 'networkidle'});
  await page.locator('#view-update-button').click();
  await expect(page).toHaveScreenshot();
});

import { test, expect } from '@playwright/test';

test.describe('Simple Test', () => {
  test('should open a basic page', async ({ page }) => {
    // Rather than relying on the webServer config, let's test the server directly
    // This assumes you have the server running on port 3000
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1:has-text("Taken?")')).toBeVisible();
  });
});

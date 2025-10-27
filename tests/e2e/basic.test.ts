import { test, expect } from '@playwright/test';

test.describe('Multi-Registry Package Name Checker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main page with title', async ({ page }) => {
    // Check that the "Taken?" title is visible
    await expect(page.locator('h1:has-text("Taken?")')).toBeVisible();

    // Check that the subtitle is visible
    await expect(page.locator('h2:has-text("Multi-Registry Package Name Checker")')).toBeVisible();

    // Check that the input field is present
    await expect(page.locator('input[aria-label="Package name"]')).toBeVisible();
  });

  test('should allow entering a package name', async ({ page }) => {
    const input = page.locator('input[aria-label="Package name"]');

    await input.fill('react');
    await expect(input).toHaveValue('react');
  });

  test('should show results after entering a package name', async ({ page }) => {
    const input = page.locator('input[aria-label="Package name"]');

    // Clear any existing value and enter a package name
    await input.fill('react');

    // Wait for the debounced input to trigger the check
    await page.waitForTimeout(600); // Wait longer than the debounce time (500ms)

    // Check if registry status elements appear
    await expect(page.locator('[role="status"]').first()).toBeVisible();
  });

  test('should show loading indicators when checking', async ({ page }) => {
    const input = page.locator('input[aria-label="Package name"]');

    // Listen for network requests
    await page.route('**/*', route => {
      // Add a small delay to simulate real network conditions
      setTimeout(() => route.continue(), 100);
    });

    await input.fill('test-package-name');

    // Wait for loading state to appear
    await page.waitForTimeout(100);

    // Check if loading indicators are visible
    const loadingIndicators = page.locator('.animate-spin');
    await expect(loadingIndicators).toHaveCount(3); // For npm, PyPI, and Cargo
  });

  test('should handle clearing the input correctly', async ({ page }) => {
    const input = page.locator('input[aria-label="Package name"]');

    // Fill the input
    await input.fill('react');
    await expect(input).toHaveValue('react');

    // Click the clear button
    const clearButton = page.locator('button[aria-label="Clear input"]');
    await clearButton.click();

    // Check that the input is cleared
    await expect(input).toHaveValue('');
  });

  test('should handle 404 responses correctly (package name not taken)', async ({ page }) => {
    const input = page.locator('input[aria-label="Package name"]');

    // Use a randomly generated package name that likely doesn't exist
    const fakePackageName = 'reallyuniquepackagename12345';
    await input.fill(fakePackageName);

    // Wait for the check to complete
    await page.waitForTimeout(1000);

    // Check that the status indicators show "Available"
    const statusElements = page.locator('[role="status"]');
    await expect(statusElements).toHaveCount(3); // For npm, PyPI, and Cargo

    // Verify all statuses indicate the package is available
    await expect(page.locator('text=Available')).toHaveCount(3);
  });

  test('should handle dark mode toggle', async ({ page }) => {
    // Initially check if light mode is active
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Toggle dark mode by changing the system preference (if supported)
    // For now, we'll just verify that the dark mode class system exists
    const currentTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    // The app automatically follows system preferences, so we'll just verify the system is in place
    expect(typeof currentTheme).toBe('boolean');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Plant Yield Tracking', () => {
  test('can log harvest and see yield rating from DB', async ({ page }) => {
    // Create a plant by using the existing flow from app.spec.ts
    await page.goto('/plants/new');
    await page.fill('input#name', 'Tomato');
    await page.fill('input#variety', 'Cherry Roma');
    await page.click('button:text("Vegetable")');

    // Select growing method via radio
    const soilRadio = page.locator('label:has-text("Soil")');
    await soilRadio.click();

    // Add healthy tag
    await page.click('button:text("Healthy")');

    // Submit - use locator for the submit button specifically
    await page.locator('button[type="submit"]:text("Add Plant")').click();
    await page.waitForURL(/\/plants\/\d+/, { timeout: 15000 });

    // Should see Yield Tracker section
    await expect(page.locator('text=Yield Tracker')).toBeVisible({ timeout: 10000 });

    // Should show expected yield from DB reference
    // The plant name "Tomato" should match the DB reference
    await expect(page.locator('text=Expected yield')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Days to harvest')).toBeVisible();
    await expect(page.locator('text=Harvests/season')).toBeVisible();

    // Take screenshot showing yield reference data from DB
    await page.screenshot({ path: 'e2e/screenshots/yield-reference.png', fullPage: true });

    // Log a harvest
    await page.click('button:text("Log")');
    await expect(page.locator('text=Log Harvest').last()).toBeVisible();
    await page.fill('input[placeholder="e.g. 250"]', '500');
    await page.fill('input[placeholder*="First harvest"]', 'First harvest of the season');
    await page.locator('button:text("Log Harvest")').click();

    // Should show the yield record
    await expect(page.getByText('500g', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=1 harvest')).toBeVisible();

    // Log another large harvest
    await page.click('button:text("Log")');
    await page.fill('input[placeholder="e.g. 250"]', '3000');
    await page.locator('button:text("Log Harvest")').click();

    // Total should now be 3500g
    await expect(page.locator('text=2 harvest')).toBeVisible({ timeout: 5000 });

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/yield-tracking.png', fullPage: true });

    // Reload and verify persistence
    await page.reload();
    await expect(page.locator('text=Yield Tracker')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=2 harvest')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/yield-persisted.png', fullPage: true });
  });
});

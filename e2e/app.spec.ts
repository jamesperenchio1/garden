import { test, expect } from '@playwright/test';

test.describe('Garden Companion App', () => {
  test('dashboard loads with navigation and widgets', async ({ page }) => {
    await page.goto('/');

    // Sidebar navigation should be visible
    await expect(page.locator('[data-slot="sidebar"]')).toBeVisible();

    // Dashboard header
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Stats cards should show
    await expect(page.locator('text=Total Plants')).toBeVisible();
    await expect(page.locator('text=Systems')).toBeVisible();
    await expect(page.locator('text=Healthy')).toBeVisible();

    // Quick actions
    await expect(page.locator('text=Add Plant')).toBeVisible();
    await expect(page.locator('text=Check Weather')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/dashboard.png', fullPage: true });
  });

  test('navigation works between all pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to My Plants
    await page.goto('/plants');
    await expect(page.locator('text=No plants yet')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/plants.png', fullPage: true });

    // Navigate to Weather
    await page.goto('/weather');
    await expect(page.getByRole('heading', { name: /Weather/i })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/weather.png', fullPage: true });

    // Navigate to Calendar
    await page.goto('/calendar');
    await expect(page.getByRole('heading', { name: /Calendar/i }).first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/calendar.png', fullPage: true });

    // Navigate to Companions
    await page.goto('/companions');
    await expect(page.getByRole('heading', { name: /Companion/i }).first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/companions.png', fullPage: true });

    // Navigate to Nutrients
    await page.goto('/nutrients');
    await expect(page.getByRole('heading', { name: /Nutrient/i }).first()).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/nutrients.png', fullPage: true });

    // Navigate to System Designer
    await page.goto('/designer');
    await expect(page.getByRole('heading', { name: /Hydroponic/i })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/designer.png', fullPage: true });

    // Navigate to Soil Planner
    await page.goto('/soil');
    await expect(page.getByRole('tab', { name: 'Garden Beds' })).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/soil.png', fullPage: true });
  });

  test('can create a plant and it persists after reload', async ({ page }) => {
    await page.goto('/plants/new');

    // Fill in plant name
    await page.fill('input#name', 'Thai Basil Test');
    await page.fill('input#variety', 'Sweet Basil');

    // Select category (click Herb button)
    await page.click('button:text("Herb")');

    // Select growing method (click Hydroponic radio)
    await page.click('text=Hydroponic');

    // Set health status
    await page.click('button:text("Healthy")');

    // Submit
    await page.click('button:text("Add Plant")');

    // Should redirect to plant detail
    await page.waitForURL(/\/plants\/\d+/);
    await expect(page.locator('text=Thai Basil Test')).toBeVisible();
    await expect(page.locator('text=Sweet Basil')).toBeVisible();

    // Take screenshot of plant detail
    await page.screenshot({ path: 'e2e/screenshots/plant-detail.png', fullPage: true });

    // Navigate to plants list
    await page.getByRole('link', { name: 'My Plants' }).click();
    await expect(page).toHaveURL('/plants');
    await expect(page.locator('text=Thai Basil Test')).toBeVisible();

    // PERSISTENCE TEST: Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Plant should still be there after reload
    await expect(page.locator('text=Thai Basil Test')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/plants-persisted.png', fullPage: true });
  });

  test('weather page loads with header', async ({ page }) => {
    await page.goto('/weather');

    // Weather page header should be visible
    await expect(page.getByRole('heading', { name: /Weather/i })).toBeVisible();

    // Page should render (loading or loaded)
    await page.screenshot({ path: 'e2e/screenshots/weather-page.png', fullPage: true });
  });

  test('companion planting lookup works', async ({ page }) => {
    await page.goto('/companions');

    // Click on Tomato
    await page.click('button:text("Tomato")');

    // Should show companions for Tomato
    await expect(page.locator('text=All companions for Tomato')).toBeVisible();

    // Click on Basil to compare
    await page.click('button:text("Basil")');

    // Should show compatibility result (use first match)
    await expect(page.locator('text=Good Companion').first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/companions-lookup.png', fullPage: true });

    // Switch to grid view
    await page.click('button:text("Compatibility Grid")');
    await page.screenshot({ path: 'e2e/screenshots/companions-grid.png', fullPage: true });
  });

  test('nutrient calculator computes values', async ({ page }) => {
    await page.goto('/nutrients');

    // Simple mode - select brand
    await page.click('[data-slot="select-trigger"]:near(:text("Nutrient Brand"))');
    await page.click('text=General Hydroponics Flora Series');

    // Select plant
    await page.click('[data-slot="select-trigger"]:near(:text("Plant Type"))');
    await page.click('text=Tomato');

    // Should show mixing instructions
    await expect(page.locator('text=Mixing Instructions')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/nutrients-simple.png', fullPage: true });

    // Switch to advanced mode
    await page.click('button:text("Advanced Mode")');

    // Select plant and stage
    await page.click('[data-slot="select-trigger"]:near(:text("Plant"))');
    await page.click('text=Tomato');
    await page.click('[data-slot="select-trigger"]:near(:text("Growth Stage"))');
    await page.click('text=fruiting');

    // Should show NPK values
    await expect(page.locator('text=Macronutrients')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/nutrients-advanced.png', fullPage: true });
  });

  test('calendar shows Thai planting guide', async ({ page }) => {
    await page.goto('/calendar');

    // Switch to planting guide tab
    await page.click('button:text("Planting Guide")');

    // Should show sow/transplant/harvest columns
    await expect(page.locator('text=Sow Now')).toBeVisible();
    await expect(page.getByText('Transplant', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Harvest', { exact: true }).first()).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/calendar-planting.png', fullPage: true });

    // Moon calendar tab
    await page.click('button:text("Moon Calendar")');
    await expect(page.locator('text=Moon Phase Calendar')).toBeVisible();
    await page.screenshot({ path: 'e2e/screenshots/calendar-moon.png', fullPage: true });
  });
});

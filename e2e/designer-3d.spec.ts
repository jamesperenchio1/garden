import { test, expect } from '@playwright/test';

test.describe('3D Hydroponic Designer', () => {
  test('create system and verify 3D WebGL canvas renders', async ({ page }) => {
    await page.goto('/designer');
    await expect(page.getByRole('heading', { name: /Hydroponic/i })).toBeVisible();

    // Open new system dialog
    await page.locator('button:text("New System")').last().click();
    await expect(page.locator('text=System Name')).toBeVisible({ timeout: 5000 });

    // Fill name and select type
    await page.fill('input[placeholder*="Rooftop"]', 'Test NFT System');
    await page.locator('button:has-text("Nutrient Film")').click();
    await page.locator('button:text("Create & Open")').click();

    // Wait for editor page
    await page.waitForURL(/\/designer\/\d+/, { timeout: 15000 });
    await expect(page.locator('text=Test NFT System')).toBeVisible({ timeout: 10000 });

    // Wait for WebGL canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Take screenshot of 3D scene with grid floor
    await page.screenshot({ path: 'e2e/screenshots/designer-3d-empty.png', fullPage: true });

    // Verify component panel is present
    await expect(page.locator('text=Components').first()).toBeVisible();

    // New explicit-place flow: click a type to arm, click the canvas to drop.
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('canvas bounding box missing');
    const placeAt = async (offsetX: number, offsetY: number) => {
      await page.mouse.click(
        canvasBox.x + canvasBox.width / 2 + offsetX,
        canvasBox.y + canvasBox.height / 2 + offsetY,
      );
      await page.waitForTimeout(150);
    };

    await page.locator('button:has-text("Water / nutrient")').click();
    await placeAt(-80, 0);
    await page.locator('button:has-text("Moves nutrient")').click();
    await placeAt(0, 0);
    await page.locator('button:has-text("NFT or rail")').click();
    await placeAt(80, 0);

    await page.waitForTimeout(500);

    // Verify 3 components in scene
    await expect(page.locator('text=In Scene (3)')).toBeVisible();

    // Screenshot with components in 3D
    await page.screenshot({ path: 'e2e/screenshots/designer-3d-components.png', fullPage: true });

    // Save
    const toolbar = page.locator('.border-b');
    await toolbar.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500);

    // Reload to verify IndexedDB persistence
    await page.reload();
    await expect(canvas).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=In Scene (3)')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/designer-3d-persisted.png', fullPage: true });
  });

  test('component connections and flow simulation controls', async ({ page }) => {
    await page.goto('/designer');

    // Create system
    await page.locator('button:text("New System")').last().click();
    await page.fill('input[placeholder*="Rooftop"]', 'Flow Test');
    await page.locator('button:has-text("Deep Water")').click();
    await page.locator('button:text("Create & Open")').click();

    await page.waitForURL(/\/designer\/\d+/, { timeout: 15000 });
    const canvas2 = page.locator('canvas');
    await expect(canvas2).toBeVisible({ timeout: 15000 });

    // Add 4 components via explicit place flow
    const cbox = await canvas2.boundingBox();
    if (!cbox) throw new Error('canvas bounding box missing');
    const drop = async (offsetX: number, offsetY: number) => {
      await page.mouse.click(
        cbox.x + cbox.width / 2 + offsetX,
        cbox.y + cbox.height / 2 + offsetY,
      );
      await page.waitForTimeout(150);
    };

    await page.locator('button:has-text("Water / nutrient")').click();
    await drop(-120, -60);
    await page.locator('button:has-text("Moves nutrient")').click();
    await drop(-40, -60);
    await page.locator('button:has-text("Ebb & flow")').click();
    await drop(40, -60);
    await page.locator('button:has-text("Aerates nutrient")').click();
    await drop(120, -60);

    await page.waitForTimeout(500);
    await expect(page.locator('text=In Scene (4)')).toBeVisible();

    // Select the first component in scene list to see connection options
    const sceneItems = page.locator('button:has-text("comp-")');
    await sceneItems.first().click();
    await page.waitForTimeout(500);

    // Take screenshot showing properties panel with connection options
    await page.screenshot({ path: 'e2e/screenshots/designer-3d-selected.png', fullPage: true });

    // Toggle grid (use toolbar button specifically)
    const toolbar = page.locator('.border-b');
    await toolbar.locator('button:has-text("Grid")').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'e2e/screenshots/designer-3d-no-grid.png', fullPage: true });

    // Toggle grid back on
    await toolbar.locator('button:has-text("Grid")').click();
    await page.waitForTimeout(300);

    await page.screenshot({ path: 'e2e/screenshots/designer-3d-final.png', fullPage: true });
  });

  test('soil bed designer with canvas and plant persistence', async ({ page }) => {
    await page.goto('/soil');

    // Create a new bed
    await page.click('button:text("Create First Bed")');
    await expect(page.locator('text=Create New Garden Bed')).toBeVisible();

    await page.fill('input#bed-name', 'Test Thai Bed');
    await page.fill('input#bed-width', '150');
    await page.fill('input#bed-length', '300');
    await page.click('button:text("Create Bed")');

    // Should open bed designer
    await expect(page.getByRole('heading', { name: 'Test Thai Bed' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('canvas')).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/soil-bed-empty.png', fullPage: true });

    // Add plants via the base-ui Select dropdown
    const selectTrigger = page.locator('[data-slot="select-trigger"]:has-text("Choose plant")');
    const addBtn = page.locator('button.bg-green-600:has-text("Add")');

    await selectTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('[data-slot="select-item"]').filter({ hasText: 'Tomato' }).first().click();
    await page.waitForTimeout(300);
    await addBtn.click();
    await page.waitForTimeout(500);

    // Add another plant
    await selectTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('[data-slot="select-item"]').filter({ hasText: 'Thai Basil' }).click();
    await page.waitForTimeout(300);
    await addBtn.click();

    await page.waitForTimeout(500);
    await expect(page.locator('text=2 plant')).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/soil-bed-with-plants.png', fullPage: true });

    // Back + re-open to verify persistence
    await page.click('button:text("Beds")');
    await page.waitForTimeout(500);
    await page.locator('.cursor-pointer:has-text("Test Thai Bed")').click();
    await expect(page.locator('text=2 plant')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/soil-bed-persisted.png', fullPage: true });
  });
});

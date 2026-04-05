import { test, expect } from '@playwright/test';

test.describe('Plant detail — tags & notes', () => {
  test('can edit tags and notes inline, and they persist after reload', async ({ page }) => {
    // Create a fresh plant so the test runs on a known-good row.
    await page.goto('/plants/new');
    await page.fill('input#name', 'E2E Persistence Plant');
    await page.fill('input#variety', 'Test Variety');
    await page.click('button:has-text("Herb")');
    await page.click('text=Hydroponic');
    await page.click('button:has-text("Healthy")');
    await page.click('button:has-text("Add Plant")');

    // We land on /plants/<id>.
    await page.waitForURL(/\/plants\/\d+/);
    await expect(page.getByText('E2E Persistence Plant').first()).toBeVisible();

    // Scope to the Tags card (CardTitle text="Tags", not "Health Status").
    const tagsCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: /^Tags$/ }) });
    await expect(tagsCard).toBeVisible();

    // Initial state: empty-state copy should be visible.
    await expect(tagsCard.getByText('No tags yet. Click the pencil to add some.')).toBeVisible();

    // Click the pencil to begin editing.
    await tagsCard.getByRole('button').first().click();

    // Add two tags via the input + Add button.
    const tagInput = tagsCard.getByPlaceholder('Add a tag…');
    await tagInput.fill('organic');
    await tagsCard.getByRole('button', { name: 'Add' }).click();
    await tagInput.fill('indoor');
    await tagsCard.getByRole('button', { name: 'Add' }).click();

    // Save (the check icon is the second icon button in edit mode).
    await tagsCard.locator('button').nth(1).click();

    // Tags should render as badges.
    await expect(tagsCard.getByText('organic')).toBeVisible();
    await expect(tagsCard.getByText('indoor')).toBeVisible();

    // Now the Notes card.
    const notesCard = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: /^Notes$/ }) });
    await expect(notesCard).toBeVisible();

    await notesCard.getByRole('button').first().click();
    await notesCard.getByPlaceholder('Add notes about this plant…').fill(
      'This plant is doing well after two weeks.'
    );
    await notesCard.locator('button').nth(1).click();
    await expect(
      notesCard.getByText('This plant is doing well after two weeks.')
    ).toBeVisible();

    // Persistence: reload and assert everything survived.
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('E2E Persistence Plant').first()).toBeVisible();

    const tagsCardAfter = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: /^Tags$/ }) });
    await expect(tagsCardAfter.getByText('organic')).toBeVisible();
    await expect(tagsCardAfter.getByText('indoor')).toBeVisible();

    const notesCardAfter = page
      .locator('[data-slot="card"]')
      .filter({ has: page.locator('[data-slot="card-title"]', { hasText: /^Notes$/ }) });
    await expect(
      notesCardAfter.getByText('This plant is doing well after two weeks.')
    ).toBeVisible();

    await page.screenshot({ path: 'e2e/screenshots/plant-detail-tags-notes.png', fullPage: true });
  });
});

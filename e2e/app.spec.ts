import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'Dashboard' },
  { path: '/plants', name: 'Plants' },
  { path: '/plants/new', name: 'Add Plant' },
  { path: '/weather', name: 'Weather' },
  { path: '/calendar', name: 'Calendar' },
  { path: '/designer', name: 'Designer' },
  { path: '/companions', name: 'Companions' },
  { path: '/nutrients', name: 'Nutrients' },
  { path: '/soil', name: 'Soil' },
  { path: '/sunmap', name: 'Sunmap' },
  { path: '/iot', name: 'IoT' },
  { path: '/tasks', name: 'Tasks' },
];

for (const route of routes) {
  test(`${route.name} page loads without errors`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toContainText('Garden Companion');
  });
}

test('dashboard shows key sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-slot="card-title"]', { hasText: 'Weather' })).toBeVisible();
  await expect(page.locator('[data-slot="card-title"]', { hasText: 'Plants' })).toBeVisible();
  await expect(page.locator('[data-slot="card-title"]', { hasText: 'Tasks' })).toBeVisible();
});

test('sidebar navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('text=My Plants');
  await expect(page).toHaveURL(/\/plants$/);
  await page.click('text=Weather');
  await expect(page).toHaveURL(/\/weather$/);
  await page.click('text=Calendar');
  await expect(page).toHaveURL(/\/calendar$/);
});

test('theme toggle works', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const initialClass = await html.getAttribute('class');
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.waitForTimeout(300);
  const newClass = await html.getAttribute('class');
  expect(newClass).not.toBe(initialClass);
});

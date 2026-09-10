import { test, expect } from '@playwright/test';

test.describe('AppDrawer Navigation (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to "Todos os Itens" correctly', async ({ page }) => {
    // 1. Navigate to Settings first so we can test returning to "Todos os Itens"
    await page.getByRole('link', { name: 'Configurações' }).click();
    await expect(page).toHaveURL(/.*\/settings/);
    await expect(page.getByRole('heading', { name: 'Configurações', level: 1 })).toBeVisible();

    // 2. Click "Todos os Itens" in the Drawer
    await page.getByRole('link', { name: 'Todos os Itens' }).click();

    // 3. Verify URL and main component
    await expect(page).toHaveURL(/.*\/notebook\/all/);
    await expect(page.getByRole('heading', { name: 'Todos os Itens', level: 1 })).toBeVisible();
  });

  test('navigates to "Configurações" correctly', async ({ page }) => {
    // 1. Click "Configurações" in the Drawer
    await page.getByRole('link', { name: 'Configurações' }).click();

    // 2. Verify URL and main component
    await expect(page).toHaveURL(/.*\/settings/);
    await expect(page.getByRole('heading', { name: 'Configurações', level: 1 })).toBeVisible();
  });

  test('navigates to "Lixeira" correctly', async ({ page }) => {
    // 1. Click "Lixeira" in the Drawer
    await page.getByRole('link', { name: 'Lixeira' }).click();

    // 2. Verify URL and main component
    await expect(page).toHaveURL(/.*\/trash/);
    await expect(page.getByRole('heading', { name: 'Lixeira', level: 1 })).toBeVisible();
  });
});

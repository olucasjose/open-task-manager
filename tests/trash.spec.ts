import { test, expect, type Page } from '@playwright/test';

test.describe('Trash Management', () => {
  test.beforeEach(async ({ page }) => {
    // Setup dialog handler for window.confirm (deletion)
    page.on('dialog', async dialog => {
      if (dialog.type() === 'confirm') {
        await dialog.accept();
      }
    });
    
    // Go to the app before each test
    await page.goto('/');
  });

  // Helper function to create a quick entry and move it to trash
  async function createAndTrashEntry(page: Page, title: string) {
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Anotação').click();
    
    const titleInput = page.getByPlaceholder('Título da anotação');
    await expect(titleInput).toBeVisible();
    await titleInput.fill(title);
    
    // Save it first since new entries don't have a delete button
    await page.getByRole('button', { name: 'Voltar' }).click();

    // Now click on it in the list to open it
    const entryTitle = page.getByRole('heading', { name: title });
    await expect(entryTitle).toBeVisible();
    await entryTitle.click();

    // Click delete to move to trash
    await page.getByRole('button', { name: 'Deletar' }).click();
    
    // Verify it disappeared from home (it auto-navigates back)
    await expect(page.getByRole('heading', { name: title })).not.toBeVisible();
  }

  test('views items in trash', async ({ page }) => {
    await createAndTrashEntry(page, 'Item Lixeira 1');

    // Navigate to Trash
    await page.getByRole('link', { name: 'Lixeira' }).click();

    // Verify item is there
    await expect(page.getByRole('heading', { name: 'Item Lixeira 1' })).toBeVisible();
  });

  test('restores an item from trash', async ({ page }) => {
    await createAndTrashEntry(page, 'Item para Restaurar');

    // Navigate to Trash
    await page.getByRole('link', { name: 'Lixeira' }).click();

    // Find the row and click restore
    const trashRow = page.locator('div.group').filter({ hasText: 'Item para Restaurar' });
    await trashRow.getByTitle('Restaurar').click();

    // Verify it disappeared from Trash
    await expect(page.getByRole('heading', { name: 'Item para Restaurar' })).not.toBeVisible();

    // Go back to Home
    await page.getByRole('link', { name: 'Todos os Itens' }).click();

    // Verify it's back in Home
    await expect(page.getByRole('heading', { name: 'Item para Restaurar' })).toBeVisible();
  });

  test('hard deletes an item', async ({ page }) => {
    await createAndTrashEntry(page, 'Item Definitivo');

    // Navigate to Trash
    await page.getByRole('link', { name: 'Lixeira' }).click();

    // Find the row and click hard delete
    const trashRow = page.locator('div.group').filter({ hasText: 'Item Definitivo' });
    await trashRow.getByTitle('Excluir Definitivamente').click();

    // Verification - item is gone
    await expect(page.getByRole('heading', { name: 'Item Definitivo' })).not.toBeVisible();
  });

  test('empties the trash', async ({ page }) => {
    await createAndTrashEntry(page, 'Lixo 1');
    await createAndTrashEntry(page, 'Lixo 2');

    // Navigate to Trash
    await page.getByRole('link', { name: 'Lixeira' }).click();

    // Verify both are there
    await expect(page.getByRole('heading', { name: 'Lixo 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lixo 2' })).toBeVisible();

    // Click 'Esvaziar'
    await page.getByRole('button', { name: 'Esvaziar' }).click();

    // Verify the empty state
    await expect(page.getByRole('heading', { name: 'Lixeira Vazia' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lixo 1' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lixo 2' })).not.toBeVisible();
  });
});

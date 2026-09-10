import { test, expect } from '@playwright/test';

test.describe('Settings and Confirmations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('disables confirmations and validates flow without confirm dialog', async ({ page }) => {
    let dialogFired = false;
    
    // Setup dialog handler and track if it was called
    page.on('dialog', async dialog => {
      dialogFired = true;
      await dialog.accept();
    });

    // 1. Navigate to Settings
    await page.getByRole('link', { name: 'Configurações' }).click();

    // 2. Uncheck the confirmation toggles
    // Click the parent label because the input itself has 'sr-only' class and is visually hidden
    const deleteConfirmToggle = page.getByLabel('Confirmar exclusão de itens e cadernos');
    const trashConfirmToggle = page.getByLabel('Confirmar exclusão ao esvaziar lixeira');
    
    if (await deleteConfirmToggle.isChecked()) {
      await deleteConfirmToggle.locator('..').click();
    }
    if (await trashConfirmToggle.isChecked()) {
      await trashConfirmToggle.locator('..').click();
    }

    // Verify they are unchecked
    await expect(deleteConfirmToggle).not.toBeChecked();
    await expect(trashConfirmToggle).not.toBeChecked();

    // 3. Create an entry to test deletion
    await page.getByRole('link', { name: 'Todos os Itens' }).click();
    
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Anotação').click();
    
    const titleInput = page.getByPlaceholder('Título da anotação');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Item Sem Confirmacao');
    
    // Save it first
    await page.getByRole('button', { name: 'Voltar' }).click();

    // Now click on it in the list to open it
    const entryTitle = page.getByRole('heading', { name: 'Item Sem Confirmacao' });
    await expect(entryTitle).toBeVisible();
    await entryTitle.click();

    // 4. Click delete to move to trash
    dialogFired = false; // Reset to be sure
    await page.getByRole('button', { name: 'Deletar' }).click();
    
    // Verify it navigated back
    await expect(page.getByRole('heading', { name: 'Item Sem Confirmacao' })).not.toBeVisible();
    
    // Assert dialog was NOT fired
    expect(dialogFired).toBe(false);

    // 5. Hard delete it from Trash without dialog
    await page.getByRole('link', { name: 'Lixeira' }).click();

    const trashRow = page.locator('div.group').filter({ hasText: 'Item Sem Confirmacao' });
    await trashRow.getByTitle('Excluir Definitivamente').click();

    // Verify it disappeared
    await expect(page.getByRole('heading', { name: 'Item Sem Confirmacao' })).not.toBeVisible();
    
    // Assert dialog was NOT fired
    expect(dialogFired).toBe(false);
  });
});

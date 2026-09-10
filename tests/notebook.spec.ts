import { test, expect } from '@playwright/test';

test.describe('Notebook', () => {
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

  test('creates a notebook', async ({ page }) => {
    // Click to create a new notebook and type the name
    await page.getByText('Novo Caderno').click();
    await page.getByPlaceholder('Nome do caderno...').fill('Test Notebook Create');
    await page.getByPlaceholder('Nome do caderno...').press('Enter');

    // Verify it was created
    const notebookItem = page.getByRole('link', { name: 'Test Notebook Create' });
    await expect(notebookItem).toBeVisible();
  });

  test('edits a notebook', async ({ page }) => {
    // Create first
    await page.getByText('Novo Caderno').click();
    await page.getByPlaceholder('Nome do caderno...').fill('Notebook Original');
    await page.getByPlaceholder('Nome do caderno...').press('Enter');

    const notebookItem = page.getByRole('link', { name: 'Notebook Original' });
    await expect(notebookItem).toBeVisible();
    
    await notebookItem.click(); // Select it to make it active

    // Wait for the notebook to become active (it renders a second button for the menu)
    await expect(notebookItem.locator('button')).toHaveCount(2);

    // Click the MoreVertical button
    await notebookItem.locator('button').last().click();
    
    // Click 'Renomear' in the dropdown
    await page.getByRole('button', { name: /Renomear/i }).click();

    // Fill the new name
    const editInput = page.getByPlaceholder('Novo nome...');
    await editInput.fill('Notebook Editado');
    await editInput.press('Enter');

    // Verify it was updated
    const updatedItem = page.getByRole('link', { name: 'Notebook Editado' });
    await expect(updatedItem).toBeVisible();
    await expect(notebookItem).not.toBeVisible();
  });

  test('deletes a notebook', async ({ page }) => {
    // Create first
    await page.getByText('Novo Caderno').click();
    await page.getByPlaceholder('Nome do caderno...').fill('Notebook para Excluir');
    await page.getByPlaceholder('Nome do caderno...').press('Enter');

    const notebookItem = page.getByRole('link', { name: 'Notebook para Excluir' });
    await expect(notebookItem).toBeVisible();
    
    await notebookItem.click(); // Select it to make it active

    // Wait for the notebook to become active
    await expect(notebookItem.locator('button')).toHaveCount(2);

    // Click the MoreVertical button
    await notebookItem.locator('button').last().click();
    
    // Click 'Excluir' in the dropdown
    await page.getByRole('button', { name: /Excluir/i }).click();

    // Verify it was deleted
    await expect(notebookItem).not.toBeVisible();
  });

  test('notebook isolation (navigation)', async ({ page }) => {
    // Create Notebook A
    await page.getByText('Novo Caderno').click();
    await page.getByPlaceholder('Nome do caderno...').fill('Notebook A');
    await page.getByPlaceholder('Nome do caderno...').press('Enter');
    
    // Create Notebook B
    await page.getByText('Novo Caderno').click();
    await page.getByPlaceholder('Nome do caderno...').fill('Notebook B');
    await page.getByPlaceholder('Nome do caderno...').press('Enter');

    // Select Notebook A
    const notebookA = page.getByRole('link', { name: 'Notebook A' });
    await notebookA.click();

    // Wait for Notebook A to become active before creating a task
    await expect(notebookA.locator('button')).toHaveCount(2);

    // Create an entry (Task) inside Notebook A
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Tarefa').click();
    
    // Fill the task content
    const titleInput = page.getByPlaceholder('Título da tarefa');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Tarefa Isolada');
    await titleInput.blur(); // Trigger any save-on-blur mechanics

    // Important: We must click the TopAppBar back button to trigger the save!
    await page.getByRole('button', { name: 'Voltar' }).click();

    // Verify the task is listed in Notebook A
    await expect(page.getByText('Tarefa Isolada')).toBeVisible();

    // Select Notebook B
    const notebookB = page.getByRole('link', { name: 'Notebook B' });
    await notebookB.click();

    // Verify the task is NOT listed in Notebook B
    await expect(page.getByText('Tarefa Isolada')).not.toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Entries Management', () => {
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

  test('creates different types of entries', async ({ page }) => {
    // Note
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Anotação').click();
    await page.getByPlaceholder('Título da anotação').fill('Minha Nova Anotação');
    await page.getByPlaceholder('Comece a escrever...').fill('Conteúdo da anotação');
    await page.getByRole('button', { name: 'Voltar' }).click();
    await expect(page.getByRole('heading', { name: 'Minha Nova Anotação' })).toBeVisible();

    // Task
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Tarefa').click();
    await page.getByPlaceholder('Título da tarefa').fill('Minha Nova Tarefa');
    await page.getByPlaceholder('Adicione uma descrição...').fill('Conteúdo da tarefa');
    await page.getByRole('button', { name: 'Voltar' }).click();
    await expect(page.getByRole('heading', { name: 'Minha Nova Tarefa' })).toBeVisible();

    // Reasoning Line
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Linha de Raciocínio').click();
    await page.getByPlaceholder('Título da linha de raciocínio').fill('Meu Raciocínio');
    await page.getByRole('button', { name: 'Voltar' }).click();
    await expect(page.getByRole('heading', { name: 'Meu Raciocínio' })).toBeVisible();
  });

  test('edits an entry content', async ({ page }) => {
    // Create a note first
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Anotação').click();
    await page.getByPlaceholder('Título da anotação').fill('Nota para Editar');
    await page.getByPlaceholder('Comece a escrever...').fill('Texto original');
    await page.getByRole('button', { name: 'Voltar' }).click();

    // Verify it's on the list and click it
    const entryTitle = page.getByRole('heading', { name: 'Nota para Editar' });
    await expect(entryTitle).toBeVisible();
    await entryTitle.click();

    // Edit it
    const titleInput = page.getByPlaceholder('Título da anotação');
    await titleInput.fill('Nota Editada');
    
    const contentInput = page.getByPlaceholder('Comece a escrever...');
    await contentInput.fill('Texto editado no markdown');

    // Save and go back
    await page.getByRole('button', { name: 'Voltar' }).click();

    // Verify the new title is shown on the list
    await expect(page.getByRole('heading', { name: 'Nota Editada' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Nota para Editar' })).not.toBeVisible();
    
    // Verify the new content snippet is shown on the list
    await expect(page.getByText('Texto editado no markdown')).toBeVisible();
  });

  test('toggles a task completion status', async ({ page }) => {
    // Create a task
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Tarefa').click();
    await page.getByPlaceholder('Título da tarefa').fill('Tarefa para Concluir');
    await page.getByRole('button', { name: 'Voltar' }).click();

    // Wait for it to appear
    const taskTitle = page.getByRole('heading', { name: 'Tarefa para Concluir' });
    await expect(taskTitle).toBeVisible();

    // Find the task row
    const taskRow = page.locator('div.group').filter({ has: taskTitle });
    
    // The toggle button is inside this row
    const toggleButton = taskRow.locator('button').first();
    
    // Click to complete
    await toggleButton.click();

    // Validate visual change: The text should have a 'line-through' class.
    await expect(taskRow.locator('h3')).toHaveClass(/line-through/);
    
    // The row should have 'opacity-75' class
    await expect(taskRow).toHaveClass(/opacity-75/);

    // Click again to un-complete
    await toggleButton.click();
    
    // Validate it's no longer crossed out
    await expect(taskRow.locator('h3')).not.toHaveClass(/line-through/);
  });

  test('moves an entry to trash', async ({ page }) => {
    // Create a note
    await page.locator('button.bg-indigo-600').click();
    await page.getByText('Nova Anotação').click();
    await page.getByPlaceholder('Título da anotação').fill('Anotação para Lixeira');
    await page.getByRole('button', { name: 'Voltar' }).click();

    // Wait for it to appear and click it
    const entryTitle = page.getByRole('heading', { name: 'Anotação para Lixeira' });
    await expect(entryTitle).toBeVisible();
    await entryTitle.click();

    // Click the delete button in TopAppBar
    await page.getByRole('button', { name: 'Deletar' }).click();

    // Verify it disappeared from the main list
    await expect(page.getByRole('heading', { name: 'Anotação para Lixeira' })).not.toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test('allows adding, completing, and clearing todos', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toHaveText('My Tasks:');

    // Empty state should be visible at start.
    await expect(page.getByText('No todos yet. Add one above!')).toBeVisible();

    const input = page.getByPlaceholder('What needs to be done?');
    const addButton = page.getByRole('button', { name: 'Add' });

    await input.fill('Write unit tests');
    await addButton.click();

    await input.fill('Review architecture');
    await addButton.click();

    const listItems = page.getByRole('listitem');
    await expect(listItems).toHaveCount(2);

    const stats = page.locator('.stat-item .stat-value');
    await expect(stats.nth(0)).toHaveText('2');
    await expect(stats.nth(1)).toHaveText('0');

    // Complete the first todo and wait for the auto deletion to fire.
    const firstCheckbox = page.getByRole('checkbox', { name: 'Toggle todo' }).first();
    await firstCheckbox.check();
    await page.waitForTimeout(600);

    await expect(listItems).toHaveCount(1);
    await expect(stats.nth(0)).toHaveText('1');
    await expect(stats.nth(1)).toHaveText('1');

    // Clear the remaining todo through the confirmation dialog.
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear All Values' }).click();

    await expect(page.getByText('No todos yet. Add one above!')).toBeVisible();
    await expect(stats.nth(0)).toHaveText('0');
    await expect(stats.nth(1)).toHaveText('0');
  });
});

import { test, expect } from '@playwright/test';

test('shows the login page when unauthenticated', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Login · Bookclub');
});

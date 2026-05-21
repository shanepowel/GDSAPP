import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('sign-in page is accessible', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

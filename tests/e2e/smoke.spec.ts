import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('sign-in page loads', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('accessibility statement has no critical axe violations', async ({ page }) => {
  await page.goto('/accessibility');
  await expect(page.getByRole('heading', { name: 'Accessibility statement' })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(serious).toEqual([]);
});

test('ai-use and performance pages render', async ({ page }) => {
  await page.goto('/ai-use');
  await expect(page.getByRole('heading', { name: 'How Assemble uses AI' })).toBeVisible();
  await page.goto('/performance');
  await expect(page.getByRole('heading', { name: 'Performance' })).toBeVisible();
});

import { test, expect, type Page } from '@playwright/test';

async function signInDemo(page: Page) {
  await page.goto('/sign-in');
  await page.getByRole('button', { name: /Launch demo/ }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/\/squads\//);
}

test('people rows and squad assign controls open drawers', async ({ page }) => {
  await signInDemo(page);

  await expect(page.getByRole('button', { name: 'See all' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'See all' }).first().click();
  await expect(page.getByRole('heading', { name: 'Lead user researcher' })).toBeVisible();
  await page.getByRole('button', { name: 'Assign to this role' }).first().click();
  await expect(page.getByRole('button', { name: 'Change' }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Change' }).first().click();
  await expect(page.getByRole('heading', { name: 'Lead user researcher' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Lead user researcher' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Start again' }).click();
  await expect(page.getByRole('button', { name: 'See all' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm this squad' })).toBeDisabled();

  await page.goto('/people');
  await page.locator('tr.clickable', { hasText: 'Bethan Morris' }).click();
  await expect(page.getByRole('heading', { name: 'Bethan Morris' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Bethan Morris' })).toHaveCount(0);
});

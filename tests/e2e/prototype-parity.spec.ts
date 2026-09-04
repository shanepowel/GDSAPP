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
  await expect(page.getByText('Harper Cole')).toBeVisible();
  await page
    .locator('tr.clickable', { hasText: 'Harper Cole' })
    .getByRole('button', { name: 'Show working' })
    .click();
  await expect(page.getByText('Nothing recorded for this person')).toBeVisible();

  await page.goto('/assurance/nrw-demo');
  await expect(page.getByRole('heading', { name: 'Whether this team will pass' })).toBeVisible();
  await expect(page.getByText('0.64')).toHaveCount(0);
});

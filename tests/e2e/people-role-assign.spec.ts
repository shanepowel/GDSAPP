import { test, expect } from '@playwright/test';

test('role dropdown keeps the chosen role when adding and assigning a person', async ({
  page,
}) => {
  await page.goto('/sign-in');
  await page.getByRole('button', { name: /Launch demo/ }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/\/squads\//);

  await page.goto('/engagements/nrw-demo/team/people');
  const addRole = page.locator('select[name="new-person-role"]');
  await expect(addRole).toBeEnabled();

  const personName = `E2E Role ${Date.now()}`;
  await page.getByLabel('Name', { exact: true }).fill(personName);
  await addRole.selectOption('user-researcher-working');
  await expect(addRole).toHaveValue('user-researcher-working');
  await page.getByRole('button', { name: 'Add person' }).click();

  const created = page.locator('li', { hasText: personName });
  await expect(created).toBeVisible();
  const createdRole = created.locator('select[name^="person-role-"]');
  await expect(createdRole).toHaveValue('user-researcher-working');

  const personRoles = page.locator('select[name^="person-role-"]');
  const count = await personRoles.count();
  let assignedExisting = false;
  for (let i = 0; i < count; i += 1) {
    const select = personRoles.nth(i);
    if ((await select.inputValue()) !== '') continue;
    await select.selectOption('service-owner-associate');
    await expect(select).toHaveValue('service-owner-associate');
    assignedExisting = true;
    break;
  }
  expect(assignedExisting).toBe(true);

  await page.reload();
  await expect(created.locator('select[name^="person-role-"]')).toHaveValue(
    'user-researcher-working',
  );
});

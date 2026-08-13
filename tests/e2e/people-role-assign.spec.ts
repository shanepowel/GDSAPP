import { test, expect, type Page } from '@playwright/test';

async function signInDemo(page: Page) {
  await page.goto('/sign-in');
  await page.getByRole('button', { name: /Launch demo/ }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(/\/squads\//);
}

test('role dropdown keeps the chosen role when adding and assigning a person', async ({
  page,
}) => {
  await signInDemo(page);

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

test('logged-in user can add a person and assign a role on People', async ({ page }) => {
  await signInDemo(page);

  await page.goto('/people');
  const form = page.locator('#add-person');
  await expect(form).toBeVisible();
  const addRole = form.locator('select[name="new-person-role"]');
  await expect(addRole).toBeEnabled();

  const personName = `E2E Pool ${Date.now()}`;
  await form.getByLabel('Name', { exact: true }).fill(personName);
  const roleValue = await addRole.locator('option').nth(1).getAttribute('value');
  expect(roleValue).toBeTruthy();
  await addRole.selectOption(roleValue!);
  await form.getByRole('button', { name: 'Add person' }).click();

  const row = page.locator('.sheet tr', { hasText: personName });
  await expect(row).toBeVisible();
  const createdRole = row.locator('select[name^="person-role-"]');
  await expect(createdRole).toHaveValue(roleValue!);

  const nextRole = await createdRole.locator('option').nth(2).getAttribute('value');
  expect(nextRole).toBeTruthy();
  await createdRole.selectOption(nextRole!);
  await expect(createdRole).toHaveValue(nextRole!);

  await page.reload();
  const reloaded = page.locator('.sheet tr', { hasText: personName });
  await expect(reloaded.locator('select[name^="person-role-"]')).toHaveValue(nextRole!);
});

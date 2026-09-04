/**
 * Part 1 route, auth, axe and Welsh audit. Writes JSON to stdout.
 * Run: npx tsx scripts/audit-routes.ts
 */
import { chromium, type Page, type ConsoleMessage } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

const PUBLIC_ROUTES = [
  '/',
  '/roles',
  '/practice/pillars',
  '/practice/ceremonies',
  '/practice/maturity',
  '/practice/standards',
  '/sign-in',
  '/accessibility',
  '/ai-use',
  '/performance',
  '/demo',
];

const PROTECTED_ROUTES = [
  '/people',
  '/people/graph',
  '/squads',
  '/squads/nrw-demo',
  '/squads/nrw-demo/gaps',
  '/assurance',
  '/assurance/nrw-demo',
  '/portfolio',
  '/profile',
  '/settings',
  '/settings/archetypes',
  '/framework',
  '/handover',
  '/benchmarking',
  '/engagements/new',
  '/engagements/nrw-demo/assess',
  '/engagements/nrw-demo/assure',
  '/engagements/nrw-demo/team/people',
  '/engagements/nrw-demo/organise',
  '/engagements/nrw-demo/tender',
  '/engagements/nrw-demo/requirement',
  '/engagements/nrw-demo/judgements',
  '/engagements/nrw-demo/evidence',
  '/engagements/nrw-demo/structure',
  '/engagements/nrw-demo/analysis',
  '/engagements/nrw-demo/rigour',
  '/engagements/nrw-demo/history',
  '/engagements/nrw-demo/settings',
  '/engagements/nrw-demo/report',
  '/engagements/nrw-demo/reviews',
  '/engagements/nrw-demo/activity',
];

type RouteResult = {
  route: string;
  signedOut: string;
  signedIn: string;
  console: string[];
  network: string[];
  axe: string[];
  notes: string[];
};

function collectConsole(page: Page, bucket: string[]) {
  const onConsole = (msg: ConsoleMessage) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      bucket.push(`${type}: ${msg.text()}`);
    }
  };
  const failed: string[] = [];
  page.on('console', onConsole);
  page.on('pageerror', (err) => bucket.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => {
    failed.push(`${req.failure()?.errorText ?? 'failed'} ${req.url()}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });
  return failed;
}

async function visit(page: Page, path: string, timeout = 20000) {
  const consoleMsgs: string[] = [];
  const network = collectConsole(page, consoleMsgs);
  const started = Date.now();
  const response = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout });
  await page.waitForTimeout(800);
  const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 400);
  const stillLoading = /\bLoading…\b/.test(body) && body.trim().length < 80;
  const title = await page.title();
  const url = page.url();
  return {
    status: response?.status() ?? 0,
    finalUrl: url.replace(BASE, ''),
    title,
    stillLoading,
    elapsedMs: Date.now() - started,
    console: [...new Set(consoleMsgs)].slice(0, 12),
    network: [...new Set(network)].slice(0, 12),
    bodySnippet: body.replace(/\s+/g, ' ').slice(0, 220),
  };
}

async function axeSerious(page: Page) {
  try {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    return results.violations
      .filter((v) => v.impact === 'critical' || v.impact === 'serious')
      .map((v) => `${v.impact}: ${v.id} (${v.nodes.length} nodes) ${v.help}`);
  } catch (e) {
    return [`axe-error: ${(e as Error).message}`];
  }
}

async function signIn(page: Page) {
  await page.goto(BASE + '/sign-in');
  const launch = page.getByRole('button', { name: /Launch demo/ });
  if (await launch.isVisible().catch(() => false)) {
    await launch.click();
  } else {
    await page.getByLabel('Email').fill('admin@demo.local');
    await page.getByLabel('Password').fill('demo-password');
  }
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL((u) => !u.pathname.includes('/sign-in'), { timeout: 20000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results: RouteResult[] = [];

  const outCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const outPage = await outCtx.newPage();

  for (const route of PUBLIC_ROUTES) {
    const v = await visit(outPage, route);
    const axe = await axeSerious(outPage);
    results.push({
      route,
      signedOut: `${v.status} ${v.finalUrl}${v.stillLoading ? ' STUCK-LOADING' : ''}`,
      signedIn: 'n/a (public)',
      console: v.console,
      network: v.network,
      axe,
      notes: [v.bodySnippet],
    });
  }

  for (const route of PROTECTED_ROUTES) {
    const v = await visit(outPage, route);
    const redirected = v.finalUrl.includes('/sign-in');
    results.push({
      route,
      signedOut: redirected
        ? `redirect ${v.finalUrl}`
        : `${v.status} ${v.finalUrl}${v.stillLoading ? ' STUCK-LOADING' : ''}`,
      signedIn: '',
      console: v.console,
      network: v.network,
      axe: [],
      notes: [],
    });
  }

  // Auth callback check
  await outPage.goto(BASE + '/sign-in?callbackUrl=/portfolio');
  const launch = outPage.getByRole('button', { name: /Launch demo/ });
  if (await launch.isVisible().catch(() => false)) await launch.click();
  await outPage.getByRole('button', { name: 'Sign in', exact: true }).click();
  await outPage.waitForURL((u) => !u.pathname.includes('/sign-in'), { timeout: 20000 });
  const afterCallback = outPage.url();

  await outCtx.close();

  const inCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const inPage = await inCtx.newPage();
  await signIn(inPage);

  for (const route of [...PUBLIC_ROUTES, ...PROTECTED_ROUTES]) {
    const v = await visit(inPage, route);
    const axe = ['/', '/roles', '/people', '/squads/nrw-demo', '/assurance/nrw-demo', '/portfolio', '/sign-in'].includes(
      route,
    )
      ? await axeSerious(inPage)
      : [];
    const existing = results.find((r) => r.route === route);
    const signedIn = `${v.status} ${v.finalUrl}${v.stillLoading ? ' STUCK-LOADING' : ''}`;
    if (existing) {
      existing.signedIn = signedIn;
      existing.console = [...existing.console, ...v.console.map((c) => `in: ${c}`)];
      existing.network = [...existing.network, ...v.network.map((c) => `in: ${c}`)];
      if (axe.length) existing.axe = [...existing.axe, ...axe];
      existing.notes.push(v.bodySnippet);
    } else {
      results.push({
        route,
        signedOut: '',
        signedIn,
        console: v.console,
        network: v.network,
        axe,
        notes: [v.bodySnippet],
      });
    }
  }

  // Welsh sample
  await inPage.goto(BASE + '/');
  await inPage.getByLabel('Language').selectOption('cy');
  await inPage.waitForTimeout(400);
  const welshHome = (await inPage.locator('body').innerText()).slice(0, 1500);
  await inPage.goto(BASE + '/people');
  await inPage.waitForTimeout(600);
  const welshPeople = (await inPage.locator('body').innerText()).slice(0, 800);

  // Viewport overflow sample
  const overflowNotes: string[] = [];
  for (const width of [375, 768, 1280]) {
    await inPage.setViewportSize({ width, height: 800 });
    for (const path of ['/', '/squads/nrw-demo', '/assurance/nrw-demo', '/people']) {
      await inPage.goto(BASE + path, { waitUntil: 'domcontentloaded' });
      await inPage.waitForTimeout(500);
      const overflow = await inPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 8);
      if (overflow) overflowNotes.push(`${width}px ${path}: horizontal overflow`);
    }
  }

  // Keyboard on squads
  await inPage.setViewportSize({ width: 1280, height: 800 });
  await inPage.goto(BASE + '/squads/nrw-demo');
  await inPage.waitForTimeout(800);
  await inPage.keyboard.press('Tab');
  await inPage.keyboard.press('Tab');
  await inPage.keyboard.press('Tab');
  const focused = await inPage.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return el ? `${el.tagName} ${el.getAttribute('href') ?? el.getAttribute('aria-label') ?? el.textContent?.slice(0, 40)}` : 'none';
  });

  await inCtx.close();
  await browser.close();

  const payload = {
    afterCallback,
    focusedAfterTabs: focused,
    welshHome,
    welshPeople,
    overflowNotes,
    results,
  };

  mkdirSync('/opt/cursor/artifacts', { recursive: true });
  writeFileSync('/opt/cursor/artifacts/audit-raw.json', JSON.stringify(payload, null, 2));
  writeFileSync('/tmp/audit-raw.json', JSON.stringify(payload, null, 2));
  console.log(JSON.stringify({ afterCallback, focused, overflowNotes, routes: results.length }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

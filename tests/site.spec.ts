import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('loads all assets without runtime errors and has working contact destinations', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Gintaro stogai/);
  await expect(page.locator('h1')).toContainText('Tvirtas stogas.');
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0));
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.header-call')).toHaveAttribute('href', 'tel:+37063340465');
  await expect(page.locator('.contact-phone')).toHaveAttribute('href', 'tel:+37063340465');
  expect(errors).toEqual([]);
});

test('a service card selects the matching SMS enquiry', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-service="Stogų renovacija"]').click();
  await expect(page).toHaveURL(/#kontaktai$/);
  await expect(page.locator('#service-select')).toHaveValue('Stogų renovacija');
  const href = await page.locator('#sms-link').getAttribute('href');
  expect(decodeURIComponent(href!)).toContain('domina stogų renovacija');
  await page.locator('#service-select').selectOption('Skardinimo darbai');
  expect(decodeURIComponent((await page.locator('#sms-link').getAttribute('href'))!)).toContain('domina skardinimo darbai');
});

test('questions open and close with the keyboard', async ({ page }) => {
  await page.goto('/');
  const summary = page.locator('.faq-item').first().locator('summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.faq-item').first()).toHaveAttribute('open', '');
  await expect(page.locator('.faq-answer').first()).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('.faq-item').first()).not.toHaveAttribute('open', '');
});

test('copying the telephone number has honest success and failure states', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.locator('.copy-phone').click();
  await expect(page.locator('#copy-status')).toHaveText('Telefono numeris nukopijuotas.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('+370 633 40465');
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('Denied')) }); });
  await page.locator('.copy-phone').click();
  await expect(page.locator('#copy-status')).toContainText('Nepavyko');
  expect(await page.evaluate(() => window.getSelection()?.toString().trim())).toBe('+370 633 40465');
});

test('mobile navigation closes on Escape and destination selection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-menu')).not.toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('#mobile-menu a[href="#paslaugos"]').click();
  await expect(page).toHaveURL(/#paslaugos$/);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.mobile-call-bar')).toBeVisible();
});

test('layouts fit phones, tablets, desktops and ultrawide screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 375, 390, 760, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(dimensions.scroll, `Horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.client);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('desktop and mobile meet automated WCAG AA checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
  }
});

test('content and phone links remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('#services-title')).toBeVisible();
  await expect(page.locator('.contact-phone')).toHaveAttribute('href', 'tel:+37063340465');
  await context.close();
});

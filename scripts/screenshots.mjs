import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch();
for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `docs/screenshots/${name}.png`, fullPage: true });
  await page.screenshot({ path: `docs/screenshots/${name}-hero.png` });
  await page.close();
}
await browser.close();
console.log('Desktop and mobile screenshots saved.');

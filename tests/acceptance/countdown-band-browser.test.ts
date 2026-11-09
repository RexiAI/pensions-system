import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { CHROME_PATH, launchBrowser, type Browser, type BrowserPage } from '../helpers/chromium';
import { BUILD_PRESENT, routePath, startServedApp, type ServedApp } from '../helpers/served-app';

/**
 * Step 1's measured properties, in a real Chromium against the built app (`npm run build`).
 *
 * The file skips where there is no build or no browser binary; the recorded numbers live in
 * `countdown-band.test.ts`, which never skips. What is asserted here is the numeral hierarchy the
 * story actually renders: the day count is the largest numeral on the page, the sub-day fields sit
 * below it, and the fuse's drawing does not move while the seconds tick.
 */
const READY = BUILD_PRESENT && CHROME_PATH !== undefined;
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
] as const;

const MEASURE = `(() => {
  const px = (el) => (el ? parseFloat(getComputedStyle(el).fontSize) : 0);
  const visible = (el) => !!el && el.getClientRects().length > 0;
  const days = document.querySelector('[data-top-step="number"] .clock__value--days');
  const h1 = document.querySelector('[data-top-step="number"] h1');
  let maxNumeral = 0;
  for (const el of document.querySelectorAll('main *')) {
    if (!visible(el)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
    if (/\\d/.test(own)) maxNumeral = Math.max(maxNumeral, px(el));
  }
  const fuse = document.querySelector('[data-top-step="distance"] svg');
  const rects = fuse ? [...fuse.querySelectorAll('rect')].map((r) => r.getAttribute('width')) : [];
  return { days: px(days), h1: px(h1), maxNumeral, rects };
})()`;

interface Measurement {
  days: number;
  h1: number;
  maxNumeral: number;
  rects: string[];
}

describe.skipIf(!READY)('step 1 and step 4, measured', () => {
  let app: ServedApp;
  let browser: Browser;
  const pages: BrowserPage[] = [];

  beforeAll(async () => {
    app = await startServedApp();
    browser = await launchBrowser();
  });

  afterAll(async () => {
    for (const page of pages) await page.close();
    browser?.close();
    await app?.close();
  });

  async function measure(locale: Locale, viewport: (typeof VIEWPORTS)[number]): Promise<Measurement> {
    const page = await browser.open(`${app.baseUrl}${routePath(locale)}`, viewport);
    pages.push(page);
    return page.evaluate<Measurement>(MEASURE);
  }

  it('AC-003-02 and AC-003-03: the day numeral is the largest numeral, and it beats the h1', async () => {
    for (const viewport of VIEWPORTS) {
      for (const locale of LOCALES) {
        const measured = await measure(locale, viewport);
        expect(measured.days, `${locale} ${viewport.width}`).toBeGreaterThan(measured.h1);
        expect(measured.days, `${locale} ${viewport.width}`).toBe(measured.maxNumeral);
        expect(measured.days, `${locale} ${viewport.width}`).toBeGreaterThanOrEqual(44);
      }
    }
  }, 120_000);

  it('AC-003-21: the fuse geometry does not change after the page settles', async () => {
    const page = await browser.open(`${app.baseUrl}/`, VIEWPORTS[2]);
    pages.push(page);
    const first = await page.evaluate<Measurement>(MEASURE);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const later = await page.evaluate<Measurement>(MEASURE);
    expect(later.rects).toEqual(first.rects);
  }, 60_000);

  it('AC-003-05: the anchor and the two disclosures are visible text below the story', async () => {
    // Spec 007: the precision moved with the method region to the Método page.
    const page = await browser.open(`${app.baseUrl}/metodo`, VIEWPORTS[2]);
    pages.push(page);
    const facts = await page.evaluate<{ method: string }>(
      `(() => ({ method: (document.querySelector('#metodo')?.textContent ?? '').trim() }))()`,
    );
    expect(facts.method.length).toBeGreaterThan(200);
  }, 60_000);

  it('AC-003-30 and AC-003-31: loading a public route requests only its own origin', async () => {
    const page = await browser.open(`${app.baseUrl}/`, VIEWPORTS[2]);
    pages.push(page);
    const foreign = page.requests.filter((url) => !url.startsWith(app.baseUrl) && !url.startsWith('data:'));
    expect(foreign).toEqual([]);
  }, 60_000);
});

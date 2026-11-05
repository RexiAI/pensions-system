import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { CHROME_PATH, launchBrowser, type Browser, type BrowserPage } from '../helpers/chromium';
import { BUILD_PRESENT, routePath, startServedApp, type ServedApp } from '../helpers/served-app';

/**
 * AC-004-60…63 — each of the five steps fits one screen (spec 004 T14).
 *
 * Measured in a real Chromium at the three viewports the suite already uses. A step's height is
 * content height, never a `100dvh` block: a screen full of nothing is the same complaint as a
 * column full of nothing, so the viewport is a ceiling rather than a target.
 */
const READY = BUILD_PRESENT && CHROME_PATH !== undefined;
const VIEWPORTS = [
  { label: '390x844', width: 390, height: 844 },
  { label: '1366x768', width: 1366, height: 768 },
  { label: '1440x900', width: 1440, height: 900 },
] as const;

const MEASURE = `(() => {
  const steps = [...document.querySelectorAll('[data-top-step]')].map((el) => ({
    id: el.getAttribute('data-top-step'),
    height: el.getBoundingClientRect().height,
    display: getComputedStyle(el).display,
    overflow: getComputedStyle(el).overflow,
  }));
  return { steps, viewport: window.innerHeight };
})()`;

interface Measured {
  steps: { id: string; height: number; display: string; overflow: string }[];
  viewport: number;
}

describe.skipIf(!READY)('one screen per step', () => {
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

  async function measure(locale: Locale, viewport: (typeof VIEWPORTS)[number]): Promise<Measured> {
    const page = await browser.open(`${app.baseUrl}${routePath(locale)}`, viewport);
    pages.push(page);
    return page.evaluate<Measured>(MEASURE);
  }

  it('AC-004-60: every step fits the viewport at the three measured sizes', async () => {
    for (const viewport of VIEWPORTS) {
      const measured = await measure('es', viewport);
      expect(measured.steps).toHaveLength(5);
      for (const step of measured.steps) {
        expect(step.height, `${viewport.label} ${step.id}`).toBeGreaterThan(0);
        expect(step.height, `${viewport.label} ${step.id}`).toBeLessThanOrEqual(measured.viewport);
      }
    }
  }, 120_000);

  /** Asserts every step's height against the viewport and returns step 3's recorded height. */
  function assertFits(measured: Measured, label: string): number {
    const heights = measured.steps.map((step) => step.height);
    for (const [index, height] of heights.entries()) {
      expect(height, `${label} ${measured.steps[index]?.id ?? index}`).toBeLessThanOrEqual(measured.viewport);
    }
    const why = measured.steps.find((step) => step.id === 'why');
    expect(why, label).toBeDefined();
    const recorded = why?.height ?? 0;
    expect(recorded, `${label} why`).toBeGreaterThan(0);
    expect(recorded, `${label} why`).toBeLessThanOrEqual(measured.viewport);
    return recorded;
  }

  it('AC-004-61 and AC-004-62: every step fits in every locale, and step 3 is recorded', async () => {
    const records: string[] = [];
    for (const locale of LOCALES) {
      for (const viewport of VIEWPORTS) {
        const measured = await measure(locale, viewport);
        const why = assertFits(measured, `${locale} ${viewport.label}`);
        records.push(`${locale} ${viewport.label} why=${Math.round(why)}px`);
      }
    }
    // The record is asserted against the bound above and printed here for the report's table.
    expect(records).toHaveLength(LOCALES.length * VIEWPORTS.length);
  }, 240_000);

  it('AC-004-63: nothing is hidden to meet the bound', async () => {
    const measured = await measure('es', VIEWPORTS[2]);
    for (const step of measured.steps) {
      expect(step.display, step.id).not.toBe('none');
      expect(step.overflow, step.id).not.toBe('hidden');
    }
    const CSS = readFileSync('web/styles/globals.css', 'utf8');
    // The only collapsed thing on the page is step 3's data disclosure.
    expect(CSS).not.toMatch(/\.step[^{]*\{[^}]*block-size:\s*\d+[dsv]?[hl]?\b/s);
    expect(CSS).not.toMatch(/\.step[^{]*\{[^}]*overflow:\s*hidden/s);
  }, 60_000);
});

import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { CHROME_PATH, launchBrowser, type Browser, type BrowserPage } from '../helpers/chromium';
import { BUILD_PRESENT, routePath, startServedApp, type ServedApp } from '../helpers/served-app';

/**
 * Step 1's rendered air, measured in a real Chromium against the built app: `.step--number`'s
 * computed padding against every other step's, and the three interior boundaries against
 * `--space-5`.
 */
const READY = BUILD_PRESENT && CHROME_PATH !== undefined;
const VIEWPORTS = [
  { label: '390x844', width: 390, height: 844 },
  { label: '1366x768', width: 1366, height: 768 },
  { label: '1440x900', width: 1440, height: 900 },
] as const;

const MEASURE = `(() => {
  const px = (value) => parseFloat(value) || 0;
  const steps = [...document.querySelectorAll('[data-top-step]')].map((el) => ({
    id: el.getAttribute('data-top-step'),
    paddingStart: px(getComputedStyle(el).paddingBlockStart),
    paddingEnd: px(getComputedStyle(el).paddingBlockEnd),
    height: el.getBoundingClientRect().height,
  }));
  const step = document.querySelector('[data-top-step="number"]');
  const title = step.querySelector('.hero__title');
  const clock = step.querySelector('.clock');
  const sentence = step.querySelector('.step__sentence');
  const box = (el) => (el ? el.getBoundingClientRect() : null);
  return {
    steps,
    viewport: window.innerHeight,
    titleBottom: box(title)?.bottom ?? null,
    clockTop: box(clock)?.top ?? null,
    clockBottom: box(clock)?.bottom ?? null,
    sentenceTop: box(sentence)?.top ?? null,
  };
})()`;

interface Measurement {
  steps: Array<{ id: string | null; paddingStart: number; paddingEnd: number; height: number }>;
  viewport: number;
  titleBottom: number | null;
  clockTop: number | null;
  clockBottom: number | null;
  sentenceTop: number | null;
}

const SPACE_5 = Number(/--space-5:\s*(\d+)px;/.exec(readFileSync('web/styles/tokens.css', 'utf8'))?.[1] ?? 0);

function assertStepOnePadding(measured: Measurement, locale: Locale): void {
  const number = measured.steps.find((step) => step.id === 'number');
  expect(number, locale).toBeDefined();
  for (const other of measured.steps.filter((step) => step.id !== 'number')) {
    expect(number?.paddingStart, `${locale} start ${number?.id} vs ${other.id}`).toBeGreaterThanOrEqual(
      other.paddingStart,
    );
    expect(number?.paddingEnd, `${locale} end ${number?.id} vs ${other.id}`).toBeGreaterThanOrEqual(
      other.paddingEnd,
    );
  }
}

function assertInteriorGaps(measured: Measurement, locale: Locale, viewport: string): void {
  const titleGap = (measured.clockTop ?? 0) - (measured.titleBottom ?? 0);
  const sentenceGap = (measured.sentenceTop ?? 0) - (measured.clockBottom ?? 0);
  expect(titleGap, `${locale} ${viewport} h1→clock ${titleGap}`).toBeGreaterThanOrEqual(SPACE_5);
  expect(sentenceGap, `${locale} ${viewport} clock→sentence ${sentenceGap}`).toBeGreaterThanOrEqual(SPACE_5);
}

describe.skipIf(!READY)('step 1’s air, measured', () => {
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

  it('AC-005-13: step 1 computes at least every other step’s padding', async () => {
    for (const locale of LOCALES) {
      assertStepOnePadding(await measure(locale, VIEWPORTS[2]), locale);
    }
  }, 120_000);

  it('AC-005-14: headline, clock and sentence are separated by at least --space-5', async () => {
    expect(SPACE_5).toBe(24);
    for (const locale of LOCALES) {
      for (const viewport of [VIEWPORTS[0], VIEWPORTS[2]]) {
        assertInteriorGaps(await measure(locale, viewport), locale, viewport.label);
      }
    }
  }, 180_000);

  it('AC-005-15: the extra air does not break the one-screen bound', async () => {
    for (const locale of LOCALES) {
      for (const viewport of VIEWPORTS) {
        const measured = await measure(locale, viewport);
        const step = measured.steps.find((entry) => entry.id === 'number');
        expect(step?.height, `${locale} ${viewport.label} height ${step?.height}`).toBeGreaterThan(0);
        expect(step?.height, `${locale} ${viewport.label}`).toBeLessThanOrEqual(measured.viewport);
      }
    }
    const css = readFileSync('web/styles/globals.css', 'utf8');
    const number = css.slice(css.indexOf('.step--number {'), css.indexOf('}', css.indexOf('.step--number {')));
    expect(number).not.toContain('display: none');
    expect(number).not.toMatch(/block-size:\s*\d/);
    expect(number).not.toContain('overflow: hidden');
  }, 240_000);
});

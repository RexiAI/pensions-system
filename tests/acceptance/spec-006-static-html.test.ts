import { existsSync, readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readClock } from '../../web/series/clock';
import { LOCALES } from '../../web/content/types';
import { countdownValue } from '../fixtures/series';
import { stepOf, storyPage } from '../helpers/story';
import { BROWSER_READY, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-32, AC-006-33 — step 1 is static HTML (Task 12).
 *
 * With no seconds there is nothing to tick, so the served markup is the value. The assertion is not
 * two HTTP requests — within the revalidation window they return the same bytes even if a clock
 * were baked in — but the visible text two seconds after load against the markup that was served.
 */
const SCENE = `(() => {
  const step = document.querySelector('[data-top-step="number"]');
  const numeral = step.querySelector('.clock__value--days');
  const declared = step.querySelector('[data-rendered-at]');
  return {
    numeral: numeral ? (numeral.textContent || '').trim() : null,
    renderedAt: declared ? declared.getAttribute('data-rendered-at') : null,
    text: (step.textContent || '').replace(/\\s+/g, ' ').trim(),
    clockState: !!step.querySelector('[data-clock-state]'),
    groupWrapper: !!step.querySelector('.clock[role="group"]'),
    hiddenTicker: !!step.querySelector('[data-top-step="number"] [aria-hidden="true"]'),
  };
})()`;

interface Scene {
  numeral: string | null;
  renderedAt: string | null;
  text: string;
  clockState: boolean;
  groupWrapper: boolean;
  hiddenTicker: boolean;
}

describe('AC-006-32: the revalidation window is declared', () => {
  it('AC-006-32: both public segments declare revalidate = 3600 and keep force-static', () => {
    // The window sits on each segment's layout — Next folds every segment's route config into one
    // policy, and the page keeps its `dynamic = 'force-static'` (AC-001-69, AC-003-44 untouched).
    for (const page of ['app/(public)/(home)/page.tsx', 'app/(public)/[locale]/page.tsx']) {
      expect(readFileSync(page, 'utf8'), page).toContain("export const dynamic = 'force-static'");
    }
    for (const layout of ['app/(public)/(home)/layout.tsx', 'app/(public)/[locale]/layout.tsx']) {
      expect(readFileSync(layout, 'utf8'), layout).toContain('export const revalidate = 3600');
    }
  });
});

describe.skipIf(!BROWSER_READY)('the served markup is the value', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-32: the numeral equals the declared instant’s reading, and nothing corrects it', async () => {
    const page = await served.open('es', { width: 1440, height: 900 });
    const before = await page.evaluate<Scene>(SCENE);

    expect(before.numeral, 'the numeral is in the served markup').not.toBeNull();
    expect(before.numeral ?? '', 'digits and separators only').toMatch(/^[\d.,\s\u00A0\u202F]+$/);
    expect(before.numeral ?? '', 'no placeholder').not.toBe('0');

    const instant = Date.parse(before.renderedAt ?? '');
    expect(Number.isFinite(instant), 'the render instant is machine-readable').toBe(true);
    const expected = readClock(countdownValue().anchor as string, instant).days;
    expect(before.numeral?.replace(/[^\d]/g, ''), 'the numeral is the declared instant’s reading').toBe(String(expected));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const after = await page.evaluate<Scene>(SCENE);
    // A ticking field would differ; the static value does not.
    expect(after.text, 'step 1 text two seconds after load').toBe(before.text);
  }, 120_000);
});

describe('AC-006-33: no client clock remains', () => {
  it('AC-006-33: the number step’s render path carries no client directive', () => {
    for (const file of [
      'web/components/public/NumberStep.tsx',
      'web/components/public/TopStepSection.tsx',
      'web/components/public/step-numerals.ts',
      'web/components/public/top-steps.ts',
      'web/components/PublicPage.tsx',
    ]) {
      expect(readFileSync(file, 'utf8'), file).not.toContain("'use client'");
    }
  });

  it('AC-006-33: the deleted machinery is gone and no timer is created for the story', () => {
    expect(existsSync('web/components/series/CountdownClock.tsx')).toBe(false);
    expect(existsSync('web/series/clock-ticker.ts')).toBe(false);
    for (const file of ['web/components/public/NumberStep.tsx', 'web/series/clock.ts', 'web/components/public/PublicStory.tsx']) {
      const source = readFileSync(file, 'utf8');
      for (const timer of ['setInterval(', 'setTimeout(', 'requestAnimationFrame(']) {
        expect(source, `${file}: ${timer}`).not.toContain(timer);
      }
    }
  });

  it('AC-006-33: step 1 carries no clock state attribute, hidden ticker or group wrapper', () => {
    for (const locale of LOCALES) {
      const step = stepOf(storyPage(locale), 'number');
      expect(step, locale).not.toContain('data-clock-state');
      expect(step, locale).not.toContain('role="group"');
      expect(step, locale).not.toContain('aria-hidden');
    }
  });
});

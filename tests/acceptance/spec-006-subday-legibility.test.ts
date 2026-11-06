import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { content } from '../fixtures/figures';
import { clockLabels, stepOf, storyPage } from '../helpers/story';
import { BROWSER_READY, DOM_PREAMBLE, MATRIX, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-05, AC-006-06 — the sub-day row is gone (Task 3 superseded by Task 11).
 *
 * Revision 1 required the three fields to grow to a legible size; revision 2 removes them. The ids
 * stay cited and the reversal is visible: the row is absent from step 1 and the strings are absent
 * from the whole page.
 */
const GROUP = `(() => {
  ${DOM_PREAMBLE}
  const numeral = document.querySelector('[data-top-step="number"] .clock__value--days');
  const group = numeral ? numeral.closest('.clock__field--days') : null;
  const sizes = group
    ? [...group.querySelectorAll('*')].map((el) => parseFloat(getComputedStyle(el).fontSize))
    : [];
  const label = document.querySelector('[data-top-step="number"] .step__label');
  const sentence = document.querySelector('[data-top-step="number"] .step__sentence');
  return {
    inGroup: sizes,
    labelSize: label ? parseFloat(getComputedStyle(label).fontSize) : 0,
    labelInGroup: group ? group.contains(label) : true,
    sentenceGap: sentence ? parseFloat(getComputedStyle(sentence).marginBlockStart) : 0,
  };
})()`;

interface GroupMeasurement {
  inGroup: number[];
  labelSize: number;
  labelInGroup: boolean;
  sentenceGap: number;
}

describe.skipIf(!BROWSER_READY)('the number group’s sizes and the gap it leaves', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-05: no leaf inside the number group computes 12 or 13 px', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const measured = await served.measure<GroupMeasurement>(locale, viewport, GROUP);
        for (const size of measured.inGroup) {
          expect(size, `${locale} ${viewport.width}: group size`).not.toBe(12);
          expect(size, `${locale} ${viewport.width}: group size`).not.toBe(13);
        }
        // The step label's 12 px caps treatment is a label, outside this criterion's boundary.
        expect(measured.labelInGroup, `${locale} ${viewport.width}: label outside the group`).toBe(false);
        expect(measured.labelSize, `${locale} ${viewport.width}: label is 12`).toBe(12);
        // Nothing is left of the empty row: the gap is the sentence's own --space-5.
        expect(measured.sentenceGap, `${locale} ${viewport.width}: sentence gap`).toBe(24);
      }
    }
  }, 300_000);

  it('AC-006-06: the page still has no horizontal overflow at 320 px', async () => {
    for (const locale of LOCALES) {
      const measured = await served.measure<{ overflow: number }>(
        locale,
        { width: 320, height: 900 },
        `(() => ({ overflow: document.documentElement.scrollWidth - window.innerWidth }))()`,
      );
      expect(measured.overflow, locale).toBeLessThanOrEqual(0);
    }
  }, 180_000);
});

describe('AC-006-05/06: the row and its strings are absent from the DOM', () => {
  it('AC-006-05: no sub-day cell, value or label is present in step 1', () => {
    for (const locale of LOCALES) {
      const step = stepOf(storyPage(locale), 'number');
      expect(step, locale).not.toContain('clock__field--sub');
      expect(step, locale).not.toContain('clock__value--sub');
      const labels = clockLabels(step);
      expect(labels, locale).toEqual([content(locale).t('countdown.clock.days')]);
    }
  });

  it('AC-006-06: no element renders a sub-day string as a field label, story or method', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const labels = clockLabels(html);
      // One label renders, and it is the unit `días`: the three sub-day strings have no renderer
      // anywhere on the page. A substring scan would match `s` and `min` inside ordinary prose, so
      // the assertion is on the field labels and on the sub-day cell markup.
      expect(labels, locale).toEqual([content(locale).t('countdown.clock.days')]);
      expect(html, locale).not.toContain('clock__field--sub');
      expect(html, locale).not.toContain('clock__value--sub');
    }
  });
});

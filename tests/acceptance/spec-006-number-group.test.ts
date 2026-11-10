import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LOCALES } from '../../web/content/types';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { content } from '../fixtures/figures';
import { countdownSeries, countdownValue } from '../fixtures/series';
import { clockLabels, metodoPage, stepOf, storyPage } from '../helpers/story';
import { renderComponent } from '../fixtures/figures';
import { BROWSER_READY, DOM_PREAMBLE, MATRIX, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';

/**
 * AC-006-03, AC-006-04 — the number group is one measured quantity (Task 2).
 *
 * The gap is measured on ink, to 0.1 px, because the design measured exactly 12.0 px once the
 * `5ch` reservation was dropped: the boundary is inclusive and the rounding is stated.
 */
const GAP = `(() => {
  ${DOM_PREAMBLE}
  const numeral = document.querySelector('[data-top-step="number"] .clock__value--days');
  const unit = document.querySelector('[data-top-step="number"] .clock__label');
  const numeralInk = inkOf(numeral);
  const unitInk = inkOf(unit);
  return {
    gap: unitInk.left - numeralInk.right,
    unitSize: parseFloat(getComputedStyle(unit).fontSize),
    sameLine: numeralInk.top < unitInk.bottom && unitInk.top < numeralInk.bottom,
  };
})()`;

interface GapMeasurement {
  gap: number;
  unitSize: number;
  sameLine: boolean;
}

describe.skipIf(!BROWSER_READY)('the unit beside its numeral, measured', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-03: the ink gap is at most 12 px, the unit stays legible and on one line', async () => {
    for (const viewport of MATRIX) {
      for (const locale of LOCALES) {
        const measured = await served.measure<GapMeasurement>(locale, viewport, GAP);
        // 12 px is the flex gap; the numeral's tracking can only tighten it. Inclusive at 12.
        expect(Number(measured.gap.toFixed(1)), `${locale} ${viewport.width} gap`).toBeLessThanOrEqual(12);
        expect(measured.gap, `${locale} ${viewport.width} gap is positive`).toBeGreaterThan(0);
        expect(measured.unitSize, `${locale} ${viewport.width} unit size`).toBeGreaterThanOrEqual(15);
        expect(measured.sameLine, `${locale} ${viewport.width} one line`).toBe(true);
      }
    }
  }, 300_000);
});

/** The number group: the nearest ancestor of the day numeral that also contains the unit. */
function groupOf(html: string): string {
  const at = html.indexOf('clock__field--days');
  if (at === -1) return '';
  return html.slice(at, html.indexOf('</p>', at));
}

describe('AC-006-04: the group publishes exactly one quantity', () => {
  it('AC-006-04: it holds the day numeral and `días`, and nothing else', () => {
    for (const locale of LOCALES) {
      const html = storyPage(locale);
      const group = groupOf(html);
      const local = content(locale);
      expect(group, locale).not.toBe('');
      expect(group, locale).toContain('clock__value--days');
      expect(group, locale).toContain(`class="clock__label">${local.t('countdown.clock.days')}<`);
      // No years numeral, no second unit, no sub-day cell, no time-of-day value.
      for (const marker of ['countdown__numeral', 'clock__value--sub', 'clock__field--sub', 'countdown__unit']) {
        expect(group, `${locale}: ${marker}`).not.toContain(marker);
      }
      const labels = clockLabels(group);
      expect(labels, locale).toEqual([local.t('countdown.clock.days')]);
    }
  });

  it('AC-006-04: absent from the DOM, not hidden, and no content key was deleted', () => {
    const html = storyPage('es');
    // Absent everywhere in step 1, so no CSS rule has to hide it.
    const step = stepOf(html, 'number');
    expect(step).not.toContain('clock__value--sub');
    expect(step).not.toContain('countdown__numeral');
    // The keys the removed fields used are still declared in the content model (AC-005-34).
    const strings = content('es').strings;
    for (const key of ['countdown.clock.days', 'countdown.clock.hours', 'countdown.clock.minutes', 'countdown.clock.seconds'] as const) {
      expect(strings[key]?.trim(), key).toBeTruthy();
    }
    expect(countdownValue().anchor).not.toBeNull();
  });
});

describe('AC-002-13/14: the surviving group invariants', () => {
  it('AC-002-13: “no anchor, no clock” still holds', () => {
    // The group's carrier file went with the clock; the invariant is re-cited here (spec 006 §4.3).
    const notCrossed = { ...countdownValue(), state: 'not-crossed' as const, anchor: null, thresholdYear: null, years: null };
    const html = renderComponent(PublicPage, {
      content: content('es'),
      figures: [],
      citations: citationRegistry,
      freshnessWindowDays: 45,
      stale: false,
      series: [{ ...countdownSeries(), value: notCrossed }],
      now: new Date(Date.parse('2026-10-31T10:00:00Z')),
      pageKind: 'historia',
    });
    expect(html).not.toContain('clock__value--days');
    expect(html).toContain(content('es').t('countdown.notCrossed', { year: notCrossed.horizonEnd }));
  });

  it('AC-002-14: the anchor date stays visible text, and the group never states the crossing', () => {
    const now = Date.parse('2026-10-31T10:00:00Z');
    for (const locale of LOCALES) {
      const method = metodoPage(locale, { nowMs: now });
      expect(method, locale).toContain('2042');
      expect(method, locale).toContain(content(locale).t('countdown.clock.anchorLabel'));
      const step = stepOf(storyPage(locale, { nowMs: now }), 'number');
      const group = /<div class="clock"[^>]*>([\s\S]*?)<\/div>/.exec(step)?.[1] ?? '';
      expect(group, locale).not.toMatch(/cruza|cruz|alcanza|alcanz|valid|supera|corrobor|cross|reaches|atteint|erreicht|raggiunge/i);
    }
  });
});

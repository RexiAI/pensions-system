import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { formatValue } from '../../web/content/format';
import type { ValueKind } from '../../web/content/format';
import { content } from '../fixtures/figures';
import { shareFigure } from '../fixtures/figures';
import { VIEW_BUILDERS } from '../../web/components/metrics/views';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { shareOfGdp } from '../../web/metrics/pension-share';

/**
 * Percentage points are not a fraction.
 *
 * `fig-02` stores the published `% of GDP` unit verbatim — `{"raw": 13.23, "share": 13.23}` — so
 * the number already *is* the percentage. Formatting it with `Intl`'s `style: 'percent'` (the
 * formatter for a fraction, which multiplies by 100) rendered `1323 %`. The suite stayed green
 * because every expectation was derived by calling the function under test, so the factor-of-100
 * error was asserted as correct. These assertions name the exact strings instead.
 *
 * The unit choice is grounded in AC-001-86: the international figure computes
 * `expenditure / GDP × 100` and the result *is* `10.00 (% of GDP)`, i.e. points are the stored
 * representation at ingest → derive → render. Only the presentation was wrong.
 */
const NBSP = '\u00A0';

/** The kind a percentage point is rendered with. Fails as an unknown kind until it exists. */
const POINTS: ValueKind = 'percentPoints';

const render = (value: number, locale: 'es' | 'en' | 'fr' | 'de' | 'it'): string =>
  formatValue(value, POINTS, locale, 'no definido');

describe('percentage points are rendered as points, never as a fraction', () => {
  it('AC-001-86: the %-of-GDP value is stored in points and rendered in points', () => {
    const computed = shareOfGdp(150_000_000_000, 1_500_000_000_000);
    expect(computed).toBe(10);
    expect(formatValue(computed, POINTS, 'es', 'no definido')).toBe(`10,00${NBSP}%`);
  });

  it('renders 13.23 points as "13,23 %" in es and "13.23%" in en', () => {
    expect(render(13.23, 'es')).toBe(`13,23${NBSP}%`);
    expect(render(13.23, 'en')).toBe('13.23%');
  });

  it('renders 9.82 points as "9,82 %" in es and "9.82%" in en', () => {
    expect(render(9.82, 'es')).toBe(`9,82${NBSP}%`);
    expect(render(9.82, 'en')).toBe('9.82%');
  });

  it('uses the locale decimal separator and the design’s percent suffix in every locale', () => {
    // design §Number and date formatting, "Percent" row: `4,2 %` (nbsp) in es/de/fr/it, `4.2%` in en.
    expect(render(14.39, 'es')).toBe(`14,39${NBSP}%`);
    expect(render(14.39, 'de')).toBe(`14,39${NBSP}%`);
    expect(render(14.39, 'fr')).toBe(`14,39${NBSP}%`);
    expect(render(14.39, 'it')).toBe(`14,39${NBSP}%`);
    expect(render(14.39, 'en')).toBe('14.39%');
  });

  it('never renders a percent-points value multiplied by 100', () => {
    // The defect's signature: a value already in points, scaled again (13.23 -> 1323, 9.82 -> 982).
    for (const points of [9.82, 10.13, 13.23, 14.39, 0.4, 99.99]) {
      const rendered = render(points, 'es');
      const asPoints = `${points.toFixed(2).replace('.', ',')}${NBSP}%`;
      const asFraction = `${Math.round(points * 100)}${NBSP}%`;
      expect(rendered).toBe(asPoints);
      expect(rendered).not.toBe(asFraction);
    }
  });

  it('renders the committed fig-02 first, latest and maximum observations as their own numbers', () => {
    const figure = readDerivedFigures('data/derived').find((entry) => entry.figureId === 'fig-02');
    if (!figure) throw new Error('fig-02 is not committed');
    const value = figure.value as {
      first: { share: number };
      latest: { share: number };
      max: number;
    };

    expect(value.first.share).toBe(9.82);
    expect(value.latest.share).toBe(13.23);
    expect(value.max).toBe(14.39);

    expect(formatValue(value.first.share, POINTS, 'es', 'no definido')).toBe(`9,82${NBSP}%`);
    expect(formatValue(value.latest.share, POINTS, 'es', 'no definido')).toBe(`13,23${NBSP}%`);
    expect(formatValue(value.max, POINTS, 'es', 'no definido')).toBe(`14,39${NBSP}%`);
  });

  it('no percent-points value ever renders as four digits before the sign (property)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 9_999 }), (hundredths) => {
        const points = hundredths / 100;
        expect(formatValue(points, POINTS, 'en', 'no definido')).toBe(`${points.toFixed(2)}%`);
        expect(formatValue(points, POINTS, 'es', 'no definido')).toBe(
          `${points.toFixed(2).replace('.', ',')}${NBSP}%`,
        );
      }),
      { numRuns: 200 },
    );
  });

  it('falls back to the null label for a value that does not exist', () => {
    expect(formatValue(null, POINTS, 'es', 'no definido')).toBe('no definido');
    expect(formatValue(Number.NaN, POINTS, 'es', 'no definido')).toBe('no definido');
  });
});

describe('the fig-02 view formats its own values as points', () => {
  it('formats the headline, the readout and the table cells without scaling them', () => {
    const es = content('es');
    const view = VIEW_BUILDERS[2]({ content: es, figure: shareFigure() });

    expect(view.format(13.23)).toBe(`13,23${NBSP}%`);
    expect(view.readout).toEqual([
      { label: es.t('readout.latest'), value: `13,23${NBSP}%` },
      { label: es.t('readout.first'), value: `9,82${NBSP}%` },
      { label: es.t('readout.max'), value: `13,23${NBSP}%` },
    ]);
    expect(view.rows).toEqual([
      ['1995', `9,82${NBSP}%`],
      ['2010', `10,50${NBSP}%`],
      ['2024', `13,23${NBSP}%`],
    ]);
  });
});

describe('a fraction still renders as a fraction', () => {
  it('keeps the existing one-decimal percent rendering for ratios expressed as fractions', () => {
    expect(formatValue(0.02, 'percent', 'es', 'no definido')).toBe(`2${NBSP}%`);
    expect(formatValue(0.02, 'percent', 'en', 'no definido')).toBe('2%');
    expect(formatValue(1, 'percent', 'es', 'no definido')).toBe(`100${NBSP}%`);
    expect(formatValue(-1, 'percent', 'es', 'no definido')).toBe(`-100${NBSP}%`);
  });

  it('uses one percent suffix for both kinds in a single locale', () => {
    const fraction = formatValue(0.042, 'percent', 'it', 'no definido');
    const points = formatValue(4.2, POINTS, 'it', 'no definido');
    expect(fraction).toBe(`4,2${NBSP}%`);
    expect(points).toBe(`4,20${NBSP}%`);
    expect(fraction.slice(-2)).toBe(points.slice(-2));
  });
});

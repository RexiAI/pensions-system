import { describe, expect, it } from 'vitest';
import { formatValue } from '../../web/content/format';
import { NumberStep } from '../../web/components/public/NumberStep';
import { thresholdNumerals } from '../../web/components/public/step-numerals';
import type { TopStep } from '../../web/components/public/top-steps';
import { TOP_STEPS } from '../../web/components/public/top-steps';
import { Panel } from '../../web/components/series/PyramidPanel';
import { PyramidPlate } from '../../web/components/series/PyramidPlate';
import { AGE_BANDS, bandLabel } from '../../web/series/age-bands';
import type { BandShare, PyramidValue, YearStructure } from '../../web/series/age-structure';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue, pyramidSeries, pyramidValue } from '../fixtures/series';

/**
 * Assertions the shipped suite does not make, each written for a survivor of stage 5a's mutation
 * run. They are here rather than in the scenario suites because each names one branch a mutant can
 * flatten without any scenario noticing — the panel head's separator, and the two guards that keep
 * an empty payload from throwing instead of rendering nothing.
 *
 * The shape is the one specs 003–005 established: one block per killed mutant cluster, on rendered
 * output, never on a helper that rebuilds the expectation.
 */

const ES = content('es');

/** One panel's year, from the committed band list, with every share supplied. */
function year(bands: BandShare[]): YearStructure {
  return {
    year: 2025,
    state: 'observed',
    hue: 'measured',
    population: 48_000_000,
    bands,
    readout: { over65: 0, under20: 0 },
  };
}

const BANDS: BandShare[] = AGE_BANDS.slice(0, 3).map((band, index) => ({
  band,
  male: index + 1,
  female: index + 1,
  total: (index + 1) * 2,
}));

/** The visible text of a fragment: tags removed *without* inserting a space in their place. */
function bareText(markup: string): string {
  return markup.replace(/<[^>]*>/g, '').trim();
}

describe('AC-006-04: the group reads as the numeral and the unit', () => {
  it('AC-006-04: the numeral and the unit are separated by a space', () => {
    // The 12 px gap is the flex container's `gap`, so a dropped `{' '}` changes nothing on
    // screen — measured, 1440×900 `es`: numeral right edge 779.22, unit left edge 791.22,
    // both before and after the text node is removed. What it changes is the group's text:
    // `textContent` reads `5534días`, so the two tokens stop being two words.
    const value = countdownValue();
    const nowMs = Date.parse('2026-10-31T10:00:00Z');
    const html = renderComponent(NumberStep, {
      step: TOP_STEPS[0] as TopStep,
      content: ES,
      countdown: value,
      nowMs,
    });
    const group = /<p class="clock__field--days">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
    const numeral = /class="clock__value[^"]*clock__value--days">([^<]*)</.exec(group)?.[1] ?? '';
    expect(numeral, 'the numeral renders').toMatch(/\d/);
    expect(bareText(group)).toBe(`${numeral} ${ES.t('countdown.clock.days')}`);
  });
});

describe('AC-006-27: the panel prints its state word beside its year', () => {
  it('AC-006-27: the year and the state word are separated by a space', () => {
    // `textOf` replaces every tag with a space, which would hide the separator; reading the
    // element's own text concatenates its two spans, so a dropped `{' '}` reads `2025observado`.
    const html = renderComponent(Panel, { year: year(BANDS), content: ES, axisMax: 4.5 });
    const head = /<p class="demography__panel-head">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? '';
    expect(head, 'the panel head renders').not.toBe('');
    expect(bareText(head)).toBe(`2025 ${ES.t('demography.year.observed')}`);
  });
});

describe('AC-004-16: a panel names a band even when it is given none', () => {
  it('AC-004-16: an empty band list annotates the base band instead of throwing', () => {
    // `annotatedBand` falls back to the wide foot when the sort has nothing to pick. Without the
    // guard the panel throws on `largest.band`, which is a crash on the page, not an empty state.
    const html = renderComponent(Panel, { year: year([]), content: ES, axisMax: 4.5 });
    expect(html).toContain('demography__annotation');
    expect(html).toContain(ES.t('demography.year.observed'));
  });
});

describe('AC-004-15: the finding sentence survives an empty year list', () => {
  it('AC-004-15: no years renders an empty finding sentence, not a thrown render', () => {
    // `findingSentence` returns '' when the series has no first or last year. Reading `first.year`
    // instead would throw before the disclosure renders at all.
    const base = pyramidSeries();
    const series = {
      ...base,
      value: { ...(base.value as PyramidValue), years: [] } as PyramidValue,
    };
    expect(() => renderComponent(PyramidPlate, { content: ES, series })).not.toThrow();
    const html = renderComponent(PyramidPlate, { content: ES, series });
    expect(html).toContain('demography__finding"></p>');
  });
});

describe('AC-006-32: the sentence states the date as absent when there is no anchor', () => {
  it('AC-006-32: a computed countdown with no anchor writes the empty date, not a phantom one', () => {
    // `measured()` returns undefined for an anchor-less countdown, so the sentence is the whole
    // body: the date slot must stay empty. A literal fallback there prints a word where the date
    // belongs — the group still shows no numeral, so nothing else in the step notices.
    const countdown = { ...countdownValue(), anchor: null, thresholdYear: null, years: null };
    const html = renderComponent(NumberStep, {
      step: TOP_STEPS[0] as TopStep,
      content: ES,
      countdown,
      nowMs: Date.parse('2026-10-31T10:00:00Z'),
    });
    expect(html).toContain(
      ES.t('steps.number.sentence', { date: '', ...thresholdNumerals('es') }),
    );
  });
});

describe('AC-004-19: the plate renders nothing unless the value is computed', () => {
  it('AC-004-19: a computed series with a null value renders nothing instead of throwing', () => {
    // The availability test and the null test are two conditions, not one. A series marked
    // computed whose value is still null must take the empty branch; the conjoined form falls
    // through to `value.years` and crashes the page.
    const series = { ...pyramidSeries(), availability: 'computed' as const, value: null };
    expect(() => renderComponent(PyramidPlate, { content: ES, series })).not.toThrow();
    expect(renderComponent(PyramidPlate, { content: ES, series })).toBe('');
  });

  it('AC-004-19: an unavailable series renders nothing even when a stale value is attached', () => {
    // The inverse case. The shipped fixture pairs `unavailable` with a null value, so it cannot
    // tell the availability test from the null test; a series that keeps its last value can.
    const base = pyramidSeries();
    const series = { ...base, availability: 'unavailable' as const, value: base.value };
    expect(renderComponent(PyramidPlate, { content: ES, series })).toBe('');
  });
});

describe('AC-001-97: a band a year omits still reads as a share', () => {
  it('AC-001-97: a missing band reads as the zero share, not as an unformatted value', () => {
    // `bandByYear` fills a gap with a zero share. Flattening that filler to `{}` leaves the two
    // cells undefined, which the formatter prints as `NaN` — in the accessible table, where the
    // number is the claim.
    const omitted = AGE_BANDS[2] as number;
    const value = pyramidValue();
    const years = value.years.map((year, index) =>
      index === 0 ? { ...year, bands: year.bands.filter((entry) => entry.band !== omitted) } : year,
    );
    const series = { ...pyramidSeries(), value: { ...value, years } as PyramidValue };

    const html = renderComponent(PyramidPlate, { content: ES, series });
    const row = new RegExp(`<tr><th scope="row">${bandLabel(omitted)}</th>([\\s\\S]*?)</tr>`).exec(html)?.[1] ?? '';
    expect(row, 'the band still has a row').not.toBe('');
    expect(row).not.toContain('NaN');
    expect(row).toContain(formatValue(0, 'percentPoints', 'es', ES.t('table.notDefined')));
  });
});

import { describe, expect, it } from 'vitest';
import { DISCOUNT_RATES, implicitDebt, presentValue } from '../../web/metrics/implicit-debt';
import { internationalRendering } from '../../web/manifest/definitions';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { renderPlate } from '../fixtures/figures';

describe('implicit debt', () => {
  it('AC-001-24: the present value of obligations is discounted correctly', () => {
    const expected = 100 / 1.02 + 100 / 1.02 ** 2 + 100 / 1.02 ** 3;

    expect(presentValue([100, 100, 100], 0.02)).toBeCloseTo(expected, 10);
  });

  it('AC-001-25: all four rates are present and there is no single headline value', () => {
    const result = implicitDebt([100, 100, 100], 50);

    expect(Object.keys(result.byRate)).toEqual(['0.01', '0.02', '0.03', '0.04']);
    expect(Object.keys(result.byRate)).toHaveLength(4);
    expect(result.rates).toEqual(DISCOUNT_RATES);
    // No path produces a single scalar: the only top-level numbers are the point-in-time
    // asset balance and nothing else, so no caller can render one headline figure.
    const numericTopLevel = Object.entries(result)
      .filter(([, value]) => typeof value === 'number')
      .map(([key]) => key);
    expect(numericTopLevel).toEqual(['assets']);
  });

  it('AC-001-26: assets are subtracted and a surplus stays negative', () => {
    const result = implicitDebt([1020], 1200);

    expect(result.presentValues['0.02']).toBeCloseTo(1000, 10);
    expect(result.byRate['0.02']).toBeCloseTo(-200, 10);
    expect(result.byRate['0.02']).toBeLessThan(0);
  });

  it('AC-001-27: implicit debt decreases as the rate increases', () => {
    const result = implicitDebt([100, 100, 100, 100], 0);
    const values = DISCOUNT_RATES.map((rate) => result.byRate[String(rate)] as number);

    for (let i = 1; i < values.length; i += 1) {
      expect(values[i] as number).toBeLessThan(values[i - 1] as number);
    }
  });

  it('AC-001-89: no internationally comparable implicit debt is presented', () => {
    const published = readDerivedFigures('data/derived');
    const rendering = internationalRendering('implicit-debt', published);

    expect(rendering.metric).toBe('implicit-debt');
    expect(rendering.definitionId).toBe('implicit-debt.national');
    expect(rendering.availability).toBe('unavailable');
    expect(rendering.reason).toBe(
      'no internationally comparable source for accrued obligations and system assets',
    );

    const figure = published.find((entry) => entry.figureId === 'fig-04');
    expect(figure?.definitionId).toBe('implicit-debt.national');
    expect(figure?.value).toBeNull();

    if (!figure) throw new Error('fig-04 is not published');
    const row = renderPlate(figure, 'en').toLowerCase();
    expect(row).toContain('internationally comparable source for accrued obligations');
    // The four-rate rule still applies to the metric's own definition: no single headline
    // value exists anywhere, because no value exists at all.
    expect(rendering.availability).not.toBe('computed');
  });
});

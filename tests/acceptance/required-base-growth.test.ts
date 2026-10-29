import { describe, expect, it } from 'vitest';
import { DEFINITION_IDS, internationalRendering } from '../../web/manifest/definitions';
import { readDerivedFigures } from '../../web/ingest/write-derived';
import { figureById } from '../../web/ingest/figures';
import { ASSUMED_INFLATION, ASSUMED_REAL_WAGE_GROWTH } from '../../web/ingest/figures';
import {
  annualisedGrowthRate,
  DEFAULT_G_WAGE_SWEEP,
  realRate,
  requiredBaseGrowth,
  sensitivityGrid,
} from '../../web/metrics/required-base-growth';
import type { BaseGrowthFigureValue } from '../../web/metrics/required-base-growth';
import type { SourceSnapshot } from '../../web/sources/types';

const HORIZON = { from: 2026, to: 2070 };

describe('required base growth', () => {
  it('AC-001-28: required growth is the real return minus wage growth', () => {
    const result = requiredBaseGrowth({
      rPaidNominal: 0.05,
      inflation: 0,
      gWage: 0.01,
      gProj: 0,
      horizon: HORIZON,
    });

    expect(result.rPaidReal).toBeCloseTo(0.05, 10);
    expect(result.gRequired).toBeCloseTo(0.04, 10);
  });

  it('AC-001-29: the gap is required growth minus projected growth', () => {
    const result = requiredBaseGrowth({
      rPaidNominal: 0.05,
      inflation: 0,
      gWage: 0.01,
      gProj: -0.01,
      horizon: HORIZON,
    });

    expect(result.gap).toBeCloseTo(0.05, 10);
    expect(result.gap).toBeGreaterThan(0);
  });

  it('AC-001-30: a shrinking base widens the gap', () => {
    const shrinking = requiredBaseGrowth({
      rPaidNominal: 0.05,
      inflation: 0,
      gWage: 0.01,
      gProj: -0.01,
      horizon: HORIZON,
    });

    expect(shrinking.gap).toBeCloseTo(0.04 - -0.01, 10);
    expect(shrinking.gap).toBeGreaterThan(shrinking.gRequired);
  });

  it('AC-001-31: every output carries its assumptions', () => {
    const result = requiredBaseGrowth({
      rPaidNominal: 0.031,
      inflation: 0.02,
      gWage: 0.01,
      gProj: -0.002,
      horizon: HORIZON,
    });

    expect(result.rPaidReal).toBeCloseTo(realRate(0.031, 0.02), 12);
    expect(result.gWage).toBe(0.01);
    expect(result.gProj).toBe(-0.002);
    expect(result.horizon).toEqual({ from: 2026, to: 2070 });
  });

  it('AC-001-32: the gap is monotonic in the return and in the projection', () => {
    const lower = updatedGap(0.04, -0.01);
    const higherReturn = updatedGap(0.06, -0.01);
    const higherProjection = updatedGap(0.04, 0.005);

    expect(higherReturn).toBeGreaterThan(lower);
    expect(higherProjection).toBeLessThan(lower);
  });

  it('AC-001-31: the sensitivity grid holds nine cells over the wage sweep and the band', () => {
    const cells = sensitivityGrid({
      band: { min: 0.01, central: 0.03, max: 0.05 },
      inflation: 0.02,
      gProj: -0.002,
      horizon: HORIZON,
    });

    expect(cells).toHaveLength(9);
    expect(new Set(cells.map((c) => c.gWage))).toEqual(new Set([0, 0.01, 0.02]));
  });

  it('AC-001-31: annualised growth is negative for a shrinking projected base', () => {
    const rate = annualisedGrowthRate(32_388_947, 31_000_000, 44);

    expect(rate).toBeLessThan(0);
  });
});

function updatedGap(rPaidNominal: number, gProj: number): number {
  return requiredBaseGrowth({
    rPaidNominal,
    inflation: 0,
    gWage: 0.01,
    gProj,
    horizon: HORIZON,
  }).gap;
}

describe('required base growth, international rendering', () => {
  it('AC-001-90: no internationally comparable required base growth is presented', () => {
    const published = readDerivedFigures('data/derived');
    const rendering = internationalRendering('required-base-growth', published);

    expect(rendering.metric).toBe('required-base-growth');
    expect(rendering.definitionId).toBe('required-base-growth.national');
    expect(rendering.availability).toBe('unavailable');
    expect(rendering.reason).toBe(
      'depends on the cohort return, which has no internationally comparable computation',
    );

    // The internationally comparable g_proj input is not published as a substitute metric:
    // no figure carries a projected-growth definition, and fig-05 carries no value.
    expect(DEFINITION_IDS.some((id) => id.includes('projection'))).toBe(false);
    const figure = published.find((entry) => entry.figureId === 'fig-05');
    expect(figure?.definitionId).toBe('required-base-growth.national');
    expect(figure?.value).toBeNull();
    expect(published.some((entry) => Object.keys(entry.assumptions ?? {}).includes('gProj'))).toBe(
      false,
    );
  });
});

/** A resolved snapshot of the shape `fig-05`'s compute body reads. */
function resolved(sourceId: string, payload: unknown): SourceSnapshot {
  return {
    sourceId,
    bytes: `bytes-${sourceId}`,
    resolved: true,
    retrievedAt: '2026-10-20T00:00:00Z',
    sourceUrl: [`https://example.org/${sourceId}`],
    publisher: 'Example',
    dataset: 'Example dataset',
    payload,
  };
}

/** The three sources `fig-05` requires, all resolved: the state that reaches the compute body. */
function baseGrowthSources(): ReadonlyMap<string, SourceSnapshot> {
  return new Map(
    [
      resolved('ss-average-contribution-pension', {
        cohort: {
          label: 'Representative cohort',
          contributionMinor: 10_000,
          pensionMinor: 20_000,
        },
      }),
      resolved('ine-life-expectancy-at-65', {
        COD: 'TM1657',
        Nombre: 'Esperanza de vida a los 65 años',
        Data: [{ Anyo: 2024, Valor: 20.0 }],
      }),
      resolved('ine-population-projection-working-age', {
        years: [
          { year: 2026, population: 40_000_000 },
          { year: 2070, population: 32_000_000 },
        ],
      }),
    ].map((entry) => [entry.sourceId, entry]),
  );
}

describe('the central cell of the sensitivity grid (T7, finding F1)', () => {
  /**
   * The grid is swept over the *nominal* band and deflated inside the formula, so the central
   * cell must be found by the inputs it was swept over — never by comparing a real rate to a
   * nominal one, which no non-zero inflation can ever satisfy.
   */
  it('AC-001-31: the central cell is the swept nominal return, deflated exactly once', () => {
    const figure = figureById('fig-05');
    if (!figure) throw new Error('fig-05 is not defined');

    const computed = figure.compute(baseGrowthSources());
    const value = computed.value as BaseGrowthFigureValue;

    // The defect case: both a non-zero nominal central IRR and a non-zero assumed inflation,
    // so nominal and real rates are guaranteed to differ.
    expect(value.band.central).toBeGreaterThan(0);
    expect(ASSUMED_INFLATION).not.toBe(0);
    expect(ASSUMED_REAL_WAGE_GROWTH).not.toBe(0);

    // The central cell is the one swept at the band's central nominal and the assumed wage growth.
    const centralCells = value.grid.filter(
      (cell) =>
        cell.rPaidNominal === value.band.central && cell.gWage === ASSUMED_REAL_WAGE_GROWTH,
    );
    expect(centralCells).toHaveLength(1);
    const central = centralCells[0]!;

    // The units are proven, not assumed: the cell's real rate is the band's central nominal
    // deflated once. Exact equality is legitimate — the same function over the same inputs.
    expect(central.rPaidReal).toBe(realRate(value.band.central, ASSUMED_INFLATION));
    expect(central.rPaidReal).not.toBe(value.band.central);
    expect(central.gWage).toBe(ASSUMED_REAL_WAGE_GROWTH);

    // Three wage assumptions against three band values: nine cells, each swept pair once.
    expect(value.grid).toHaveLength(9);
    expect(new Set(value.grid.map((cell) => cell.gWage))).toEqual(new Set(DEFAULT_G_WAGE_SWEEP));
    expect(new Set(value.grid.map((cell) => cell.rPaidNominal))).toEqual(
      new Set([value.band.min, value.band.central, value.band.max]),
    );

    // The published central is that cell, not a re-derivation of it.
    expect(value.central.rPaidReal).toBe(central.rPaidReal);
    expect(value.central.gWage).toBe(central.gWage);
    expect(value.central.gRequired).toBe(central.gRequired);
    expect(value.central.gap).toBe(central.gap);
    expect(computed.assumptions.inflation).toBe(ASSUMED_INFLATION);
    expect(computed.assumptions.gWage).toBe(ASSUMED_REAL_WAGE_GROWTH);

    // The central cell is reachable only while the assumed wage growth stays in the sweep.
    expect(DEFAULT_G_WAGE_SWEEP).toContain(ASSUMED_REAL_WAGE_GROWTH);
  });
});

describe('projected growth from the population projection (T7)', () => {
  /**
   * A projection carrying years on both sides of the horizon and one inside it. Any lookup that
   * takes the first entry, ignores the horizon, or subtracts the endpoints the wrong way round
   * annualises different populations over a different span, so the published `g_proj` changes —
   * which is what this test pins.
   */
  function projectionPayload(): unknown {
    return {
      years: [
        { year: 2010, population: 30_000_000 },
        { year: 2026, population: 40_000_000 },
        { year: 2050, population: 36_000_000 },
        { year: 2070, population: 32_000_000 },
      ],
    };
  }

  it('AC-001-31: g_proj annualises the horizon endpoints, not the first or the nearest year', () => {
    const figure = figureById('fig-05');
    if (!figure) throw new Error('fig-05 is not defined');

    const sources = new Map(baseGrowthSources());
    sources.set(
      'ine-population-projection-working-age',
      resolved('ine-population-projection-working-age', projectionPayload()),
    );

    const computed = figure.compute(sources);
    const value = computed.value as BaseGrowthFigureValue;

    // 40M at 2026 falling to 32M at 2070 is 44 years, not 60 (first entry), 4096 (endpoints
    // summed) or 20 (the interior decoy year paired with the end).
    expect(value.central.gProj).toBe(annualisedGrowthRate(40_000_000, 32_000_000, 44));
    expect(value.central.gProj).toBeCloseTo(-0.005058606285837319, 12);

    // The decoy years are distinguishable from the correct answer, so the assertion above is a
    // real pin rather than a value every lookup would happen to produce.
    expect(annualisedGrowthRate(30_000_000, 32_000_000, 60)).not.toBeCloseTo(
      value.central.gProj,
      6,
    );
    expect(annualisedGrowthRate(36_000_000, 32_000_000, 20)).not.toBeCloseTo(
      value.central.gProj,
      6,
    );

    // The same g_proj is what the figure publishes in its assumptions (visible input).
    expect(computed.assumptions.gProj).toBe(value.central.gProj);
  });
});

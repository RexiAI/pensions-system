import { describe, expect, it } from 'vitest';
import { ASSUMED_INFLATION, ASSUMED_REAL_WAGE_GROWTH, FIGURES, figureById } from '../../web/ingest/figures';
import { runCompute } from '../../web/ingest/run-compute';
import type { ComputeOptions } from '../../web/ingest/run-compute';
import { sha256Hex } from '../../web/manifest/hash';
import { contributionCover } from '../../web/metrics/contribution-cover';
import { cohortReturn } from '../../web/metrics/cohort-irr';
import { implicitDebt } from '../../web/metrics/implicit-debt';
import { realRate } from '../../web/metrics/required-base-growth';
import type { BaseGrowthFigureValue } from '../../web/metrics/required-base-growth';
import { PUBLISHED_GEO } from '../../web/sources/countries';
import type { SourceSnapshot } from '../../web/sources/types';
import type { DerivedFigure } from '../../web/ingest/types';
import type { CountryConfiguration } from '../../web/sources/countries';

const NOW = new Date('2026-10-25T12:00:00Z');

/**
 * The ingest harness against *resolved* inputs for every figure (T2, T3–T7, AC-001-04/05/06/07/83/86).
 *
 * The committed snapshots leave five of the seven figures unresolved, so the committed-data
 * tests exercise only figures 1 and 2; the compute body of figures 3 to 7 has never executed.
 * These fixtures resolve every source, which is the only way to assert that each figure's
 * assumptions carry the values its formula actually consumed.
 */

interface StatDimension {
  codes: string[];
  labels: Record<string, string>;
}

function jsonStat(
  id: string[],
  dimensions: Record<string, StatDimension>,
  timeCodes: string[],
  values: number[],
): unknown {
  const value: Record<string, number> = {};
  values.forEach((entry, index) => {
    value[String(index)] = entry;
  });
  return {
    id,
    size: id.map((name) => dimensions[name]?.codes.length ?? 1),
    dimension: Object.fromEntries(
      id.map((name) => {
        const dimension = dimensions[name] ?? { codes: ['x'], labels: { x: 'x' } };
        return [
          name,
          {
            category: {
              index: Object.fromEntries(dimension.codes.map((code, index) => [code, index])),
              label: dimension.labels,
            },
          },
        ];
      }),
    ),
    time: timeCodes,
    value,
  };
}

const years = (codes: string[]): Record<string, string> =>
  Object.fromEntries(codes.map((code) => [code, code]));

function beneficiariesPayload(timeCodes: string[], values: number[]): unknown {
  return jsonStat(
    ['geo', 'spdepb', 'spdepm', 'sex', 'unit', 'time'],
    {
      geo: { codes: ['ES'], labels: { ES: 'Spain' } },
      spdepb: { codes: ['OLD'], labels: { OLD: 'Old age pension' } },
      spdepm: { codes: ['TOTAL'], labels: { TOTAL: 'Total' } },
      sex: { codes: ['T'], labels: { T: 'Total' } },
      unit: { codes: ['PS'], labels: { PS: 'Person' } },
      time: { codes: timeCodes, labels: years(timeCodes) },
    },
    timeCodes,
    values,
  );
}

function employmentPayload(timeCodes: string[], values: number[]): unknown {
  return jsonStat(
    ['geo', 'indic_em', 'sex', 'age', 'unit', 'time'],
    {
      geo: { codes: ['ES'], labels: { ES: 'Spain' } },
      indic_em: {
        codes: ['EMP_LFS'],
        labels: { EMP_LFS: 'Total employment (resident population concept - LFS)' },
      },
      sex: { codes: ['T'], labels: { T: 'Total' } },
      age: { codes: ['Y15-64'], labels: { 'Y15-64': 'From 15 to 64 years' } },
      unit: { codes: ['THS'], labels: { THS: 'Thousand persons' } },
      time: { codes: timeCodes, labels: years(timeCodes) },
    },
    timeCodes,
    values,
  );
}

function expenditurePayload(timeCodes: string[], values: number[]): unknown {
  return jsonStat(
    ['geo', 'spdepb', 'spdepm', 'unit', 'time'],
    {
      geo: { codes: ['ES'], labels: { ES: 'Spain' } },
      spdepb: { codes: ['TOTAL'], labels: { TOTAL: 'Total' } },
      spdepm: { codes: ['TOTAL'], labels: { TOTAL: 'Total' } },
      unit: {
        codes: ['PC_GDP'],
        labels: { PC_GDP: 'Percentage of gross domestic product (GDP)' },
      },
      time: { codes: timeCodes, labels: years(timeCodes) },
    },
    timeCodes,
    values,
  );
}

function snapshot(
  sourceId: string,
  payload: unknown,
  overrides: Partial<SourceSnapshot> = {},
): SourceSnapshot {
  return {
    sourceId,
    bytes: `raw-bytes-${sourceId}`,
    resolved: true,
    retrievedAt: '2026-09-01T00:00:00Z',
    sourceUrl: [`https://example.org/${sourceId}`],
    publisher: 'Example',
    dataset: 'Example dataset',
    payload,
    ...overrides,
  };
}

/**
 * Every source the seven figures require, resolved. Beneficiaries cover 2020–2024 while
 * employment covers 2022–2024, so the aligned series has three points and the four
 * unshared beneficiary years are dropped rather than forward-filled (T3).
 */
function allSources(): SourceSnapshot[] {
  return [
    snapshot('eurostat-spr-pns-ben', beneficiariesPayload(
      ['2020', '2021', '2022', '2023', '2024'],
      [5_000_000, 5_500_000, 6_000_000, 6_500_000, 7_059_353],
    )),
    snapshot('eurostat-lfsi-emp-a', employmentPayload(['2022', '2023', '2024'], [19_000, 20_000, 21_300])),
    snapshot('eurostat-spr-exp-pens', expenditurePayload(['2023', '2024'], [13.0, 13.23])),
    snapshot('ss-average-contribution-pension', {
      cohort: { label: 'Representative cohort', contributionMinor: 10_000, pensionMinor: 20_000 },
    }),
    snapshot('ine-life-expectancy-at-65', {
      COD: 'TM1657',
      Nombre: 'Esperanza de vida a los 65 años',
      Data: [
        { Anyo: 2022, Valor: 21.1 },
        { Anyo: 2024, Valor: 20.0 },
      ],
    }),
    snapshot('airef-obligations', { obligationsMinor: [100_000, 110_000] }),
    snapshot('fondo-de-reserva', { assetsMinor: 500_000, asOf: '2025-12-31' }),
    snapshot('ine-population-projection-working-age', {
      years: [
        { year: 2026, population: 40_000_000 },
        { year: 2050, population: 36_000_000 },
        { year: 2070, population: 32_000_000 },
      ],
    }),
    snapshot('ss-pensioners', {
      months: [
        { month: '2026-01', value: 9_000_000 },
        { month: '2026-02', value: 9_100_000 },
      ],
    }),
    snapshot('ss-affiliates', {
      months: [
        { month: '2025-12', value: 20_000_000 },
        { month: '2026-02', value: 20_500_000 },
      ],
    }),
    snapshot('igae-social-contributions', {
      years: [
        { year: 2024, value: 120_000 },
        { year: 2025, value: 130_000 },
      ],
    }),
    snapshot('igae-pension-expenditure', {
      years: [
        { year: 2023, value: 140_000 },
        { year: 2025, value: 150_000 },
      ],
    }),
  ];
}

function options(snapshots: SourceSnapshot[], overrides: Partial<ComputeOptions> = {}): ComputeOptions {
  return {
    figures: FIGURES,
    snapshots: new Map(snapshots.map((entry) => [entry.sourceId, entry])),
    now: NOW,
    freshnessWindowDays: 90,
    reproducePath: 'scripts/compute.ts',
    fileExists: (path) => path === 'scripts/compute.ts',
    ...overrides,
  };
}

function figureNamed(figures: readonly DerivedFigure[], figureId: string): DerivedFigure {
  const found = figures.find((figure) => figure.figureId === figureId);
  if (!found) throw new Error(`no figure ${figureId}`);
  return found;
}

describe('every figure computes from resolved sources', () => {
  const report = runCompute(options(allSources()));

  it('publishes every figure as computed from resolved sources', () => {
    // Finding F1 is fixed: the central cell is matched on the nominal band centre the grid was
    // swept over, so `fig-05` reaches a value instead of throwing on a deflated-vs-nominal
    // comparison. Its central cell and its units are asserted in
    // `tests/acceptance/required-base-growth.test.ts`.
    expect(report.figures.filter((figure) => figure.availability === 'computed').map((figure) => figure.figureId)).toEqual([
      'fig-01',
      'fig-02',
      'fig-03',
      'fig-04',
      'fig-05',
      'fig-06',
      'fig-07',
    ]);
    expect(report.figures.map((figure) => figure.figureId)).toEqual([
      'fig-01',
      'fig-02',
      'fig-03',
      'fig-04',
      'fig-05',
      'fig-06',
      'fig-07',
    ]);
  });

  it('aligns the two international series on the years both observe', () => {
    const value = figureNamed(report.figures, 'fig-01').value as {
      points: Array<{ period: string; numerator: number; denominator: number }>;
      latest: { period: string; numerator: number; denominator: number; ratio: number };
      first: { period: string };
      meanLastTenYears: number;
    };

    // 2020–2021 are dropped: the ratio is aligned, never forward-filled.
    expect(value.points.map((point) => point.period)).toEqual(['2022', '2023', '2024']);
    expect(value.first.period).toBe('2022');
    expect(value.latest.period).toBe('2024');
    expect(value.latest.numerator).toBe(7_059_353);
    // Thousand persons is converted to persons before dividing.
    expect(value.latest.denominator).toBe(21_300_000);
    expect(value.latest.ratio).toBe(0.33);
    expect(value.meanLastTenYears).toBe(0.32);
  });

  it('records what figure 1 actually counted, as resolved codes not guesses', () => {
    expect(figureNamed(report.figures, 'fig-01').assumptions).toEqual({
      pensionType: 'OLD',
      pensionMeansTesting: 'TOTAL',
      pensionUnit: 'PS',
      beneficiarySex: 'T',
      employmentIndicator: 'EMP_LFS',
      employmentUnit: 'THS',
      employmentAge: 'From 15 to 64 years',
      employmentAgeCode: 'Y15-64',
      firstYear: 2022,
      lastYear: 2024,
      alignment: 'years observed by both series',
    });
  });

  it('records figure 2 as the publisher percentage, with its own codes', () => {
    const figure = figureNamed(report.figures, 'fig-02');
    const value = figure.value as { latest: { year: number; share: number }; max: number };

    expect(value.latest).toMatchObject({ year: 2024, share: 13.23 });
    expect(value.max).toBe(13.23);
    expect(figure.assumptions).toEqual({
      unit: 'percent of GDP, as published by the publisher',
      unitCode: 'PC_GDP',
      pensionType: 'TOTAL',
      pensionMeansTesting: 'TOTAL',
      firstYear: 2023,
      lastYear: 2024,
    });
  });

  it('builds figure 3 from the cohort amounts and the latest life expectancy', () => {
    const figure = figureNamed(report.figures, 'fig-03');
    const expected = cohortReturn({
      entryAge: 25,
      retirementAge: 65,
      lifeExpectancyAtRetirement: 20,
      averageMonthlyContribution: 10_000,
      averageMonthlyPension: 20_000,
    });

    expect(figure.value).toMatchObject({
      yearsContributing: 40,
      yearsDrawing: 20,
      annualContribution: 120_000,
      annualPension: 280_000,
    });
    expect((figure.value as { central: number }).central).toBeCloseTo(expected.central as number, 12);
    expect(figure.assumptions).toEqual({
      entryAge: 25,
      retirementAge: 65,
      pensionPayments: 14,
      contributionMonths: 12,
      lifeExpectancyAtRetirement: 20,
    });
  });

  it('builds figure 4 as the four-rate set, with the asset date stated', () => {
    const figure = figureNamed(report.figures, 'fig-04');

    expect(figure.value).toEqual(implicitDebt([100_000, 110_000], 500_000));
    expect(figure.assumptions).toEqual({
      assetsAsOf: '2025-12-31',
      discountRates: '1,2,3,4 percent',
    });
    expect(Object.keys((figure.value as { byRate: object }).byRate)).toEqual([
      '0.01',
      '0.02',
      '0.03',
      '0.04',
    ]);
  });

  it('computes figure 5: it projects g_proj, sweeps the grid, and carries the central cell', () => {
    const figure = figureNamed(report.figures, 'fig-05');
    const value = figure.value as BaseGrowthFigureValue;

    // Reaching a value at all is the fix for finding F1: the central cell is now found by the
    // nominal band centre the grid was swept over, so no problem is recorded for this figure.
    expect(report.problems.filter((entry) => entry.figureId === 'fig-05')).toHaveLength(0);
    expect(figure.availability).toBe('computed');

    // The sweep is the full 3 x 3 grid over the wage sweep and the T5 band.
    expect(value.grid).toHaveLength(9);

    // g_proj was derived from the population projection (40M falling to 32M), not defaulted.
    expect(value.central.gProj).toBeLessThan(0);
    expect(figure.assumptions.gProj).toBe(value.central.gProj);

    // The published central is the band's central nominal, deflated exactly once.
    expect(value.central.rPaidReal).toBe(realRate(value.band.central, ASSUMED_INFLATION));
    expect(value.central.gWage).toBe(ASSUMED_REAL_WAGE_GROWTH);
    expect(value.central.horizon).toEqual({ from: 2026, to: 2070 });
  });

  it('aligns the national monthly series on the months both observe', () => {
    const figure = figureNamed(report.figures, 'fig-06');
    const value = figure.value as { points: Array<{ period: string; ratio: number }> };

    expect(value.points.map((point) => point.period)).toEqual(['2026-02']);
    expect(value.points[0]?.ratio).toBe(0.44);
    expect(figure.assumptions).toEqual({ entry: 'monthly series' });
  });

  it('aligns the national annual series and divides contributions by expenditure', () => {
    const figure = figureNamed(report.figures, 'fig-07');
    const value = figure.value as { points: Array<{ year: number }>; yearsBelowBreakEven: number };

    expect(value.points.map((point) => point.year)).toEqual([2025]);
    expect(figure.value).toEqual(
      expect.objectContaining(contributionCoverSeriesFor([{ year: 2025, contributions: 130_000, expenditure: 150_000 }])),
    );
    expect(value.yearsBelowBreakEven).toBe(1);
    expect(figure.assumptions).toEqual({ unit: 'EUR minor units' });
  });
});

function contributionCoverSeriesFor(points: Array<{ year: number; contributions: number; expenditure: number }>) {
  const mapped = points.map((point) => ({ ...point, ...contributionCover(point.contributions, point.expenditure) }));
  return {
    points: mapped,
    latest: mapped.at(-1) ?? null,
    yearsBelowBreakEven: mapped.filter((point) => point.status === 'gap').length,
  };
}

describe('the manifest describes exactly what was ingested', () => {
  it('sorts and de-duplicates the source URLs it cites', () => {
    const sources = allSources().map((entry) =>
      entry.sourceId === 'ss-pensioners'
        ? { ...entry, sourceUrl: ['https://z.example/p', 'https://a.example/p'] }
        : entry.sourceId === 'ss-affiliates'
          ? { ...entry, sourceUrl: ['https://a.example/p'] }
          : entry,
    );
    const figure = figureNamed(runCompute(options(sources)).figures, 'fig-06');

    expect(figure.manifest.sourceUrl).toEqual(['https://a.example/p', 'https://z.example/p']);
  });

  it('hashes the figure id, the country, and every source byte', () => {
    const figure = figureNamed(runCompute(options(allSources())).figures, 'fig-06');
    const expected = [
      'figure:fig-06',
      `geo:${PUBLISHED_GEO}`,
      'src-a-placeholder',
    ];
    // The hash covers the same three things the byte string does: figure, geo, raw source bytes.
    expect(figure.manifest.inputHash).toBe(
      sha256Hex(
        ['figure:fig-06', `geo:${PUBLISHED_GEO}`, 'ss-affiliates:raw-bytes-ss-affiliates', 'ss-pensioners:raw-bytes-ss-pensioners']
          .sort()
          .join('\u0000'),
      ),
    );
    expect(expected.length).toBe(3);
  });

  it('changes the hash when the country changes but the bytes do not', () => {
    const portugal: CountryConfiguration = {
      geo: 'PT',
      sources: {
        'dependency-ratio.international': ['eurostat-spr-pns-ben', 'eurostat-lfsi-emp-a'],
        'pension-expenditure-gdp.international': ['eurostat-spr-exp-pens'],
      },
    };
    const countries = [...[] , portugal];
    const source = snapshot('eurostat-spr-exp-pens', expenditurePayload(['2024'], [13.23]));
    const fileExists = (path: string): boolean => path === 'scripts/compute.ts';
    const base = { figures: [figureById('fig-02') as (typeof FIGURES)[number]], now: NOW, freshnessWindowDays: 90, reproducePath: 'scripts/compute.ts', fileExists };

    const es = runCompute({ ...base, geo: 'ES', snapshots: new Map([['eurostat-spr-exp-pens', source]]) });
    const pt = runCompute({
      ...base,
      geo: 'PT',
      countries,
      snapshots: new Map([['eurostat-spr-exp-pens', source]]),
    });

    expect(es.figures[0]?.manifest.inputHash).not.toBe(pt.figures[0]?.manifest.inputHash);
  });

  it('stamps the oldest source retrieval, not the run time', () => {
    const sources = allSources().map((entry) =>
      entry.sourceId === 'ss-pensioners'
        ? { ...entry, retrievedAt: '2026-08-01T00:00:00Z' }
        : entry.sourceId === 'ss-affiliates'
          ? { ...entry, retrievedAt: '2026-09-15T00:00:00Z' }
          : entry,
    );
    const figure = figureNamed(runCompute(options(sources)).figures, 'fig-06');

    expect(figure.manifest.fetchedAt).toBe('2026-08-01T00:00:00Z');
  });

  it('falls back to the run time when no source has a snapshot at all', () => {
    const figure = figureNamed(
      runCompute(options([])).figures,
      'fig-06',
    );

    expect(figure.manifest.fetchedAt).toBe('2026-10-25T12:00:00Z');
  });

  it('cites a declared publisher URL for a source that has no snapshot', () => {
    const figure = figureNamed(runCompute(options([])).figures, 'fig-06');

    // No snapshot, so the URL is the declared publisher page, not an empty list.
    expect(figure.manifest.sourceUrl).toEqual([
      'https://www.seg-social.es/wps/portal/wss/internet/EstadisticasPresupuestosEstudios/Estadisticas',
    ]);
  });

  it('records the reproduce path it was given', () => {
    const figure = figureNamed(runCompute(options(allSources())).figures, 'fig-01');
    expect(figure.manifest.reproducePath).toBe('scripts/compute.ts');
  });
});

describe('the reasons a figure is withheld name the specific cause', () => {
  it('names a source missing from disk, and the figure keeps its definitionId', () => {
    const sources = allSources().filter((entry) => entry.sourceId !== 'ss-affiliates');
    const report = runCompute(options(sources));
    const figure = figureNamed(report.figures, 'fig-06');

    expect(report.exitCode).toBe(1);
    expect(figure.availability).toBe('unavailable');
    expect(figure.value).toBeNull();
    expect(figure.definitionId).toBe('dependency-ratio.national');
    expect(figure.unresolvedSources).toEqual(['ss-affiliates']);
    expect(figure.unresolvedReason).toBe('ss-affiliates: no committed snapshot');
    expect(report.problems.filter((entry) => entry.figureId === 'fig-06')).toEqual([
      { figureId: 'fig-06', sourceId: 'ss-affiliates', code: 'missing-source', detail: 'no committed snapshot' },
    ]);
  });

  it('names an unresolved series and does not fail the build for it', () => {
    const sources = allSources().map((entry) =>
      entry.sourceId === 'ss-affiliates'
        ? { ...entry, resolved: false, payload: undefined, unresolvedReason: 'series code unresolved' }
        : entry,
    );
    const report = runCompute(
      options(sources, { figures: [figureById('fig-06') as (typeof FIGURES)[number]] }),
    );
    const figure = figureNamed(report.figures, 'fig-06');

    expect(report.exitCode).toBe(0);
    expect(report.problems).toEqual([]);
    expect(figure.unresolvedReason).toBe('ss-affiliates: series code unresolved');
    expect(figure.unresolvedSources).toEqual(['ss-affiliates']);
  });

  it('falls back to a generic reason when an unresolved snapshot names none', () => {
    const sources = allSources().map((entry) =>
      entry.sourceId === 'ss-affiliates'
        ? { ...entry, resolved: false, payload: undefined, unresolvedReason: undefined }
        : entry,
    );
    const figure = figureNamed(runCompute(options(sources)).figures, 'fig-06');

    expect(figure.unresolvedReason).toBe('ss-affiliates: series not specified');
  });

  it('names a stale snapshot with its age and the window reason', () => {
    const sources = allSources().map((entry) =>
      entry.sourceId === 'ss-affiliates' ? { ...entry, retrievedAt: '2026-01-01T00:00:00Z' } : entry,
    );
    const report = runCompute(options(sources));
    const figure = figureNamed(report.figures, 'fig-06');

    expect(report.exitCode).toBe(1);
    expect(report.problems.filter((entry) => entry.figureId === 'fig-06')[0]).toMatchObject({
      code: 'stale-snapshot',
      sourceId: 'ss-affiliates',
    });
    expect(figure.unresolvedReason).toContain('ss-affiliates: snapshot');
    expect(figure.unresolvedReason).toContain('days old');
  });

  it('withholds the figure when its own manifest does not validate', () => {
    const report = runCompute(options(allSources(), { fileExists: () => false }));
    const figure = figureNamed(report.figures, 'fig-02');

    expect(figure.availability).toBe('unavailable');
    expect(figure.unresolvedReason).toBe('manifest did not validate');
    expect(report.exitCode).toBe(1);
    expect(report.problems.filter((entry) => entry.figureId === 'fig-02')).toEqual([
      { figureId: 'fig-02', code: 'manifest-invalid', detail: 'reproducePath: missingFile' },
    ]);
  });

  it('turns a compute error into an unavailable figure with the error message', () => {
    const sources = allSources().map((entry) =>
      entry.sourceId === 'igae-pension-expenditure' ? { ...entry, payload: { years: [] } } : entry,
    );
    const report = runCompute(
      options(sources, { figures: [figureById('fig-07') as (typeof FIGURES)[number]] }),
    );
    const figure = figureNamed(report.figures, 'fig-07');

    expect(report.exitCode).toBe(1);
    expect(figure.availability).toBe('unavailable');
    expect(figure.unresolvedReason).toBe('contributions and expenditure share no observed year');
    expect(report.problems).toEqual([
      {
        figureId: 'fig-07',
        code: 'compute-failed',
        detail: 'contributions and expenditure share no observed year',
      },
    ]);
  });

  it('names the country when it has no source for the definition', () => {
    const partial: CountryConfiguration = {
      geo: 'PT',
      sources: { 'pension-expenditure-gdp.international': ['eurostat-spr-exp-pens'] },
    };
    const report = runCompute(
      options(allSources(), { geo: 'PT', countries: [partial], figures: [figureById('fig-01') as (typeof FIGURES)[number]] }),
    );
    const figure = figureNamed(report.figures, 'fig-01');

    expect(figure.availability).toBe('unavailable');
    expect(figure.definitionId).toBe('dependency-ratio.international');
    expect(figure.unresolvedReason).toBe('no source configured for geo PT');
    expect(report.exitCode).toBe(0);
  });

  it('names an unconfigured country in both the figure and the problem', () => {
    const report = runCompute(options(allSources(), { geo: 'DE' }));
    const figure = figureNamed(report.figures, 'fig-01');

    expect(report.exitCode).toBe(1);
    expect(figure.unresolvedReason).toBe('geo DE is not configured in this deployment');
    expect(report.problems[0]).toEqual({
      figureId: 'fig-01',
      code: 'country-not-configured',
      detail: 'geo DE is not configured in this deployment',
    });
    expect(report.problems).toHaveLength(7);
    expect(report.problems.map((problem) => problem.figureId)).toEqual([
      'fig-01',
      'fig-02',
      'fig-03',
      'fig-04',
      'fig-05',
      'fig-06',
      'fig-07',
    ]);
  });
});

describe('the failure each figure reports when its own inputs are unusable', () => {
  /** Runs one figure over the resolved fixtures, with `patches` applied by source id. */
  function oneFigure(
    figureId: string,
    patches: Record<string, (entry: SourceSnapshot) => SourceSnapshot>,
  ) {
    const sources = allSources().map((entry) => patches[entry.sourceId]?.(entry) ?? entry);
    const report = runCompute(
      options(sources, { figures: [figureById(figureId) as (typeof FIGURES)[number]] }),
    );
    return { report, figure: report.figures[0] as DerivedFigure };
  }

  it('refuses to align a national series that shares no month', () => {
    const { report, figure } = oneFigure('fig-06', {
      'ss-affiliates': (entry) => ({
        ...entry,
        payload: { months: [{ month: '2020-01', value: 20_000_000 }] },
      }),
    });

    expect(figure.availability).toBe('unavailable');
    expect(report.problems[0]?.detail).toBe('pensioners and affiliates share no observed month');
  });

  it('refuses to build the cohort return without a life expectancy observation', () => {
    const { report, figure } = oneFigure('fig-03', {
      'ine-life-expectancy-at-65': (entry) => ({ ...entry, payload: { COD: 'TM1657', Data: [] } }),
    });

    expect(figure.availability).toBe('unavailable');
    expect(report.problems[0]?.detail).toBe('life expectancy series has no observation');
  });

  it('refuses a projection that does not cover the stated horizon', () => {
    const { report, figure } = oneFigure('fig-05', {
      'ine-population-projection-working-age': (entry) => ({
        ...entry,
        payload: { years: [{ year: 2026, population: 40_000_000 }] },
      }),
    });

    expect(figure.availability).toBe('unavailable');
    expect(report.problems[0]?.detail).toBe('projection does not cover the stated horizon');
  });

  it('refuses to carry a cohort return that has no central value', () => {
    // Nothing was paid in, so there is no IRR to carry into the required-growth formula.
    const { report, figure } = oneFigure('fig-05', {
      'ss-average-contribution-pension': (entry) => ({
        ...entry,
        payload: { cohort: { label: 'no contributions', contributionMinor: 0, pensionMinor: 20_000 } },
      }),
    });

    expect(figure.availability).toBe('unavailable');
    expect(report.problems[0]?.detail).toBe(
      'cohort return has no central value to carry into required growth',
    );
  });
});

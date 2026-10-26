import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { countSignChanges, irrBisection, npv } from '../../web/metrics/npv';
import { contributionCover, contributionCoverSeries } from '../../web/metrics/contribution-cover';
import { buildCashflows, cohortIrr, cohortReturn } from '../../web/metrics/cohort-irr';
import { dependencyRatio, dependencyRatioSeries } from '../../web/metrics/dependency-ratio';
import { pensionShareSeries, publishedShare } from '../../web/metrics/pension-share';
import { realRate, requiredBaseGrowth, sensitivityGrid } from '../../web/metrics/required-base-growth';
import { stableStringify } from '../../web/ingest/deterministic-json';
import {
  derivedFileName,
  readDerivedFigures,
  serialiseDerivedFigure,
  writeDerivedFigures,
} from '../../web/ingest/write-derived';
import { nationalDependencyFigure } from '../fixtures/figures';

/**
 * Branch-level coverage for the calculation kernels (T3–T7).
 *
 * The acceptance tests pin the published values and the property tests pin the invariants. This
 * file covers the arithmetic and boundary branches those two layers leave: the exact rate at
 * which a status flips, the window a mean is taken over, the scale a root-finder normalises by,
 * and the solver's own bracket behaviour when it is told to stop early.
 */

describe('NPV and the root finder', () => {
  it('discounts by period index and counts only real sign changes', () => {
    expect(npv(0, [5, -5, 5])).toBe(5);
    expect(countSignChanges([1, 1, 1])).toBe(0);
    expect(countSignChanges([-1, -1, 1])).toBe(1);
    expect(countSignChanges([-1, 1, -1, 1])).toBe(3);
    // A zero flow is not a sign: it neither resets nor counts as a change.
    expect(countSignChanges([0, -1, 0, 1])).toBe(1);
    expect(countSignChanges([])).toBe(0);
  });

  it('solves a one-sign-change problem and refuses one it cannot bracket', () => {
    const rate = irrBisection([-1000, 1100]);

    // The contract is the absolute NPV tolerance, not a digit count.
    expect(rate).toBeCloseTo(0.1, 7);
    expect(Math.abs(npv(rate as number, [-1000, 1100]))).toBeLessThanOrEqual(1e-6);
    // Two sign changes, or none at all, are not a unique root.
    expect(irrBisection([-1, 5, -6])).toBeNull();
    expect(irrBisection([1, 2, 3])).toBeNull();
    expect(irrBisection([])).toBeNull();
  });

  it('produces the same rate for the same problem expressed in cents', () => {
    const units = [-1200, -1200, 2800];
    const cents = units.map((flow) => flow * 100_000);

    const inUnits = irrBisection(units) as number;
    const inCents = irrBisection(cents) as number;

    // Normalising by the largest magnitude is what keeps the absolute tolerance meaningful
    // across the two scalar magnitudes (T5 in abstract units, T6 in minor currency units).
    expect(inCents).toBeCloseTo(inUnits, 9);
  });

  it('honours a tighter tolerance than the default', () => {
    const flows = [-1000, 1100];
    const rate = irrBisection(flows, { tolerance: 1e-12 }) as number;

    expect(Math.abs(npv(rate, flows))).toBeLessThanOrEqual(1e-12 * 1100);
    expect(rate).toBeCloseTo(0.1, 10);
  });

  it('returns the bracket midpoint when it is told to run no iterations', () => {
    // The documented default bracket is [-0.9999, 10]; with no iteration budget the solver
    // must still return a usable number from the bracket rather than null.
    expect(irrBisection([-1000, 1100], { maxIterations: 0 })).toBeCloseTo((-0.9999 + 10) / 2, 12);
  });

  it('takes one bisection step when given a budget of one', () => {
    const zeroBudget = irrBisection([-1000, 1100], { maxIterations: 0 }) as number;
    const oneStep = irrBisection([-1000, 1100], { maxIterations: 1 }) as number;

    expect(oneStep).not.toBe(zeroBudget);
    // One step halves the bracket: [-0.9999, 4.50005], whose midpoint is below the failed
    // midpoint of the empty run.
    expect(oneStep).toBeCloseTo((-0.9999 + 4.50005) / 2, 9);
  });

  it('accepts an explicit bracket', () => {
    const rate = irrBisection([-1000, 1100], { lower: 0.05, upper: 0.2 }) as number;

    expect(rate).toBeCloseTo(0.1, 7);
    // A bracket that does not contain the root is reported as no root, not a wrong number.
    expect(irrBisection([-1000, 1100], { lower: 0.2, upper: 0.5 })).toBeNull();
  });
});

describe('contribution cover', () => {
  it('flips status exactly at break-even', () => {
    expect(contributionCover(100, 100).status).toBe('break-even');
    expect(contributionCover(99, 100).status).toBe('gap');
    expect(contributionCover(101, 100).status).toBe('surplus');
    expect(contributionCover(0, 100).status).toBe('gap');
  });

  it('reports the raw quotient beside the rounded one', () => {
    const result = contributionCover(2, 3);

    expect(result.cover).toBe(0.67);
    expect(result.raw).toBeCloseTo(0.666_666_666_666_666_6, 12);
    expect(result.gap).toBe(1);
  });

  it('leaves every derived field undefined when expenditure is zero', () => {
    expect(contributionCover(100, 0)).toEqual({
      cover: null,
      raw: null,
      gap: null,
      status: 'undefined',
    });
  });

  it('sorts a series by year without reordering the caller array', () => {
    const input = [
      { year: 2025, contributions: 130, expenditure: 150 },
      { year: 2023, contributions: 200, expenditure: 100 },
    ];
    const series = contributionCoverSeries(input);

    expect(series.points.map((point) => point.year)).toEqual([2023, 2025]);
    expect(input.map((point) => point.year)).toEqual([2025, 2023]);
    expect(series.latest?.year).toBe(2025);
    expect(series.latest?.status).toBe('gap');
    expect(series.yearsBelowBreakEven).toBe(1);
  });

  it('counts only gap years, not every year below a surplus', () => {
    const series = contributionCoverSeries([
      { year: 2021, contributions: 50, expenditure: 100 },
      { year: 2022, contributions: 100, expenditure: 100 },
      { year: 2023, contributions: 150, expenditure: 100 },
      { year: 2024, contributions: 0, expenditure: 100 },
    ]);

    expect(series.yearsBelowBreakEven).toBe(2);
  });

  it('reports no latest point for an empty series', () => {
    expect(contributionCoverSeries([]).latest).toBeNull();
    expect(contributionCoverSeries([]).yearsBelowBreakEven).toBe(0);
  });
});

describe('cohort return', () => {
  const BASE = {
    entryAge: 25,
    retirementAge: 65,
    lifeExpectancyAtRetirement: 20,
    averageMonthlyContribution: 100,
    averageMonthlyPension: 200,
  };

  it('rounds the contributing and drawing years to whole years, never negative', () => {
    expect(buildCashflows({ ...BASE, retirementAge: 65.4 }).yearsContributing).toBe(40);
    expect(buildCashflows({ ...BASE, lifeExpectancyAtRetirement: 20.6 }).yearsDrawing).toBe(21);
    // A retirement before entry leaves nothing to contribute.
    expect(buildCashflows({ ...BASE, retirementAge: 20 }).yearsContributing).toBe(0);
    expect(buildCashflows({ ...BASE, lifeExpectancyAtRetirement: -5 }).yearsDrawing).toBe(0);
  });

  it('treats a negative life expectancy as no benefit years', () => {
    expect(cohortIrr({ ...BASE, lifeExpectancyAtRetirement: -5 })).toBe(-1);
  });

  it('builds the sensitivity band from the grid the task fixes', () => {
    // The band is the min and max over life expectancy {c-2, c, c+2} x contribution
    // {x0.9, x1, x1.1} x pension {x0.9, x1, x1.1} — rebuilt here from the task's own wording,
    // so a factor applied the wrong way round cannot hide behind a self-consistent band.
    const grid = [18, 20, 22]
      .flatMap((life) => [90, 100, 110].flatMap((contribution) => [180, 200, 220].map((pension) => ({ life, contribution, pension }))))
      .map((combo) =>
        cohortIrr({
          ...BASE,
          lifeExpectancyAtRetirement: combo.life,
          averageMonthlyContribution: combo.contribution,
          averageMonthlyPension: combo.pension,
        }),
      )
      .filter((rate): rate is number => rate !== null);

    const result = cohortReturn(BASE);

    expect(result.band?.min).toBeCloseTo(Math.min(...grid), 12);
    expect(result.band?.max).toBeCloseTo(Math.max(...grid), 12);
    expect(result.central).toBeCloseTo(cohortIrr(BASE) as number, 12);
    expect(result.yearsContributing).toBe(40);
    expect(result.yearsDrawing).toBe(20);
    expect(result.annualContribution).toBe(1200);
    expect(result.annualPension).toBe(2800);
    expect(result.lifeExpectancyAtRetirement).toBe(20);
  });

  it('keeps the band ordered and finite for a pension far above the contribution', () => {
    const result = cohortReturn({ ...BASE, averageMonthlyPension: 400 });

    expect(Number.isFinite(result.band?.min as number)).toBe(true);
    expect(result.band?.min as number).toBeLessThan(result.band?.max as number);
    expect(result.central as number).toBeGreaterThanOrEqual(result.band?.min as number);
    expect(result.central as number).toBeLessThanOrEqual(result.band?.max as number);
  });
});

describe('dependency ratio', () => {
  it('takes the ten-year mean over the last ten calendar years only', () => {
    const series = dependencyRatioSeries([
      { period: '2000', numerator: 900, denominator: 100 },
      { period: '2017', numerator: 300, denominator: 100 },
      { period: '2020', numerator: 100, denominator: 100 },
      { period: '2026', numerator: 300, denominator: 100 },
    ]);

    // latest is 2026, so the window is 2017..2026: 2000 is excluded.
    expect(series.meanLastTenYears).toBe(2.33);
    expect(series.points.map((point) => point.period)).toEqual(['2000', '2017', '2020', '2026']);
    expect(series.latest?.period).toBe('2026');
    expect(series.first?.period).toBe('2000');
  });

  it('ignores undefined points when averaging', () => {
    const series = dependencyRatioSeries([
      { period: '2025', numerator: 1, denominator: 0 },
      { period: '2026', numerator: 300, denominator: 100 },
    ]);

    expect(series.meanLastTenYears).toBe(3);
  });

  it('reports no mean when every point in the window is undefined', () => {
    const series = dependencyRatioSeries([{ period: '2026', numerator: 1, denominator: 0 }]);

    expect(series.points[0]?.ratio).toBeNull();
    expect(series.meanLastTenYears).toBeNull();
    expect(series.latest?.ratio).toBeNull();
  });

  it('sorts by period without reordering the caller array', () => {
    const input = [
      { period: '2026-02', numerator: 2, denominator: 2 },
      { period: '2026-01', numerator: 1, denominator: 2 },
    ];
    const series = dependencyRatioSeries(input);

    expect(series.points.map((point) => point.period)).toEqual(['2026-01', '2026-02']);
    expect(input[0]?.period).toBe('2026-02');
    expect(series.first?.period).toBe('2026-01');
  });

  it('reports an empty series as having no points, no latest and no mean', () => {
    expect(dependencyRatioSeries([])).toEqual({
      points: [],
      latest: null,
      first: null,
      meanLastTenYears: null,
    });
  });

  it('keeps numerator, denominator and raw on a defined point', () => {
    expect(dependencyRatio(840, 2000)).toEqual({ ratio: 0.42, raw: 0.42, numerator: 840, denominator: 2000 });
    expect(dependencyRatio(1, 0)).toEqual({ ratio: null, raw: null, numerator: 1, denominator: 0 });
  });
});

describe('pension share', () => {
  it('takes the maximum over defined observations only', () => {
    const series = pensionShareSeries([
      { year: 2020, percent: 9.82 },
      { year: 2021, percent: Number.NaN },
      { year: 2022, percent: 13.23 },
    ]);

    expect(series.max).toBe(13.23);
    expect(series.points[1]?.share).toBeNull();
    expect(series.points[1]?.raw).toBeNull();
  });

  it('reports no maximum when no observation is defined', () => {
    const series = pensionShareSeries([{ year: 2020, percent: Number.NaN }]);

    expect(series.max).toBeNull();
    expect(series.latest?.share).toBeNull();
    expect(pensionShareSeries([]).first).toBeNull();
  });

  it('sorts by year without reordering the caller array', () => {
    const input = [
      { year: 2024, percent: 13.23 },
      { year: 1995, percent: 9.82 },
    ];
    const series = pensionShareSeries(input);

    expect(series.points.map((point) => point.year)).toEqual([1995, 2024]);
    expect(input[0]?.year).toBe(2024);
  });

  it('rounds a negative or non-finite percentage to nothing, never clamping it', () => {
    expect(publishedShare(-0.5)).toBeNull();
    expect(publishedShare(Number.POSITIVE_INFINITY)).toBeNull();
    expect(publishedShare(13.235)).toBe(13.24);
  });
});

describe('required base growth', () => {
  it('deflates the nominal return by the stated inflation', () => {
    expect(realRate(0.05, 0.02)).toBeCloseTo(1.05 / 1.02 - 1, 15);
    expect(realRate(0.05, 0)).toBeCloseTo(0.05, 15);
    // Deflation raises the real rate above the nominal one.
    expect(realRate(0.05, -0.02)).toBeGreaterThan(0.05);
  });

  it('returns every cell of the grid with both the swept nominal and the deflated rate', () => {
    const cells = sensitivityGrid({
      band: { min: 0.01, central: 0.03, max: 0.05 },
      inflation: 0.02,
      gProj: -0.002,
      horizon: { from: 2026, to: 2070 },
    });

    expect(cells).toHaveLength(9);
    for (const cell of cells) {
      expect(Object.keys(cell).sort()).toEqual([
        'gRequired',
        'gWage',
        'gap',
        'rPaidNominal',
        'rPaidReal',
      ]);
      expect(cell.gap).toBeCloseTo(cell.gRequired - -0.002, 12);
      // The cell records the nominal it was swept over and the rate the formula consumed.
      expect([0.01, 0.03, 0.05]).toContain(cell.rPaidNominal);
      expect(cell.rPaidReal).toBe(realRate(cell.rPaidNominal, 0.02));
    }
    expect(new Set(cells.map((cell) => cell.gWage))).toEqual(new Set([0, 0.01, 0.02]));
  });

  it('carries the horizon through unchanged', () => {
    const horizon = { from: 2026, to: 2070 };
    expect(requiredBaseGrowth({ rPaidNominal: 0.03, inflation: 0.02, gWage: 0.01, gProj: 0, horizon }).horizon).toBe(
      horizon,
    );
  });
});

describe('deterministic derived JSON', () => {
  it('sorts the keys of objects nested inside arrays, not only top-level keys', () => {
    expect(stableStringify([{ b: 1, a: 2 }])).toBe('[\n  {\n    "a": 2,\n    "b": 1\n  }\n]\n');
  });

  it('passes null, primitives and nested arrays through unchanged', () => {
    expect(stableStringify({ a: null, b: 1, c: 'x', d: [1, [2]] })).toBe(
      '{\n  "a": null,\n  "b": 1,\n  "c": "x",\n  "d": [\n    1,\n    [\n      2\n    ]\n  ]\n}\n',
    );
  });
});

describe('writing and reading derived figures', () => {
  it('names each file after its figure', () => {
    expect(derivedFileName('fig-01')).toBe('fig-01.json');
  });

  it('round-trips a figure through a file, keeping non-ASCII text intact', () => {
    const dir = mkdtempSync(join(tmpdir(), 'derived-'));
    const figure = nationalDependencyFigure();
    const paths = writeDerivedFigures(dir, [figure]);

    expect(paths).toEqual([join(dir, 'fig-06.json')]);
    expect(readFileSync(paths[0] as string, 'utf8')).toContain('jubilación');
    expect(readFileSync(paths[0] as string, 'utf8')).toBe(serialiseDerivedFigure(figure));
  });

  it('creates the target directory when it does not exist', () => {
    const dir = join(mkdtempSync(join(tmpdir(), 'derived-')), 'nested', 'deeper');

    expect(writeDerivedFigures(dir, [])).toEqual([]);
  });

  it('reads only JSON files and skips anything else in the directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'derived-'));
    writeFileSync(join(dir, 'fig-01.json'), JSON.stringify({ figureId: 'fig-01' }), 'utf8');
    writeFileSync(join(dir, 'README.md'), 'notes', 'utf8');

    expect(readDerivedFigures(dir).map((figure) => figure.figureId)).toEqual(['fig-01']);
  });
});

describe('cohort return without a usable grid', () => {
  it('reports no band at all when nothing was paid in', () => {
    // With no contribution there is no IRR for any grid point, so the band must be absent —
    // never a band of Infinity/-Infinity, and never a band built from null grid entries.
    const result = cohortReturn({
      entryAge: 25,
      retirementAge: 65,
      lifeExpectancyAtRetirement: 20,
      averageMonthlyContribution: 0,
      averageMonthlyPension: 20_000,
    });

    expect(result.central).toBeNull();
    expect(result.band).toBeNull();
    expect(JSON.stringify(result)).not.toMatch(/Infinity|NaN/);
  });
});

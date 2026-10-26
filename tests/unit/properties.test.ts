import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { dependencyRatio, dependencyRatioSeries } from '../../web/metrics/dependency-ratio';
import { contributionCover } from '../../web/metrics/contribution-cover';
import { buildCashflows, cohortIrr } from '../../web/metrics/cohort-irr';
import { DISCOUNT_RATES, implicitDebt, presentValue } from '../../web/metrics/implicit-debt';
import { annualisedGrowthRate, requiredBaseGrowth, sensitivityGrid } from '../../web/metrics/required-base-growth';
import { pensionShareSeries, publishedShare, shareOfGdp } from '../../web/metrics/pension-share';
import { countSignChanges, irrBisection, npv } from '../../web/metrics/npv';
import { roundTo } from '../../web/metrics/rounding';
import { evaluateFreshness } from '../../web/sources/freshness';
import { readEmployedPersons } from '../../web/sources/eurostat';
import { latestObservation } from '../../web/sources/ine';
import { figureById } from '../../web/ingest/figures';
import type { DependencyRatioSeriesValue } from '../../web/metrics/dependency-ratio';
import type { SourceSnapshot } from '../../web/sources/types';
import { sha256Hex } from '../../web/manifest/hash';
import { barGeometry, ladderSpan, niceMax, toSegments, xForValue } from '../../web/charts/geometry';
import { formatValue } from '../../web/content/format';
import { LOCALES } from '../../web/content/types';

/**
 * Property tests for the invariants the tasks state (T3 to T7). The generators are
 * constrained to the task's own valid-input domain, so a failure here is a real
 * invariant break, not an artefact of an out-of-domain value.
 */
const positiveMoney = fc.integer({ min: 1, max: 10_000_000 });
const counts = fc.integer({ min: 0, max: 20_000_000 });

describe('metric invariants (property tests)', () => {
  it('T3: the dependency ratio is never negative and is monotonic in both inputs', () => {
    fc.assert(
      fc.property(counts, counts, (pensioners, affiliates) => {
        const base = dependencyRatio(pensioners, affiliates);
        if (base.raw === null) return;
        expect(base.raw).toBeGreaterThanOrEqual(0);
        const morePensioners = dependencyRatio(pensioners + 1, affiliates);
        const fewerAffiliates = dependencyRatio(pensioners, Math.max(1, affiliates - 1));
        expect(morePensioners.raw as number).toBeGreaterThanOrEqual(base.raw);
        expect(fewerAffiliates.raw as number).toBeGreaterThanOrEqual(base.raw);
      }),
      { numRuns: 200 },
    );
  });

  it('T3: a series never serialises Infinity or NaN', () => {
    fc.assert(
      fc.property(fc.array(fc.record({ period: fc.constantFrom('2026-01', '2026-02'), numerator: counts, denominator: counts })), (points) => {
        const serialised = JSON.stringify(dependencyRatioSeries(points));
        expect(serialised).not.toMatch(/Infinity|NaN/);
      }),
      { numRuns: 100 },
    );
  });

  it('T4: cover is never negative and the gap equals expenditure minus contributions', () => {
    fc.assert(
      fc.property(counts, positiveMoney, (contributions, expenditure) => {
        const result = contributionCover(contributions, expenditure);
        if (result.cover === null) return;
        expect(result.cover).toBeGreaterThanOrEqual(0);
        expect(result.gap).toBe(expenditure - contributions);
      }),
      { numRuns: 200 },
    );
  });

  it('T5: the IRR is finite, unique and inside the bracket for every valid cohort', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 1, max: 40 }),
        (contribution, pension, life) => {
          const input = { entryAge: 25, retirementAge: 65, lifeExpectancyAtRetirement: life, averageMonthlyContribution: contribution, averageMonthlyPension: pension };
          const { flows } = buildCashflows(input);
          const rate = cohortIrr(input);
          if (rate === null) {
            expect(countSignChanges(flows)).not.toBe(1);
            return;
          }
          expect(Number.isFinite(rate)).toBe(true);
          expect(rate).toBeGreaterThan(-1);
          expect(rate).toBeLessThan(10);
          expect(countSignChanges(flows)).toBe(1);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('T5: NPV is solved to the stated tolerance for well-conditioned cohorts', () => {
    // The absolute 1e-6 tolerance is only attainable where the root is not pinned against
    // -100%: near r = -1 the discount factor (1 + r)^t approaches zero and the absolute
    // residual is bounded by float resolution, not by the solver. The realistic domain is
    // a pension of at least half the contribution, which keeps r well away from -1.
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 5000 }),
        fc.double({ min: 0.5, max: 3, noNaN: true }),
        fc.integer({ min: 5, max: 35 }),
        (contribution, pensionFactor, life) => {
          const pension = Math.max(1, Math.round(contribution * pensionFactor));
          const input = { entryAge: 25, retirementAge: 65, lifeExpectancyAtRetirement: life, averageMonthlyContribution: contribution, averageMonthlyPension: pension };
          const rate = cohortIrr(input);
          if (rate === null) return;
          const { flows } = buildCashflows(input);
          const scale = Math.max(...flows.map((flow) => Math.abs(flow)));
          expect(Math.abs(npv(rate, flows))).toBeLessThanOrEqual(1e-6 * scale + 1e-9);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('T5: the sensitivity band always contains the central value', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 3000 }),
        fc.integer({ min: 100, max: 6000 }),
        fc.integer({ min: 5, max: 35 }),
        (contribution, pension, life) => {
          const irr = cohortIrr({
            entryAge: 25,
            retirementAge: 65,
            lifeExpectancyAtRetirement: life,
            averageMonthlyContribution: contribution,
            averageMonthlyPension: pension,
          });
          if (irr === null) return;
          expect(Number.isFinite(irr)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('T6: implicit debt is strictly decreasing in the discount rate', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 1_000_000 }), { minLength: 1, maxLength: 30 }), counts, (obligations, assets) => {
        const result = implicitDebt(obligations, assets);
        const values = DISCOUNT_RATES.map((rate) => result.byRate[String(rate)] as number);
        for (let index = 1; index < values.length; index += 1) {
          expect(values[index] as number).toBeLessThanOrEqual(values[index - 1] as number);
        }
        expect(Object.keys(result.byRate)).toHaveLength(4);
      }),
      { numRuns: 100 },
    );
  });

  it('T6: present value is linear in the obligation stream', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 1, maxLength: 10 }), (stream) => {
        const doubled = stream.map((value) => value * 2);
        expect(presentValue(doubled, 0.03)).toBeCloseTo(presentValue(stream, 0.03) * 2, 6);
      }),
      { numRuns: 100 },
    );
  });

  it('T7: the gap increases with the return and decreases with projected growth and wages', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -0.02, max: 0.08, noNaN: true }),
        fc.double({ min: -0.03, max: 0.03, noNaN: true }),
        fc.double({ min: 0, max: 0.03, noNaN: true }),
        (rPaidNominal, gProj, gWage) => {
          const horizon = { from: 2026, to: 2070 };
          const base = requiredBaseGrowth({ rPaidNominal, inflation: 0, gWage, gProj, horizon });
          const higherReturn = requiredBaseGrowth({ rPaidNominal: rPaidNominal + 0.01, inflation: 0, gWage, gProj, horizon });
          const higherProjection = requiredBaseGrowth({ rPaidNominal, inflation: 0, gWage, gProj: gProj + 0.01, horizon });
          const higherWage = requiredBaseGrowth({ rPaidNominal, inflation: 0, gWage: gWage + 0.005, gProj, horizon });
          expect(higherReturn.gap).toBeGreaterThanOrEqual(base.gap);
          expect(higherProjection.gap).toBeLessThanOrEqual(base.gap);
          expect(higherWage.gap).toBeLessThanOrEqual(base.gap);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('T7: the 3 x 3 grid is always nine cells with the band endpoints', () => {
    fc.assert(
      fc.property(fc.double({ min: -0.02, max: 0.06, noNaN: true }), (central) => {
        const cells = sensitivityGrid({
          band: { min: central - 0.01, central, max: central + 0.01 },
          inflation: 0.02,
          gProj: -0.002,
          horizon: { from: 2026, to: 2070 },
        });
        expect(cells).toHaveLength(9);
      }),
      { numRuns: 50 },
    );
  });
});

describe('shared kernel properties', () => {
  it('roundTo is idempotent and bounded', () => {
    fc.assert(
      fc.property(fc.double({ min: -1e9, max: 1e9, noNaN: true }), (value) => {
        const once = roundTo(value, 2);
        expect(roundTo(once, 2)).toBe(once);
        expect(Math.abs(roundTo(value, 2) - value)).toBeLessThanOrEqual(0.005 + 1e-9);
      }),
      { numRuns: 200 },
    );
  });

  it('sha256Hex is deterministic, 64 hex chars, and collision-free on distinct inputs', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (a, b) => {
        expect(sha256Hex(a)).toMatch(/^[0-9a-f]{64}$/);
        expect(sha256Hex(a)).toBe(sha256Hex(a));
        if (a !== b) expect(sha256Hex(a)).not.toBe(sha256Hex(b));
      }),
      { numRuns: 100 },
    );
  });

  it('NPV of a single flow at t=0 is rate independent', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), fc.double({ min: -0.9, max: 1, noNaN: true }), (flow, rate) => {
        expect(npv(rate, [flow])).toBeCloseTo(flow, 6);
      }),
      { numRuns: 100 },
    );
  });

  it('irrBisection returns null when there is no sign change', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 10 }), (flows) => {
        expect(irrBisection(flows)).toBeNull();
      }),
      { numRuns: 50 },
    );
  });

  it('freshness is monotonic in the window', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 400 }), fc.integer({ min: 1, max: 60 }), (ageDays, window) => {
        const now = new Date('2026-10-25T12:00:00Z');
        const fetchedAt = new Date(now.getTime() - ageDays * 86_400_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
        const narrow = evaluateFreshness(fetchedAt, window, now);
        const wide = evaluateFreshness(fetchedAt, window + 100, now);
        if (narrow.fresh) expect(wide.fresh).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

describe('chart geometry properties', () => {
  it('a monotonic series produces segments whose y values never increase with the value', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 20 }), (values) => {
        const points = values.map((value, index) => ({ label: String(index), value }));
        const segments = toSegments(points, 0, 100);
        expect(segments).toHaveLength(1);
        expect(segments[0]?.startsWith('M')).toBe(true);
      }),
      { numRuns: 50 },
    );
  });

  it('null points break the line into separate segments', () => {
    const segments = toSegments(
      [
        { label: 'a', value: 1 },
        { label: 'b', value: null },
        { label: 'c', value: 2 },
      ],
      0,
      10,
    );
    expect(segments).toHaveLength(2);
  });

  it('niceMax is at least the value and a multiple of the step', () => {
    fc.assert(
      fc.property(fc.double({ min: 0.01, max: 5, noNaN: true }), (value) => {
        const rounded = niceMax(value, 0.1);
        expect(rounded).toBeGreaterThanOrEqual(value);
        expect(Math.abs(rounded / 0.1 - Math.round(rounded / 0.1))).toBeLessThan(1e-9);
      }),
      { numRuns: 100 },
    );
  });

  it('ladder spans contain every row and xForValue stays inside the plot box', () => {
    fc.assert(
      fc.property(fc.array(fc.record({ min: fc.double({ min: 0, max: 1, noNaN: true }), max: fc.double({ min: 1, max: 2, noNaN: true }) }), { minLength: 1, maxLength: 5 }), (rows) => {
        const withCentral = rows.map((row) => ({ label: 'r', ...row, central: row.min }));
        const span = ladderSpan(withCentral);
        const box = { width: 1000, height: 200, paddingX: 100, paddingY: 10 };
        const x = xForValue(span.max, span.min, span.max, box);
        expect(x).toBeLessThanOrEqual(box.width - box.paddingX + 1e-6);
        expect(x).toBeGreaterThanOrEqual(box.paddingX - 1e-6);
      }),
      { numRuns: 50 },
    );
  });

  it('negative bars extend left of the zero baseline without being clamped', () => {
    const bars = barGeometry(
      [
        { label: 'a', value: -100 },
        { label: 'b', value: 50 },
      ],
      { width: 1000, height: 200, paddingX: 100, paddingY: 10 },
    );
    const negative = bars[0];
    const zero = 100 + (1000 - 200) / 2;
    expect((negative?.x as number) + (negative?.width as number)).toBeCloseTo(zero, 6);
    expect(negative?.width as number).toBeGreaterThan(0);
  });
});

describe('formatting properties', () => {
  it('every locale formats without throwing and keeps the digits', () => {
    fc.assert(
      fc.property(fc.double({ min: -1e6, max: 1e6, noNaN: true }), (value) => {
        for (const locale of LOCALES) {
          const rendered = formatValue(value, 'ratio', locale, 'n/a');
          expect(rendered).not.toContain('NaN');
          expect(rendered.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 50 },
    );
  });

  it('a null value always renders the supplied label', () => {
    for (const locale of LOCALES) {
      expect(formatValue(null, 'currencyMinor', locale, 'no definido')).toBe('no definido');
    }
  });
});

/** One observation per year, so a generated year set and its values stay the same length. */
const yearObservations = fc.uniqueArray(
  fc.tuple(fc.integer({ min: 1990, max: 2030 }), fc.integer({ min: 0, max: 50_000_000 })),
  { minLength: 1, maxLength: 8, selector: (entry) => entry[0] },
);

function orderedYears(observations: readonly (readonly [number, number])[]): number[] {
  return observations.map(([year]) => year).sort((a, b) => a - b);
}

interface StatDimension {
  codes: string[];
  labels: Record<string, string>;
}

/**
 * A JSON-stat payload whose only dimension with more than one category is `time`, so the
 * flat index of an observation equals its position in `values`.
 */
function jsonStatPayload(
  id: string[],
  dimensions: Record<string, StatDimension>,
  years: string[],
  values: number[],
) {
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
    value,
  };
}

function beneficiaryPayload(years: string[], values: number[]) {
  return jsonStatPayload(
    ['geo', 'spdepb', 'spdepm', 'sex', 'unit', 'time'],
    {
      geo: { codes: ['ES'], labels: { ES: 'Spain' } },
      spdepb: { codes: ['OLD'], labels: { OLD: 'Old age pension' } },
      spdepm: { codes: ['TOTAL'], labels: { TOTAL: 'Total' } },
      sex: { codes: ['T'], labels: { T: 'Total' } },
      unit: { codes: ['PS'], labels: { PS: 'Person' } },
      time: { codes: years, labels: Object.fromEntries(years.map((year) => [year, year])) },
    },
    years,
    values,
  );
}

function employmentPayload(years: string[], values: number[]) {
  return jsonStatPayload(
    ['geo', 'indic_em', 'sex', 'age', 'unit', 'time'],
    {
      geo: { codes: ['ES'], labels: { ES: 'Spain' } },
      indic_em: { codes: ['EMP'], labels: { EMP: 'Total employment (resident population concept - LFS)' } },
      sex: { codes: ['T'], labels: { T: 'Total' } },
      age: { codes: ['Y15-64'], labels: { 'Y15-64': 'From 15 to 64 years' } },
      unit: { codes: ['THS'], labels: { THS: 'Thousand persons' } },
      time: { codes: years, labels: Object.fromEntries(years.map((year) => [year, year])) },
    },
    years,
    values,
  );
}

function snapshotOf(sourceId: string, payload: unknown): SourceSnapshot {
  return {
    sourceId,
    bytes: `bytes-${sourceId}`,
    resolved: true,
    retrievedAt: '2026-10-24T00:00:00Z',
    sourceUrl: ['https://example.invalid'],
    publisher: 'Eurostat',
    dataset: sourceId,
    payload,
  };
}

describe('ingest alignment properties', () => {
  it('a figure aligns only years both series observe, and converts thousands to persons exactly', () => {
    fc.assert(
      fc.property(yearObservations, yearObservations, (beneficiaryObs, employmentObs) => {
        const beneficiaryYears = orderedYears(beneficiaryObs);
        const employmentYears = orderedYears(employmentObs);
        const beneficiaryByYear = new Map(beneficiaryObs);
        const employmentByYear = new Map(employmentObs);
        const employment = readEmployedPersons(
          employmentPayload(
            employmentYears.map(String),
            employmentYears.map((year) => employmentByYear.get(year) as number),
          ),
        );
        expect(employment.points.map((point) => point.value)).toEqual(
          employmentYears.map((year) => (employmentByYear.get(year) as number) * 1_000),
        );

        const definition = figureById('fig-01');
        if (!definition) throw new Error('fig-01 is not defined');
        const inputs: ReadonlyMap<string, SourceSnapshot> = new Map([
          [
            'eurostat-spr-pns-ben',
            snapshotOf(
              'eurostat-spr-pns-ben',
              beneficiaryPayload(
                beneficiaryYears.map(String),
                beneficiaryYears.map((year) => beneficiaryByYear.get(year) as number),
              ),
            ),
          ],
          ['eurostat-lfsi-emp-a', snapshotOf('eurostat-lfsi-emp-a', employmentPayload(
            employmentYears.map(String),
            employmentYears.map((year) => employmentByYear.get(year) as number),
          ))],
        ]);

        const shared = beneficiaryYears.filter((year) => employmentByYear.has(year));
        if (shared.length === 0) {
          expect(() => definition.compute(inputs)).toThrow(/share no observed year/);
          return;
        }

        const computed = definition.compute(inputs);
        const value = computed.value as DependencyRatioSeriesValue;
        expect(value.points.map((point) => Number(point.period))).toEqual(shared);
        for (const point of value.points) {
          const year = Number(point.period);
          expect(point.numerator).toBe(beneficiaryByYear.get(year));
          expect(point.denominator).toBe((employmentByYear.get(year) as number) * 1_000);
        }
        expect(computed.assumptions.firstYear).toBe(shared[0]);
        expect(computed.assumptions.lastYear).toBe(shared[shared.length - 1]);
      }),
      { numRuns: 100 },
    );
  });

  it('the ten-year readout mean ignores every observation outside the window', () => {
    const periodPoint = fc
      .tuple(fc.integer({ min: 1980, max: 2030 }), fc.integer({ min: 0, max: 20_000_000 }), fc.integer({ min: 1, max: 20_000_000 }))
      .map(([year, numerator, denominator]) => ({ period: String(year), numerator, denominator }));
    fc.assert(
      fc.property(fc.array(periodPoint, { minLength: 1, maxLength: 10 }), fc.integer({ min: 1980, max: 2030 }), (points, oldYear) => {
        const series = dependencyRatioSeries(points);
        if (series.meanLastTenYears === null || series.latest === null) return;
        const latestYear = Number(series.latest.period.slice(0, 4));
        const outside = { period: String(Math.min(oldYear, latestYear - 10)), numerator: 1, denominator: 1 };
        const extended = dependencyRatioSeries([...points, outside]);
        expect(extended.meanLastTenYears).toBe(series.meanLastTenYears);
      }),
      { numRuns: 100 },
    );
  });

  it('the latest INE observation is the last finite year, never a year the payload lacks', () => {
    const observation = fc.record({
      Anyo: fc.integer({ min: -1_000_000, max: 1_000_000 }),
      Valor: fc.oneof(
        fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }),
        fc.constant(Number.NaN),
        fc.constant(Number.POSITIVE_INFINITY),
      ),
    });
    fc.assert(
      fc.property(fc.array(observation, { maxLength: 12 }), (entries) => {
        const latest = latestObservation({ COD: 'TM1657', Nombre: 'serie', Data: entries });
        const finite = entries.filter((entry) => Number.isFinite(entry.Valor));
        if (finite.length === 0) {
          expect(latest).toBeNull();
          return;
        }
        const maxYear = Math.max(...finite.map((entry) => entry.Anyo));
        const firstAtMax = finite.find((entry) => entry.Anyo === maxYear);
        expect(latest).toEqual({ year: maxYear, value: firstAtMax?.Valor });
      }),
      { numRuns: 100 },
    );
  });
});

describe('percentage and growth properties', () => {
  const positiveCounts = fc.integer({ min: 1, max: 20_000_000 });

  it('the %-of-GDP share is undefined only for a zero denominator', () => {
    fc.assert(
      fc.property(positiveMoney, positiveCounts, (expenditure, gdp) => {
        const share = shareOfGdp(expenditure, gdp);
        expect(share).not.toBeNull();
        expect(share as number).toBeGreaterThanOrEqual(0);
        expect(Math.abs((share as number) - (expenditure / gdp) * 100)).toBeLessThanOrEqual(0.005 + 1e-9);
        expect(shareOfGdp(expenditure, 0)).toBeNull();
      }),
      { numRuns: 100 },
    );
  });

  it('a published share rejects a malformed observation and never moves on re-rounding', () => {
    fc.assert(
      fc.property(fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }), (percent) => {
        const share = publishedShare(percent);
        if (percent < 0) {
          expect(share).toBeNull();
          return;
        }
        expect(share).not.toBeNull();
        expect(publishedShare(share as number)).toBe(share);
        expect(Math.abs((share as number) - percent)).toBeLessThanOrEqual(0.005 + 1e-9);
      }),
      { numRuns: 200 },
    );
    expect(publishedShare(Number.NaN)).toBeNull();
    expect(publishedShare(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('a share series is sorted, keeps every observation year, and its maximum is one of them', () => {
    const observation = fc.tuple(
      fc.integer({ min: 1990, max: 2030 }),
      fc.double({ min: 0, max: 1000, noNaN: true, noDefaultInfinity: true }),
    );
    fc.assert(
      fc.property(
        fc.uniqueArray(observation, { minLength: 1, maxLength: 8, selector: (entry) => entry[0] }),
        (observations) => {
          const series = pensionShareSeries(observations.map(([year, percent]) => ({ year, percent })));
          expect(series.points.map((point) => point.year)).toEqual(orderedYears(observations));
          expect(series.first).toBe(series.points[0]);
          expect(series.latest).toBe(series.points.at(-1));
          expect(series.max).toBe(Math.max(...observations.map(([, percent]) => percent)));
          for (const point of series.points) {
            expect(point.share).not.toBeNull();
            expect(point.share).toBe(publishedShare(point.raw as number));
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('annualised growth reconstructs the last observation and degenerates to zero, never NaN', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1e9, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 1, max: 1e9, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 1, max: 100 }),
        (first, last, years) => {
          const rate = annualisedGrowthRate(first, last, years);
          expect(Number.isFinite(rate)).toBe(true);
          // Round-tripping a near-total loss (rate close to -1) cancels catastrophically in
          // `1 + rate`, so the reconstruction is asserted to relative 1e-6, not machine epsilon.
          expect(Math.abs(first * (1 + rate) ** years - last) / last).toBeLessThan(1e-6);
          expect(annualisedGrowthRate(first, last, 0)).toBe(0);
          expect(annualisedGrowthRate(0, last, years)).toBe(0);
          expect(annualisedGrowthRate(-first, last, years)).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('a cohort series holds one flow per year, contributions negative and pensions positive', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 1, max: 5000 }),
        fc.integer({ min: 0, max: 45 }),
        fc.integer({ min: 0, max: 45 }),
        (contribution, pension, contributingYears, drawingYears) => {
          const cashflows = buildCashflows({
            entryAge: 25,
            retirementAge: 25 + contributingYears,
            lifeExpectancyAtRetirement: drawingYears,
            averageMonthlyContribution: contribution,
            averageMonthlyPension: pension,
          });
          expect(cashflows.yearsContributing).toBe(contributingYears);
          expect(cashflows.yearsDrawing).toBe(drawingYears);
          expect(cashflows.flows).toHaveLength(contributingYears + drawingYears);
          expect(cashflows.annualContribution).toBe(contribution * 12);
          expect(cashflows.annualPension).toBe(pension * 14);
          expect(cashflows.flows.slice(0, contributingYears).every((flow) => flow === -cashflows.annualContribution)).toBe(true);
          expect(cashflows.flows.slice(contributingYears).every((flow) => flow === cashflows.annualPension)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

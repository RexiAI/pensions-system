import { describe, expect, it } from 'vitest';
import { OPEN_BAND, bandOfAgeLabel } from '../../web/series/age-bands';
import { computePyramid, readAgeCounts } from '../../web/series/age-structure';
import {
  computeCountdown,
  lastObservedYear,
  observedDependency,
  readDependencySeries,
} from '../../web/series/countdown';
import { SERIES, seriesById } from '../../web/ingest/series';
import { SERIES_AVAILABILITY, SERIES_IDS, isSeriesId } from '../../web/ingest/series-types';
import { committedPayload, countdownSeries, pyramidSeries, pyramidValue } from '../fixtures/series';

/**
 * The assertions the revision-2 mutation run found missing on the series surface (T17/T18).
 *
 * Everything here is either a stated invariant with no test behind it, or a synthetic JSON-stat
 * payload built so that only one reading of the code can produce the expected answer. The
 * payloads are deliberately small and hand-built: the committed snapshots are single-variant and
 * ascending, so a filter or a sort cannot be observed through them at all.
 */

interface Dimension {
  id: string;
  /** `[code, label]`, in the payload's own category order. */
  categories: ReadonlyArray<readonly [string, string]>;
}

interface StatPoint {
  coords: Record<string, string>;
  value: number;
}

function positionsOf(dimension: Dimension): Record<string, number> {
  return Object.fromEntries(dimension.categories.map(([code], position) => [code, position]));
}

interface Layout {
  id: readonly string[];
  positions: Record<string, Record<string, number>>;
  /** Row-major stride per dimension: the last dimension varies fastest, as JSON-stat specifies. */
  strides: readonly number[];
}

function flatIndexOf(layout: Layout, coords: Record<string, string>): number {
  return layout.id.reduce(
    (flat, dimensionId, position) =>
      flat + (layout.positions[dimensionId]?.[coords[dimensionId] ?? ''] ?? 0) * (layout.strides[position] ?? 1),
    0,
  );
}

/** A minimal JSON-stat 2.0 dataset: `id`/`size`/`dimension` plus the flat `value` map. */
function jsonStat(dimensions: readonly Dimension[], points: readonly StatPoint[]): unknown {
  const size = dimensions.map((dimension) => dimension.categories.length);
  const layout: Layout = {
    id: dimensions.map((dimension) => dimension.id),
    positions: Object.fromEntries(dimensions.map((spec) => [spec.id, positionsOf(spec)])),
    strides: size.map((_, position) => size.slice(position + 1).reduce((product, length) => product * length, 1)),
  };
  const dimension = Object.fromEntries(
    dimensions.map((spec) => [
      spec.id,
      { category: { index: positionsOf(spec), label: Object.fromEntries(spec.categories) } },
    ]),
  );
  const value = Object.fromEntries(
    points.map((point) => [String(flatIndexOf(layout, point.coords)), point.value]),
  );
  return { id: layout.id, size, dimension, value };
}

const FREQ: Dimension = { id: 'freq', categories: [['A', 'Annual']] };
const UNIT_PERSON: Dimension = { id: 'unit', categories: [['PER', 'Person']] };
const UNIT_NUMBER: Dimension = { id: 'unit', categories: [['NR', 'Number']] };
const GEO: Dimension = { id: 'geo', categories: [['ES', 'Spain']] };
const SEXES: Dimension = {
  id: 'sex',
  categories: [
    ['T', 'Total'],
    ['M', 'Males'],
    ['F', 'Females'],
  ],
};

/**
 * Two projection variants over the same years. `demo_pjan`/`proj_23np` as committed carry one
 * variant each, so the variant filter is unobservable there — this payload makes it observable.
 * `Unknown` precedes `Total` in the age dimension so the excluded-label set is recorded out of
 * alphabetical order.
 */
function mixedVariantProjection(): unknown {
  const age: Dimension = {
    id: 'age',
    categories: [
      ['UNK', 'Unknown'],
      ['TOTAL', 'Total'],
      ['Y0', 'Less than 1 year'],
      ['Y5', '5 years'],
    ],
  };
  const time: Dimension = { id: 'time', categories: [['2050', '2050']] };
  const projection: Dimension = {
    id: 'projection',
    categories: [
      ['BSL', 'Baseline projections'],
      ['HMIGR', 'Higher migration'],
    ],
  };
  const baseline: StatPoint[] = [
    { coords: { age: 'UNK', sex: 'T', projection: 'BSL' }, value: 5 },
    { coords: { age: 'TOTAL', sex: 'T', projection: 'BSL' }, value: 210 },
    { coords: { age: 'Y0', sex: 'M', projection: 'BSL' }, value: 10 },
    { coords: { age: 'Y0', sex: 'F', projection: 'BSL' }, value: 12 },
    { coords: { age: 'Y0', sex: 'T', projection: 'BSL' }, value: 22 },
    { coords: { age: 'Y5', sex: 'M', projection: 'BSL' }, value: 20 },
    { coords: { age: 'Y5', sex: 'F', projection: 'BSL' }, value: 21 },
    { coords: { age: 'Y5', sex: 'T', projection: 'BSL' }, value: 41 },
  ];
  const higher: StatPoint[] = [
    { coords: { age: 'UNK', sex: 'T', projection: 'HMIGR' }, value: 7 },
    { coords: { age: 'TOTAL', sex: 'T', projection: 'HMIGR' }, value: 610 },
    { coords: { age: 'Y0', sex: 'M', projection: 'HMIGR' }, value: 30 },
    { coords: { age: 'Y0', sex: 'F', projection: 'HMIGR' }, value: 32 },
    { coords: { age: 'Y0', sex: 'T', projection: 'HMIGR' }, value: 62 },
    { coords: { age: 'Y5', sex: 'M', projection: 'HMIGR' }, value: 60 },
    { coords: { age: 'Y5', sex: 'F', projection: 'HMIGR' }, value: 61 },
    { coords: { age: 'Y5', sex: 'T', projection: 'HMIGR' }, value: 121 },
  ];
  return jsonStat([FREQ, projection, SEXES, age, UNIT_PERSON, GEO, time], [...baseline, ...higher]);
}

/** A projection year that publishes its population total and no single-year rows at all. */
function totalOnlyProjection(): unknown {
  const age: Dimension = {
    id: 'age',
    categories: [
      ['TOTAL', 'Total'],
      ['UNK', 'Unknown'],
    ],
  };
  const projection: Dimension = { id: 'projection', categories: [['BSL', 'Baseline projections']] };
  const time: Dimension = { id: 'time', categories: [['2050', '2050']] };
  return jsonStat([FREQ, projection, SEXES, age, UNIT_PERSON, GEO, time], [
    { coords: { age: 'TOTAL', sex: 'T', projection: 'BSL' }, value: 210 },
    { coords: { age: 'UNK', sex: 'T', projection: 'BSL' }, value: 5 },
  ]);
}

const AGE_CLASSES: Dimension = {
  id: 'age',
  categories: [
    ['Y65', '65 years or over'],
    ['Y1564', 'From 15 to 64 years'],
    ['Y2064', 'From 20 to 64 years'],
  ],
};

const PROJECTIONS: Dimension = {
  id: 'projection',
  categories: [
    ['BSL', 'Baseline projections'],
    ['HMIGR', 'Higher migration'],
  ],
};

/**
 * The dependency-ratio payload, built to expose what the committed snapshot cannot:
 *  - the years are published in *descending* order (the committed one is ascending);
 *  - 2024 carries the numerator and no denominator (a year that must be skipped);
 *  - 2025's sex halves do not reconcile with its total (1400+1600 ≠ 3000), so anything that
 *    sums the two halves instead of reading the `Total` row lands on a different ratio;
 *  - a second projection variant exists, so a lost variant filter changes the ratio.
 * Baseline reads 40.00 in 2023 and 50.00 in 2025; nothing crosses 50 before 2025.
 */
function dependencyPayload(): unknown {
  const time: Dimension = {
    id: 'time',
    categories: [
      ['2025', '2025'],
      ['2024', '2024'],
      ['2023', '2023'],
    ],
  };
  const points: StatPoint[] = [
    { coords: { projection: 'BSL', sex: 'T', age: 'Y65', time: '2025' }, value: 3000 },
    { coords: { projection: 'BSL', sex: 'T', age: 'Y1564', time: '2025' }, value: 6000 },
    { coords: { projection: 'BSL', sex: 'M', age: 'Y65', time: '2025' }, value: 1400 },
    { coords: { projection: 'BSL', sex: 'F', age: 'Y65', time: '2025' }, value: 1600 },
    { coords: { projection: 'BSL', sex: 'M', age: 'Y1564', time: '2025' }, value: 2000 },
    { coords: { projection: 'BSL', sex: 'F', age: 'Y1564', time: '2025' }, value: 2500 },
    { coords: { projection: 'BSL', sex: 'T', age: 'Y65', time: '2024' }, value: 2900 },
    { coords: { projection: 'BSL', sex: 'T', age: 'Y65', time: '2023' }, value: 2800 },
    { coords: { projection: 'BSL', sex: 'T', age: 'Y1564', time: '2023' }, value: 7000 },
    { coords: { projection: 'BSL', sex: 'M', age: 'Y65', time: '2023' }, value: 1300 },
    { coords: { projection: 'BSL', sex: 'F', age: 'Y65', time: '2023' }, value: 1500 },
    { coords: { projection: 'BSL', sex: 'M', age: 'Y1564', time: '2023' }, value: 3400 },
    { coords: { projection: 'BSL', sex: 'F', age: 'Y1564', time: '2023' }, value: 3600 },
    { coords: { projection: 'HMIGR', sex: 'T', age: 'Y65', time: '2025' }, value: 3100 },
    { coords: { projection: 'HMIGR', sex: 'T', age: 'Y1564', time: '2025' }, value: 6000 },
    { coords: { projection: 'HMIGR', sex: 'T', age: 'Y65', time: '2023' }, value: 2700 },
    { coords: { projection: 'HMIGR', sex: 'T', age: 'Y1564', time: '2023' }, value: 7000 },
  ];
  return jsonStat([FREQ, PROJECTIONS, SEXES, AGE_CLASSES, UNIT_PERSON, GEO, time], points);
}

/** A projection whose baseline variant publishes the numerator every year and never a denominator. */
function baselineWithoutDenominator(): unknown {
  const time: Dimension = {
    id: 'time',
    categories: [
      ['2025', '2025'],
      ['2024', '2024'],
    ],
  };
  const points: StatPoint[] = [
    { coords: { projection: 'BSL', sex: 'T', age: 'Y65', time: '2025' }, value: 3000 },
    { coords: { projection: 'BSL', sex: 'T', age: 'Y65', time: '2024' }, value: 2900 },
  ];
  return jsonStat([FREQ, PROJECTIONS, SEXES, AGE_CLASSES, UNIT_PERSON, GEO, time], points);
}

/**
 * An observation-shaped payload: three years published out of order, two bands (0–4 and 65–69),
 * and no 15–64 band at all, so the published denominator has no population behind it.
 */
function observationPayload(): unknown {
  const age: Dimension = {
    id: 'age',
    categories: [
      ['TOTAL', 'Total'],
      ['Y0', 'Less than 1 year'],
      ['Y65', '65 years'],
    ],
  };
  const time: Dimension = {
    id: 'time',
    categories: [
      ['2025', '2025'],
      ['1995', '1995'],
      ['2010', '2010'],
    ],
  };
  const points = (['2025', '1995', '2010'] as const).flatMap((year): StatPoint[] => [
    { coords: { age: 'TOTAL', sex: 'T', time: year }, value: 1000 },
    { coords: { age: 'Y0', sex: 'M', time: year }, value: 100 },
    { coords: { age: 'Y0', sex: 'F', time: year }, value: 100 },
    { coords: { age: 'Y0', sex: 'T', time: year }, value: 200 },
    { coords: { age: 'Y65', sex: 'M', time: year }, value: 150 },
    { coords: { age: 'Y65', sex: 'F', time: year }, value: 150 },
    { coords: { age: 'Y65', sex: 'T', time: year }, value: 300 },
  ]);
  return jsonStat([FREQ, UNIT_NUMBER, age, SEXES, GEO, time], points);
}

describe('the band mapping saturates at the open band rather than inventing a band above it', () => {
  it('folds every age above 100 into the open-ended band', () => {
    expect(bandOfAgeLabel('105 years')).toBe(OPEN_BAND);
    expect(bandOfAgeLabel('120 years')).toBe(OPEN_BAND);
    // Exactly 100 is the boundary the open band starts at.
    expect(bandOfAgeLabel('100 years')).toBe(OPEN_BAND);
  });

  it('tolerates the whitespace the published labels carry', () => {
    expect(bandOfAgeLabel('  5  years ')).toBe(5);
    expect(bandOfAgeLabel('5  YEARS')).toBe(5);
  });
});

describe('the published readouts are the block\'s printed claim, not an artefact of rounding', () => {
  it('pins over65 and under20 per year against independently computed shares', () => {
    // Independently decoded from the committed snapshots: the 65+ band counts over the year
    // total are 5,938,187/39,639,726 and 10,179,254/49,128,297 and 16,491,469/50,460,161.
    const readouts = pyramidValue().years.map((year) => [year.year, year.readout.over65, year.readout.under20]);
    expect(readouts).toEqual([
      [1995, 14.98, 25.14],
      [2025, 20.72, 18.4],
      [2050, 32.68, 16],
    ]);
  });

  it('carries the year, its state and its hue role, and no other', () => {
    const shape = pyramidValue().years.map((year) => [year.year, year.state, year.hue]);
    expect(shape).toEqual([
      [1995, 'observed', 'reference'],
      [2025, 'observed', 'measured'],
      [2050, 'projected', 'projected'],
    ]);
    expect(pyramidValue().years.map((year) => year.population)).toEqual([39639726, 49128297, 50460161]);
  });

  it('records the excluded age classes in a stable order', () => {
    expect(pyramidValue().excludedLabels).toEqual(['Total', 'Unknown']);
  });
});

describe('the reader refuses a population it cannot band, and names what it refused', () => {
  it('reads only the pinned projection variant, never both', () => {
    const counts = readAgeCounts(mixedVariantProjection(), { projectionLabel: 'Baseline projections' });
    expect(counts.totals.get(2050)).toBe(210);
    expect(counts.years.get(2050)?.get(0)?.total).toBe(22);
    expect(counts.years.get(2050)?.get(5)?.total).toBe(41);
  });

  it('sorts the excluded labels it reports', () => {
    // `Unknown` precedes `Total` in this payload's age dimension, so an unsorted set comes back
    // in the opposite order from the one published.
    const counts = readAgeCounts(mixedVariantProjection(), { projectionLabel: 'Baseline projections' });
    expect(counts.excludedLabels).toEqual(['Total', 'Unknown']);
  });

  it('names the computed sums when the sexes do not reconcile with the total', () => {
    const age: Dimension = {
      id: 'age',
      categories: [
        ['TOTAL', 'Total'],
        ['Y100', '100 years or over'],
      ],
    };
    const time: Dimension = { id: 'time', categories: [['1995', '1995']] };
    const payload = jsonStat([FREQ, UNIT_NUMBER, age, SEXES, GEO, time], [
      { coords: { age: 'TOTAL', sex: 'T', time: '1995' }, value: 3 },
      { coords: { age: 'Y100', sex: 'M', time: '1995' }, value: 1 },
      { coords: { age: 'Y100', sex: 'F', time: '1995' }, value: 1 },
      { coords: { age: 'Y100', sex: 'T', time: '1995' }, value: 3 },
    ]);
    // The message is the only place the two sums appear; a wrong operand there misreports why
    // the build stopped.
    expect(() => readAgeCounts(payload)).toThrow(/males \+ females \(2\)/);
    expect(() => readAgeCounts(payload)).toThrow(/the sex total \(3\)/);
  });

  it('refuses a year whose population total exists but whose bands do not', () => {
    expect(() =>
      computePyramid({ observed: committedPayload('eurostat-demo-pjan'), projected: totalOnlyProjection() }),
    ).toThrow(/age band 0 is missing for 2050/);
  });
});

describe('the dependency series is read off the pinned variant, the total row and a sorted year axis', () => {
  it('orders the years, skips an incomplete one, and reads the total row rather than the halves', () => {
    const series = readDependencySeries(dependencyPayload(), { variant: 'BSL' });
    expect(series).toEqual([
      { year: 2023, ratio: 40 },
      { year: 2025, ratio: 50 },
    ]);
  });

  it('answers an observation whose published denominator has no population behind it with null', () => {
    expect(observedDependency(observationPayload(), 2025)).toBeNull();
  });

  it('finds the latest observed year on an unsorted time axis', () => {
    // The payload publishes 2025, 1995, 2010 in that order; an unsorted read reports 2010.
    expect(lastObservedYear(observationPayload(), 2026)).toBe(2025);
    expect(lastObservedYear(observationPayload(), 2025)).toBe(2025);
  });

  it('refuses a projection whose baseline variant never publishes a complete year', () => {
    expect(() =>
      computeCountdown({
        projected: baselineWithoutDenominator(),
        observed: committedPayload('eurostat-demo-pjan'),
        snapshotYear: 2026,
      }),
    ).toThrow(/no baseline dependency series/);
  });
});

describe('the series ids and the published assumptions', () => {
  it('closes the series id set and the availability set', () => {
    expect(SERIES_IDS).toEqual(['pyramid', 'countdown']);
    expect(SERIES_AVAILABILITY).toEqual(['computed', 'unavailable']);
    expect(isSeriesId('pyramid')).toBe(true);
    expect(isSeriesId('countdown')).toBe(true);
    expect(isSeriesId('figure')).toBe(false);
    expect(isSeriesId(42)).toBe(false);
    expect(isSeriesId(null)).toBe(false);
  });

  it('resolves a series by id and nothing for an unknown one', () => {
    expect(seriesById('pyramid')).toBe(SERIES[0]);
    expect(seriesById('countdown')).toBe(SERIES[1]);
    expect(seriesById('fig-01')).toBeUndefined();
  });

  it('records the age-structure assumptions beside the value', () => {
    expect(pyramidSeries().assumptions).toEqual({
      bands: 21,
      observedYears: '1995,2025',
      projectedYear: 2050,
      projectionVariant: 'Baseline projections',
      encoding: 'share of the year total population, percent',
      decimals: 2,
      excludedLabels: 'Total,Unknown',
    });
  });

  it('records the countdown assumptions beside the value', () => {
    expect(countdownSeries().assumptions).toEqual({
      threshold: 50,
      denominator: '15-64',
      variant: 'BSL',
      snapshotYear: 2026,
      variantsCrossing: 'BSL:2042,HMIGR:2043,LFRT:2041,LMIGR:2040,LMRT:2041,NMIGR:2039',
      backCast: 31.91,
      observation: 31.22,
    });
  });
});

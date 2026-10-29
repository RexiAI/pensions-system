/**
 * Population age structure (T17, R1). Reads `demo_pjan` (observed) and `proj_23np` (projected),
 * bands both to the twenty-one five-year groups, and encodes each band as that sex's share of
 * the year's total population — never an absolute count, so the panels stay comparable as the
 * population grows.
 *
 * Three traps are handled here, not in the chart:
 *  - the open-ended band resolves by label, so neither dataset's spelling can drop it;
 *  - `sex = T` is used for the year total only, `M`/`F` alone for the mirrored halves, so no
 *    person is counted twice;
 *  - every published share is a rounded share of one year total, and the band totals are
 *    asserted to reconcile with it before anything is written.
 */
import { roundTo } from '../metrics/rounding';
import { IngestError, categoryLabels, jsonStatPoints, resolveCategoryCode, resolveCountUnit } from '../sources/eurostat';
import { AGE_BANDS, OPEN_BAND, bandOfAgeLabel } from './age-bands';

export interface BandCounts {
  male: number;
  female: number;
  total: number;
}

export interface BandShare {
  band: number;
  male: number;
  female: number;
  total: number;
}

/** The label `proj_23np` publishes for its baseline variant. Resolved, never a code literal. */
export const BASELINE_PROJECTION_LABEL = 'Baseline projections';

export const PYRAMID_OBSERVED_YEARS = [1995, 2025] as const;
export const PYRAMID_PROJECTED_YEAR = 2050;
export const PYRAMID_AXIS_MAX_PERCENT = 4.5;
export const PYRAMID_DECIMALS = 2;

const SEX_LABELS = { male: 'Males', female: 'Females', total: 'Total' } as const;

interface SexCodes {
  male: string;
  female: string;
  total: string;
}

export interface AgeCounts {
  /** year → band start → counts per sex. */
  years: Map<number, Map<number, BandCounts>>;
  /** year → the population of that year, from the payload's own `Total` age row. */
  totals: Map<number, number>;
  /** Age labels the banding excluded: `Total`, `Unknown`, and any published aggregate class. */
  excludedLabels: string[];
}

/** The year's state: two observations and one projection, each with its own encoding role. */
export type YearState = 'observed' | 'projected';

export interface YearStructure {
  year: number;
  state: YearState;
  /** Which hue role the panel takes. Sex is never encoded by hue, so the panel gets one. */
  hue: 'reference' | 'measured' | 'projected';
  population: number;
  bands: BandShare[];
  readout: { over65: number; under20: number };
}

export interface PyramidValue {
  years: YearStructure[];
  axisMaxPercent: number;
  decimals: number;
  excludedLabels: string[];
}

function sexCodes(payload: unknown): SexCodes {
  return {
    male: resolveCategoryCode(payload, 'sex', SEX_LABELS.male),
    female: resolveCategoryCode(payload, 'sex', SEX_LABELS.female),
    total: resolveCategoryCode(payload, 'sex', SEX_LABELS.total),
  };
}

function projectionFilter(payload: unknown, projectionLabel?: string): string | null {
  return projectionLabel === undefined ? null : resolveCategoryCode(payload, 'projection', projectionLabel);
}

interface BandAccumulator {
  years: Map<number, Map<number, BandCounts>>;
  totals: Map<number, number>;
  excluded: Set<string>;
}

function emptyBand(): BandCounts {
  return { male: 0, female: 0, total: 0 };
}

function bandBucket(accumulator: BandAccumulator, year: number, band: number): BandCounts {
  const byBand = accumulator.years.get(year) ?? new Map<number, BandCounts>();
  accumulator.years.set(year, byBand);
  const counts = byBand.get(band) ?? emptyBand();
  byBand.set(band, counts);
  return counts;
}

interface PointContext {
  sex: SexCodes;
  labels: Record<string, string>;
  projection: string | null;
}

interface AgePoint {
  coords: Record<string, string>;
  value: number;
}

function addToBand(bucket: BandCounts, sex: string, codes: SexCodes, value: number): void {
  if (sex === codes.male) bucket.male += value;
  else if (sex === codes.female) bucket.female += value;
  else if (sex === codes.total) bucket.total += value;
}

/** A row the banding excluded: `Total` becomes the year's denominator, everything else is noted. */
function accumulateExcluded(accumulator: BandAccumulator, point: AgePoint, label: string, context: PointContext): void {
  accumulator.excluded.add(label);
  if (label.trim().toLocaleLowerCase() !== 'total' || point.coords.sex !== context.sex.total) return;
  const year = Number(point.coords.time);
  if (Number.isFinite(year)) accumulator.totals.set(year, point.value);
}

function belongsToProjection(point: AgePoint, context: PointContext): boolean {
  return context.projection === null || point.coords.projection === context.projection;
}

function accumulatePoint(accumulator: BandAccumulator, point: AgePoint, context: PointContext): void {
  if (!belongsToProjection(point, context)) return;
  const year = Number(point.coords.time);
  if (!Number.isFinite(year)) return;
  const label = context.labels[point.coords.age] ?? point.coords.age ?? '';
  const band = bandOfAgeLabel(label);
  if (band === null) {
    accumulateExcluded(accumulator, point, label, context);
    return;
  }
  addToBand(bandBucket(accumulator, year, band), point.coords.sex, context.sex, point.value);
}

/**
 * Reads one population dataset into per-year, per-band counts. The payload must carry exactly
 * one unit and, once filtered, one projection variant: mixing variants in one series is the
 * mistake that would let a sensitivity test pass as the baseline.
 */
export function readAgeCounts(payload: unknown, options: { projectionLabel?: string } = {}): AgeCounts {
  resolveCountUnit(payload);
  const context: PointContext = {
    sex: sexCodes(payload),
    labels: categoryLabels(payload, 'age'),
    projection: projectionFilter(payload, options.projectionLabel),
  };
  const accumulator: BandAccumulator = { years: new Map(), totals: new Map(), excluded: new Set() };
  for (const point of jsonStatPoints(payload)) accumulatePoint(accumulator, point, context);
  assertSexTotals(accumulator.years);
  return { years: accumulator.years, totals: accumulator.totals, excludedLabels: [...accumulator.excluded].sort() };
}

/**
 * `T` is published alongside `M` and `F`; summing every sex row double-counts. The total row must
 * equal the two halves exactly, and a payload where it does not is refused at read time rather
 * than published as a shape nobody can reconcile.
 */
function assertSexTotals(years: Map<number, Map<number, BandCounts>>): void {
  for (const [year, bands] of years) {
    for (const [band, counts] of bands) {
      if (counts.male + counts.female !== counts.total) {
        throw new IngestError(
          `age band ${band} ${year}: males + females (${counts.male + counts.female}) ≠ the sex total (${counts.total}), so the sex rows double-count`,
        );
      }
    }
  }
}

function yearTotal(counts: AgeCounts, year: number): number {
  const total = counts.totals.get(year);
  if (total === undefined || total <= 0) {
    throw new IngestError(`no total population for ${year}: the year's share has no denominator`);
  }
  return total;
}

function bandCounts(counts: AgeCounts, year: number, band: number): BandCounts {
  const entry = counts.years.get(year)?.get(band);
  if (!entry) throw new IngestError(`age band ${band} is missing for ${year}`);
  if (entry.male + entry.female !== entry.total) {
    throw new IngestError(`age band ${band} ${year}: males + females ≠ total, so the sex rows double-count`);
  }
  return entry;
}

function shareOf(value: number, total: number): number {
  return roundTo((value / total) * 100, PYRAMID_DECIMALS);
}

/**
 * The published band. `male` and `female` are each band's share of the year total; `total` is the
 * sum of the two *published* halves, so a reader adding the two columns gets the total exactly
 * rather than a rounded third figure that disagrees with them by a hundredth. The payload-level
 * `M + F == T` equality is asserted before any rounding (`assertSexTotals`), so this sum can never
 * hide a double-counted row.
 */
function bandShare(counts: AgeCounts, year: number, band: number): BandShare {
  const total = yearTotal(counts, year);
  const entry = bandCounts(counts, year, band);
  const male = shareOf(entry.male, total);
  const female = shareOf(entry.female, total);
  return { band, male, female, total: roundTo(male + female, PYRAMID_DECIMALS) };
}

/**
 * `over65` and `under20` are the block's printed claim: the shape in two numbers per year. They
 * are summed from the counts and rounded once, never by adding rounded band shares — that would
 * turn a rounding artefact into a published figure.
 */
function readoutOf(counts: AgeCounts, year: number): { over65: number; under20: number } {
  const total = yearTotal(counts, year);
  const sum = (predicate: (band: number) => boolean) =>
    shareOf(
      AGE_BANDS.filter(predicate).reduce((acc, band) => acc + bandCounts(counts, year, band).total, 0),
      total,
    );
  return {
    over65: sum((band) => band >= 65),
    under20: sum((band) => band < 20),
  };
}

function structureFor(counts: AgeCounts, year: number, state: YearState, hue: YearStructure['hue']): YearStructure {
  const bands = AGE_BANDS.map((band) => bandShare(counts, year, band));
  return {
    year,
    state,
    hue,
    population: yearTotal(counts, year),
    bands,
    readout: readoutOf(counts, year),
  };
}

const OBSERVED_HUES: Readonly<Record<number, YearStructure['hue']>> = {
  [PYRAMID_OBSERVED_YEARS[0]]: 'reference',
  [PYRAMID_OBSERVED_YEARS[1]]: 'measured',
};

/**
 * The published value: three panels, one per year, sharing one axis. Every year must resolve —
 * a missing third year is a build failure, never a two-panel plate.
 */
export function computePyramid(inputs: { observed: unknown; projected: unknown }): PyramidValue {
  const observed = readAgeCounts(inputs.observed);
  const projected = readAgeCounts(inputs.projected, { projectionLabel: BASELINE_PROJECTION_LABEL });
  const years = [
    ...PYRAMID_OBSERVED_YEARS.map((year) => structureFor(observed, year, 'observed', OBSERVED_HUES[year] ?? 'measured')),
    structureFor(projected, PYRAMID_PROJECTED_YEAR, 'projected', 'projected'),
  ];
  return {
    years,
    axisMaxPercent: PYRAMID_AXIS_MAX_PERCENT,
    decimals: PYRAMID_DECIMALS,
    excludedLabels: observed.excludedLabels,
  };
}

/** The open-ended band's share in one year, used by the tests that guard the dropped-band trap. */
export function openBandShare(value: PyramidValue, year: number): BandShare | undefined {
  return value.years.find((entry) => entry.year === year)?.bands.find((band) => band.band === OPEN_BAND);
}

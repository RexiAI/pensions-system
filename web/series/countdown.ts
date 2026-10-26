/**
 * Projected threshold crossing (T18, R2). The old-age dependency ratio per year — population
 * aged 65 and over per 100 persons aged 15 to 64 — drawn entirely from `proj_23np`, including
 * its own 2025 back-cast. The `demo_pjan` observation of the same definition is read only for
 * the disclosure that the two differ, never mixed into the series.
 *
 * The crossing year is derived, never authored: the threshold is a parameter and the range is
 * computed over every projection variant the payload publishes.
 */
import { roundTo } from '../metrics/rounding';
import { IngestError, categoryLabels, jsonStatPoints, resolveCategoryCode } from '../sources/eurostat';
import { readAgeCounts } from './age-structure';

export const COUNTDOWN_THRESHOLD = 50;
export const COUNTDOWN_DECIMALS = 2;
export const BASELINE_PROJECTION_LABEL = 'Baseline projections';
export const DEPENDENCY_NUMERATOR_LABEL = '65 years or over';

/** Eurostat's own old-age dependency age classes, resolved by label (never by code). */
export const DEPENDENCY_DENOMINATORS = {
  '15-64': 'From 15 to 64 years',
  '20-64': 'From 20 to 64 years',
} as const;

export type Denominator = keyof typeof DEPENDENCY_DENOMINATORS;

/** The denominator the page publishes. The 20–64 class exists in the same payload and is not it. */
export const PUBLISHED_DENOMINATOR: Denominator = '15-64';

export interface DependencyPoint {
  year: number;
  ratio: number;
}

export interface VariantCrossing {
  variant: string;
  label: string;
  thresholdYear: number | null;
}

export interface CountdownValue {
  state: 'computed' | 'not-crossed';
  variant: string;
  variantLabel: string;
  threshold: number;
  snapshotYear: number;
  thresholdYear: number | null;
  /** `thresholdYear - snapshotYear`, both integers. Never a sub-annual unit. */
  years: number | null;
  /** The horizon's last published year, printed in the `not-crossed` sentence. */
  horizonEnd: number;
  range: { min: number; max: number } | null;
  variants: VariantCrossing[];
  /** The projection's own value for the snapshot year, and the observation of the same year. */
  backCast: { year: number; projected: number; observed: number; difference: number } | null;
}

function ratioOf(numerator: number, denominator: number): number {
  if (denominator <= 0) throw new IngestError('dependency ratio denominator is zero');
  return roundTo((numerator / denominator) * 100, COUNTDOWN_DECIMALS);
}

interface DependencyCodes {
  numerator: string;
  denominator: string;
  sex: string;
}

function dependencyCodes(payload: unknown, denominator: Denominator): DependencyCodes {
  return {
    numerator: resolveCategoryCode(payload, 'age', DEPENDENCY_NUMERATOR_LABEL),
    denominator: resolveCategoryCode(payload, 'age', DEPENDENCY_DENOMINATORS[denominator]),
    sex: resolveCategoryCode(payload, 'sex', 'Total'),
  };
}

interface YearSums {
  numerator: number;
  denominator: number;
}

function matchesPoint(point: { coords: Record<string, string> }, codes: DependencyCodes, variant: string | null): boolean {
  if (point.coords.sex !== codes.sex) return false;
  return variant === null || point.coords.projection === variant;
}

function addToYear(sums: YearSums, age: string, codes: DependencyCodes, value: number): void {
  if (age === codes.numerator) sums.numerator += value;
  if (age === codes.denominator) sums.denominator += value;
}

function pointsFor(payload: unknown, codes: DependencyCodes, variant: string | null): Map<number, YearSums> {
  const byYear = new Map<number, YearSums>();
  for (const point of jsonStatPoints(payload)) {
    if (!matchesPoint(point, codes, variant)) continue;
    const year = Number(point.coords.time);
    if (!Number.isFinite(year)) continue;
    const sums = byYear.get(year) ?? { numerator: 0, denominator: 0 };
    addToYear(sums, point.coords.age ?? '', codes, point.value);
    byYear.set(year, sums);
  }
  return byYear;
}

/**
 * The ratio per year for one projection variant (or for a payload that carries no projection
 * dimension, such as `demo_pjan`). Ordered by year; a year missing either age class is skipped
 * rather than filled.
 */
export function readDependencySeries(
  payload: unknown,
  options: { denominator?: Denominator; variant?: string | null } = {},
): DependencyPoint[] {
  const codes = dependencyCodes(payload, options.denominator ?? PUBLISHED_DENOMINATOR);
  const byYear = pointsFor(payload, codes, options.variant ?? null);
  return [...byYear.entries()]
    .filter(([, entry]) => entry.numerator > 0 && entry.denominator > 0)
    .map(([year, entry]) => ({ year, ratio: ratioOf(entry.numerator, entry.denominator) }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Every projection variant the payload publishes, in the publisher's own order. A payload with
 * no projection dimension is a source error here, not an empty range: the countdown cannot be
 * computed from data that does not say which variants it carries.
 */
export function projectionVariants(payload: unknown): Array<{ code: string; label: string }> {
  const labels = categoryLabels(payload, 'projection');
  return Object.entries(labels)
    .filter(([code]) => code.trim() !== '')
    .map(([code, label]) => ({ code, label }));
}

/** The first year whose published ratio reaches the threshold, or `null` inside the horizon. */
export function firstYearAtOrAbove(points: readonly DependencyPoint[], threshold: number): number | null {
  const crossed = points.find((point) => point.ratio >= threshold);
  return crossed ? crossed.year : null;
}

function crossing(threshold: number, points: readonly DependencyPoint[]): number | null {
  return firstYearAtOrAbove(points, threshold);
}

function rangeOf(crossings: readonly VariantCrossing[]): { min: number; max: number } | null {
  const years = crossings.map((entry) => entry.thresholdYear).filter((year): year is number => year !== null);
  if (years.length === 0) return null;
  return { min: Math.min(...years), max: Math.max(...years) };
}

/** The latest year the observed dataset carries at or before `upTo`, or `null`. */
export function lastObservedYear(payload: unknown, upTo: number): number | null {
  const years = [...readAgeCounts(payload).years.keys()].filter((year) => year <= upTo).sort((a, b) => a - b);
  return years.length > 0 ? (years[years.length - 1] as number) : null;
}

/**
 * The observation of the same definition, read from the observed dataset's own bands. Used for
 * the disclosure only: the published series never contains this number.
 */
export function observedDependency(
  payload: unknown,
  year: number,
  denominator: Denominator = PUBLISHED_DENOMINATOR,
): number | null {
  const counts = readAgeCounts(payload);
  const bands = counts.years.get(year);
  if (!bands) return null;
  const total = (predicate: (band: number) => boolean) =>
    [...bands.entries()].filter(([band]) => predicate(band)).reduce((sum, [, entry]) => sum + entry.total, 0);
  const numerator = total((band) => band >= 65);
  const denominatorPopulation = total((band) => band >= (denominator === '15-64' ? 15 : 20) && band <= 60);
  return denominatorPopulation > 0 ? ratioOf(numerator, denominatorPopulation) : null;
}

/** The projection's own value for one year, from the pinned variant. */
function projectedAt(points: readonly DependencyPoint[], year: number): number | null {
  return points.find((point) => point.year === year)?.ratio ?? null;
}

export interface CountdownInputs {
  /** `proj_23np`: every projection variant the payload publishes. */
  projected: unknown;
  /** `demo_pjan`: the observation the back-cast is compared against, never merged into it. */
  observed: unknown;
  /** Recorded at ingest from the snapshot date (OQ19); never derived at render time. */
  snapshotYear: number;
  threshold?: number;
}

function variantCrossings(
  payload: unknown,
  threshold: number,
  denominator: Denominator,
): VariantCrossing[] {
  return projectionVariants(payload).map((variant) => ({
    variant: variant.code,
    label: variant.label,
    thresholdYear: crossing(threshold, readDependencySeries(payload, { denominator, variant: variant.code })),
  }));
}

/**
 * The projection's back-cast for the last year an observation exists, against that observation.
 * The comparison year is the latest observed year at or before the snapshot vintage — never the
 * vintage year itself, which the observed dataset does not carry.
 */
function backCast(
  pinned: readonly DependencyPoint[],
  observedPayload: unknown,
  snapshotYear: number,
  denominator: Denominator,
): CountdownValue['backCast'] {
  const year = lastObservedYear(observedPayload, snapshotYear);
  if (year === null) return null;
  const projected = projectedAt(pinned, year);
  const observed = observedDependency(observedPayload, year, denominator);
  if (projected === null || observed === null) return null;
  return { year, projected, observed, difference: roundTo(projected - observed, COUNTDOWN_DECIMALS) };
}

function computedState(
  pinned: readonly DependencyPoint[],
  threshold: number,
  snapshotYear: number,
): Pick<CountdownValue, 'state' | 'thresholdYear' | 'years'> {
  const thresholdYear = firstYearAtOrAbove(pinned, threshold);
  if (thresholdYear === null) return { state: 'not-crossed', thresholdYear: null, years: null };
  return { state: 'computed', thresholdYear, years: thresholdYear - snapshotYear };
}

/**
 * The countdown. `threshold` is a documented parameter: changing it changes the crossing year,
 * which is the property that proves the year is derived rather than authored.
 */
export function computeCountdown(inputs: CountdownInputs): CountdownValue {
  const threshold = inputs.threshold ?? COUNTDOWN_THRESHOLD;
  const denominator = PUBLISHED_DENOMINATOR;
  const pinnedCode = resolveCategoryCode(inputs.projected, 'projection', BASELINE_PROJECTION_LABEL);
  const pinned = readDependencySeries(inputs.projected, { denominator, variant: pinnedCode });
  if (pinned.length === 0) throw new IngestError('proj_23np has no baseline dependency series');
  const crossings = variantCrossings(inputs.projected, threshold, denominator);
  return {
    variant: pinnedCode,
    variantLabel: BASELINE_PROJECTION_LABEL,
    threshold,
    snapshotYear: inputs.snapshotYear,
    horizonEnd: pinned[pinned.length - 1]?.year ?? inputs.snapshotYear,
    range: rangeOf(crossings),
    variants: crossings,
    backCast: backCast(pinned, inputs.observed, inputs.snapshotYear, denominator),
    ...computedState(pinned, threshold, inputs.snapshotYear),
  };
}

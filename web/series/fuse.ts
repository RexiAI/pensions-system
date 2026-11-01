/**
 * The fuse (spec 003 T2): how much of the threshold the **observed** old-age dependency ratio has
 * already reached. `consumed = observedRatio(latestObservedYear) ÷ threshold`.
 *
 * The input is `demo_pjan` only. The projected series (`proj_23np`, including its own 2025
 * back-cast) is never read here: "now" is an observation, and a projection standing in for it
 * would be the exact mixing T18 (001) forbids. The threshold is the countdown's own documented
 * parameter, never a second literal.
 */
import { roundTo } from '../metrics/rounding';
import { readAgeCounts } from './age-structure';
import { COUNTDOWN_DECIMALS, COUNTDOWN_THRESHOLD, observedDependency } from './countdown';

export interface FuseValue {
  /** Population 65+ per 100 aged 15–64, Spain, two decimals (AC-001-08 convention). */
  observedRatio: number;
  /** The greatest year in the snapshot that carries both age classes. */
  observedYear: number;
  threshold: number;
  /** `observedRatio ÷ threshold × 100`, two decimals, unclamped: above the threshold it exceeds 100. */
  consumedPercent: number;
}

export interface FuseInputs {
  /** `demo_pjan`: the observation. The only payload this computation accepts. */
  observed: unknown;
  threshold?: number;
}

/** The latest year with a defined observed ratio, read from the newest year down. */
function latestObservation(payload: unknown): { year: number; ratio: number } | null {
  const years = [...readAgeCounts(payload).years.keys()].sort((a, b) => b - a);
  for (const year of years) {
    const ratio = observedDependency(payload, year);
    if (ratio !== null) return { year, ratio };
  }
  return null;
}

/**
 * The fuse figure, or `null` when the snapshot carries no year with both age classes — the
 * caller publishes nothing in that case, never a substitute (AC-003-18).
 */
export function computeFuse(inputs: FuseInputs): FuseValue | null {
  const threshold = inputs.threshold ?? COUNTDOWN_THRESHOLD;
  if (!(threshold > 0)) return null;
  const latest = latestObservation(inputs.observed);
  if (latest === null) return null;
  return {
    observedRatio: latest.ratio,
    observedYear: latest.year,
    threshold,
    consumedPercent: roundTo((latest.ratio / threshold) * 100, COUNTDOWN_DECIMALS),
  };
}

/** The printed percentage: whole percent, round half up, never capped (OQ-3, AC-003-15). */
export function displayPercent(consumedPercent: number): number {
  return roundTo(consumedPercent, 0);
}

/** The drawn fraction: clamped to `[0, 1]` for geometry only (AC-003-15). */
export function drawnFraction(consumedPercent: number): number {
  return Math.min(1, Math.max(0, consumedPercent / 100));
}

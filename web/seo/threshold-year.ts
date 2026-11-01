import { SERIES_DIR, findSeries, readDerivedSeries } from '../derived/series-store';
import type { CountdownValue } from '../series/countdown';

/**
 * The threshold year the static preview may carry (spec 003 T4): read from the committed
 * countdown series, never typed. `null` whenever the countdown is not `computed` with a year —
 * not crossed, unavailable or withheld — and the preview then falls back to its year-free
 * strings, with no substitute (AC-003-38).
 */
export function committedThresholdYear(seriesDir: string = SERIES_DIR): number | null {
  const entry = findSeries(readDerivedSeries(seriesDir), 'countdown');
  const value = entry?.availability === 'computed' ? (entry.value as CountdownValue | null) : null;
  return value?.state === 'computed' ? value.thresholdYear : null;
}

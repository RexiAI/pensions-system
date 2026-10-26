import { ISO_UTC_SECONDS } from '../manifest/hash';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface FreshnessResult {
  fresh: boolean;
  ageDays: number;
  reason?: string;
}

/**
 * A snapshot is current only while `fetchedAt` is inside the configured window.
 * Outside it, the harness fails the figure instead of reusing the snapshot silently.
 */
export function evaluateFreshness(
  fetchedAt: string,
  windowDays: number,
  now: Date,
): FreshnessResult {
  if (!ISO_UTC_SECONDS.test(fetchedAt)) {
    return { fresh: false, ageDays: Number.POSITIVE_INFINITY, reason: 'malformed-fetched-at' };
  }
  const fetched = Date.parse(fetchedAt);
  if (Number.isNaN(fetched)) {
    return { fresh: false, ageDays: Number.POSITIVE_INFINITY, reason: 'unparsable-fetched-at' };
  }
  const ageDays = (now.getTime() - fetched) / DAY_MS;
  if (ageDays > windowDays) {
    return { fresh: false, ageDays, reason: `snapshot ${Math.floor(ageDays)} days old` };
  }
  return { fresh: true, ageDays };
}

/**
 * The anchored clock (T20, Revision 3 §P2). A second reading of the countdown block: days,
 * hours, minutes and seconds counted to the conventional date the projection is assigned —
 * 1 January of the derived `thresholdYear`, at 00:00 Europe/Madrid (CET, a fixed `+01:00`, so
 * January carries no DST ambiguity).
 *
 * Two rules this module exists to make structural:
 *
 *  1. **The anchor is derived, never authored.** `anchorFor` assembles the ISO instant from the
 *     threshold year; there is no literal anchor date in the codebase to drift from the data.
 *  2. **No anchor, no clock.** `anchorFor(null)` is `null`, so a `not-crossed` projection has
 *     nothing to count to and the component cannot render a ticking field.
 *
 * The clock never states when the threshold is crossed. `elapsed` says only that the date has
 * passed; the projection above it continues to say whatever the data says.
 */

/** The one place the tick frequency exists (§P2 Performance: a custom property could not be read by JS). */
export const CLOCK_TICK_MS = 1000;

/** The anchor's timezone. A constant with this comment, deliberately not a layout token. */
export const CLOCK_TIME_ZONE = 'Europe/Madrid';

/** January in Madrid is CET: a fixed offset, so the ISO string needs no DST rule. */
export const CLOCK_UTC_OFFSET = '+01:00';

export const CLOCK_FIELDS = ['days', 'hours', 'minutes', 'seconds'] as const;

export type ClockField = (typeof CLOCK_FIELDS)[number];

export interface ClockReading {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** `true` once the anchor instant has passed: four zero fields and no timer. */
  elapsed: boolean;
}

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;

/**
 * The ISO instant `{thresholdYear}-01-01T00:00:00+01:00`, or `null` when there is no threshold
 * year. Changing the threshold moves the anchor, because the year is the only input.
 */
export function anchorFor(thresholdYear: number | null | undefined): string | null {
  if (thresholdYear === null || thresholdYear === undefined) return null;
  if (!Number.isInteger(thresholdYear)) return null;
  return `${String(thresholdYear).padStart(4, '0')}-01-01T00:00:00${CLOCK_UTC_OFFSET}`;
}

/** Epoch milliseconds of an anchor. Parsed once per mount, never once per tick. */
export function anchorInstant(anchor: string): number {
  return Date.parse(anchor);
}

/**
 * The four fields at an instant. `now` is epoch milliseconds. A non-positive remaining interval
 * is the `elapsed` state: every field zero, and the caller creates no timer.
 */
export function readClock(anchor: string, now: number): ClockReading {
  const remaining = Math.floor((anchorInstant(anchor) - now) / 1000);
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true };
  }
  return {
    days: Math.floor(remaining / SECONDS_PER_DAY),
    hours: Math.floor((remaining % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((remaining % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: remaining % SECONDS_PER_MINUTE,
    elapsed: false,
  };
}

/**
 * The countdown's derived schema, in field order. The countdown value is published data, so an
 * unknown field is a schema change nobody documented: `verify-derived` rejects it rather than
 * letting a stale or invented field ride along inside a verified artefact (T18, AC-001-78's
 * closed-set discipline applied to the series).
 */
export const COUNTDOWN_VALUE_FIELDS = [
  'state',
  'variant',
  'variantLabel',
  'threshold',
  'snapshotYear',
  'thresholdYear',
  'anchor',
  'years',
  'horizonEnd',
  'range',
  'variants',
  'backCast',
] as const;

/** Comments on the derived `anchor`: it carries the threshold year and nothing else. */
export function anchorProblem(thresholdYear: number | null, anchor: unknown): string | null {
  const expected = anchorFor(thresholdYear);
  if (anchor === expected) return null;
  return `anchor ${String(anchor)} does not match thresholdYear ${String(thresholdYear)}`;
}

/** A derived countdown value's field names against the documented set, in both directions. */
export function countdownSchemaProblems(value: Record<string, unknown>): string[] {
  const documented = new Set<string>(COUNTDOWN_VALUE_FIELDS);
  const problems = Object.keys(value)
    .filter((field) => !documented.has(field))
    .map((field) => `countdown: unknown field "${field}"`);
  for (const field of COUNTDOWN_VALUE_FIELDS) {
    if (!(field in value)) problems.push(`countdown: missing field "${field}"`);
  }
  return problems;
}

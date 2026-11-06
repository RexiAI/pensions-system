import { describe, expect, it } from 'vitest';
import { anchorFor, anchorInstant, readClock } from '../../web/series/clock';

/**
 * The clock's guarantees that a render assertion cannot reach: the boundary at the anchor instant,
 * an unparseable anchor, and the derived anchor's domain.
 *
 * Spec 006 T12 deletes the ticker and the client component, so the timer-branch tests that used to
 * live here are gone with them. What remains is `readClock`/`anchorFor`: the day count and the
 * share message still call them, and the numeral's value is only meaningful if the boundary is
 * exactly right.
 */
const ANCHOR = '2042-01-01T00:00:00+01:00';
const THREE_DAYS_OUT = anchorInstant(ANCHOR) - 3 * 86_400_000;

describe('AC-001-108: the anchor instant is the boundary of the count', () => {
  it('AC-001-108: reports elapsed at exactly the anchor instant, not one second later', () => {
    // `remaining <= 0` is the elapsed test, not `remaining < 0`: the last second of the count
    // is the second before the anchor, and the instant itself has passed.
    expect(readClock(ANCHOR, anchorInstant(ANCHOR))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      elapsed: true,
    });
    expect(readClock(ANCHOR, anchorInstant(ANCHOR) - 1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      elapsed: false,
    });
  });

  it('AC-001-108: never answers with NaN fields, even for an anchor that does not parse', () => {
    for (const badAnchor of ['not-an-instant', '', 'null']) {
      expect(readClock(badAnchor, anchorInstant(ANCHOR)), badAnchor).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        elapsed: true,
      });
    }
  });

  it('AC-001-108: counts whole days from the instant, at an arbitrary distance out', () => {
    expect(readClock(ANCHOR, THREE_DAYS_OUT)).toEqual({ days: 3, hours: 0, minutes: 0, seconds: 0, elapsed: false });
  });

  it('AC-001-108: pads a three-digit year to four, so the instant is always ISO-8601', () => {
    expect(anchorFor(42)).toBe('0042-01-01T00:00:00+01:00');
    expect(anchorFor(2042)).toBe(ANCHOR);
    expect(new Date(anchorFor(42) as string).toISOString()).toBe('0041-12-31T23:00:00.000Z');
  });

  it('AC-001-108: refuses a threshold year that is not an integer', () => {
    for (const notAYear of [Number.NaN, Number.POSITIVE_INFINITY, 2042.5, -1.5]) {
      expect(anchorFor(notAYear), String(notAYear)).toBeNull();
    }
    expect(anchorFor(0)).toBe('0000-01-01T00:00:00+01:00');
    expect(anchorFor(undefined)).toBeNull();
  });
});

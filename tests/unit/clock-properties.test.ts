import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { formatValue, formatYear } from '../../web/content/format';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { anchorFor, anchorInstant, readClock } from '../../web/series/clock';

/**
 * Property tests for the clock and the two formatters the countdown block prints with.
 *
 * The acceptance and unit suites pin these at hand-picked instants — exactly at the anchor, one
 * second before it, three days out. Those examples prove the shape; they cannot prove the field
 * decomposition holds at an arbitrary instant, and an off-by-one in the day/hour modulus is
 * exactly the defect that a handful of examples can walk past. The generators are constrained to
 * the clock's own valid domain (a real year, an instant inside one year of it) so a failure here
 * is a broken invariant, not an out-of-domain artefact.
 */

/** A year the deployment can carry: four digits, so `anchorFor`'s padding is not the subject. */
const year = fc.integer({ min: 1000, max: 9999 });

/** An offset from the anchor, in whole seconds, anywhere inside the year that precedes it. */
const secondsBeforeAnchor = fc.integer({ min: 1, max: 366 * 86_400 });

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86_400;

describe('the clock field decomposition (property tests)', () => {
  it('reconstitutes the remaining whole seconds from its four fields', () => {
    fc.assert(
      fc.property(year, secondsBeforeAnchor, (thresholdYear, offset) => {
        const anchor = anchorFor(thresholdYear) as string;
        const now = anchorInstant(anchor) - offset * 1000;
        const reading = readClock(anchor, now);

        expect(reading.elapsed).toBe(false);
        const rebuilt =
          reading.days * SECONDS_PER_DAY +
          reading.hours * SECONDS_PER_HOUR +
          reading.minutes * SECONDS_PER_MINUTE +
          reading.seconds;
        expect(rebuilt).toBe(offset);
      }),
      { numRuns: 300 },
    );
  });

  it('keeps every field inside its own modulus, so no field is a cascaded carry', () => {
    fc.assert(
      fc.property(year, secondsBeforeAnchor, (thresholdYear, offset) => {
        const anchor = anchorFor(thresholdYear) as string;
        const reading = readClock(anchor, anchorInstant(anchor) - offset * 1000);

        for (const [field, value] of Object.entries({
          days: reading.days,
          hours: reading.hours,
          minutes: reading.minutes,
          seconds: reading.seconds,
        })) {
          expect(Number.isInteger(value), `${field} is an integer`).toBe(true);
          expect(value, `${field} is never negative`).toBeGreaterThanOrEqual(0);
        }
        expect(reading.hours).toBeLessThan(24);
        expect(reading.minutes).toBeLessThan(60);
        expect(reading.seconds).toBeLessThan(60);
      }),
      { numRuns: 300 },
    );
  });

  it('reports elapsed, with four zero fields, at and after the anchor', () => {
    fc.assert(
      fc.property(year, fc.integer({ min: 0, max: 400 * 86_400_000 }), (thresholdYear, afterMs) => {
        const anchor = anchorFor(thresholdYear) as string;
        const reading = readClock(anchor, anchorInstant(anchor) + afterMs);

        expect(reading).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true });
      }),
      { numRuns: 100 },
    );
  });
});

describe('the derived anchor (property tests)', () => {
  it('is 1 January of its own year at 00:00 Madrid, for every year', () => {
    fc.assert(
      fc.property(year, (thresholdYear) => {
        const instant = anchorInstant(anchorFor(thresholdYear) as string);

        // Madrid in January is CET, a fixed +01:00, so the instant is 23:00Z the day before.
        expect(instant).toBe(Date.UTC(thresholdYear, 0, 1) - SECONDS_PER_HOUR * 1000);
        // The year is the only input: two calls never disagree.
        expect(anchorFor(thresholdYear)).toBe(anchorFor(thresholdYear));
      }),
      { numRuns: 200 },
    );
  });

  it('answers no anchor for any value that is not an integer year', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ min: -1e6, max: 1e6, noNaN: true }).filter((value) => !Number.isInteger(value)),
          fc.constant(Number.NaN),
          fc.constant(Number.POSITIVE_INFINITY),
          fc.constant(Number.NEGATIVE_INFINITY),
          fc.constant(null),
          fc.constant(undefined),
        ),
        (value) => {
          expect(anchorFor(value)).toBeNull();
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe('the printed numerals (property tests)', () => {
  /** The clock prints the years quantity with `integer`; nothing else may reach that numeral. */
  it('renders the years numeral as digits and separators only, in every locale', () => {
    fc.assert(
      fc.property(fc.nat({ max: 200 }), (years) => {
        for (const locale of LOCALES) {
          const numeral = formatValue(years, 'integer', locale, '');
          // No letter, so no unit: the years quantity carries no sub-annual label of its own.
          expect(numeral, `${locale}: ${numeral}`).toMatch(/^[\d.,\s\u00A0\u202F]+$/);
          expect(Number(numeral.replace(/[.,\s\u00A0\u202F]/g, ''))).toBe(years);
        }
      }),
      { numRuns: 100 },
    );
  });

  /** A year is a label, not a quantity: `Intl`'s default grouping turns 2042 into `2,042`. */
  it('never groups a calendar year, in every locale', () => {
    fc.assert(
      fc.property(year, (value) => {
        for (const locale of LOCALES) {
          expect(formatYear(value, locale as Locale), `${locale}: ${value}`).toBe(String(value));
        }
      }),
      { numRuns: 200 },
    );
  });
});

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { NumberStep } from '../../web/components/public/NumberStep';
import type { TopStep } from '../../web/components/public/top-steps';
import { TOP_STEPS } from '../../web/components/public/top-steps';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { readClock } from '../../web/series/clock';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';

/**
 * Property tests for step 1's one numeral.
 *
 * The acceptance suite pins the numeral at named instants — three days out, the committed
 * deployment's own day, the anchor itself. Those examples prove the shape; they cannot prove the
 * numeral still reads as the day count at an arbitrary instant, in an arbitrary locale. That is
 * exactly where a formatter regression hides: a locale's group separator (`5.534` in es, `5,534`
 * in en) survives a `toContain(String(days))` on a four-digit value and only shows up on a
 * five-digit one, and an off-by-one in the day modulus is invisible at "three days out".
 *
 * Both properties are stated as invariants of the rendered page, not of `readClock` — that
 * function already has its own property suite (`clock-properties.test.ts`). What is new here is the
 * step: which numeral reaches the page, and when the page carries no numeral at all.
 */

const STEP = TOP_STEPS[0] as TopStep;
const VALUE = countdownValue();
const ANCHOR = VALUE.anchor as string;
const ANCHOR_MS = Date.parse(ANCHOR);
const DAY_MS = 86_400_000;

/** Days either side of the anchor the deployment can plausibly be read at. */
const daysBefore = fc.integer({ min: 1, max: 400 * 366 });
const daysAfter = fc.integer({ min: 0, max: 400 * 366 });

function renderAt(locale: Locale, nowMs: number): string {
  return renderComponent(NumberStep, {
    step: STEP,
    content: content(locale),
    countdown: VALUE,
    nowMs,
  });
}

/** The day numeral's text, exactly as step 1 publishes it. */
function numeralOf(markup: string): string {
  return /class="clock__value[^"]*clock__value--days">([^<]*)</.exec(markup)?.[1] ?? '';
}

/** The digits of a formatted numeral, with the locale's own group separators removed. */
function digitsOf(numeral: string): string {
  return numeral.replace(/[^\d]/g, '');
}

describe('step 1’s numeral (property tests)', () => {
  it('reads as the day count of the instant, in every locale', () => {
    fc.assert(
      fc.property(daysBefore, (days) => {
        const nowMs = ANCHOR_MS - days * DAY_MS - 1000;
        const expected = readClock(ANCHOR, nowMs).days;
        expect(expected, 'the instant is before the anchor').toBeGreaterThanOrEqual(0);

        for (const locale of LOCALES) {
          const numeral = numeralOf(renderAt(locale, nowMs));
          expect(numeral, `${locale}: a numeral renders`).not.toBe('');
          // The value, not its typography: the locale's separators are stripped, so a wrong
          // separator cannot mask a wrong number and a right number cannot fail on a separator.
          expect(digitsOf(numeral), `${locale}: ${numeral}`).toBe(String(expected));
        }
      }),
      { numRuns: 30 },
    );
  });

  it('carries the instant it was computed at, and no numeral once the anchor has passed', () => {
    fc.assert(
      fc.property(daysBefore, (days) => {
        const nowMs = ANCHOR_MS - days * DAY_MS - 1000;
        const markup = renderAt('es', nowMs);
        // D16: a stale value is attributable rather than invisible.
        expect(markup).toContain(`data-rendered-at="${new Date(nowMs).toISOString()}"`);
        // And the group's unit is the visible label, so the numeral is never bare digits.
        expect(markup, 'the numeral carries its unit').toContain('clock__label');
      }),
      { numRuns: 30 },
    );

    fc.assert(
      fc.property(daysAfter, (days) => {
        const nowMs = ANCHOR_MS + days * DAY_MS;
        const markup = renderAt('es', nowMs);
        // The elapsed state renders the sentence and no numeral: zero days would be a reading,
        // not a statement (AC-001-115).
        expect(markup, 'no numeral after the anchor').not.toContain('clock__value--days');
        expect(markup, 'no number group after the anchor').not.toContain('data-rendered-at');
        expect(markup, 'the sentence still renders').toContain('step__sentence');
      }),
      { numRuns: 30 },
    );
  });
});

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LOCALES } from '../../web/content/types';

/**
 * The fold pins of specs 001-003 are retired (spec 004 T17, AC-004-77).
 *
 * Every describe this file used to carry cited a criterion the recomposition retires, and
 * asserted a geometry the page no longer has: a measured clock box, a measured field row, a
 * centred-face measure, a fifty-pixel clearance table and a frozen content-key count. They are
 * removed with the ids they carried, not silently weakened — the ids themselves no longer appear
 * anywhere under `tests/`, which is what `retired-criteria.test.ts` asserts.
 *
 * What replaces them is the assertion that the retirement happened: the constants are gone from
 * the suite, the centring measure no longer places anything, and the step heights are recorded,
 * with their measuring date, in `one-screen-per-step.test.ts` (AC-004-60…63).
 */

const CSS = readFileSync('web/styles/globals.css', 'utf8');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');

function bodyOf(path: string): string {
  return readFileSync(path, 'utf8');
}

describe('AC-004-77: the retired first-viewport geometry is gone from the suite', () => {
  it('AC-004-77: no test asserts a clock box, a field row or a clearance table', () => {
    // Written from fragments so this file does not carry the quoted constants it retires.
    for (const measurement of [['436', '52'], ['613', '28'], ['480', '91']].map((parts) => parts.join('.'))) {
      for (const file of ['tests/acceptance/clock.test.ts', 'tests/acceptance/countdown-band.test.ts']) {
        expect(bodyOf(file), `${file} must not carry ${measurement}`).not.toContain(measurement);
      }
    }
    expect(CSS).not.toContain(['const CLEARANCE', '= 50;'].join(' '));
    expect(bodyOf('tests/acceptance/clock.test.ts')).not.toContain(['CLEAR','ANCE'].join(''));
  });

  it('AC-004-77: no test asserts a fixed content-key count', () => {
    for (const file of [
      'tests/acceptance/content-locale.test.ts',
      'tests/acceptance/hero-copy.test.ts',
      'tests/acceptance/palette-labels.test.ts',
    ]) {
      expect(bodyOf(file), file).not.toMatch(/toBe\(270\)/);
      expect(bodyOf(file), file).not.toContain('EXPECTED_KEY_COUNT');
    }
  });

  it('AC-004-77: the centring measure is no longer a fold pin', () => {
    // `--measure-face` still exists as a token (T15 freezes the token values), but no rule and no
    // test uses it to place a centred face: the story is flush left on one axis.
    expect(CSS).not.toContain('var(--measure-face)');
    expect(bodyOf('tests/acceptance/clock.test.ts')).not.toContain('--measure-face');
    expect(TOKENS).toMatch(/--measure-face:\s*17\.5rem;/);
  });

  it('AC-004-77: the five locales are still the measured set', () => {
    // The heights recorded for the new composition are recorded per locale; this assertion keeps
    // the set explicit so a locale cannot drop out of the measurement unnoticed.
    expect([...LOCALES]).toEqual(['es', 'en', 'fr', 'de', 'it']);
  });
});

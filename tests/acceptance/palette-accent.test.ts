import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chroma, contrast, isHex } from '../helpers/colour';
import { listSourceFiles, readSource, stripComments } from '../helpers/source-scan';

/**
 * Spec 002's accent criteria, re-pointed by spec 006 T9.
 *
 * The chroma-against-the-old-olive clauses are retired: the accent family changed to oxblood by
 * to oxblood by decision, so a saturation delta from `#425425` is meaningless. What survives is
 * AC-002-08 — the accent's pairs on the surfaces it actually paints, and the chromatic count —
 * now asserted as **one** chromatic value rather than three (AC-006-24, AC-006-25). Everything is
 * computed from the declared hexes rather than restated beside them.
 */
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const LIGHT = TOKENS.slice(TOKENS.indexOf(':root {'), TOKENS.indexOf("[data-theme='dark']"));
const DARK = TOKENS.slice(TOKENS.indexOf("[data-theme='dark']"));

type Theme = 'light' | 'dark';

function declaration(source: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(source);
  if (!match?.[1]) throw new Error(`--${name} is not declared`);
  return match[1].trim();
}

function literal(theme: Theme, name: string): string {
  const value = declaration(theme === 'light' ? LIGHT : DARK, name);
  if (!isHex(value)) throw new Error(`--${name} (${theme}) is not a literal hex: ${value}`);
  return value.toLowerCase();
}

const AA = 4.5;
const AAA = 7;

describe('AC-002-08: the accent’s contrast pairs are recomputed and still meet their minimums', () => {
  const SURFACES = ['surface-1', 'surface-2', 'surface-3'] as const;

  it('AC-002-08: accent on every surviving ground clears 4.5:1 in both themes', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const surface of SURFACES) {
        const ratio = contrast(literal(theme, 'accent'), literal(theme, surface));
        expect(Number(ratio.toFixed(2)), `${theme} accent on ${surface}`).toBeGreaterThanOrEqual(AA);
      }
    }
  });

  it('AC-002-08: `--on-accent` on the accent clears 4.5:1, and the 7:1 design target it held', () => {
    for (const theme of ['light', 'dark'] as const) {
      const ratio = contrast(literal(theme, 'on-accent'), literal(theme, 'accent'));
      expect(ratio, `${theme} on-accent on accent`).toBeGreaterThanOrEqual(AA);
      expect(ratio, `${theme} on-accent design target`).toBeGreaterThanOrEqual(AAA);
    }
  });

  it('AC-002-08: exactly one chromatic token, not three', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(chroma(literal(theme, 'accent')), `${theme} accent`).toBeGreaterThan(20);
      for (const other of ['data-projection', 'data-deficit'] as const) {
        // Re-pointed by spec 006 T9: the amber projection and the rust deficit become neutral
        // inks; the observed/projected distinction survives by form (AC-006-27, AC-006-28).
        expect(chroma(literal(theme, other)), `${theme} --${other}`).toBeLessThanOrEqual(10);
      }
    }
  });

  it('AC-002-08: no component or series module carries a literal colour', () => {
    const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;
    for (const file of [...listSourceFiles('web/components'), ...listSourceFiles('web/series')]) {
      expect(LITERAL.test(stripComments(readSource(file))), file).toBe(false);
    }
  });
});

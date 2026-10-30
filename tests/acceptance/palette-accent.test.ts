import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chroma, contrast, hue, hueGap, isHex } from '../helpers/colour';
import { listSourceFiles, readSource, stripComments } from '../helpers/source-scan';

/**
 * T2 (spec 002): the accent's saturation is the brief's attraction lever, so it is raised without
 * moving the warm-paper identity around it. Everything here is computed from the declared hexes
 * rather than restated beside them: a palette assertion that quoted the design's table would pass
 * while `tokens.css` said something else.
 */
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const LIGHT = TOKENS.slice(TOKENS.indexOf(':root {'), TOKENS.indexOf("[data-theme='dark']"));
const DARK = TOKENS.slice(TOKENS.indexOf("[data-theme='dark']"));

type Theme = 'light' | 'dark';

/** The two accents this change replaces, and the two hue families it must stay out of. */
const PREVIOUS_ACCENT: Readonly<Record<Theme, string>> = { light: '#425425', dark: '#9cc17f' };
const COMPARABLE_ACCENTS = ['#CE261E', '#05576B', '#0061C8'] as const;
const OCHRE = '#6b520a';

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

const ACCENT_HUE_TOLERANCE = 8;
const AA = 4.5;
const DESIGN_TARGET = 7;

describe('AC-002-04: the light accent is more saturated', () => {
  it('AC-002-04: the light accent has a strictly greater CIELCh chroma than #425425', () => {
    const accent = literal('light', 'accent');
    expect(chroma(accent)).toBeGreaterThan(chroma(PREVIOUS_ACCENT.light));
    // Not a nudge: the change is only visible as the lever the brief asked for if it clears the
    // previous chroma by a real margin, and the design's band starts where the light family's
    // gamut allows it to.
    expect(chroma(accent)).toBeGreaterThan(34);
  });
});

describe('AC-002-05: the dark accent is more saturated', () => {
  it('AC-002-05: the dark accent has a strictly greater CIELCh chroma than #9cc17f', () => {
    const accent = literal('dark', 'accent');
    expect(chroma(accent)).toBeGreaterThan(chroma(PREVIOUS_ACCENT.dark));
    expect(chroma(accent)).toBeGreaterThan(42);
  });
});

describe('AC-002-06: the accent keeps the olive family', () => {
  it('AC-002-06: each theme’s hue stays within ±8° of the accent it replaces', () => {
    for (const theme of ['light', 'dark'] as const) {
      const accent = literal(theme, 'accent');
      const drift = hueGap(hue(accent), hue(PREVIOUS_ACCENT[theme]));
      expect(drift, `${theme}: hue drifted ${drift.toFixed(2)}°`).toBeLessThanOrEqual(
        ACCENT_HUE_TOLERANCE,
      );
    }
  });

  it('AC-002-06: the accent’s hue gap from the ochre projection stays wider than 20°', () => {
    // The reason ±8° is the band: AC-001-117 needs a gap above 20° from `--data-projection`, and
    // a drift past about 17° toward the ochre would close it. The gap is measured, not assumed.
    for (const theme of ['light', 'dark'] as const) {
      const ochre = literal(theme, 'data-projection');
      const gap = hueGap(hue(literal(theme, 'accent')), hue(ochre));
      expect(gap, `${theme}: ${gap.toFixed(2)}° from the projection`).toBeGreaterThan(20);
    }
    // The light accent sits ~37° from the ochre and the dark one ~37°: the design's own reading.
    expect(hueGap(hue(PREVIOUS_ACCENT.light), hue(OCHRE))).toBeGreaterThan(20);
  });

  it('AC-002-06: the accent is not red, teal or blue', () => {
    for (const theme of ['light', 'dark'] as const) {
      const accentHue = hue(literal(theme, 'accent'));
      for (const comparable of COMPARABLE_ACCENTS) {
        const distance = hueGap(accentHue, hue(comparable));
        expect(distance, `${theme}: ${comparable} is ${distance.toFixed(2)}° away`).toBeGreaterThan(20);
      }
    }
  });
});

describe('AC-002-07: warm paper, radius and shadow are unchanged', () => {
  /** The Revision 4 grounds and ink ladder, exactly as they shipped: this task moves one token. */
  const UNCHANGED: Readonly<Record<Theme, Readonly<Record<string, string>>>> = {
    light: {
      'surface-1': '#fdf2e1',
      'surface-2': '#f6ead7',
      'surface-3': '#f0e1c9',
      'surface-hero': '#fee8d0',
      'ink-1': '#1e160d',
      'ink-2': '#47392a',
      'ink-3': '#645341',
      'rule-1': '#d6c8b7',
      'rule-2': '#b9a892',
      'data-projection': '#6b520a',
      'data-deficit': '#96472a',
    },
    dark: {
      'surface-1': '#17110b',
      'surface-2': '#1f1810',
      'surface-3': '#292117',
      'surface-hero': '#201406',
      'ink-1': '#f5eddf',
      'ink-2': '#cbbead',
      'ink-3': '#a09180',
      'rule-1': '#312a22',
      'rule-2': '#473e34',
      'data-projection': '#d8bf60',
      'data-deficit': '#d08a63',
    },
  };

  it('AC-002-07: every ground, ink and rule literal is exactly what it was', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const [name, value] of Object.entries(UNCHANGED[theme])) {
        expect(literal(theme, name), `${theme} --${name}`).toBe(value);
      }
    }
  });

  it('AC-002-07: no white ground is introduced, and radius and shadow do not move', () => {
    expect(TOKENS.toLowerCase()).not.toContain('#ffffff');
    expect(declaration(LIGHT, 'radius')).toBe('0');
    expect(declaration(LIGHT, 'shadow')).toBe('none');
    for (const theme of ['light', 'dark'] as const) {
      for (const ground of ['surface-1', 'surface-2', 'surface-3', 'surface-hero'] as const) {
        expect(literal(theme, ground), `${theme} --${ground} is white`).not.toBe('#ffffff');
      }
    }
  });
});

describe('AC-002-08: the accent’s contrast pairs are recomputed and still meet their minimums', () => {
  const SURFACES = ['surface-1', 'surface-2', 'surface-3', 'surface-hero'] as const;

  it('AC-002-08: accent on every ground clears 4.5:1 in both themes', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const surface of SURFACES) {
        const ratio = contrast(literal(theme, 'accent'), literal(theme, surface));
        expect(Number(ratio.toFixed(2)), `${theme} accent on ${surface}`).toBeGreaterThanOrEqual(AA);
      }
    }
  });

  it('AC-002-08: `--on-accent` on the accent clears 4.5:1, and the design target it held', () => {
    for (const theme of ['light', 'dark'] as const) {
      const ratio = contrast(literal(theme, 'on-accent'), literal(theme, 'accent'));
      expect(ratio, `${theme} on-accent on accent`).toBeGreaterThanOrEqual(AA);
      // The design verified `--on-accent` against the new accent rather than changing it: it
      // holds at 7.60 / 9.20, so the token keeps its value. A rise in chroma that spent that
      // headroom would be a regression even at the floor.
      const target = theme === 'light' ? DESIGN_TARGET : 9;
      expect(ratio, `${theme} on-accent design target`).toBeGreaterThanOrEqual(target);
    }
    // Unchanged: the pair is verified, not recomputed to a different value.
    expect(literal('light', 'on-accent')).toBe('#fdf2e1');
    expect(literal('dark', 'on-accent')).toBe('#17110b');
  });

  it('AC-002-08: exactly three chromatic hues, each more than 20° from the accent', () => {
    for (const theme of ['light', 'dark'] as const) {
      const chromatic = ['accent', 'data-projection', 'data-deficit'].map((name) => ({
        name,
        chroma: chroma(literal(theme, name)),
      }));
      for (const entry of chromatic) {
        expect(entry.chroma, `${theme} --${entry.name} must stay chromatic`).toBeGreaterThan(20);
      }
      for (const other of ['data-projection', 'data-deficit'] as const) {
        const gap = hueGap(hue(literal(theme, 'accent')), hue(literal(theme, other)));
        expect(gap, `${theme} accent vs ${other}`).toBeGreaterThan(20);
      }
    }
  });

  it('AC-002-08: no component or series module carries a literal colour', () => {
    const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;
    for (const file of [...listSourceFiles('web/components'), ...listSourceFiles('web/series')]) {
      expect(LITERAL.test(stripComments(readSource(file))), file).toBe(false);
    }
  });

  it('AC-002-08: the accent propagates through its aliases, not through a second literal', () => {
    // `--chart-series-1`, `--chart-observed` and `--focus` alias the accent from `:root`, and the
    // dark block does not re-declare them: the chroma rise reaches them without a second hex.
    for (const alias of ['chart-series-1', 'chart-observed'] as const) {
      expect(declaration(LIGHT, alias), `--${alias}`).toBe('var(--accent)');
      expect(DARK, `--${alias} must not be re-declared in the dark block`).not.toContain(`--${alias}:`);
    }
    expect(declaration(LIGHT, 'focus')).toBe('2px solid var(--accent)');
  });
});

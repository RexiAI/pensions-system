import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chroma, contrast, lab } from '../helpers/colour';
import { listSourceFiles, readSource, stripComments } from '../helpers/source-scan';

/**
 * The palette, checked against the token file and the stylesheet as shipped.
 *
 * Everything here is computed from the declared values rather than restated beside them: the
 * contrast ratios are WCAG 2.1 relative-luminance arithmetic over the hexes in `tokens.css`, and
 * the chromatic count is CIELCh over the same values. A palette assertion that quoted the design's
 * table instead of recomputing it would pass while the file said something else.
 *
 * Re-pointed by spec 006 T9: the pair table is the new neutral palette's, the hero ground is
 * retired, and the chromatic count is one value rather than three (AC-001-117, AC-006-24…26).
 */
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const CSS = readFileSync('web/styles/globals.css', 'utf8');
/** The stylesheet without comments: a rule's selector must not absorb the prose above it. */
const CODE = stripComments(CSS);

const LIGHT = TOKENS.slice(TOKENS.indexOf(':root {'), TOKENS.indexOf("[data-theme='dark']"));
const DARK = TOKENS.slice(TOKENS.indexOf("[data-theme='dark']"));

type Theme = 'light' | 'dark';

function block(theme: Theme): string {
  return theme === 'light' ? LIGHT : DARK;
}

function declaration(source: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(source);
  if (!match?.[1]) throw new Error(`--${name} is not declared`);
  return match[1].trim();
}

/** A token's literal hex. A token that is an alias (`var(...)`) is resolved by the caller's name choice. */
function hex(theme: Theme, name: string): string {
  const value = declaration(block(theme), name);
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`--${name} is not a literal hex: ${value}`);
  return value.toLowerCase();
}

function channels(value: string): number[] {
  return [1, 3, 5].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

/** `color-mix(in srgb, a weight%, b)`, for opaque colours: a weighted sRGB average. */
function mix(a: string, b: string, weight: number): string {
  const front = channels(a);
  const back = channels(b);
  return `#${front
    .map((value, index) => Math.round(value * weight + (back[index] as number) * (1 - weight)))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** The public palette's tokens: everything a reader's page can paint. */
const PUBLIC_TOKENS = [
  'surface-1',
  'surface-2',
  'surface-3',
  'ink-1',
  'ink-2',
  'ink-3',
  'rule-1',
  'rule-2',
  'accent',
  'on-accent',
  'data-deficit',
  'data-projection',
  'chart-series-2',
] as const;

/** Non-text graphics need 3:1; text needs 4.5:1; AAA statements need 7:1. */
const NON_TEXT = 3;
const AA = 4.5;
const AAA = 7;

interface Pair {
  foreground: string;
  ground: string;
  minimum: number;
}

/**
 * Spec 006 T9's pair table, every row that is a real pair on the page. The hero panel's rows are
 * gone with the ground they were measured against; the three surfaces carry the same four inks,
 * the accent and its label, and the non-text series strokes.
 */
const PAIRS: readonly Pair[] = [
  { foreground: 'ink-1', ground: 'surface-1', minimum: AAA },
  { foreground: 'ink-1', ground: 'surface-2', minimum: AAA },
  { foreground: 'ink-1', ground: 'surface-3', minimum: AAA },
  { foreground: 'ink-2', ground: 'surface-1', minimum: AA },
  { foreground: 'ink-2', ground: 'surface-2', minimum: AA },
  { foreground: 'ink-2', ground: 'surface-3', minimum: AA },
  { foreground: 'ink-3', ground: 'surface-1', minimum: AA },
  { foreground: 'ink-3', ground: 'surface-2', minimum: AA },
  { foreground: 'ink-3', ground: 'surface-3', minimum: AA },
  { foreground: 'accent', ground: 'surface-1', minimum: AA },
  { foreground: 'accent', ground: 'surface-2', minimum: AA },
  { foreground: 'accent', ground: 'surface-3', minimum: AA },
  { foreground: 'on-accent', ground: 'accent', minimum: AAA },
  { foreground: 'on-accent', ground: 'ink-1', minimum: AAA },
  // Non-text series strokes: `data-deficit` is a neutral ink, `data-projection` likewise.
  { foreground: 'data-deficit', ground: 'surface-1', minimum: NON_TEXT },
  { foreground: 'data-projection', ground: 'surface-1', minimum: NON_TEXT },
  { foreground: 'chart-series-2', ground: 'surface-1', minimum: NON_TEXT },
  { foreground: 'chart-series-2', ground: 'surface-2', minimum: NON_TEXT },
  { foreground: 'chart-series-2', ground: 'surface-3', minimum: NON_TEXT },
];

/** The projection ground is a `color-mix`, so its pairs are computed from the mix, not quoted. */
function projectionGround(theme: Theme): string {
  return mix(hex(theme, 'data-projection'), hex(theme, 'surface-1'), 0.12);
}

describe('AC-001-117: the palette meets its contrast minimums', () => {
  it('AC-001-117: every pair meets its stated minimum in both themes', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const pair of PAIRS) {
        const ratio = contrast(hex(theme, pair.foreground), hex(theme, pair.ground));
        expect(
          Number(ratio.toFixed(2)),
          `${theme} ${pair.foreground} on ${pair.ground} = ${ratio.toFixed(2)}`,
        ).toBeGreaterThanOrEqual(pair.minimum);
      }
    }
  });

  it('AC-001-117: the projection ground is neutral and carries its ink pairs', () => {
    for (const theme of ['light', 'dark'] as const) {
      const ground = projectionGround(theme);
      expect(chroma(ground), `${theme} projection ground`).toBeLessThanOrEqual(10);
      expect(contrast(hex(theme, 'data-projection'), ground), `${theme} projection`).toBeGreaterThanOrEqual(NON_TEXT);
      expect(contrast(hex(theme, 'ink-1'), ground), `${theme} ink-1`).toBeGreaterThanOrEqual(AAA);
      expect(contrast(hex(theme, 'ink-2'), ground), `${theme} ink-2`).toBeGreaterThanOrEqual(AA);
      expect(contrast(hex(theme, 'ink-3'), ground), `${theme} ink-3`).toBeGreaterThanOrEqual(AA);
    }
  });

  it('AC-001-117: the two decorative rules stay below 3:1, so neither can carry a value', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const rule of ['rule-1', 'rule-2'] as const) {
        expect(contrast(hex(theme, rule), hex(theme, 'surface-1')), `${theme} ${rule}`).toBeLessThan(NON_TEXT);
      }
    }
  });

  it('AC-001-117: exactly one chromatic value, the accent, and every neutral is at most 10', () => {
    for (const theme of ['light', 'dark'] as const) {
      const values = PUBLIC_TOKENS.map((name) => ({ name, chroma: chroma(hex(theme, name)) }));
      const chromatic = values.filter((entry) => entry.chroma > 20).map((entry) => entry.name);
      expect(chromatic, theme).toEqual(['accent']);
      for (const entry of values.filter((value) => value.name !== 'accent')) {
        expect(entry.chroma, `${theme} ${entry.name}`).toBeLessThanOrEqual(10);
      }
      // The 10/20 band is forbidden: a token at chroma 15 is the peach defect in a new hue.
      for (const entry of values.filter((value) => value.name !== 'accent')) {
        expect(entry.chroma > 10, `${theme} ${entry.name} in the forbidden band`).toBe(false);
      }
    }
  });

  it('AC-001-117: the deficit series is a neutral ink, and no retired value survives', () => {
    for (const theme of ['light', 'dark'] as const) {
      expect(chroma(hex(theme, 'data-deficit')), `${theme} --data-deficit`).toBeLessThanOrEqual(10);
    }
    // Spec 006 T9's retired palette, plus Revision 4's before it. An edit that reintroduces one of
    // these has reverted the palette a step, which is the silent-drift failure this list stops.
    const RETIRED = [
      '#141a1b', '#f4f5f2', '#384446', '#5a6769', '#17564a', '#6a5a12', '#6e7a79', '#e4e7df',
      '#eceee8', '#c9cfc7', '#f5efe2', '#eee7d7', '#e7decb', '#1b1610', '#443b2f', '#5f5544',
      '#d3c9b6', '#b5a992', '#0e5c3c', '#6b6759', '#15110d', '#1d1813', '#27211a', '#f2ede1',
      '#c6bdae', '#9b9182', '#63c398', '#a8a292',
      // spec 006 T9: the peach, the olive accent, the amber projection, the rust deficit.
      '#fdf2e1', '#f6ead7', '#f0e1c9', '#fee8d0', '#1e160d', '#47392a', '#645341', '#d6c8b7',
      '#b9a892', '#3b5512', '#96472a', '#6b520a', '#6f6658',
      '#17110b', '#1f1810', '#292117', '#201406', '#f5eddf', '#cbbead', '#a09180', '#312a22',
      '#473e34', '#91c46d', '#d08a63', '#d8bf60', '#aba192',
    ];
    for (const file of listSourceFiles('web')) {
      const source = readSource(file).toLowerCase();
      for (const retired of RETIRED) {
        expect(source.includes(retired), `${file} still carries ${retired}`).toBe(false);
      }
    }
    // The generated mark reads its colours from the tokens, so it moved with them.
    expect(readSource('web/brand/generated.ts')).toContain(hex('light', 'ink-1'));
    expect(readSource('web/brand/generated.ts')).toContain(hex('light', 'surface-1'));
  });

  it('AC-001-117: the admin state colours still pass AA on the new grounds', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const state of ['state-pending', 'state-danger'] as const) {
        for (const ground of ['surface-1', 'surface-2', 'surface-3'] as const) {
          const ratio = contrast(hex(theme, state), hex(theme, ground));
          expect(Number(ratio.toFixed(2)), `${theme} ${state} on ${ground}`).toBeGreaterThanOrEqual(AA);
        }
      }
    }
  });

  it('AC-001-117: the neutral ramp keeps a visible L* step between grounds', () => {
    const steps = (theme: Theme): number[] => {
      const [one, two, three] = ['surface-1', 'surface-2', 'surface-3'].map((name) => lab(hex(theme, name)).lightness);
      return [Math.abs((one as number) - (two as number)), Math.abs((two as number) - (three as number))];
    };
    for (const theme of ['light', 'dark'] as const) {
      for (const [index, step] of steps(theme).entries()) {
        expect(step, `${theme} step ${index + 1}`).toBeGreaterThan(2);
      }
    }
  });

  it('AC-001-117: no component or series module carries a literal colour', () => {
    // §P1 watch item 1: after the swap, a component painting an inherited cool stroke would
    // read as dirty rather than contrasty. Every colour on the page resolves a token.
    const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;
    for (const file of [...listSourceFiles('web/components'), ...listSourceFiles('web/series')]) {
      expect(LITERAL.test(stripComments(readSource(file))), file).toBe(false);
    }
  });
});

/** Selectors whose role is a label, an eyebrow, a chip word, a state word, a caption, the scope
 *  mark or a provenance label: Revision 3 §P3 F2 forbids `--font-mono` on every one of them. */
const LABEL_SELECTORS = [
  '.step__label',
  '.plate__label',
  '.register__label',
  '.figure-row__chip',
  '.citation__chip',
  '.data-table caption',
  '.scope',
  '.provenance__field dt',
  '.provenance__detail dt',
  '.readout__item dt',
  '.hero__subject-field dt',
  '.demography__readout-item dt',
  '.demography__panel-head',
  '.figure-row__definition-label',
  '.plate__definition-label',
  '.plate__limit-label',
  '.countdown__eyebrow',
  '.countdown__year-label',
  '.countdown__source',
  '.clock__label',
  '.clock__anchor-label',
  '.clock__arithmetic',
  '.index-panel__theme legend',
] as const;

/** Selectors whose role is a numeral, an identifier, a command, a numeric cell, a locale code or
 *  the Reproduce block: Revision 3 §P3 F2 permits `--font-mono` on exactly these. */
const MONO_SELECTORS = [
  '.site-header__iso',
  '.site-header__stamp',
  '.index-panel__stamp',
  '.locale-group__cell',
  '.readout__item dd',
  '.plate__assumptions',
  '.chart__tick',
  '.chart__row-label',
  '.chart__ref-label',
  '.chart__value',
  '.data-table td',
  '.provenance__detail',
  '.reproduce__row',
  '.reproduce__count',
  '.footer__locales',
  '.countdown__numeral',
  '.countdown__year',
  '.demography__readout',
  '.demography__tick',
  '.demography__age',
  '.demography__panel-year',
  '.clock__value',
] as const;

/** The admin surface keeps its own dialect (settled by instruction, re-verified for contrast only). */
const ADMIN_PREFIXES = ['.operator-bar', '.admin-', '.status-chip', '.config-closed'];

interface CssRule {
  selectors: string[];
  body: string;
}

/** Every innermost rule that declares a font family, with its selector list split. */
function fontRules(): CssRule[] {
  const rules: CssRule[] = [];
  for (const match of CODE.matchAll(/([^{}]+)\{([^{}]*font-family:[^{}]*)\}/g)) {
    const selectors = (match[1] ?? '')
      .split(',')
      .map((selector) => selector.trim().replace(/\s+/g, ' '))
      .filter((selector) => selector.startsWith('.') || selector.startsWith(':'));
    if (selectors.length > 0) rules.push({ selectors, body: match[2] ?? '' });
  }
  return rules;
}

function resolves(rules: readonly CssRule[], selector: string): string | null {
  const rule = rules.filter((candidate) => candidate.selectors.includes(selector)).at(-1);
  const family = rule ? /font-family:\s*var\(--([a-z-]+)\)/.exec(rule.body) : null;
  return family?.[1] ?? null;
}

describe('AC-001-118: labels are not measurements', () => {
  const rules = fontRules();

  it('AC-001-118: every label role resolves --font-label, never --font-mono', () => {
    for (const selector of LABEL_SELECTORS) {
      expect(resolves(rules, selector), `${selector} must resolve --font-label`).toBe('font-label');
    }
    // The one new font token is the sans stack: a wide-tracked sans is not a second form.
    expect(declaration(LIGHT, 'font-label')).toBe('var(--font-sans)');
  });

  it('AC-001-118: every numeral, identifier, command and locale code still resolves --font-mono', () => {
    for (const selector of MONO_SELECTORS) {
      expect(resolves(rules, selector), `${selector} must resolve --font-mono`).toBe('font-mono');
    }
    // A table cell is a number and a label is a word: the caption moved, the cell did not.
    expect(resolves(rules, '.data-table td')).toBe('font-mono');
    expect(resolves(rules, '.data-table caption')).toBe('font-label');
  });

  it('AC-001-118: no selector outside the permitted measurement roles uses mono at all', () => {
    const monoSelectors = new Set<string>();
    for (const rule of rules) {
      if (!rule.body.includes('var(--font-mono)')) continue;
      for (const selector of rule.selectors) monoSelectors.add(selector);
    }
    const offenders = [...monoSelectors].filter(
      (selector) =>
        !(MONO_SELECTORS as readonly string[]).includes(selector) &&
        !ADMIN_PREFIXES.some((prefix) => selector.startsWith(prefix)),
    );
    expect(offenders).toEqual([]);
  });

  it('AC-001-118: no label role is rendered in tracked-out caps at 12px', () => {
    // F2: 0.06em tracking at 12px is the form-label signature; the token falls to 0.02em.
    expect(declaration(LIGHT, 'tracking-label')).toBe('0.02em');
  });

  it('AC-001-118: the four non-colour surfaces of P3 F3 and F5 are migrated', () => {
    // F3: step 1 no longer claims a ground (spec 006 T8), and it gains no border in its place.
    const step = CSS.slice(CSS.indexOf('.step--number {'), CSS.indexOf('.step__label {'));
    expect(step).not.toContain('border-top');
    expect(step).not.toContain('var(--surface-hero)');
    expect(step).not.toContain('var(--surface-2)');
    // F5: the ledger rows drop their rule and separate by space; the name rises a step.
    const row = CSS.slice(CSS.indexOf('.figure-row {'), CSS.indexOf('.figure-row__head {'));
    expect(row).not.toContain('border-top');
    expect(row).toContain('var(--figure-state-row-min)');
    expect(row).toContain('var(--space-5)');
    expect(CSS).toMatch(/\.figure-row__title\s*\{[^}]*font-size:\s*var\(--text-body-lg\)/s);
    // F4: the display scale rises, and nothing else shrinks to make room for it.
    expect(declaration(LIGHT, 'text-display')).toBe('clamp(2.5rem, 4.9vw, 4rem)');
    expect(declaration(LIGHT, 'text-h2')).toBe('clamp(1.625rem, 2.4vw, 2.375rem)');
    expect(declaration(LIGHT, 'text-plate')).toBe('clamp(1.1875rem, 1.55vw, 1.5rem)');
    expect(declaration(LIGHT, 'text-body-lg')).toBe('1.1875rem');
    expect(declaration(LIGHT, 'measure')).toBe('64ch');
  });
});

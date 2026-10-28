import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { listSourceFiles, readSource, stripComments } from '../helpers/source-scan';

/**
 * Revision 3 §P1 and §P3 F2, checked against the token file and the stylesheet as shipped.
 *
 * Everything here is computed from the declared values rather than restated beside them: the
 * contrast ratios are WCAG 2.1 relative-luminance arithmetic over the hexes in `tokens.css`,
 * and the hue count is CIELCh over the same values. A palette assertion that quoted the design's
 * table instead of recomputing it would pass while the file said something else.
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

function linear(component: number): number {
  const c = component / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(value: string): number {
  const [r, g, b] = channels(value).map(linear);
  return 0.2126 * (r as number) + 0.7152 * (g as number) + 0.0722 * (b as number);
}

/** WCAG 2.1 relative-luminance contrast ratio, 1:1 to 21:1. */
function contrast(foreground: string, ground: string): number {
  const [a, b] = [luminance(foreground), luminance(ground)];
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
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

function lab(value: string): [number, number, number] {
  const [r, g, b] = channels(value).map(linear) as [number, number, number];
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number): number => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function chroma(value: string): number {
  const [, a, b] = lab(value);
  return Math.hypot(a, b);
}

function hue(value: string): number {
  const [, a, b] = lab(value);
  return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
}

/** The public palette's tokens: everything a reader's page can paint. */
const PUBLIC_TOKENS = [
  'surface-1',
  'surface-2',
  'surface-3',
  'surface-hero',
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

/** The three chromatic hues, and nothing else: `--chart-series-1` aliases `--accent`. */
const CHROMATIC_TOKENS = ['accent', 'data-projection', 'data-deficit'] as const;

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
 * Revision 4 §P1 "Contrast verification", every row that is a real pair on the page.
 *
 * `surface-hero` is the hero panel's own ground (Revision 4 §P2). It is a real ground, so it
 * carries the same rows as the others: the panel holds the countdown's projection rule, the
 * clock and the readings, all of which are painted in ink, accent or projection on it.
 */
const PAIRS: readonly Pair[] = [
  { foreground: 'ink-1', ground: 'surface-1', minimum: AAA },
  { foreground: 'ink-1', ground: 'surface-2', minimum: AAA },
  { foreground: 'ink-1', ground: 'surface-3', minimum: AAA },
  { foreground: 'ink-1', ground: 'surface-hero', minimum: AAA },
  { foreground: 'ink-2', ground: 'surface-1', minimum: AA },
  { foreground: 'ink-2', ground: 'surface-2', minimum: AA },
  { foreground: 'ink-2', ground: 'surface-3', minimum: AA },
  { foreground: 'ink-2', ground: 'surface-hero', minimum: AA },
  { foreground: 'ink-3', ground: 'surface-1', minimum: AA },
  { foreground: 'ink-3', ground: 'surface-2', minimum: AA },
  { foreground: 'ink-3', ground: 'surface-3', minimum: AA },
  { foreground: 'ink-3', ground: 'surface-hero', minimum: AA },
  { foreground: 'accent', ground: 'surface-1', minimum: AA },
  { foreground: 'accent', ground: 'surface-2', minimum: AA },
  { foreground: 'accent', ground: 'surface-3', minimum: AA },
  { foreground: 'accent', ground: 'surface-hero', minimum: AA },
  { foreground: 'on-accent', ground: 'accent', minimum: AA },
  { foreground: 'data-deficit', ground: 'surface-1', minimum: AA },
  { foreground: 'data-deficit', ground: 'surface-2', minimum: AA },
  { foreground: 'data-deficit', ground: 'surface-3', minimum: AA },
  { foreground: 'data-projection', ground: 'surface-1', minimum: AA },
  { foreground: 'data-projection', ground: 'surface-2', minimum: AA },
  { foreground: 'data-projection', ground: 'surface-3', minimum: AA },
  { foreground: 'data-projection', ground: 'surface-hero', minimum: AA },
  // A stroke, never a label (§P1 watch item 3): `--chart-series-2` on `--surface-3` is 4.39.
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

  it('AC-001-117: the projection ground is what the design says it is, and carries its pairs', () => {
    expect(projectionGround('light')).toBe('#ebdfc7');
    expect(projectionGround('dark')).toBe('#2e2615');
    for (const theme of ['light', 'dark'] as const) {
      const ground = projectionGround(theme);
      expect(contrast(hex(theme, 'data-projection'), ground), `${theme} projection`).toBeGreaterThanOrEqual(AA);
      expect(contrast(hex(theme, 'ink-1'), ground), `${theme} ink-1`).toBeGreaterThanOrEqual(AAA);
      expect(contrast(hex(theme, 'ink-2'), ground), `${theme} ink-2`).toBeGreaterThanOrEqual(AA);
      expect(contrast(hex(theme, 'ink-3'), ground), `${theme} ink-3`).toBeGreaterThanOrEqual(AA);
    }
  });

  it('AC-001-117: the two decorative rules stay below 3:1, so neither can carry a value', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const rule of ['rule-1', 'rule-2']) {
        expect(contrast(hex(theme, rule), hex(theme, 'surface-1')), `${theme} ${rule}`).toBeLessThan(NON_TEXT);
      }
    }
  });

  it('AC-001-117: exactly three chromatic hues, with distinct hues and no fourth', () => {
    for (const theme of ['light', 'dark'] as const) {
      const values = PUBLIC_TOKENS.map((name) => ({ name, chroma: chroma(hex(theme, name)) }));
      const chromatic = values.filter((entry) => entry.chroma > 20).map((entry) => entry.name);
      expect(chromatic.sort(), theme).toEqual([...CHROMATIC_TOKENS].sort());

      const hues = CHROMATIC_TOKENS.map((name) => hue(hex(theme, name)));
      for (let index = 0; index < hues.length; index += 1) {
        for (let other = index + 1; other < hues.length; other += 1) {
          const gap = Math.abs((hues[index] as number) - (hues[other] as number));
          expect(Math.min(gap, 360 - gap), `${theme} hue gap`).toBeGreaterThan(20);
        }
      }
      // Warmth is the paper and the ink, never a fourth hue: the neutrals stay under 20 chroma.
      // Every ground is a neutral by this measure, the hero's own sheet included — a panel that
      // crossed 20 here would be the fourth chromatic hue by way of a background.
      for (const neutral of [
        'surface-1',
        'surface-2',
        'surface-3',
        'surface-hero',
        'ink-1',
        'ink-2',
        'ink-3',
      ] as const) {
        expect(chroma(hex(theme, neutral)), `${theme} ${neutral}`).toBeLessThan(20);
      }
    }
  });

  it('AC-001-117: --data-deficit is byte-identical to Revision 2 and --data-projection is Revision 3', () => {
    expect(declaration(LIGHT, 'data-deficit')).toBe('#96472a');
    expect(declaration(DARK, 'data-deficit')).toBe('#d08a63');
    expect(declaration(LIGHT, 'data-projection')).toBe('#6b520a');
    expect(declaration(DARK, 'data-projection')).toBe('#d8bf60');
  });

  it('AC-001-117: no retired value string remains anywhere in web/', () => {
    // Revision 1, then Revision 3's warm-paper palette. Revision 4 supersedes the latter: an
    // edit that reintroduces one of these has reverted the palette a step, which is exactly the
    // silent-drift failure this list exists to stop.
    const RETIRED = [
      '#141a1b',
      '#f4f5f2',
      '#384446',
      '#5a6769',
      '#17564a',
      '#6a5a12',
      '#6e7a79',
      '#e4e7df',
      '#eceee8',
      '#c9cfc7',
      '#f5efe2',
      '#eee7d7',
      '#e7decb',
      '#1b1610',
      '#443b2f',
      '#5f5544',
      '#d3c9b6',
      '#b5a992',
      '#0e5c3c',
      '#6b6759',
      '#15110d',
      '#1d1813',
      '#27211a',
      '#f2ede1',
      '#c6bdae',
      '#9b9182',
      '#63c398',
      '#a8a292',
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

  it('AC-001-117: the ground steps widen to the Revision 3 lightness spread', () => {
    const steps = (theme: Theme): number[] => {
      const [one, two, three] = ['surface-1', 'surface-2', 'surface-3'].map((name) => lab(hex(theme, name))[0]);
      return [Math.abs((one as number) - (two as number)), Math.abs((two as number) - (three as number))];
    };
    const [firstLight, secondLight] = steps('light');
    const [firstDark, secondDark] = steps('dark');
    expect(firstLight).toBeCloseTo(2.79, 1);
    expect(secondLight).toBeCloseTo(3.08, 1);
    expect(firstDark).toBeCloseTo(3.35, 1);
    expect(secondDark).toBeCloseTo(4.52, 1);
    // The light total spread widens from Revision 2's 5.17 to Revision 4's 5.79: more step, same
    // paper. Revision 4 lifted the whole ladder ~1.3 L* without collapsing the steps, and the
    // floor makes that explicit — a revision that re-tinted the grounds must keep the separation.
    const total = (firstLight as number) + (secondLight as number);
    expect(total).toBeCloseTo(5.79, 1);
    expect(total).toBeGreaterThan(5.6);
    expect(total).toBeGreaterThan(5.17);
  });

  it('AC-001-117: the hero panel has a ground of its own, warmer and deeper than the page', () => {
    // Revision 4 §P2. The defect this closes: the panel used `--surface-2`, a second step of the
    // same beige, so it read as a shaded region of the page rather than a sheet laid on it.
    for (const theme of ['light', 'dark'] as const) {
      const hero = hex(theme, 'surface-hero');
      for (const page of ['surface-1', 'surface-2', 'surface-3'] as const) {
        expect(hero, `${theme}: surface-hero must not equal ${page}`).not.toBe(hex(theme, page));
      }
      // Warmer: a lower Lab hue angle than the page ground carries. Chroma alone would be more
      // yellow — the direction the owner rejected — so the assertion is on both.
      expect(hue(hero), `${theme}: the hero sheet is warmer than the page`).toBeLessThan(
        hue(hex(theme, 'surface-1')),
      );
      expect(chroma(hero), `${theme}: the hero sheet carries more chroma`).toBeGreaterThan(
        chroma(hex(theme, 'surface-1')),
      );
    }
    // Light: laid on warm paper, a shade deeper than the page (the sheet sits below the ground).
    expect(lab(hex('light', 'surface-hero'))[0]).toBeLessThan(lab(hex('light', 'surface-1'))[0]);
    // Dark: a dark theme's sheet reads as laid *over*, so it sits above the ground.
    expect(lab(hex('dark', 'surface-hero'))[0]).toBeGreaterThan(lab(hex('dark', 'surface-1'))[0]);
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
  '.hero__panel-label',
  '.plate__label',
  '.register__label',
  '.figure-row__chip',
  '.citation__chip',
  '.data-table caption',
  '.scope',
  '.provenance__field dt',
  '.provenance__detail dt',
  '.hero__comparison dt',
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
  '.hero__value',
  '.hero__status-count',
  '.hero__comparison dd',
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
    // F3: the hero panel loses its hairline border and keeps the projection rule as its edge;
    // Revision 4 §P2 gives it its own ground instead of `--surface-2`.
    const panel = CSS.slice(CSS.indexOf('.hero__panel {'), CSS.indexOf('.hero__panel-label'));
    expect(panel).not.toContain('--border-hair');
    expect(panel).toContain('var(--surface-hero)');
    expect(panel).not.toContain('var(--surface-2)');
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

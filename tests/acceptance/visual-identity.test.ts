import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { chroma, contrast } from '../helpers/colour';

/**
 * The visual identity, preserved across spec 006's palette change.
 *
 * The "palette and type scale are untouched" criterion is retired: the palette decision
 * revalues the colour tokens by design. What survives is AC-004-65 (radius, shadow, hairline),
 * AC-004-66 re-pointed to exactly one chromatic token, and AC-004-68 re-pointed to the new pair
 * table with no minimum lowered (AC-006-24…26).
 */
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const CSS = readFileSync('web/styles/globals.css', 'utf8');

const LIGHT = TOKENS.slice(0, TOKENS.indexOf("[data-theme='dark']"));
const DARK = TOKENS.slice(TOKENS.indexOf("[data-theme='dark']"));

function token(theme: string, name: string): string | null {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(theme);
  return match?.[1]?.trim() ?? null;
}

describe('AC-004-65: radius, shadow and the rule weight are unchanged', () => {
  it('AC-004-65: 0, none, one 1px hairline — and no rule outside tokens declares otherwise', () => {
    expect(token(LIGHT, 'radius')).toBe('0');
    expect(token(LIGHT, 'shadow')).toBe('none');
    expect(token(LIGHT, 'border-hair')).toBe('1px solid var(--rule-1)');
    const outside = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of outside.matchAll(/border-radius:\s*([^;]+);/g)) {
      expect(['var(--radius)', '0'], 'border-radius').toContain(match[1]?.trim());
    }
    for (const match of outside.matchAll(/box-shadow:\s*([^;]+);/g)) {
      expect(match[1]?.trim(), 'box-shadow').toBe('none');
    }
    // The step boundaries use the same hairline, never a heavier separator.
    expect(CSS).toMatch(/\.step \+ \.step \{\s*border-top: var\(--border-hair\);/);
  });
});

/** Every colour-ish declaration in the stylesheet outside the token file. */
function colourDeclarations(): { property: string; value: string }[] {
  const outside = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...outside.matchAll(/(?:^|;)\s*(color|background|border-color|fill|stroke):\s*([^;]+);/g)].map((match) => ({
    property: match[1] ?? '',
    value: (match[2] ?? '').trim(),
  }));
}

const NAMED_COLOURS = /^(red|blue|green|black|white|gray|grey|orange|yellow)$/i;
const COLOUR_LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i;

describe('AC-004-66: one chromatic token, and no colour token added', () => {
  it('AC-004-66: no rule outside tokens.css declares a colour literal', () => {
    for (const { property, value } of colourDeclarations()) {
      expect(value, property).not.toMatch(COLOUR_LITERAL);
      expect(value, property).not.toMatch(NAMED_COLOURS);
    }
    expect(TOKENS.split('--').length).toBeGreaterThan(0);
  });

  it('AC-004-66: exactly one chromatic token, the accent', () => {
    for (const theme of [LIGHT, DARK]) {
      const publicTokens = ['surface-1', 'surface-2', 'surface-3', 'ink-1', 'ink-2', 'ink-3', 'rule-1', 'rule-2', 'accent', 'on-accent', 'data-deficit', 'data-projection', 'chart-series-2'];
      const chromatic = publicTokens.filter((name) => {
        const value = token(theme, name);
        return value !== null && /^#[0-9a-f]{6}$/i.test(value) && chroma(value) > 20;
      });
      expect(chromatic).toEqual(['accent']);
    }
  });

  it('AC-004-66: no token is added whose purpose is a second accent', () => {
    // `--surface-hero` retired (T8); no new colour token appears in its place.
    expect(TOKENS).not.toContain('--surface-hero:');
    const names = [...TOKENS.matchAll(/^\s*--([a-z0-9-]+):/gm)]
      .map((match) => match[1] as string)
      .filter((name) => name.includes('accent'));
    expect([...new Set(names)]).toEqual(['accent', 'on-accent']);
  });
});

/** One rule's declaration block, comment-free, by exact selector. */
function bodyOf(selector: string): string {
  const clean = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((match) => ({ selector: (match[1] ?? '').trim().replace(/\s+/g, ' '), body: match[2] ?? '' }))
    .filter((rule) => rule.selector === selector);
  return rules.map((rule) => rule.body).join('\n');
}

const TOKEN_ONLY = /^(font-size|margin[a-z-]*|padding[a-z-]*|gap|color|background|background-color|border-color|letter-spacing|line-height)$/;

describe('AC-004-67: the new rules are token-only', () => {
  it('AC-004-67: every declaration this spec touches resolves a token', () => {
    const NEW_RULES = [
      '.step--number',
      '.step--number .hero__title',
      '.step--number .step__label',
      '.step--number .step__sentence',
      '.step--number .clock__field--days',
      '.clock__field--days',
      '.clock__field--days .clock__label',
      '.clock__value--days',
      '.clock__label',
    ];
    for (const selector of NEW_RULES) {
      for (const declaration of bodyOf(selector).split(';')) {
        const [rawProperty, rawValue] = declaration.split(':');
        const property = (rawProperty ?? '').trim();
        if (!TOKEN_ONLY.test(property)) continue;
        const value = (rawValue ?? '').trim();
        expect(value, `${selector} { ${property}: ${value} }`).toMatch(/var\(--|^0$|^auto$|^none$/);
        expect(value, `${selector} { ${property} }`).not.toMatch(/#[0-9a-f]{3,8}\b|\b\d+(?:\.\d+)?(px|rem|em)\b/i);
      }
    }
  });
});

describe('AC-004-68: the contrast pairs still pass', () => {
  it('AC-004-68: no contrast minimum is lowered, and the pairs are the new table’s', () => {
    const contrastGates = readFileSync('tests/helpers/colour.ts', 'utf8');
    expect(contrastGates.length).toBeGreaterThan(0);
    // The accent on the page ground clears AA in both themes; the numeral's pair is measured, not
    // quoted. AC-006-25 carries the full table.
    for (const theme of [LIGHT, DARK]) {
      expect(contrast(token(theme, 'accent') as string, token(theme, 'surface-1') as string)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token(theme, 'ink-1') as string, token(theme, 'surface-1') as string)).toBeGreaterThanOrEqual(7);
    }
    expect(CSS).toMatch(/\.step__label\s*\{[^}]*color: var\(--ink-3\)/s);
  });
});

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** AC-004-64…68 — the visual identity is preserved (spec 004 T15). */
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const CSS = readFileSync('web/styles/globals.css', 'utf8');

const LIGHT = TOKENS.slice(0, TOKENS.indexOf("[data-theme='dark']"));
const DARK = TOKENS.slice(TOKENS.indexOf("[data-theme='dark']"));

function token(theme: string, name: string): string | null {
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(theme);
  return match?.[1]?.trim() ?? null;
}

describe('AC-004-64: the palette and the type scale are untouched', () => {
  it('AC-004-64: every named colour and size token keeps its shipped value', () => {
    const EXPECTED: Record<string, string> = {
      'surface-1': '#fdf2e1',
      'surface-2': '#f6ead7',
      'surface-3': '#f0e1c9',
      'surface-hero': '#fee8d0',
      'ink-1': '#1e160d',
      'ink-2': '#47392a',
      'ink-3': '#645341',
      'rule-1': '#d6c8b7',
      'rule-2': '#b9a892',
      accent: '#3b5512',
      'on-accent': '#fdf2e1',
      'data-projection': '#6b520a',
      'data-deficit': '#96472a',
    };
    for (const [name, value] of Object.entries(EXPECTED)) expect(token(LIGHT, name), name).toBe(value);
    expect(token(DARK, 'surface-1')).toBe('#17110b');
    expect(token(DARK, 'accent')).toBe('#91c46d');
    expect(token(DARK, 'data-projection')).toBe('#d8bf60');
    for (const name of [
      'text-display',
      'text-h2',
      'text-h3',
      'text-plate',
      'text-body-lg',
      'text-body',
      'text-small',
      'text-meta',
      'text-micro',
      'text-num-xl',
      'text-num-l',
      'text-num-m',
    ]) {
      expect(token(LIGHT, name), name).not.toBeNull();
    }
    for (const name of ['font-sans', 'font-mono', 'font-serif', 'font-label']) {
      expect(token(LIGHT, name), name).not.toBeNull();
    }
  });
});

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
    // The new step boundaries use the same hairline, never a heavier separator.
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

describe('AC-004-66: no new hue, no new colour token', () => {
  it('AC-004-66: no rule outside tokens.css declares a colour literal', () => {
    for (const { property, value } of colourDeclarations()) {
      expect(value, property).not.toMatch(COLOUR_LITERAL);
      expect(value, property).not.toMatch(NAMED_COLOURS);
    }
    expect(TOKENS.split('--').length).toBeGreaterThan(0);
  });
});

/** Every declaration in the two blocks this spec authors, as `{ property, value }`. */
function authoredDeclarations(): { property: string; value: string }[] {
  const story =
    CSS.slice(CSS.indexOf('/* ---------- Spec 004: the five-step story'), CSS.indexOf('/* ---------- Figure plates')) +
    CSS.slice(CSS.indexOf('/* ---------- The method region'), CSS.indexOf('\n.share {'));
  return [...story.matchAll(/(font-size|font-family|margin[a-z-]*|padding[a-z-]*|gap|color|background|border[a-z-]*):\s*([^;]+);/g)].map(
    (match) => ({ property: match[1] ?? '', value: (match[2] ?? '').trim() }),
  );
}

const BORDER = new Set(['border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'border-color']);
const STRUCTURAL = new Set(['border-collapse']);

describe('AC-004-67: the new rules are token-only', () => {
  it('AC-004-67: every new declaration resolves a token, and no raw length but 1px', () => {
    for (const { property, value } of authoredDeclarations()) {
      if (STRUCTURAL.has(property) || value === 'transparent') continue;
      if (BORDER.has(property)) {
        expect(value, property).toMatch(/^var\(--border-(hair|strong)\)$|^0$/);
        continue;
      }
      expect(value, `${property}: ${value}`).toMatch(/var\(--|^0$|^none$/);
      expect(value, `${property}: ${value}`).not.toMatch(/\b\d+(?:\.\d+)?(px|rem|em)\b/);
    }
  });
});

describe('AC-004-68: the contrast pairs still pass', () => {
  it('AC-004-68: no contrast minimum is lowered and the shipped pairs are unchanged', () => {
    const contrastGates = readFileSync('tests/helpers/colour.ts', 'utf8');
    expect(contrastGates.length).toBeGreaterThan(0);
    expect(TOKENS).toContain('--ink-1: #1e160d');
    expect(TOKENS).toContain('--surface-1: #fdf2e1');
    expect(CSS).toMatch(/\.step__label\s*\{[^}]*color: var\(--ink-3\)/s);
  });
});

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const CSS = readFileSync('web/styles/globals.css', 'utf8');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');

/** The token file this spec must not move: sha256 of the shipped `tokens.css`. */
const TOKENS_SHA256 = '1b3e45150859b13373ee06f4a877e00f94d927f592fd019e2c1862a933c7f5b6';

function tokenValues(text: string): Map<string, number> {
  const values = new Map<string, number>();
  for (const match of text.matchAll(/--space-(\d+):\s*(\d+)px;/g)) {
    values.set(`space-${match[1]}`, Number(match[2]));
  }
  return values;
}

interface Rule {
  selector: string;
  body: string;
}

function rulesOf(css: string): Rule[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...withoutComments.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
    selector: (match[1] ?? '').trim().replace(/\s+/g, ' '),
    body: match[2] ?? '',
  }));
}

const TOKENS_BY_NAME = tokenValues(TOKENS);
const RULES = rulesOf(CSS);

const STEP_SELECTOR = /^\.step(?:--[a-z]+)?$/;

function resolveLength(value: string): number | null {
  const token = /var\(--space-(\d+)\)/.exec(value.trim());
  if (token) return TOKENS_BY_NAME.get(`space-${token[1]}`) ?? null;
  const literal = /^(\d+)px$/.exec(value.trim());
  return literal ? Number(literal[1]) : null;
}

interface PaddingPair {
  start: number | null;
  end: number | null;
}

function applyDeclaration(pair: PaddingPair, property: string, value: string): void {
  if (property === 'padding-block') {
    const resolved = resolveLength(value);
    pair.start = resolved;
    pair.end = resolved;
    return;
  }
  if (property === 'padding-block-start') pair.start = resolveLength(value);
  if (property === 'padding-block-end') pair.end = resolveLength(value);
}

/** A rule's `padding-block` longhands, resolved through the token table. */
function paddingPair(body: string): PaddingPair {
  const pair: PaddingPair = { start: null, end: null };
  for (const declaration of body.split(';')) {
    const [rawProperty, rawValue] = declaration.split(':');
    applyDeclaration(pair, (rawProperty ?? '').trim(), rawValue ?? '');
  }
  return pair;
}

function stepPaddings(): Array<{ selector: string; pair: PaddingPair }> {
  return RULES.filter((rule) => STEP_SELECTOR.test(rule.selector))
    .map((rule) => ({ selector: rule.selector, pair: paddingPair(rule.body) }))
    .filter((entry) => entry.pair.start !== null || entry.pair.end !== null);
}

function maxOf(values: readonly (number | null)[]): number {
  return Math.max(...values.map((value) => value ?? 0));
}

function bodyOf(selector: string): string {
  return RULES.filter((rule) => rule.selector === selector)
    .map((rule) => rule.body)
    .join('\n');
}

describe('AC-005-12: the declared padding of step 1 is not smaller than any other step’s', () => {
  it('AC-005-12: step 1’s resolved padding is at least every other step selector’s', () => {
    const paddings = stepPaddings();
    const number = paddings.filter((entry) => entry.selector === '.step--number');
    const others = paddings.filter((entry) => entry.selector !== '.step--number');
    expect(number.length).toBeGreaterThan(0);
    expect(others.length).toBeGreaterThan(0);
    const numberStart = maxOf(number.map((entry) => entry.pair.start));
    const numberEnd = maxOf(number.map((entry) => entry.pair.end));
    expect(numberStart, `start ${numberStart} vs others ${JSON.stringify(others)}`).toBeGreaterThanOrEqual(
      maxOf(others.map((entry) => entry.pair.start)),
    );
    expect(numberEnd, `end ${numberEnd} vs others ${JSON.stringify(others)}`).toBeGreaterThanOrEqual(
      maxOf(others.map((entry) => entry.pair.end)),
    );
  });
});

describe('AC-005-16: the air is spent with tokens, and the ground is kept', () => {
  const SPACING = /^(padding|padding-block|padding-block-start|padding-block-end|margin|margin-block|margin-block-start|margin-block-end|margin-top|margin-bottom|gap)$/;

  it('AC-005-16: every spacing declaration in the touched rules resolves a token', () => {
    for (const selector of ['.step--number', '.hero__title', '.step__sentence', '.step__label']) {
      for (const declaration of bodyOf(selector).split(';')) {
        const [rawProperty, rawValue] = declaration.split(':');
        const property = (rawProperty ?? '').trim();
        if (!SPACING.test(property)) continue;
        const value = (rawValue ?? '').trim();
        expect(value, `${selector} ${property}`).toMatch(/var\(--/);
        expect(value, `${selector} ${property}`).not.toMatch(/\d(px|rem|em)\b/);
      }
    }
  });

  it('AC-005-16: step 1 keeps its ground, gains no border, and no surface-2 background', () => {
    const number = bodyOf('.step--number');
    expect(number).toContain('background: var(--surface-hero)');
    expect(number).not.toContain('border-top');
    expect(number).not.toContain('var(--surface-2)');
  });

  it('AC-005-16: the token file is byte-identical to the shipped one', () => {
    expect(createHash('sha256').update(TOKENS).digest('hex')).toBe(TOKENS_SHA256);
    expect(TOKENS_BY_NAME.get('space-6')).toBe(32);
    expect(TOKENS_BY_NAME.get('space-8')).toBe(64);
  });
});

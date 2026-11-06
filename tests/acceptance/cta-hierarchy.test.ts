import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PublicPage } from '../../web/components/PublicPage';
import { citationRegistry } from '../../web/content/citations';
import { content, dependencyFigure, renderComponent, shareFigure } from '../fixtures/figures';
import { seriesFixtures } from '../fixtures/series';
import { contrast } from '../helpers/colour';
import { stripComments } from '../helpers/source-scan';

/**
 * T7 (spec 002): one dominant primary action, one clearly subordinate secondary.
 *
 * Today both hero actions inherit the global `a { color: var(--accent) }`, so raising the accent's
 * chroma for T2 would make the secondary *louder*, not quieter. The hierarchy is fixed in CSS; no
 * string changes (the copy belongs to T6).
 */
const CSS = readFileSync('web/styles/globals.css', 'utf8');
const CODE = stripComments(CSS);
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');
const ES = content('es');

/** One token's declared value in a theme block, or `null`. */
function token(theme: 'light' | 'dark', name: string): string | null {
  const block = theme === 'light' ? TOKENS.slice(0, TOKENS.indexOf("[data-theme='dark']")) : TOKENS;
  const match = new RegExp(`--${name}:\\s*([^;]+);`).exec(block);
  return match?.[1]?.trim() ?? null;
}

/**
 * The declarations of one class's own rule, as written. The search is anchored at a line start so
 * a descendant rule (`.step--meaning .hero__cta`) is not mistaken for the class's own.
 */
function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|\\n)${escaped} \\{`).exec(CODE);
  expect(match, `${selector} must be declared`).not.toBeNull();
  const at = (match?.index ?? 0) + (match?.[0].startsWith('\n') === true ? 1 : 0);
  return CODE.slice(at, CODE.indexOf('}', at));
}

function declarations(source: string): string {
  return source.slice(source.indexOf('{'));
}

/**
 * The page's two actions (spec 004 T6): step 5's primary, then the after-story strip's method
 * link. The hero's action block and its proposition tier retired with the band, so the hierarchy
 * is asserted on the composition that renders it.
 */
function page(): string {
  return renderComponent(PublicPage, {
    content: ES,
    figures: [dependencyFigure(), shareFigure()],
    citations: citationRegistry,
    freshnessWindowDays: 45,
    stale: false,
    series: seriesFixtures(),
  });
}

/** One attribute value from an element's attribute string, or an empty string. */
function attribute(attributes: string, name: string): string {
  return new RegExp(`${name}="([^"]*)"`).exec(attributes)?.[1] ?? '';
}

/** Every action link on the page, with its class, href and visible text, in document order. */
function actions(html: string): { className: string; href: string; text: string }[] {
  return [...html.matchAll(/<a class="(hero__cta(?:-secondary)?)" href="([^"]*)">([^<]*)<\/a>/g)].map((match) => ({
    className: attribute(`class="${match[1]}"`, 'class'),
    href: attribute(`href="${match[2]}"`, 'href'),
    text: (match[3] ?? '').trim(),
  }));
}

const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\b\d+(?:\.\d+)?px\b/i;

describe('AC-002-31: one visually dominant primary action', () => {
  it('AC-002-31: the primary is an ink block with surface ink, no underline and the same shape', () => {
    // Re-pointed by spec 006 T9: the primary stays dominant but stops being the accent. The
    // accent budget is now owned page-wide by AC-006-26.
    const cta = rule('.hero__cta');
    expect(cta).toContain('background: var(--ink-1)');
    expect(cta).toContain('color: var(--surface-1)');
    expect(cta).toContain('text-decoration: none');
    // The pair the fill now carries clears AAA.
    expect(contrast(token('light', 'surface-1') as string, token('light', 'ink-1') as string)).toBeGreaterThanOrEqual(7);
    // Sharp corners: the site's one radius token, which is 0.
    expect(cta).toContain('border-radius: var(--radius)');
    expect(cta).toContain('font-size: var(--text-body)');
    expect(cta).toContain('padding: var(--space-3) var(--space-5)');
  });

  it('AC-002-31: no rule fills with the accent', () => {
    // Inverted from "it is the page's only accent-filled action": the inverted form is stronger,
    // because there must now be no accent-filled action at all.
    expect(rule('.hero__cta-secondary')).not.toContain('var(--accent)');
    const filled = [...CODE.matchAll(/([^{}]+)\{([^{}]*background(?:-color)?:\s*var\(--accent\)[^{}]*)\}/g)]
      .map((match) => (match[1] ?? '').trim())
      .filter((selector) => !selector.startsWith('.admin-') && !selector.startsWith('.operator'));
    expect(filled).toEqual([]);
    expect(page().split('class="hero__cta"').length - 1).toBe(1);
  });
});

describe('AC-002-32: a clearly subordinate secondary action', () => {
  it('AC-002-32: the secondary is a text link in `--ink-2`, underlined, with no fill', () => {
    const secondary = rule('.hero__cta-secondary');
    expect(secondary).toContain('color: var(--ink-2)');
    // `text-decoration-line` (the longhand): the `text-decoration` shorthand would reset the
    // thickness to `auto` and lose the shared `a` rule's 1px hairline.
    expect(secondary).toContain('text-decoration-line: underline');
    expect(secondary).not.toMatch(/text-decoration:/);
    expect(secondary).not.toMatch(/background/);
    expect(secondary).not.toContain('var(--accent)');
    expect(secondary).not.toContain('var(--on-accent)');
    // The visible 1px underline is the global link rule's, so no literal is needed here.
    expect(CODE).toMatch(/^a \{[^}]*text-decoration-thickness: 1px/sm);
  });

  it('AC-002-32: the secondary is no larger than the primary', () => {
    // The AC allows `--text-body-lg` or `--text-body`; the primary is `--text-body`, so the
    // subordinate step is `--text-body` — larger would invert the hierarchy it exists to fix.
    const secondary = rule('.hero__cta-secondary');
    const size = /font-size:\s*([^;]+)/.exec(secondary)?.[1]?.trim();
    expect(['var(--text-body)', 'var(--text-body-lg)']).toContain(size);
    expect(size).toBe('var(--text-body)');
  });
});

describe('AC-002-33: CTA styling is token-only, with no literal', () => {
  it('AC-002-33: no literal colour, size, spacing or radius appears in the CTA rules', () => {
    for (const selector of ['.hero__cta', '.hero__cta-secondary']) {
      expect(LITERAL.test(declarations(rule(selector))), `${selector} carries a literal`).toBe(false);
    }
  });

  it('AC-002-33: every visual property resolves a token', () => {
    const cta = rule('.hero__cta');
    for (const property of ['background', 'color', 'padding', 'border-radius', 'font-size']) {
      expect(cta, `.hero__cta { ${property} }`).toMatch(new RegExp(`${property}:\\s*var\\(--`));
    }
    const secondary = rule('.hero__cta-secondary');
    for (const property of ['color', 'font-size']) {
      expect(secondary, `.hero__cta-secondary { ${property} }`).toMatch(
        new RegExp(`${property}:\\s*var\\(--`),
      );
    }
  });
});

describe('AC-002-34: the secondary no longer competes on hue', () => {
  it('AC-002-34: the secondary’s colour is not the accent, so T2’s chroma rise leaves it alone', () => {
    const secondary = rule('.hero__cta-secondary');
    expect(secondary).not.toContain('var(--accent)');
    expect(secondary).toContain('var(--ink-2)');
    // Re-pointed by spec 006 T9/T5: the accent is reserved to the day numeral, so a link computes
    // an ink and the underline carries the affordance (AC-006-11, AC-006-26). The secondary's own
    // colour was already ink; what changes is the rule it used to opt out of.
    expect(CODE).toMatch(/^a \{[^}]*color: var\(--ink-2\)/m);
  });
});

describe('AC-002-35: both links keep their href targets and accessible names', () => {
  it('AC-002-35: step 5 is `#figuras` primary, the strip is `#metodo` secondary', () => {
    const links = actions(page());
    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({ className: 'hero__cta', href: '#figuras', text: ES.t('hero.ctaPrimary') });
    expect(links[1]).toEqual({
      className: 'hero__cta-secondary',
      href: '#metodo',
      text: ES.t('hero.ctaSecondary'),
    });
  });

  it('AC-002-35: the after-story strip carries the method target, outside every step', () => {
    const html = page();
    const strip = html.slice(html.indexOf('class="story__strip"'), html.indexOf('id="figuras"'));
    expect(strip).toContain('href="#metodo"');
    expect(strip).toContain(ES.t('hero.ctaSecondary'));
    // It renders after the fifth step and inside no step.
    expect(html.indexOf('class="story__strip"')).toBeGreaterThan(html.indexOf('data-top-step="meaning"'));
    expect(strip).not.toContain('data-top-step');
  });

  it('AC-002-35: each link’s visible text is its accessible name', () => {
    // No `aria-label` overrides, no extra span: the text node is the name, so the two CTAs keep
    // distinct intents and a screen reader hears the same words a sighted reader reads.
    const html = page();
    for (const link of actions(html)) {
      expect(link.text.length, 'a link has no text to name it').toBeGreaterThan(0);
    }
    for (const element of html.matchAll(/<a class="hero__cta(?:-secondary)?"[^>]*>/g)) {
      expect(element[0]).not.toContain('aria-label');
    }
  });
});

describe('AC-002-31/32: a11y and motion are unchanged by the hierarchy', () => {
  it('keeps the global focus ring outside the filled box', () => {
    // `:focus-visible` is the one focus contract; `--focus` is the accent and `--focus-offset`
    // puts the ring outside the primary's fill instead of inside it.
    expect(CODE).toMatch(/:focus-visible \{[^}]*outline: var\(--focus\)/s);
    expect(CODE).toMatch(/:focus-visible \{[^}]*outline-offset: var\(--focus-offset\)/s);
    for (const selector of ['.hero__cta', '.hero__cta-secondary']) {
      expect(rule(selector)).not.toContain('outline');
    }
  });

  it('adds no motion to either action', () => {
    for (const selector of ['.hero__cta', '.hero__cta-secondary']) {
      const body = rule(selector);
      for (const property of ['transition', 'animation', 'transform', 'will-change']) {
        expect(body, `${selector} { ${property} }`).not.toContain(property);
      }
    }
  });
});

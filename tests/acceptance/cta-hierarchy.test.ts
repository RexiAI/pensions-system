import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Hero } from '../../web/components/public/Hero';
import type { DerivedFigure } from '../../web/ingest/types';
import { content, dependencyFigure, renderComponent, shareFigure, unresolvedFigures } from '../fixtures/figures';
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
const ES = content('es');

/** The declarations of one class's rule, as written. A later duplicate would not be folded in. */
function rule(selector: string): string {
  const at = CODE.indexOf(`${selector} {`);
  expect(at, `${selector} must be declared`).toBeGreaterThan(-1);
  return CODE.slice(at, CODE.indexOf('}', at));
}

function declarations(source: string): string {
  return source.slice(source.indexOf('{'));
}

/** A tier-1/tier-2 hero: one eligible figure, so the numeric tier renders. */
function numericHero(): string {
  return renderComponent(Hero, { content: ES, figures: [dependencyFigure(), shareFigure()] });
}

/** A tier-3 hero: no eligible figure, so the proposition tier renders. */
function propositionHero(): string {
  const figures: readonly DerivedFigure[] = unresolvedFigures();
  return renderComponent(Hero, { content: ES, figures });
}

/** One attribute value from an element's attribute string, or an empty string. */
function attribute(attributes: string, name: string): string {
  return new RegExp(`${name}="([^"]*)"`).exec(attributes)?.[1] ?? '';
}

/** Every `<a …>` in the hero's actions block, with its class, href and visible text. */
function actions(html: string): { className: string; href: string; text: string }[] {
  const start = html.indexOf('class="hero__actions"');
  expect(start).toBeGreaterThan(-1);
  const block = html.slice(start, html.indexOf('</div>', start));
  return [...block.matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)].map((match) => ({
    className: attribute(match[1] ?? '', 'class'),
    href: attribute(match[1] ?? '', 'href'),
    text: (match[2] ?? '').trim(),
  }));
}

const LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\b\d+(?:\.\d+)?px\b/i;

describe('AC-002-31: one visually dominant primary action', () => {
  it('AC-002-31: the primary is a filled accent block with `--on-accent` ink and no underline', () => {
    const cta = rule('.hero__cta');
    expect(cta).toContain('background: var(--accent)');
    expect(cta).toContain('color: var(--on-accent)');
    expect(cta).toContain('text-decoration: none');
    // Sharp corners: the site's one radius token, which is 0.
    expect(cta).toContain('border-radius: var(--radius)');
    expect(cta).toContain('font-size: var(--text-body)');
    expect(cta).toContain('padding: var(--space-3) var(--space-5)');
  });

  it('AC-002-31: it is the only accent-coloured action above the fold', () => {
    // The secondary must not resolve the accent: the accent does exactly one job here.
    expect(rule('.hero__cta-secondary')).not.toContain('var(--accent)');
    // And no *other* rule inside the hero's actions block paints a link in the accent.
    const actionsAt = CODE.indexOf('.hero__actions {');
    const nextSection = CODE.indexOf('/* ', actionsAt + 1);
    const heroActionRules = CODE.slice(actionsAt, nextSection === -1 ? undefined : nextSection);
    for (const match of heroActionRules.matchAll(/\.hero__[a-z-]+[^{]*\{([^}]*)\}/g)) {
      const body = match[1] ?? '';
      expect(body, 'a hero action rule uses the accent as its ink').not.toMatch(/color:\s*var\(--accent\)/);
    }
    // The rendered tier renders exactly one primary per hero.
    for (const html of [numericHero(), propositionHero()]) {
      expect(html.split('class="hero__cta"').length - 1).toBe(1);
    }
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
    // The global link colour is still the accent — the accent is still the site's link ink — so
    // the secondary has to opt out of it explicitly rather than inherit it.
    expect(CODE).toMatch(/^a \{[^}]*color: var\(--accent\)/m);
  });
});

describe('AC-002-35: both links keep their href targets and accessible names', () => {
  it('AC-002-35: the numeric tier is `#figuras` primary, `#metodo` secondary', () => {
    const links = actions(numericHero());
    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({ className: 'hero__cta', href: '#figuras', text: ES.t('hero.ctaPrimary') });
    expect(links[1]).toEqual({
      className: 'hero__cta-secondary',
      href: '#metodo',
      text: ES.t('hero.ctaSecondary'),
    });
  });

  it('AC-002-35: the proposition tier is `#metodo` primary, `#figuras` secondary', () => {
    const links = actions(propositionHero());
    expect(links).toHaveLength(2);
    expect(links[0]).toEqual({ className: 'hero__cta', href: '#metodo', text: ES.t('hero.ctaMethod') });
    expect(links[1]).toEqual({
      className: 'hero__cta-secondary',
      href: '#figuras',
      text: ES.t('hero.ctaFigures'),
    });
  });

  it('AC-002-35: each link’s visible text is its accessible name', () => {
    // No `aria-label` overrides, no extra span: the text node is the name, so the two CTAs keep
    // distinct intents and a screen reader hears the same words a sighted reader reads.
    for (const html of [numericHero(), propositionHero()]) {
      for (const link of actions(html)) {
        expect(link.text.length, 'a link has no text to name it').toBeGreaterThan(0);
      }
      const block = html.slice(html.indexOf('class="hero__actions"'), html.indexOf('</div>', html.indexOf('class="hero__actions"')));
      expect(block).not.toContain('aria-label');
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

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAGE_NAME_KEYS } from '../../web/content/keys';
import { LOCALES, PAGE_KINDS } from '../../web/content/types';
import { pagePathFor } from '../../web/seo/routes';
import { content } from '../fixtures/figures';
import { pageOf } from '../helpers/story';

const CSS = readFileSync('web/styles/globals.css', 'utf8');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');

/** The header nav block, from its `<nav>` to its close. */
function navBlock(html: string, className: string): string {
  const at = html.indexOf(`class="${className}"`);
  if (at === -1) return '';
  return html.slice(html.lastIndexOf('<nav', at), html.indexOf('</nav>', at) + '</nav>'.length);
}

function navLinks(block: string): { href: string; label: string; current: boolean }[] {
  return [...block.matchAll(/<a\b([^>]*)>([^<]*)<\/a>/g)].map((match) => {
    const attributes = match[1] ?? '';
    return {
      href: /href="([^"]*)"/.exec(attributes)?.[1] ?? '',
      label: (match[2] ?? '').trim(),
      current: /aria-current="page"/.test(attributes),
    };
  });
}

function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(?:^|\\n)${escaped} \\{`).exec(CSS);
  if (!match) return '';
  const at = match.index + (match[0].startsWith('\n') ? 1 : 0);
  return CSS.slice(at, CSS.indexOf('}', at));
}

/**
 * AC-007-11…12 — a persistent header nav of four page links (spec 007 T6).
 */
describe('AC-007-11: four page links with aria-current on the active page', () => {
  it('AC-007-11: every page in every locale renders four localized page links', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      for (const pageKind of PAGE_KINDS) {
        const links = navLinks(navBlock(pageOf(pageKind, locale), 'site-header__nav'));
        expect(links, `${locale}/${pageKind}`).toHaveLength(4);
        expect(links.map((link) => link.href)).toEqual(PAGE_KINDS.map((kind) => pagePathFor(locale, kind)));
        expect(links.map((link) => link.label)).toEqual(PAGE_KINDS.map((kind) => local.t(PAGE_NAME_KEYS[kind])));
        expect(links.filter((link) => link.current)).toHaveLength(1);
        expect(links.find((link) => link.current)?.href).toBe(pagePathFor(locale, pageKind));
      }
    }
  });

  it('AC-007-11: the locale switcher and the theme toggle still render', () => {
    const html = pageOf('historia', 'es');
    expect(html).toContain('class="locale-group"');
    expect(html.split('class="locale-group__cell"').length - 1).toBe(5);
    expect(html).toMatch(/class="[^"]*site-header__theme/);
    for (const locale of LOCALES) {
      const cells = [...html.matchAll(/class="locale-group__cell"[^>]*aria-current="page"/g)];
      expect(cells.length, locale).toBe(1);
    }
  });
});

describe('AC-007-12: the nav is reachable, 44×44, reduced-motion safe and needs no JavaScript', () => {
  it('AC-007-12: the links are ordinary anchors in the served HTML', () => {
    const html = pageOf('historia', 'es');
    const links = navLinks(navBlock(html, 'site-header__nav'));
    expect(links).toHaveLength(4);
    for (const link of links) expect(link.href.startsWith('/')).toBe(true);
    // No hydration-only path: the markup carries every destination.
    expect(html).not.toMatch(/<script[^>]*>[^<]*(onclick|addEventListener)/);
  });

  it('AC-007-12: every nav target reaches 44×44 and adjacent links keep a 16px gap', () => {
    const nav = rule('.site-header__nav a');
    expect(nav).toContain('min-block-size: var(--tap-min)');
    expect(nav).toContain('min-inline-size: var(--tap-min)');
    expect(rule('.site-header__nav')).toContain('gap: var(--space-4)');
    expect(TOKENS).toMatch(/--space-4:\s*16px;/);
    expect(TOKENS).toMatch(/--tap-min:\s*44px;/);
    const panel = rule('.index-panel__anchors a');
    expect(panel).toContain('min-height: 48px');
  });

  it('AC-007-12: the active state is weight plus a 2px neutral rule, and no motion runs', () => {
    expect(rule(".site-header__nav a[aria-current='page']")).toContain('font-weight: 600');
    expect(rule(".site-header__nav a[aria-current='page']::after")).toContain('block-size: var(--nav-active-rule)');
    expect(TOKENS).toMatch(/--nav-active-rule:\s*2px;/);
    for (const match of CSS.matchAll(/\.site-header__nav[^{]*\{([^}]*)\}/g)) {
      expect(match[1] ?? '').not.toMatch(/transition|animation/);
    }
  });

  it('AC-007-12: the locale cells keep aria-current on the active locale', () => {
    for (const locale of LOCALES) {
      const html = pageOf('historia', locale);
      const cells = [...html.matchAll(/<a[^>]*class="locale-group__cell"[^>]*>/g)].map((match) => match[0]);
      expect(cells.filter((cell) => /aria-current="page"/.test(cell)), locale).toHaveLength(1);
    }
  });
});

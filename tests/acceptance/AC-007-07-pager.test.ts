import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAGE_NAME_KEYS } from '../../web/content/keys';
import { LOCALES, PAGE_KINDS } from '../../web/content/types';
import { pagePathFor } from '../../web/seo/routes';
import { content } from '../fixtures/figures';
import { pageOf, storyPage } from '../helpers/story';

const CSS = readFileSync('web/styles/globals.css', 'utf8');
const TOKENS = readFileSync('web/styles/tokens.css', 'utf8');

function pagerOf(html: string): string {
  const at = html.indexOf('class="pager"');
  return at === -1 ? '' : html.slice(at, html.indexOf('</nav>', at) + '</nav>'.length);
}

function pagerLinks(html: string): { direction: 'prev' | 'next'; href: string; text: string }[] {
  return [...pagerOf(html).matchAll(/<a class="pager__link pager__link--(prev|next)" href="([^"]*)">([\s\S]*?)<\/a>/g)].map(
    (match) => ({
      direction: match[1] as 'prev' | 'next',
      href: match[2] ?? '',
      text: (match[3] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    }),
  );
}

const SEQUENCE = PAGE_KINDS;

type Kind = (typeof PAGE_KINDS)[number];

interface ExpectedNeighbours {
  prev?: Kind;
  next?: Kind;
}

const NEIGHBOURS: Record<Kind, ExpectedNeighbours> = {
  historia: { next: 'cifras' },
  cifras: { prev: 'historia', next: 'metodo' },
  metodo: { prev: 'cifras', next: 'debate' },
  debate: { prev: 'metodo' },
};

function assertNeighbour(
  locale: (typeof LOCALES)[number],
  kind: Kind,
  direction: 'prev' | 'next',
  link: { href: string; text: string } | undefined,
): void {
  const target = direction === 'prev' ? NEIGHBOURS[kind].prev : NEIGHBOURS[kind].next;
  if (target === undefined) {
    expect(link, `${locale}/${kind} ${direction}`).toBeUndefined();
    return;
  }
  expect(link?.href, `${locale}/${kind} ${direction}`).toBe(pagePathFor(locale, target));
  if (link) expect(link.text, `${locale}/${kind}`).toContain(content(locale).t(PAGE_NAME_KEYS[target]));
}

/**
 * AC-007-13 — the end-of-page previous/next pager (spec 007 T7).
 */
describe('AC-007-13: each page ends with previous/next walking the four-page sequence', () => {
  it('AC-007-13: Historia has next only, Debate previous only, the middle pages both', () => {
    for (const locale of LOCALES) {
      for (const kind of SEQUENCE) {
        const links = pagerLinks(pageOf(kind, locale));
        assertNeighbour(locale, kind, 'prev', links.find((link) => link.direction === 'prev'));
        assertNeighbour(locale, kind, 'next', links.find((link) => link.direction === 'next'));
      }
    }
  });

  it('AC-007-13: the pager is the last element inside main, and Historia keeps its story strip', () => {
    for (const kind of SEQUENCE) {
      const html = pageOf(kind, 'es');
      const pager = html.indexOf('class="pager"');
      const mainClose = html.indexOf('</main>');
      expect(pager, kind).toBeGreaterThan(-1);
      expect(pager, kind).toBeLessThan(mainClose);
      // Nothing but the pager renders after it inside main.
      expect(html.slice(pager, mainClose).split('class="pager"').length - 1, kind).toBe(1);
    }
    const historia = storyPage('es');
    expect(historia).toContain('class="story__strip"');
    expect(historia).toContain('class="pager"');
  });

  it('AC-007-13: every link is 44px tall, separated by the pager gap, and declares no motion', () => {
    expect(CSS).toMatch(/\.pager__link\s*\{[^}]*min-block-size:\s*var\(--tap-min\)/s);
    expect(CSS).toMatch(/\.pager\s*\{[^}]*gap:\s*var\(--pager-gap\)/s);
    expect(TOKENS).toMatch(/--pager-gap:\s*var\(--space-6\);/);
    expect(TOKENS).toMatch(/--space-6:\s*32px;/);
    for (const match of CSS.matchAll(/\.pager[^{]*\{([^}]*)\}/g)) {
      expect(match[1] ?? '').not.toMatch(/transition|animation/);
    }
    expect(pagerOf(pageOf('cifras', 'es'))).not.toMatch(/<a class="pager__link[^>]*><\/a>/);
  });
});

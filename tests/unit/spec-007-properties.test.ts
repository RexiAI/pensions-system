import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { REQUIRED_KEYS, missingKeys, unknownKeys } from '../../web/content/keys';
import { COUNTRY_DOCUMENTS } from '../../web/content/registry';
import { canonicalUrl } from '../../web/content/site';
import { DEFAULT_LOCALE, LOCALES, PAGE_KINDS } from '../../web/content/types';
import type { LocaleDocument, PageKind } from '../../web/content/types';
import { metadataFor } from '../../web/seo/metadata';
import {
  alternateLinks,
  isPublicRoute,
  pageKindOfPath,
  pagePathFor,
  PUBLIC_ROUTE_PATHS,
  sitemapEntries,
} from '../../web/seo/routes';
import { pageOf } from '../helpers/story';

/**
 * Property tests for the invariants the four-page model claims (spec 007 T1/T7/T9/T10) — "the
 * manifest covers every locale × kind exactly once", "a path reads back as the page it was spelt
 * for", "the alternates are reciprocal", "the pager follows one page order in both directions",
 * "every locale carries the same key set", "the sitemap is the manifest". The unit and acceptance
 * suites pin examples of each; these hold them for every input in the domain, so a fifth locale or
 * a fifth page kind cannot satisfy the examples and break the invariant.
 */

const localeArb = fc.constantFrom(...LOCALES);
const kindArb = fc.constantFrom(...PAGE_KINDS);
/** Any absolute origin, so the URL derivation is checked against bases the site never shipped. */
const originArb = fc.webUrl().map((url) => new URL(url).origin);

describe('route model invariants (property tests)', () => {
  it('T1: one distinct path per locale, and each path reads back as the page it was spelt for', () => {
    fc.assert(
      fc.property(localeArb, kindArb, (locale, kind) => {
        const path = pagePathFor(locale, kind);
        expect(isPublicRoute(path), path).toBe(true);
        expect(pageKindOfPath(path), path).toBe(kind);
        // One locale per kind spells one path: no two locales collide on one page of one kind.
        const siblings = LOCALES.map((candidate) => pagePathFor(candidate, kind));
        expect(new Set(siblings).size, kind).toBe(LOCALES.length);
      }),
      { numRuns: 200 },
    );
  });

  it('T1: the manifest is exactly the locale × kind product, with no repeats and no admin path', () => {
    const expected = PAGE_KINDS.flatMap((kind) => LOCALES.map((locale) => pagePathFor(locale, kind)));
    expect(new Set(PUBLIC_ROUTE_PATHS)).toEqual(new Set(expected));
    expect(PUBLIC_ROUTE_PATHS).toHaveLength(PAGE_KINDS.length * LOCALES.length);
    // Set equality plus a matching length proves the manifest holds no duplicate entry.
    expect(new Set(PUBLIC_ROUTE_PATHS).size).toBe(PUBLIC_ROUTE_PATHS.length);
    for (const path of PUBLIC_ROUTE_PATHS) {
      expect(path.startsWith('/admin'), path).toBe(false);
      expect(isPublicRoute(path), path).toBe(true);
    }
  });

  it('T1: pageKindOfPath is total — any path, however malformed, names one of the four kinds', () => {
    fc.assert(
      fc.property(fc.string(), (path) => {
        expect(PAGE_KINDS).toContain(pageKindOfPath(path));
      }),
      { numRuns: 300 },
    );
  });
});

describe('alternate and sitemap invariants (property tests)', () => {
  it('T9: every page kind advertises its own page in all five locales plus x-default, under the base origin', () => {
    fc.assert(
      fc.property(originArb, kindArb, (base, kind) => {
        const alternates = alternateLinks(base, kind);
        expect(alternates).toHaveLength(LOCALES.length + 1);
        expect(new Set(alternates.map((alternate) => alternate.hreflang))).toEqual(new Set([...LOCALES, 'x-default']));
        // The five locale entries are this kind in each locale — never another page's URL.
        const localeHrefs = alternates
          .filter((alternate) => alternate.hreflang !== 'x-default')
          .map((alternate) => alternate.href);
        expect(new Set(localeHrefs)).toEqual(new Set(LOCALES.map((locale) => canonicalUrl(pagePathFor(locale, kind), base))));
        // x-default names the default locale's page of the same kind.
        expect(alternates.find((alternate) => alternate.hreflang === 'x-default')?.href).toBe(
          canonicalUrl(pagePathFor(DEFAULT_LOCALE, kind), base),
        );
        for (const alternate of alternates) expect(new URL(alternate.href).origin).toBe(new URL(base).origin);
      }),
      { numRuns: 60 },
    );
  });

  it('T9: the sitemap is the manifest — same URL set, each entry carrying its own page alternates', () => {
    fc.assert(
      fc.property(originArb, (base) => {
        const entries = sitemapEntries(base);
        expect(entries).toHaveLength(PUBLIC_ROUTE_PATHS.length);
        expect(new Set(entries.map((entry) => entry.url))).toEqual(
          new Set(PUBLIC_ROUTE_PATHS.map((path) => canonicalUrl(path, base))),
        );
        for (const entry of entries) {
          const kind = pageKindOfPath(new URL(entry.url).pathname);
          expect(entry.alternates).toEqual(alternateLinks(base, kind));
        }
      }),
      { numRuns: 60 },
    );
  });

  it('T9: a route publishes its own canonical in the link and og:url, and og:title mirrors the title', () => {
    fc.assert(
      fc.property(localeArb, kindArb, (locale, kind) => {
        const canonical = canonicalUrl(pagePathFor(locale, kind));
        const meta = metadataFor(locale, kind);
        expect(String(meta.alternates?.canonical), `${locale}/${kind}`).toBe(canonical);
        expect(String(meta.openGraph?.url), `${locale}/${kind}`).toBe(canonical);
        expect(meta.openGraph?.title, `${locale}/${kind}`).toBe(meta.title);
      }),
      { numRuns: 200 },
    );
  });

  it('T9: a route advertises its own page in all five locales plus x-default', () => {
    fc.assert(
      fc.property(localeArb, kindArb, (locale, kind) => {
        const languages = (metadataFor(locale, kind).alternates?.languages ?? {}) as Record<string, string>;
        expect(new Set(Object.keys(languages)), `${locale}/${kind}`).toEqual(new Set([...LOCALES, 'x-default']));
        for (const target of LOCALES) {
          expect(languages[target], `${locale}/${kind} → ${target}`).toBe(canonicalUrl(pagePathFor(target, kind)));
        }
      }),
      { numRuns: 200 },
    );
  });
});

describe('pager invariants (property tests)', () => {
  type PagerDirection = 'prev' | 'next';

  interface PagerLink {
    direction: PagerDirection;
    href: string;
  }

  /** The pager's links as served, in document order. */
  function pagerLinksOf(html: string): PagerLink[] {
    const at = html.indexOf('class="pager"');
    if (at === -1) return [];
    const markup = html.slice(at, html.indexOf('</nav>', at));
    return [...markup.matchAll(/<a class="pager__link pager__link--(prev|next)" href="([^"]*)"/g)].map((match) => ({
      direction: match[1] as PagerDirection,
      href: match[2] ?? '',
    }));
  }

  /** The href one page carries for one direction, if it carries that link at all. */
  function hrefFor(links: readonly PagerLink[], direction: PagerDirection): string | undefined {
    return links.find((link) => link.direction === direction)?.href;
  }

  /** The page before/after one page in the declared reading order — the order, never a table. */
  function neighbourOf(index: number, offset: -1 | 1): PageKind | undefined {
    const position = index + offset;
    return position >= 0 && position < PAGE_KINDS.length ? PAGE_KINDS[position] : undefined;
  }

  /** The href each direction must carry on one page. */
  function expectedNeighbours(locale: string, index: number): Record<PagerDirection, string | undefined> {
    const hrefOf = (offset: -1 | 1): string | undefined => {
      const kind = neighbourOf(index, offset);
      return kind === undefined ? undefined : pagePathFor(locale, kind);
    };
    return { prev: hrefOf(-1), next: hrefOf(1) };
  }

  /** One page's pager: a link per existing neighbour, pointing at it, and nothing else. */
  function assertPageNeighbours(locale: string, index: number, kind: PageKind, links: readonly PagerLink[]): void {
    const expected = expectedNeighbours(locale, index);
    expect(hrefFor(links, 'prev'), `${locale}/${kind} prev`).toBe(expected.prev);
    expect(hrefFor(links, 'next'), `${locale}/${kind} next`).toBe(expected.next);
    // The two ends carry one link; a middle page carries both.
    expect(links, `${locale}/${kind}`).toHaveLength(Object.values(expected).filter((href) => href !== undefined).length);
  }

  /** Following a link and reading the destination's opposite link returns to the page you came from. */
  function assertReciprocity(
    locale: string,
    kind: PageKind,
    direction: PagerDirection,
    links: ReadonlyMap<PageKind, readonly PagerLink[]>,
  ): void {
    const href = hrefFor(links.get(kind) ?? [], direction);
    if (href === undefined) return;
    const opposite: PagerDirection = direction === 'prev' ? 'next' : 'prev';
    const back = hrefFor(links.get(pageKindOfPath(href)) ?? [], opposite);
    expect(back, `${kind} ${direction}`).toBe(pagePathFor(locale, kind));
  }

  it('T7: prev/next walk the declared page order, reciprocally, with nothing at the two ends', () => {
    fc.assert(
      fc.property(localeArb, (locale) => {
        const links = new Map(PAGE_KINDS.map((kind) => [kind, pagerLinksOf(pageOf(kind, locale))] as const));
        for (const [index, kind] of PAGE_KINDS.entries()) {
          assertPageNeighbours(locale, index, kind, links.get(kind) ?? []);
        }
        for (const kind of PAGE_KINDS) {
          assertReciprocity(locale, kind, 'prev', links);
          assertReciprocity(locale, kind, 'next', links);
        }
      }),
      { numRuns: 12 },
    );
  });
});

describe('content parity invariants (property tests)', () => {
  const documents = COUNTRY_DOCUMENTS as readonly LocaleDocument[];

  function stringsOf(locale: string): Record<string, string> {
    const document = documents.find((candidate) => candidate.locale === locale);
    if (document === undefined) throw new Error(`no content document for ${locale}`);
    return document.strings;
  }

  it('T10: every locale carries exactly the required key set, non-blank and with no unknown key', () => {
    const required = new Set(REQUIRED_KEYS);
    fc.assert(
      fc.property(localeArb, (locale) => {
        const strings = stringsOf(locale);
        expect(new Set(Object.keys(strings)), locale).toEqual(required);
        expect(missingKeys(strings), locale).toEqual([]);
        expect(unknownKeys(strings), locale).toEqual([]);
      }),
      { numRuns: 50 },
    );
    // Set equality against the reference is the parity claim itself: no locale is a subset.
    expect(new Set(Object.keys(stringsOf(DEFAULT_LOCALE)))).toEqual(required);
  });

  it('T10: missingKeys reports exactly the required keys a document has dropped, and nothing else', () => {
    const complete = stringsOf(DEFAULT_LOCALE);
    fc.assert(
      fc.property(fc.subarray([...REQUIRED_KEYS], { minLength: 1, maxLength: 8 }), (dropped) => {
        const partial: Record<string, string> = { ...complete };
        for (const key of dropped) delete partial[key];
        expect(new Set(missingKeys(partial))).toEqual(new Set(dropped));
      }),
      { numRuns: 100 },
    );
  });
});

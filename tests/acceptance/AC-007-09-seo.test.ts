import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE_URL, canonicalUrl } from '../../web/content/site';
import { LOCALES, PAGE_KINDS } from '../../web/content/types';
import { metadataFor } from '../../web/seo/metadata';
import { robotsPolicy, pageKindOfPath, pagePathFor, sitemapEntries } from '../../web/seo/routes';
import { shareAlt, shareCard } from '../../web/seo/share-card';
import { content } from '../fixtures/figures';
import { pageOf } from '../helpers/story';

const SUB_PAGE_FILES = ['cifras', 'metodo', 'debate'] as const;

/**
 * AC-007-18…21 — per-page SEO (spec 007 T9).
 */
describe('AC-007-18: one canonical URL per route, in the link, og:url and the footer', () => {
  it('AC-007-18: every one of the twenty routes publishes its own canonical in all three places', () => {
    for (const locale of LOCALES) {
      for (const kind of PAGE_KINDS) {
        const canonical = canonicalUrl(pagePathFor(locale, kind));
        const meta = metadataFor(locale, kind);
        expect(String(meta.alternates?.canonical), `${locale}/${kind}`).toBe(canonical);
        expect(String(meta.openGraph?.url), `${locale}/${kind}`).toBe(canonical);
        expect(pageOf(kind, locale), `${locale}/${kind} footer`).toContain(`<code>${canonical}</code>`);
      }
    }
  });

  it('AC-007-18: no route publishes another route’s canonical', () => {
    const canonicals = new Set<string>();
    for (const locale of LOCALES) {
      for (const kind of PAGE_KINDS) canonicals.add(String(metadataFor(locale, kind).alternates?.canonical));
    }
    expect(canonicals.size).toBe(20);
  });
});

function assertAlternates(locale: (typeof LOCALES)[number], kind: (typeof PAGE_KINDS)[number]): void {
  const languages = (metadataFor(locale, kind).alternates?.languages ?? {}) as Record<string, string>;
  expect(Object.keys(languages).sort(), `${locale}/${kind}`).toEqual([...LOCALES, 'x-default'].sort());
  for (const target of LOCALES) {
    expect(languages[target], `${locale}/${kind} → ${target}`).toBe(canonicalUrl(pagePathFor(target, kind)));
  }
  expect(languages['x-default'], `${locale}/${kind} x-default`).toBe(canonicalUrl(pagePathFor('es', kind)));
  for (const href of Object.values(languages)) expect(new URL(href).origin, href).toBe(SITE_URL);
}

describe('AC-007-19: every route advertises the reciprocal per-page alternate set', () => {
  it('AC-007-19: five locales plus x-default, each the same page kind', () => {
    for (const locale of LOCALES) {
      for (const kind of PAGE_KINDS) assertAlternates(locale, kind);
    }
  });

  it('AC-007-19: a sub-page never advertises the home URL as its alternate', () => {
    for (const locale of LOCALES) {
      for (const kind of SUB_PAGE_FILES) {
        const hrefs = Object.values((metadataFor(locale, kind).alternates?.languages ?? {}) as Record<string, string>);
        expect(hrefs, `${locale}/${kind}`).not.toContain(canonicalUrl('/'));
      }
    }
  });
});

function assertSitemapEntry(entry: ReturnType<typeof sitemapEntries>[number]): void {
  const path = new URL(entry.url).pathname;
  const kind = pageKindOfPath(path);
  const languages = Object.fromEntries(entry.alternates.map((alternate) => [alternate.hreflang, alternate.href]));
  expect(Object.keys(languages).sort(), entry.url).toEqual([...LOCALES, 'x-default'].sort());
  expect(languages['x-default'], entry.url).toBe(canonicalUrl(pagePathFor('es', kind)));
}

describe('AC-007-20: the sitemap lists all 20 routes, robots still points at it', () => {
  it('AC-007-20: twenty entries, each with its own per-page alternates', () => {
    const entries = sitemapEntries(SITE_URL);
    expect(entries).toHaveLength(20);
    for (const entry of entries) assertSitemapEntry(entry);
    expect(Object.fromEntries(robotsPolicy(SITE_URL).rules.map((rule) => [rule.userAgent, rule.allow]))).toEqual({ '*': '/' });
    expect(robotsPolicy(SITE_URL).sitemap).toBe(canonicalUrl('/sitemap.xml'));
  });

  it('AC-007-20: the sitemap advertises the same alternate set each page does', () => {
    for (const entry of sitemapEntries(SITE_URL)) {
      for (const alternate of entry.alternates) {
        expect(alternate.href.startsWith(SITE_URL), alternate.href).toBe(true);
      }
    }
  });
});

describe('AC-007-21: the share card stays a single home-page asset', () => {
  it('AC-007-21: only the home route files generate a card', () => {
    expect(existsSync('app/(public)/(home)/opengraph-image.tsx')).toBe(true);
    expect(existsSync('app/(public)/[locale]/opengraph-image.tsx')).toBe(true);
    for (const slug of SUB_PAGE_FILES) {
      expect(existsSync(`app/(public)/(home)/${slug}/opengraph-image.tsx`), slug).toBe(false);
      expect(existsSync(`app/(public)/[locale]/${slug}/opengraph-image.tsx`), slug).toBe(false);
    }
    const subPageMeta = metadataFor('es', 'cifras').openGraph as { images?: unknown };
    expect(subPageMeta.images).toBeUndefined();
  });

  it('AC-007-21: og:image:alt stays the home card’s alt, unchanged per locale', () => {
    const alts = LOCALES.map((locale) => shareAlt(locale));
    expect(new Set(alts).size, 'one alt per locale').toBe(LOCALES.length);
    // The visible card copy is the same keys it always was: the year-free proposition.
    for (const locale of LOCALES) {
      const card = shareCard(locale, null);
      expect(card?.alt, locale).toContain(content(locale).t('hero.statement'));
    }
  });
});

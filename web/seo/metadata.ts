import type { Metadata } from 'next';
import { BRAND } from '../brand/generated';
import { contentRegistry } from '../content/registry';
import { formatYear } from '../content/format';
import { SITE_URL, canonicalUrl } from '../content/site';
import { alternateLinks, publicPathFor } from './routes';
import { committedThresholdYear } from './threshold-year';

/**
 * Page metadata for one locale (T19, R4 level 3). The `<title>` and `og:title` take a scope
 * suffix from the country record, so a shared link says which country the figures cover. No
 * metric, no day count and no date reaches either string: a social card is cached for weeks, and
 * a number there becomes a false claim the first time the figure changes (D7). Spec 003 T4
 * amends D7 for one value only: the derived threshold year, which stays true until the projection
 * is revised. Without a threshold year the strings are year-free, with no substitute.
 */
export interface PageMetadata {
  title: string;
  ogTitle: string;
  description: string;
}

function scopedTitle(countryName: string): string {
  return countryName === '' ? BRAND.wordmark : `${BRAND.wordmark} · ${countryName}`;
}

export function pageMetadata(locale: string, thresholdYear: number | null = committedThresholdYear()): PageMetadata {
  const entry = contentRegistry.get('ES', locale);
  if (!entry.ok) return { title: BRAND.wordmark, ogTitle: BRAND.wordmark, description: '' };
  const scoped = scopedTitle(entry.content.country.name);
  if (thresholdYear === null) return { title: scoped, ogTitle: scoped, description: entry.content.t('hero.sub') };
  // Spec 003 T4: the derived threshold year leads the preview; the scope suffix stays last.
  const year = formatYear(thresholdYear, entry.content.locale);
  const title = `${entry.content.t('meta.title', { year })} · ${scoped}`;
  return { title, ogTitle: title, description: entry.content.t('meta.description', { year }) };
}

/**
 * The reciprocal `hreflang` map every locale route publishes: the five locales plus
 * `x-default` → Spanish (`15-design.md` §i18n). It is the same list the sitemap advertises, from
 * the same helper, so a page and the sitemap cannot tell a crawler two different stories about
 * which URLs are translations of each other. Values are absolute, from `canonicalUrl`.
 */
export function languageAlternates(baseUrl: string = SITE_URL): Record<string, string> {
  return Object.fromEntries(alternateLinks(baseUrl).map((alternate) => [alternate.hreflang, alternate.href]));
}

/**
 * One locale's page metadata. `<link rel="canonical">` and `og:url` are the same absolute URL,
 * and both come from `canonicalUrl(publicPathFor(locale))` — the footer's citation line calls the
 * same pair, so the three cannot disagree about what this page's URL is.
 *
 * `alternates.languages` is what Next renders as `<link rel="alternate" hreflang="…">`. Every
 * route carries the full set, not just its own entry: a translation group is declared on all of
 * its members or a crawler cannot see the group.
 */
export function metadataFor(locale: string): Metadata {
  const meta = pageMetadata(locale);
  const canonical = canonicalUrl(publicPathFor(locale));
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, languages: languageAlternates() },
    openGraph: { title: meta.ogTitle, description: meta.description, url: canonical },
  };
}

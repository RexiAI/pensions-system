import type { Metadata } from 'next';
import { BRAND } from '../brand/generated';
import { PAGE_NAME_KEYS, PAGE_TITLE_KEYS } from '../content/keys';
import type { LocaleKey } from '../content/keys';
import { contentRegistry } from '../content/registry';
import { formatYear } from '../content/format';
import { SITE_URL, canonicalUrl } from '../content/site';
import type { CountryLocaleContent, PageKind } from '../content/types';
import { alternateLinks, pagePathFor } from './routes';
import { committedThresholdYear } from './threshold-year';

/**
 * Page metadata for one locale and one page kind (spec 007 T8/T9). The `<title>` and `og:title`
 * take a scope suffix from the country record, so a shared link says which country the figures
 * cover. The promise framing and its `{year}` interpolation come from the content model; the
 * suffix (" · wordmark · country") is unchanged from spec 003, so the title keeps its shape.
 */
export interface PageMetadata {
  title: string;
  ogTitle: string;
  description: string;
}

function scopedTitle(countryName: string): string {
  return countryName === '' ? BRAND.wordmark : `${BRAND.wordmark} · ${countryName}`;
}

/**
 * The leading string before the scope suffix. Historia carries the promise framing; a sub-page
 * carries its own page name and the derived year. Without a committed year Historia falls back
 * to the year-free suffix alone and a sub-page to its name alone — neither invents a year.
 */
function leadingTitle(content: CountryLocaleContent, thresholdYear: number | null, kind: PageKind): string {
  const year = thresholdYear === null ? null : formatYear(thresholdYear, content.locale);
  const key: LocaleKey = PAGE_TITLE_KEYS[kind];
  if (year === null) return kind === 'historia' ? '' : content.t(PAGE_NAME_KEYS[kind]);
  return content.t(key, { year });
}

/**
 * The `description` a page publishes: the promise sentence when no threshold year is committed,
 * the year-bearing one when one is. One rule for every page kind and every return path below, so
 * a page cannot describe itself two ways depending on whether it carries a leading title.
 */
function descriptionFor(content: CountryLocaleContent, thresholdYear: number | null): string {
  if (thresholdYear === null) return content.t('hero.sub');
  return content.t('meta.description', { year: formatYear(thresholdYear, content.locale) });
}

export function pageMetadata(
  locale: string,
  thresholdYear: number | null = committedThresholdYear(),
  kind: PageKind = 'historia',
): PageMetadata {
  const entry = contentRegistry.get('ES', locale);
  if (!entry.ok) return { title: BRAND.wordmark, ogTitle: BRAND.wordmark, description: '' };
  const scoped = scopedTitle(entry.content.country.name);
  const leading = leadingTitle(entry.content, thresholdYear, kind);
  const description = descriptionFor(entry.content, thresholdYear);
  if (leading === '') return { title: scoped, ogTitle: scoped, description };
  const title = `${leading} · ${scoped}`;
  return { title, ogTitle: title, description };
}

/**
 * The reciprocal `hreflang` map one page kind publishes: the same page in the five locales plus
 * `x-default` → the Spanish page of that kind. It is the same list the sitemap advertises, from
 * the same helper, so a page and the sitemap cannot tell a crawler two different stories about
 * which URLs are translations of each other. Values are absolute, from `canonicalUrl`.
 */
export function languageAlternates(baseUrl: string = SITE_URL, kind: PageKind = 'historia'): Record<string, string> {
  return Object.fromEntries(alternateLinks(baseUrl, kind).map((alternate) => [alternate.hreflang, alternate.href]));
}

/**
 * One page's metadata. `<link rel="canonical">` and `og:url` are the same absolute URL, and both
 * come from `canonicalUrl(pagePathFor(locale, kind))` — the footer's citation line calls the same
 * pair, so the three cannot disagree about what this page's URL is.
 *
 * `alternates.languages` is what Next renders as `<link rel="alternate" hreflang="…">`. Every
 * route carries the full set for its own page kind, never the home URL for a sub-page.
 */
export function metadataFor(locale: string, kind: PageKind = 'historia'): Metadata {
  const meta = pageMetadata(locale, committedThresholdYear(), kind);
  const canonical = canonicalUrl(pagePathFor(locale, kind));
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical, languages: languageAlternates(SITE_URL, kind) },
    openGraph: { title: meta.ogTitle, description: meta.description, url: canonical },
  };
}

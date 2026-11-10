import type { Metadata } from 'next';
import { PAGE_NAME_KEYS } from '../content/keys';
import { contentRegistry } from '../content/registry';
import { formatYear } from '../content/format';
import { SITE_URL, canonicalUrl } from '../content/site';
import type { CountryLocaleContent, PageKind } from '../content/types';
import { alternateLinks, pagePathFor } from './routes';
import { committedThresholdYear } from './threshold-year';

/**
 * Page metadata for one locale and one page kind (spec 007 T8/T9, revision 2). The tab title is
 * the short claim on the home page and the page name plus the mechanism kicker on a sub-page:
 * no year, no wordmark and no country, so the same claim reads the same in a shared tab.
 * The `description` and `og:description` keep the derived year.
 */
export interface PageMetadata {
  title: string;
  ogTitle: string;
  description: string;
}

/**
 * The title a page publishes. Historia carries its short claim from `meta.title`; a sub-page
 * carries its own page name and the mechanism kicker, composed here so the two translations
 * cannot drift into a hand-typed concatenation.
 */
function titleFor(content: CountryLocaleContent, kind: PageKind): string {
  if (kind === 'historia') return content.t('meta.title');
  return `${content.t(PAGE_NAME_KEYS[kind])} · ${content.t('kicker.mechanism')}`;
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
  if (!entry.ok) return { title: '', ogTitle: '', description: '' };
  const title = titleFor(entry.content, kind);
  const description = descriptionFor(entry.content, thresholdYear);
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
 * come from `canonicalUrl(pagePathFor(locale, kind))`, so the two cannot disagree about what this
 * page's URL is.
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

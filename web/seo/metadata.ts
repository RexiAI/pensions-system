import type { Metadata } from 'next';
import { BRAND } from '../brand/generated';
import { contentRegistry } from '../content/registry';
import { canonicalUrl } from '../content/site';
import { publicPathFor } from './routes';

/**
 * Page metadata for one locale (T19, R4 level 3). The `<title>` and `og:title` take a scope
 * suffix from the country record, so a shared link says which country the figures cover. No
 * metric, no number and no date reaches either string: a social card is cached for weeks, and a
 * number there becomes a false claim the first time the figure changes (D7).
 */
export interface PageMetadata {
  title: string;
  ogTitle: string;
  description: string;
}

export function pageMetadata(locale: string): PageMetadata {
  const entry = contentRegistry.get('ES', locale);
  const countryName = entry.ok ? entry.content.country.name : '';
  const title = countryName === '' ? BRAND.wordmark : `${BRAND.wordmark} · ${countryName}`;
  const description = entry.ok ? entry.content.t('hero.sub') : '';
  return { title, ogTitle: title, description };
}

/**
 * One locale's page metadata. `<link rel="canonical">` and `og:url` are the same absolute URL,
 * and both come from `canonicalUrl(publicPathFor(locale))` — the footer's citation line calls the
 * same pair, so the three cannot disagree about what this page's URL is.
 */
export function metadataFor(locale: string): Metadata {
  const meta = pageMetadata(locale);
  const canonical = canonicalUrl(publicPathFor(locale));
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical },
    openGraph: { title: meta.ogTitle, description: meta.description, url: canonical },
  };
}

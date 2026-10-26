import type { Metadata } from 'next';
import { BRAND } from '../brand/generated';
import { contentRegistry } from '../content/registry';

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

export function metadataFor(locale: string): Metadata {
  const meta = pageMetadata(locale);
  return {
    title: meta.title,
    description: meta.description,
    openGraph: { title: meta.ogTitle, description: meta.description },
  };
}

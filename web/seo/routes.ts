import { DEFAULT_LOCALE, LOCALES } from '../content/types';

/**
 * The sitemap is generated from this explicit public manifest, never from filesystem
 * discovery, so adding an admin route cannot leak it into the index (design §noindex).
 */
export const PUBLIC_ROUTE_PATHS = ['/', '/en', '/fr', '/de', '/it'] as const;

export const ADMIN_ROUTE_PREFIX = '/admin';

const HREFLANG: Readonly<Record<string, string>> = {
  es: 'es',
  en: 'en',
  fr: 'fr',
  de: 'de',
  it: 'it',
};

export interface SitemapAlternate {
  hreflang: string;
  href: string;
}

export interface SitemapEntry {
  url: string;
  alternates: SitemapAlternate[];
  changeFrequency: 'daily';
  priority: number;
}

function pathForLocale(locale: string): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
}

function absolute(baseUrl: string, path: string): string {
  return new URL(path, baseUrl).toString();
}

export function sitemapEntries(baseUrl: string): SitemapEntry[] {
  const alternates: SitemapAlternate[] = [
    ...LOCALES.map((locale) => ({ hreflang: HREFLANG[locale] ?? locale, href: absolute(baseUrl, pathForLocale(locale)) })),
    { hreflang: 'x-default', href: absolute(baseUrl, '/') },
  ];
  return PUBLIC_ROUTE_PATHS.map((path) => ({
    url: absolute(baseUrl, path),
    alternates,
    changeFrequency: 'daily' as const,
    priority: path === '/' ? 1 : 0.8,
  }));
}

export function isPublicRoute(pathname: string): boolean {
  return (PUBLIC_ROUTE_PATHS as readonly string[]).includes(pathname);
}

export function containsAdminPath(urls: readonly string[]): boolean {
  return urls.some((url) => url.includes(ADMIN_ROUTE_PREFIX));
}

/**
 * `robots.txt` deliberately carries no `Disallow: /admin`: a disallow would stop crawlers
 * fetching the page and therefore from seeing its `noindex`, while still advertising the
 * path to anyone who reads the file.
 */
export function robotsPolicy(baseUrl: string): {
  rules: Array<{ userAgent: string; allow: string }>;
  sitemap: string;
} {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absolute(baseUrl, '/sitemap.xml'),
  };
}

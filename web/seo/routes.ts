import { DEFAULT_LOCALE, LOCALES, PAGE_KINDS, isLocale } from '../content/types';
import type { PageKind } from '../content/types';
import { canonicalUrl } from '../content/site';

/**
 * The sitemap is generated from this explicit public manifest, never from filesystem
 * discovery, so adding an admin route cannot leak it into the index (design §noindex).
 *
 * Spec 007: the public surface is four pages × five locales. The path is spelled in exactly one
 * place — `pagePathFor` — and the manifest, the canonical link, the `hreflang` set and the
 * sitemap all derive from it, so they cannot disagree about a route's URL.
 */
const PAGE_SLUGS: Readonly<Record<PageKind, string>> = {
  historia: '',
  cifras: 'cifras',
  metodo: 'metodo',
  debate: 'debate',
};

export const ADMIN_ROUTE_PREFIX = '/admin';

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

function localePrefix(locale: string): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/**
 * One page kind in one locale: the single place a path is spelled. Historia is the locale root
 * (`/` for `es`, `/{locale}` otherwise); the three sub-pages add their Spanish slug in every
 * locale, so the `hreflang` group has one shape.
 */
export function pagePathFor(locale: string, kind: PageKind): string {
  const prefix = localePrefix(locale);
  const slug = PAGE_SLUGS[kind];
  if (slug === '') return prefix === '' ? '/' : prefix;
  return `${prefix}/${slug}`;
}

/** The Historia path for a locale — the route every locale link and the wordmark use. */
export function publicPathFor(locale: string): string {
  return pagePathFor(locale, 'historia');
}

/**
 * The page kind a public path names — the inverse of `pagePathFor`, and the only other place a
 * slug is read. Both directions resolve from `PAGE_SLUGS`, so a page cannot be spelled one way
 * outbound and read another way inbound. An unrecognised or unknown path is Historia's root shape.
 */
export function pageKindOfPath(path: string): PageKind {
  const segments = path.split('/').filter(Boolean);
  const rest = segments[0] !== undefined && isLocale(segments[0]) ? segments.slice(1) : segments;
  const slug = rest[0];
  return PAGE_KINDS.find((kind) => PAGE_SLUGS[kind] === slug) ?? 'historia';
}

/** The twenty public paths: four page kinds × five locales, declared by hand. */
export const PUBLIC_ROUTE_PATHS: readonly string[] = PAGE_KINDS.flatMap((kind) =>
  LOCALES.map((locale) => pagePathFor(locale, kind)),
);

/**
 * `canonicalUrl` bound to a base: the single function that turns a path into the absolute URL the
 * site publishes, so the sitemap's `<loc>`, its `hreflang` hrefs and the page's own alternate
 * links cannot spell the same URL three ways.
 */
function absolute(baseUrl: string, path: string): string {
  return canonicalUrl(path, baseUrl);
}

/**
 * The reciprocal alternate set one page kind carries: the same page in the five locales plus
 * `x-default`, which names the default locale's page of that kind. The sitemap entry's
 * `alternates`, the page's `alternates.languages` and the served `<link rel="alternate">` set
 * all come from here — a translation group is one claim, and two surfaces disagreeing about it
 * is a crawler reading two different claims.
 */
export function alternateLinks(baseUrl: string, kind: PageKind = 'historia'): SitemapAlternate[] {
  return [
    ...LOCALES.map((locale) => ({
      hreflang: locale,
      href: absolute(baseUrl, pagePathFor(locale, kind)),
    })),
    { hreflang: 'x-default', href: absolute(baseUrl, pagePathFor(DEFAULT_LOCALE, kind)) },
  ];
}

export function sitemapEntries(baseUrl: string): SitemapEntry[] {
  return PAGE_KINDS.flatMap((kind) =>
    LOCALES.map((locale) => {
      const path = pagePathFor(locale, kind);
      return {
        url: absolute(baseUrl, path),
        alternates: alternateLinks(baseUrl, kind),
        changeFrequency: 'daily' as const,
        priority: path === '/' ? 1 : 0.8,
      };
    }),
  );
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTE_PATHS.includes(pathname);
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

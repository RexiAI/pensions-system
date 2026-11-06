import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { StoryStrip } from '../../web/components/public/StoryStrip';
import { SITE_URL, canonicalUrl } from '../../web/content/site';
import { LOCALES } from '../../web/content/types';
import { metadataFor } from '../../web/seo/metadata';
import { publicPathFor, sitemapEntries } from '../../web/seo/routes';
import { SHARE_NETWORKS, shareHref } from '../../web/share/links';
import { content, renderComponent } from '../fixtures/figures';
import { countdownValue } from '../fixtures/series';
import { BROWSER_READY, startServedBrowser } from '../helpers/served-browser';
import type { ServedBrowser } from '../helpers/served-browser';
import { decodeText } from '../helpers/render-document';

/**
 * AC-006-34, AC-006-35 — the share link is canonical (Task 13).
 *
 * The criterion may not be self-referential: comparing a control with the same constant that
 * builds it is how the wrong host shipped. AC-006-34 bounds the *shape* at build time (one origin,
 * no project alias); AC-006-35 checks the *equality* against the serving origin, on the live
 * deployment when `PRODUCTION_URL` is set.
 */
const SITE_SOURCE = readFileSync('web/content/site.ts', 'utf8');

function shareRegion(locale = 'es'): string {
  return renderComponent(StoryStrip, { content: content(locale), countdown: countdownValue() });
}

/** The page URL embedded in a share href: the `url` parameter, or the text's last token. */
function embedded(href: string): string {
  const url = new URL(decodeText(href));
  return url.searchParams.get('url') ?? (url.searchParams.get('text') ?? '').split(' ').at(-1) ?? '';
}

/** Every absolute URL the route publishes: canonical, og:url and the alternates. */
function canonicalOf(locale: (typeof LOCALES)[number]): string {
  return String(metadataFor(locale).alternates?.canonical);
}

function ogOf(locale: (typeof LOCALES)[number]): string {
  return String(metadataFor(locale).openGraph?.url);
}

function alternatesOf(locale: (typeof LOCALES)[number]): string[] {
  return Object.values((metadataFor(locale).alternates?.languages ?? {}) as Record<string, string>);
}

function routeUrls(locale: (typeof LOCALES)[number]): { canonical: string; og: string; alternates: string[] } {
  return { canonical: canonicalOf(locale), og: ogOf(locale), alternates: alternatesOf(locale) };
}

/** The http(s) hrefs of a share region. */
function shareHrefs(html: string): string[] {
  return [...html.matchAll(/<a [^>]*href="([^"]*)"/g)]
    .map((match) => match[1] ?? '')
    .filter((href) => href.startsWith('http'));
}

describe('AC-006-34: one origin, and it is not a project alias', () => {
  it('AC-006-34: the committed default origin contains no project-alias segment', () => {
    expect(SITE_URL).not.toContain('-projects.vercel.app');
    expect(new URL(SITE_URL).origin).toBe(SITE_URL);
    expect(SITE_SOURCE).not.toContain('-projects.vercel.app');
    // `SITE_URL` still overrides it when the deployment sets it.
    expect(SITE_SOURCE).toContain('process.env.SITE_URL');
  });

  it('AC-006-34: the canonical, og:url, hreflang, sitemap and share controls carry that one origin', () => {
    for (const locale of LOCALES) {
      const url = canonicalUrl(publicPathFor(locale));
      const route = routeUrls(locale);
      expect(route.canonical, `${locale} canonical`).toBe(url);
      expect(route.og, `${locale} og:url`).toBe(url);
      for (const href of [route.canonical, route.og, ...route.alternates]) {
        expect(new URL(href).origin, `${locale} metadata`).toBe(SITE_URL);
      }
      for (const href of shareHrefs(shareRegion(locale))) {
        expect(new URL(embedded(href)).origin, `${locale} share`).toBe(SITE_URL);
      }
    }
    for (const entry of sitemapEntries(SITE_URL)) {
      expect(new URL(entry.url).origin, entry.url).toBe(SITE_URL);
    }
  });

  it('AC-006-34: every control shares one origin, with no tracking parameter', () => {
    for (const locale of LOCALES) {
      const url = canonicalUrl(publicPathFor(locale));
      for (const network of SHARE_NETWORKS) {
        const href = shareHref(network, `text ${url}`, url);
        expect(embedded(href), `${locale} ${network}`).toBe(url);
        expect(href).not.toMatch(/utm_|fbclid|gclid/);
      }
    }
  });
});

describe.skipIf(!BROWSER_READY)('the share hrefs carry one origin on the served page', () => {
  let served: ServedBrowser;

  beforeAll(async () => {
    served = await startServedBrowser();
  });

  afterAll(async () => {
    await served?.close();
  });

  it('AC-006-35: every share control embeds one origin, and it is the canonical’s', async () => {
    const scene = await served.measure<{ canonical: string | null; embedded: string[] }>(
      'es',
      { width: 1440, height: 900 },
      `(() => {
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
        const urls = [...document.querySelectorAll('.share a[href]')].map((link) => {
          const url = new URL(link.getAttribute('href'), location.href);
          return url.searchParams.get('url') ?? (url.searchParams.get('text') ?? '').split(' ').at(-1) ?? '';
        });
        return { canonical, embedded: urls };
      })()`,
    );
    expect(scene.canonical, 'a canonical link is served').not.toBeNull();
    const canonicalOrigin = new URL(scene.canonical as string).origin;
    expect(canonicalOrigin).toBe(SITE_URL);
    expect(scene.embedded.length, 'four share controls').toBe(4);
    for (const url of scene.embedded) {
      expect(new URL(url).origin, url).toBe(canonicalOrigin);
    }
    // The live equality runs when a production URL is supplied to the suite.
    const production = process.env.PRODUCTION_URL;
    if (production !== undefined && production.trim() !== '') {
      const response = await fetch(production);
      const html = await response.text();
      const servedCanonical = /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/.exec(html)?.[1] ?? '';
      expect(new URL(servedCanonical).origin, 'the production origin serves the shared origin').toBe(
        new URL(production).origin,
      );
    }
  }, 120_000);
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  BUILD_PRESENT,
  htmlLang,
  metaContent,
  routePath,
  startServedApp,
  type ServedApp,
} from '../helpers/served-app';
import { LOCALES } from '../../web/content/types';
import { CONTACT_EMAIL, canonicalUrl } from '../../web/content/site';
import { publicPathFor } from '../../web/seo/routes';
import { shareAlt } from '../../web/seo/share-card';

/**
 * The `<link rel="alternate" hreflang="…">` set the document actually carries, as a plain map.
 * Attribute order is not guaranteed by the renderer, so each `<link>` tag is matched whole and
 * then read for its `hreflang` and `href` — a `rel="alternate"` link without a `hreflang` (an
 * RSS feed, for instance) is not part of this set and is skipped.
 */
function localeAlternates(html: string): Record<string, string> {
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map((match) => match[0]);
  return Object.fromEntries(
    links.flatMap((link) => {
      if (!/rel="alternate"/.test(link)) return [];
      const hreflang = /\shreflang="([^"]*)"/i.exec(link)?.[1];
      const href = /\shref="([^"]*)"/i.exec(link)?.[1];
      return hreflang && href ? [[hreflang, href.replaceAll('&amp;', '&')]] : [];
    }),
  );
}

/**
 * The defects this file pins down were invisible from the source tree: each one needed the
 * served bytes. Every assertion here is against `next start` on a real build.
 *
 * `BUILD_PRESENT` guards the file because `next start` needs `.next`, and `npm test` does not
 * require a build. The same behaviours are asserted without a build in `document-lang.test.ts`
 * (the rendered document, the manifest's icon paths, the per-locale alt resolver), so this file
 * is never the only guard on its defect — see that file's header.
 */
describe.skipIf(!BUILD_PRESENT)('the served document', () => {
  let app: ServedApp;

  beforeAll(async () => {
    app = await startServedApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('serves each route with its own <html lang>', async () => {
    const observed: Record<string, string | null> = {};
    for (const locale of LOCALES) {
      const response = await fetch(`${app.baseUrl}${routePath(locale)}`);
      expect(response.status, `${routePath(locale)} must be 200`).toBe(200);
      observed[locale] = htmlLang(await response.text());
    }
    expect(observed).toEqual({ es: 'es', en: 'en', fr: 'fr', de: 'de', it: 'it' });
  });

  it('still answers an unknown locale with a 404', async () => {
    const response = await fetch(`${app.baseUrl}/xx`);
    expect(response.status).toBe(404);
  });

  it('serves both manifest icons', async () => {
    for (const icon of ['/icon-192.png', '/icon-512.png']) {
      const response = await fetch(`${app.baseUrl}${icon}`);
      expect(response.status, `${icon} is declared by the manifest`).toBe(200);
      expect(response.headers.get('content-type'), icon).toBe('image/png');
    }
  });

  it('publishes one canonical URL per route, in the link, og:url and the footer', async () => {
    // The three places that name this page's URL, read from the bytes a reader receives: a
    // metadata helper that is right in isolation but never wired into the route would pass every
    // other test in this file and still ship a page with no canonical.
    for (const locale of LOCALES) {
      const canonical = canonicalUrl(publicPathFor(locale));
      const html = await (await fetch(`${app.baseUrl}${routePath(locale)}`)).text();

      const link = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
      const ogUrl = metaContent(html, 'og:url');
      expect(link, `${locale}: <link rel="canonical">`).toBe(canonical);
      expect(ogUrl, `${locale}: og:url`).toBe(canonical);
      // The footer's citation line carries the same absolute URL — never a bare path.
      expect(html, `${locale}: footer line`).toContain(canonical);
      expect(html, `${locale}: no reserved-domain host`).not.toMatch(/pensiones\.example/);
      expect(html, `${locale}: a real inbox`).toContain(`mailto:${CONTACT_EMAIL}`);
    }
  });

  it('publishes the locale alternate set in every served <head>', async () => {
    // AC-001-52: the metadata helper was correct in isolation before this existed and the page
    // still shipped without alternates — `generateMetadata` is what decides whether a value the
    // helper returns ever reaches the `<head>`. Read from the bytes, on the two ends of the set:
    // the default locale at `/` and a prefixed one at `/en`.
    const expected: Record<string, string> = {
      es: canonicalUrl('/'),
      en: canonicalUrl('/en'),
      fr: canonicalUrl('/fr'),
      de: canonicalUrl('/de'),
      it: canonicalUrl('/it'),
      'x-default': canonicalUrl('/'),
    };
    for (const locale of ['es', 'en']) {
      const html = await (await fetch(`${app.baseUrl}${routePath(locale)}`)).text();
      const alternates = localeAlternates(html);
      expect(alternates, `${routePath(locale)}: served alternates`).toEqual(expected);
    }
  });

  it('announces the share card in the route s own language', async () => {    const observed: Record<string, string | null> = {};
    const cardStatus: Record<string, number> = {};
    for (const locale of LOCALES) {
      const html = await (await fetch(`${app.baseUrl}${routePath(locale)}`)).text();
      observed[locale] = metaContent(html, 'og:image:alt');

      const advertised = metaContent(html, 'og:image');
      expect(advertised, `${locale} must advertise a card`).toBeTruthy();
      const cardUrl = new URL(advertised ?? 'http://invalid.example/');
      const card = await fetch(`${app.baseUrl}${cardUrl.pathname}${cardUrl.search}`);
      cardStatus[locale] = card.status;
    }

    expect(observed).toEqual(
      Object.fromEntries(LOCALES.map((locale) => [locale, shareAlt(locale)])),
    );
    expect(new Set(Object.values(observed)).size, 'one alt per locale').toBe(LOCALES.length);
    expect(cardStatus).toEqual({ es: 200, en: 200, fr: 200, de: 200, it: 200 });
  });
});

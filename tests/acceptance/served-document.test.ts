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
import { shareAlt } from '../../web/seo/share-card';

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

  it('announces the share card in the route s own language', async () => {
    const observed: Record<string, string | null> = {};
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

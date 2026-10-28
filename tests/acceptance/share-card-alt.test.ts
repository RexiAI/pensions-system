import { describe, expect, it } from 'vitest';
import * as shareCardRoute from '../../app/(public)/[locale]/opengraph-image';
import { LOCALES } from '../../web/content/types';
import { shareAlt, shareCard } from '../../web/seo/share-card';

/**
 * `og:image:alt` per locale on the `/[locale]` routes.
 *
 * The defect this pins down: the card image and `og:title` were per-locale, but the alt text
 * came from this route's `alt` export — one string for the whole route, hardcoded to the
 * default locale. A French link announced itself in Spanish.
 *
 * The mechanism: the metadata-file `alt` export is a single string for the route, so it cannot
 * vary by param. `generateImageMetadata` is the file-convention API that receives the route's
 * params, and its per-image `alt` is what Next writes into `og:image:alt` (and
 * `twitter:image:alt`). Verified end to end in `served-document.test.ts`.
 */
describe('share card alt text', () => {
  it('resolves the alt text per locale from the route params', async () => {
    const observed: Record<string, string> = {};
    for (const locale of LOCALES.filter((candidate) => candidate !== 'es')) {
      const [metadata] = await shareCardRoute.generateImageMetadata({
        params: Promise.resolve({ locale }),
      });
      observed[locale] = String(metadata?.alt);
    }

    expect(observed).toEqual({
      en: shareAlt('en'),
      fr: shareAlt('fr'),
      de: shareAlt('de'),
      it: shareAlt('it'),
    });
    expect(new Set(Object.values(observed)).size, 'one alt per locale').toBe(4);
    expect(Object.values(observed)).not.toContain(shareAlt('es'));
  });

  it('names the card image and its size for every locale', async () => {
    for (const locale of LOCALES.filter((candidate) => candidate !== 'es')) {
      const [metadata] = await shareCardRoute.generateImageMetadata({
        params: Promise.resolve({ locale }),
      });
      expect(metadata?.id, locale).toBeTruthy();
      expect(metadata?.size, locale).toEqual(shareCardRoute.size);
      expect(metadata?.contentType, locale).toBe('image/png');
    }
  });

  it('falls back to the base locale when no locale param is present', async () => {
    const [metadata] = await shareCardRoute.generateImageMetadata({
      params: Promise.resolve({}),
    });

    expect(metadata?.alt).toBe(shareAlt('es'));
  });

  it('exports no single-locale alt constant', () => {
    // `export const alt = ...` is the shape of the defect: one string for all four routes.
    expect(Object.keys(shareCardRoute)).not.toContain('alt');
  });

  it('still draws a distinct card per locale', async () => {
    const propositions = LOCALES.map((locale) => {
      const card = shareCard(locale);
      expect(card, locale).not.toBeNull();
      return card?.alt;
    });

    expect(new Set(propositions).size).toBe(LOCALES.length);
  });
});

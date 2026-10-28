import { describe, expect, it } from 'vitest';
import HomeRootLayout from '../../app/(public)/(home)/layout';
import LocaleRootLayout from '../../app/(public)/[locale]/layout';
import AdminBranchRootLayout from '../../app/(admin)/layout';
import { DEFAULT_LOCALE, LOCALES } from '../../web/content/types';
import { documentLang, elementFor, renderDocument } from '../helpers/render-document';
import { readSource } from '../helpers/source-scan';

/**
 * `<html lang>` per route.
 *
 * The defect this pins down: every route served `lang="es"`, because the document shell lived
 * in one `app/layout.tsx` above the `[locale]` segment — a layout that cannot see the segment
 * below it, so it could only ever emit one language. Four of five locales were mislabelled for
 * hyphenation, screen-reader pronunciation and search indexing.
 *
 * The fix restructured the tree into one root layout per locale branch. These assertions cover
 * the rendering layer (they need no build); `served-document.test.ts` makes the same claims
 * against the HTML `next start` actually returns.
 */
describe('<html lang> per route', () => {
  it('the base-locale route declares the base locale', async () => {
    const html = await renderDocument(elementFor(HomeRootLayout, { children: null }));

    expect(documentLang(html)).toBe(DEFAULT_LOCALE);
  });

  it('every localised route declares its own locale', async () => {
    const observed: Record<string, string | null> = {};
    for (const locale of LOCALES) {
      const html = await renderDocument(
        elementFor(LocaleRootLayout, { children: null, params: Promise.resolve({ locale }) }),
      );
      observed[locale] = documentLang(html);
    }

    expect(observed).toEqual({ es: 'es', en: 'en', fr: 'fr', de: 'de', it: 'it' });
  });

  it('takes the locale from the route segment, not from a constant', async () => {
    const render = (locale: string) =>
      renderDocument(
        elementFor(LocaleRootLayout, { children: null, params: Promise.resolve({ locale }) }),
      );
    const [french, german] = await Promise.all([render('fr'), render('de')]);

    expect(documentLang(french)).toBe('fr');
    expect(documentLang(german)).toBe('de');
    expect(documentLang(french)).not.toBe(documentLang(german));

    // A literal lang in this file is the regression itself: it is what collapsed five locales
    // into one before the split.
    const source = readSource('app/(public)/[locale]/layout.tsx');
    expect(source).toContain('lang={locale}');
    expect(source).not.toMatch(/lang="[a-z]{2}"/);
  });

  it('an unsupported locale renders no document at all', async () => {
    const attempt = renderDocument(
      elementFor(LocaleRootLayout, { children: null, params: Promise.resolve({ locale: 'pt' }) }),
    );

    // `notFound()` is the only path: a stranger locale must not fall back to another language.
    await expect(attempt).rejects.toThrow();
  });

  it('the admin branch declares the base locale', async () => {
    const html = await renderDocument(elementFor(AdminBranchRootLayout, { children: null }));

    expect(documentLang(html)).toBe(DEFAULT_LOCALE);
  });
});

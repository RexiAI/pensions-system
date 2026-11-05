import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { REQUIRED_KEYS, missingKeys, unknownKeys } from '../../web/content/keys';
import { COUNTRY_DOCUMENTS } from '../../web/content/registry';
import { LOCALES } from '../../web/content/types';
import type { LocaleDocument } from '../../web/content/types';
import { scanTopRegion } from '../../web/build/public-plain-language';
import { storyPage } from '../helpers/story';
import HomeRootLayout from '../../app/(public)/(home)/layout';
import LocaleRootLayout from '../../app/(public)/[locale]/layout';
import * as LocaleRoute from '../../app/(public)/[locale]/page';
import { DEFAULT_LOCALE } from '../../web/content/types';
import { documentLang, elementFor, renderDocument } from '../helpers/render-document';

/** AC-004-69…73 — locale parity for the new and retired keys (spec 004 T16). */
const DOCUMENTS = COUNTRY_DOCUMENTS as readonly LocaleDocument[];

function strings(locale: string): Record<string, string> {
  const found = DOCUMENTS.find((document) => document.locale === locale);
  if (!found) throw new Error(`no document for ${locale}`);
  return found.strings;
}

describe('AC-004-69: REQUIRED_KEYS matches what the page renders', () => {
  it('AC-004-69: every story key is listed, and the retired keys are not', () => {
    for (const key of [
      'steps.number.label',
      'steps.number.sentence',
      'steps.breakage.label',
      'steps.breakage.sentence',
      'steps.why.label',
      'steps.why.annotation.reference',
      'steps.why.annotation.measured',
      'steps.why.annotation.projected',
      'steps.distance.label',
      'steps.distance.sentence',
      'steps.meaning.label',
      'steps.meaning.sentence',
    ]) {
      expect(REQUIRED_KEYS as readonly string[], key).toContain(key);
    }
    for (const retired of ['pending.heading.one', 'pending.heading.other', 'figure.statusSummary', 'figure.statusLabel']) {
      expect(REQUIRED_KEYS as readonly string[], retired).not.toContain(retired);
    }
  });
});

describe('AC-004-70: all five locales carry exactly the required set', () => {
  it('AC-004-70: missingKeys and unknownKeys are empty for each locale', () => {
    for (const locale of LOCALES) {
      const doc = strings(locale);
      expect(missingKeys(doc), locale).toEqual([]);
      expect(unknownKeys(doc), locale).toEqual([]);
    }
    const reference = Object.keys(strings('es')).sort();
    for (const locale of LOCALES) expect(Object.keys(strings(locale)).sort(), locale).toEqual(reference);
  });
});

describe('AC-004-71: every new key is translated, not copied', () => {
  it('AC-004-71: non-blank in all five locales, and none is the Spanish value', () => {
    const NEW = REQUIRED_KEYS.filter((key) => key.startsWith('steps.')) as string[];
    for (const key of NEW) {
      for (const locale of LOCALES) {
        const value = strings(locale)[key] ?? '';
        expect(value.trim().length, `${locale}/${key}`).toBeGreaterThan(0);
        if (locale !== 'es') expect(value, `${locale}/${key} copies the Spanish value`).not.toBe(strings('es')[key]);
      }
    }
  });

  it('AC-004-71: every new value passes the plain-language gate', () => {
    for (const locale of LOCALES) {
      const page = storyPage(locale);
      expect(scanTopRegion(page, locale), locale).toEqual([]);
    }
  });
});

describe('AC-004-72: five routes, five languages', () => {
  it('AC-004-72: five routes render, each document’s <html lang> matches, and no locale 404s', async () => {
    // The document shell, not `storyPage`: a component render has no `<html>` element at all, which
    // is why the earlier version of this test could not fail. These are the layouts Next mounts
    // for the base route and for `/[locale]`, so the language is the one a served document carries.
    const home = await renderDocument(elementFor(HomeRootLayout, { children: null }));
    expect(documentLang(home), 'base route').toBe(DEFAULT_LOCALE);

    const observed: Record<string, string | null> = {};
    for (const locale of LOCALES.filter((entry) => entry !== DEFAULT_LOCALE)) {
      const html = await renderDocument(
        elementFor(LocaleRootLayout, { children: null, params: Promise.resolve({ locale }) }),
      );
      observed[locale] = documentLang(html);
    }
    expect(observed).toEqual({ en: 'en', fr: 'fr', de: 'de', it: 'it' });

    // One route per locale, and every one of them prerenders: the closed locale set is what the
    // route declares, so no published locale can fall through to a 404.
    const params = LocaleRoute.generateStaticParams().map((entry) => entry.locale);
    expect(params.sort()).toEqual(LOCALES.filter((entry) => entry !== DEFAULT_LOCALE).sort());
    expect([DEFAULT_LOCALE, ...params].sort()).toEqual([...LOCALES].sort());
  });
});

describe('AC-004-73: parity replaces the key freeze', () => {
  it('AC-004-73: the parity tests assert set equality, never a fixed count', () => {
    expect(REQUIRED_KEYS.length).toBe(new Set(REQUIRED_KEYS).size);
    const paritySources = ['tests/acceptance/locale-parity.test.ts'];
    for (const file of paritySources) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/toBe\(\s*\d{3}\s*\)/);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { BRAND } from '../../web/brand/generated';
import { PAGE_NAME_KEYS } from '../../web/content/keys';
import { findThesisTerms } from '../../web/content/registers';
import { LOCALES } from '../../web/content/types';
import { metadataFor, pageMetadata } from '../../web/seo/metadata';
import { committedThresholdYear } from '../../web/seo/threshold-year';
import { content } from '../fixtures/figures';
import { historiaPage } from '../helpers/story';

const YEAR = committedThresholdYear();
if (YEAR === null) throw new Error('the committed countdown has no threshold year');

const PROMISE: Record<string, string> = {
  es: 'Sistema de pensiones: la promesa que no se sostiene · {year}',
  en: 'Pension system: the promise that does not hold · {year}',
  de: 'Rentensystem: das Versprechen, das nicht trägt · {year}',
  fr: 'Système de retraites : la promesse qui ne tient pas · {year}',
  it: 'Sistema pensionistico: la promessa che non regge · {year}',
};

const KICKER: Record<string, string> = {
  es: 'Sistema de pensiones: esquema de reparto',
  en: 'Pension system: pay-as-you-go',
  de: 'Rentensystem: Umlageverfahren',
  fr: 'Système de retraites : répartition',
  it: 'Sistema pensionistico: ripartizione',
};

const BANNED_TERMS = [
  'estafa',
  'fraud',
  'fraude',
  'frode',
  'betrug',
  'pirámide',
  'piramide',
  'pyramid',
  'pyramide',
  'cadena',
  'chain letter',
  'kette',
];

/**
 * AC-007-14…17 — the promise title and the mechanism kicker (spec 007 T8).
 */
describe('AC-007-14: the home title is the promise framing, per locale, ending in the country', () => {
  it('AC-007-14: title and og:title start with the promise and end with the country', () => {
    for (const locale of LOCALES) {
      const promise = PROMISE[locale].replace('{year}', String(YEAR));
      const country = content(locale).country.name;
      const meta = pageMetadata(locale);
      expect(meta.title, locale).toContain(promise);
      expect(meta.title.endsWith(` · ${country}`), locale).toBe(true);
      const resolved = metadataFor(locale);
      expect(String(resolved.title), locale).toBe(meta.title);
      expect(String((resolved.openGraph as { title?: string }).title), locale).toBe(meta.ogTitle);
    }
  });
});

describe('AC-007-15: the kicker names the mechanism above the h1, exact per locale', () => {
  it('AC-007-15: the kicker is the locale’s exact string, above the h1 and not a heading', () => {
    for (const locale of LOCALES) {
      const html = historiaPage(locale);
      expect(html, locale).toContain(`<p class="hero__kicker">${KICKER[locale]}</p>`);
      const kicker = html.indexOf(`<p class="hero__kicker">${KICKER[locale]}</p>`);
      expect(kicker, locale).toBeLessThan(html.indexOf('<h1'));
      const kickerElement = html.slice(kicker, html.indexOf('</p>', kicker));
      expect(kickerElement, locale).not.toContain('<h1');
      expect(kickerElement, locale).not.toContain('<h2');
    }
  });
});

describe('AC-007-16: sub-page titles follow the same shape and end in the country', () => {
  it('AC-007-16: each sub-page title carries the page name, the year, the wordmark and the country', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      for (const kind of ['cifras', 'metodo', 'debate'] as const) {
        const meta = pageMetadata(locale, YEAR, kind);
        const pageName = local.t(PAGE_NAME_KEYS[kind]);
        expect(meta.title.toLowerCase(), `${locale}/${kind}`).toContain(pageName.toLowerCase());
        expect(meta.title, `${locale}/${kind}`).toContain(String(YEAR));
        expect(meta.title, `${locale}/${kind}`).toContain(BRAND.wordmark);
        expect(meta.title.endsWith(` · ${local.country.name}`), `${locale}/${kind}`).toBe(true);
      }
    }
  });
});

describe('AC-007-17: the promise title and kicker stay inside the thesis-vocabulary boundary', () => {
  it('AC-007-17: findThesisTerms returns no hit and no explicit term appears', () => {
    for (const locale of LOCALES) {
      const strings = [
        PROMISE[locale].replace('{year}', String(YEAR)),
        KICKER[locale],
        pageMetadata(locale).title,
        pageMetadata(locale, YEAR, 'cifras').title,
        pageMetadata(locale, YEAR, 'metodo').title,
        pageMetadata(locale, YEAR, 'debate').title,
      ];
      for (const text of strings) {
        expect(findThesisTerms(text), `${locale}: ${text}`).toEqual([]);
        const lower = text.toLowerCase();
        for (const term of BANNED_TERMS) expect(lower, `${locale}: ${term}`).not.toContain(term);
      }
    }
  });

  it('AC-007-17: without a year the home title is the year-free wordmark · country, and the kicker stays', () => {
    for (const locale of LOCALES) {
      const meta = pageMetadata(locale, null);
      expect(meta.title, locale).toBe(`${BRAND.wordmark} · ${content(locale).country.name}`);
      expect(meta.title, locale).not.toMatch(/\b(19|20)\d\d\b/);
      expect(historiaPage(locale), locale).toContain(KICKER[locale]);
    }
  });
});

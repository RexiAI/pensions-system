import { describe, expect, it } from 'vitest';
import { AgreementSection } from '../../web/components/registers/AgreementSection';
import { citationRegistry } from '../../web/content/citations';
import { PAGE_NAME_KEYS } from '../../web/content/keys';
import {
  THESIS_CLAIM_KEYS,
  findThesisTerms,
  thesisVocabularyOutsideThesis,
} from '../../web/content/registers';
import { LOCALES } from '../../web/content/types';
import { metadataFor, pageMetadata } from '../../web/seo/metadata';
import { committedThresholdYear } from '../../web/seo/threshold-year';
import { content, renderComponent } from '../fixtures/figures';
import { historiaPage } from '../helpers/story';

const YEAR = committedThresholdYear();
if (YEAR === null) throw new Error('the committed countdown has no threshold year');

const PROMISE: Record<string, string> = {
  es: 'Sistema de pensiones: estafa piramidal',
  en: 'Pension system: pyramid scam',
  de: 'Rentensystem: Schneeball-Betrug',
  fr: 'Système de retraites : fraude pyramidale',
  it: 'Sistema pensionistico: frode piramidale',
};

const KICKER: Record<string, string> = {
  es: 'Estafa piramidal',
  en: 'Pyramid scam',
  de: 'Schneeball-Betrug',
  fr: 'Fraude pyramidale',
  it: 'Frode piramidale',
};

/**
 * AC-007-14…17 — the promise title and the mechanism kicker (spec 007 T8; revision 2 title).
 */
describe('AC-007-14: the home title is the promise framing, exact per locale', () => {
  it('AC-007-14: title and og:title are the exact claim, with no year, wordmark or country', () => {
    for (const locale of LOCALES) {
      const promise = PROMISE[locale];
      const meta = pageMetadata(locale);
      expect(meta.title, locale).toBe(promise);
      expect(meta.title, locale).not.toMatch(/\b(19|20)\d\d\b/);
      expect(meta.title, locale).not.toContain(content(locale).country.name);
      const resolved = metadataFor(locale);
      expect(String(resolved.title), locale).toBe(promise);
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

describe('AC-007-16: sub-page titles are the page name plus the mechanism kicker', () => {
  it('AC-007-16: each sub-page title is exactly "<page name> · <kicker>", with no year or country', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      for (const kind of ['cifras', 'metodo', 'debate'] as const) {
        const meta = pageMetadata(locale, YEAR, kind);
        const pageName = local.t(PAGE_NAME_KEYS[kind]);
        expect(meta.title, `${locale}/${kind}`).toBe(`${pageName} · ${local.t('kicker.mechanism')}`);
        expect(meta.title, `${locale}/${kind}`).not.toContain(String(YEAR));
        expect(meta.title, `${locale}/${kind}`).not.toContain(local.country.name);
      }
    }
  });
});

/**
 * Revision 1 (2026-11-09): the operator authorized thesis vocabulary in exactly two content
 * keys, `meta.title` and `kicker.mechanism` (see THESIS_CLAIM_KEYS). The claim is now present
 * in every locale's title and kicker; the vocabulary boundary everywhere else is unchanged.
 */
describe('AC-007-17: the revised title and kicker state the claim under the recorded exemption', () => {
  it('AC-007-17: every locale states a thesis term in the title and kicker, and the exemption covers exactly those keys', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const title = PROMISE[locale];
      expect(findThesisTerms(title).length, `${locale}: ${title}`).toBeGreaterThan(0);
      expect(findThesisTerms(KICKER[locale]).length, `${locale}: ${KICKER[locale]}`).toBeGreaterThan(0);
      expect(findThesisTerms(pageMetadata(locale).title).length, locale).toBeGreaterThan(0);
      // The exemption is exactly the two authorized keys, not a widening of the boundary.
      expect([...THESIS_CLAIM_KEYS].sort(), locale).toEqual(['kicker.mechanism', 'meta.title']);
      expect(thesisVocabularyOutsideThesis(local.strings, local.editorial), locale).toEqual([]);
      const agreement = renderComponent(AgreementSection, { content: local, citations: citationRegistry });
      expect(findThesisTerms(agreement), locale).toEqual([]);
    }
  });

  it('AC-007-17: without a year the home title is the same yearless claim, and the kicker stays', () => {
    for (const locale of LOCALES) {
      const meta = pageMetadata(locale, null);
      expect(meta.title, locale).toBe(PROMISE[locale]);
      expect(meta.title, locale).not.toMatch(/\b(19|20)\d\d\b/);
      expect(findThesisTerms(meta.title).length, locale).toBeGreaterThan(0);
      expect(historiaPage(locale), locale).toContain(KICKER[locale]);
    }
  });
});

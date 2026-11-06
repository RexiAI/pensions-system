import { describe, expect, it } from 'vitest';
import { HERO_STATEMENT_BUDGETS } from '../../web/content/budgets';
import { COUNTRY_DOCUMENTS, validateDocument } from '../../web/content/registry';
import { LOCALES } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import { pageMetadata } from '../../web/seo/metadata';
import { shareCard } from '../../web/seo/share-card';
import { content } from '../fixtures/figures';
import { stepOf, storyPage, textOf } from '../helpers/story';
import { AGEING_MARKERS, COUNTDOWN_MARKERS, containsAny } from '../helpers/spec-005';

const SHIPPED: Record<Locale, string> = {
  es: 'La pensión que te espera en España',
  en: 'The pension that waits for you in Spain',
  fr: 'La retraite qui vous attend en Espagne',
  de: 'Die Rente, die dich in Spanien erwartet',
  it: 'La pensione che ti aspetta in Spagna',
};

const BANNED: Record<Locale, string> = {
  es: 'pensión que te espera',
  en: 'pension that waits for you',
  fr: 'retraite qui vous attend',
  de: 'Rente, die dich erwartet',
  it: 'pensione che ti aspetta',
};

const AMOUNT_WORDS: Record<Locale, string> = {
  es: 'cuánto',
  en: 'how much',
  fr: 'combien',
  de: 'wie viel',
  it: 'quanto',
};

const INSTITUTIONS = [
  'eurostat',
  'ine',
  'seguridad social',
  'social security',
  'sécurité sociale',
  'sozialversicherung',
  'previdenza sociale',
];

function statement(locale: Locale): string {
  return content(locale).t('hero.statement');
}

describe('AC-005-01: the headline names ageing and the countdown', () => {
  it('AC-005-01: every locale carries one ageing marker and one countdown marker', () => {
    for (const locale of LOCALES) {
      const text = statement(locale);
      expect(containsAny(text, AGEING_MARKERS[locale]), `${locale}: "${text}" has no ageing marker`).toBe(true);
      expect(containsAny(text, COUNTDOWN_MARKERS[locale]), `${locale}: "${text}" has no countdown marker`).toBe(true);
    }
  });
});

describe('AC-005-02: the shipped promise is gone from all five', () => {
  it('AC-005-02: the statement differs from, and does not contain, the shipped promise', () => {
    for (const locale of LOCALES) {
      const text = statement(locale).toLocaleLowerCase();
      expect(text, locale).not.toBe(SHIPPED[locale].toLocaleLowerCase());
      expect(text, `${locale}: "${text}"`).not.toContain(BANNED[locale].toLocaleLowerCase());
    }
  });
});

describe('AC-005-03: the headline keeps every inherited gate', () => {
  it('AC-005-03: the content model accepts all five statements', () => {
    for (const document of COUNTRY_DOCUMENTS) {
      const locale = document.locale as Locale;
      const codes = validateDocument(document).map((problem) => problem.code);
      expect(codes, locale).not.toContain('scope-statement');
      expect(codes, locale).not.toContain('statement-budget');
      const text = document.strings['hero.statement'] ?? '';
      expect(text, locale).toContain(document.countryName);
      expect(text.length, `${locale}: "${text}"`).toBeLessThanOrEqual(HERO_STATEMENT_BUDGETS[locale]);
      expect(text, locale).not.toMatch(/[.!?;:]/);
      expect(text, locale).not.toMatch(/\d/);
      for (const institution of INSTITUTIONS) {
        const pattern = new RegExp(`(?<!\\p{L})${institution}(?!\\p{L})`, 'iu');
        expect(pattern.test(text), `${locale}: "${text}" names ${institution}`).toBe(false);
      }
    }
  });

  it('AC-005-03: the Spanish statement still addresses the reader', () => {
    expect(statement('es')).toMatch(/(?<!\p{L})(te|tú|tu|ti|contigo)(?!\p{L})/iu);
  });
});

describe('AC-005-04: the page still opens with one h1 inside step 1', () => {
  it('AC-005-04: one h1, in step 1, above the clock, carrying the statement', () => {
    const html = storyPage('es');
    expect(html.split('<h1').length - 1).toBe(1);
    const step = stepOf(html, 'number');
    expect(step).toContain('<h1');
    expect(step.indexOf('<h1')).toBeLessThan(step.indexOf('class="clock"'));
    const heading = textOf(step.slice(step.indexOf('<h1'), step.indexOf('</h1>')));
    expect(heading).toBe(content('es').t('hero.statement'));
  });

  it('AC-005-04: the share card proposition is the same statement, different in every locale', () => {
    const propositions = LOCALES.map((locale) => {
      const card = shareCard(locale, null);
      if (!card) throw new Error(`no card for ${locale}`);
      expect(card.alt, locale).toContain(statement(locale));
      return statement(locale);
    });
    expect(new Set(propositions).size).toBe(LOCALES.length);
  });
});

describe('AC-005-05: the sub-line stops promising an amount', () => {
  it('AC-005-05: no amount word, no digit, no exclamation, no em-dash, at most two sentences', () => {
    for (const locale of LOCALES) {
      const sub = content(locale).t('hero.sub');
      const lower = sub.toLocaleLowerCase();
      expect(lower, `${locale}: "${sub}"`).not.toContain(AMOUNT_WORDS[locale]);
      expect(sub, `${locale}: "${sub}"`).not.toMatch(/\d/);
      expect(sub, `${locale}: "${sub}"`).not.toContain('!');
      expect(sub, `${locale}: "${sub}"`).not.toContain('—');
      expect(sub.split(/[.!?]/).filter((part) => part.trim() !== '').length, locale).toBeLessThanOrEqual(2);
    }
  });

  it('AC-005-05: the description that ships carries no amount promise', () => {
    for (const locale of LOCALES) {
      // Production takes the non-null branch: committedThresholdYear() resolves the committed
      // countdown to 2042, never null. `hero.sub` is only the year-free fallback, so it must not
      // be the string a crawler reads; the scenario's clause is that the sub-line a user reaches
      // stops promising an amount, and this is that surface.
      const shipped = pageMetadata(locale).description;
      expect(shipped, `${locale}: the fallback sub-line is not what ships`).not.toBe(content(locale).t('hero.sub'));
      expect(shipped.toLocaleLowerCase(), `${locale}: "${shipped}"`).not.toContain(AMOUNT_WORDS[locale]);
    }
  });
});

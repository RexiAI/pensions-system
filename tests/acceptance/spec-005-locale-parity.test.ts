import { describe, expect, it } from 'vitest';
import { REQUIRED_KEYS, missingKeys, unknownKeys } from '../../web/content/keys';
import { COUNTRY_DOCUMENTS } from '../../web/content/registry';
import { LOCALES } from '../../web/content/types';
import { content } from '../fixtures/figures';
import { claimA, reading } from '../helpers/spec-005';
import { BUILD_PRESENT, htmlLang, routePath, startServedApp } from '../helpers/served-app';
import { decodeText } from '../helpers/render-document';

function withoutPlaceholders(template: string): string {
  return template.replace(/\{\w+\}/g, '').trim();
}

describe('AC-005-32: all five locales carry the change, each in its own language', () => {
  it('AC-005-32: statements, templates, mechanism claims and readings all differ', () => {
    const statements = LOCALES.map((locale) => content(locale).t('hero.statement'));
    expect(new Set(statements).size).toBe(LOCALES.length);
    expect(statements.slice(1)).not.toContain(statements[0]);

    const templates = LOCALES.map((locale) => withoutPlaceholders(content(locale).t('steps.number.sentence')));
    expect(new Set(templates).size).toBe(LOCALES.length);

    const claims = LOCALES.map((locale) => claimA(locale, content(locale).editorial.agreement).text);
    expect(new Set(claims).size).toBe(LOCALES.length);

    const readings = LOCALES.map((locale) => reading(locale, content(locale).editorial.thesis));
    expect(new Set(readings).size).toBe(LOCALES.length);
  });
});

describe('AC-005-33: the editorial shape is identical across the five', () => {
  it('AC-005-33: agreement is four everywhere and paragraph counts match', () => {
    const agreements = new Set<number>();
    const paragraphs = new Set<number>();
    for (const locale of LOCALES) {
      const editorial = content(locale).editorial;
      agreements.add(editorial.agreement.length);
      paragraphs.add(editorial.thesis.paragraphs.length);
      expect(editorial.agreement.length, locale).toBe(4);
      for (const claim of editorial.agreement) expect(claim.text.trim().length, locale).toBeGreaterThan(0);
      expect(reading(locale, editorial.thesis).trim().length, locale).toBeGreaterThan(0);
    }
    expect(agreements.size).toBe(1);
    expect(paragraphs.size).toBe(1);
  });
});

describe('AC-005-34: the key set is unchanged, and the placeholders match', () => {
  it('AC-005-34: the key set is set-equal, not a fixed count, and every template has the same placeholders', () => {
    // Spec 007 T10: parity asserts set equality, never a fixed count — the set simply grows.
    expect(REQUIRED_KEYS.length).toBe(new Set(REQUIRED_KEYS).size);
    expect(REQUIRED_KEYS.filter((key) => key.startsWith('editorial.'))).toEqual([]);
    for (const document of COUNTRY_DOCUMENTS) {
      const strings = document.strings;
      expect(missingKeys(strings), document.locale).toEqual([]);
      expect(unknownKeys(strings), document.locale).toEqual([]);
      expect(Object.keys(strings).sort(), document.locale).toEqual([...REQUIRED_KEYS].sort());
    }
    for (const locale of LOCALES) {
      const placeholders = [...content(locale).t('steps.number.sentence').matchAll(/\{(\w+)\}/g)]
        .map((match) => match[1] ?? '')
        .sort();
      expect(placeholders, locale).toEqual(['base', 'date', 'threshold']);
    }
  });
});

describe.skipIf(!BUILD_PRESENT)('AC-005-35: five routes, five languages', () => {
  it('AC-005-35: every public route serves its own locale and its own statement', async () => {
    const app = await startServedApp();
    try {
      for (const locale of LOCALES) {
        const response = await fetch(`${app.baseUrl}${routePath(locale)}`);
        expect(response.status, locale).toBe(200);
        const html = decodeText(await response.text());
        expect(htmlLang(html), locale).toBe(locale);
        expect(html, locale).toContain(content(locale).t('hero.statement'));
      }
    } finally {
      await app.close();
    }
  }, 120_000);
});

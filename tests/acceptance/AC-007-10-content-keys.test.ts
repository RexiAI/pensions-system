import { describe, expect, it } from 'vitest';
import { REQUIRED_KEYS, missingKeys, unknownKeys } from '../../web/content/keys';
import { COUNTRY_DOCUMENTS } from '../../web/content/registry';
import { LOCALES } from '../../web/content/types';
import type { LocaleDocument } from '../../web/content/types';
import { jsxTextLiterals, listSourceFiles, readSource } from '../helpers/source-scan';

const NEW_KEYS = [
  'nav.historia',
  'kicker.mechanism',
  'pager.label',
  'pager.previous',
  'pager.next',
] as const;

const DOCUMENTS = COUNTRY_DOCUMENTS as readonly LocaleDocument[];

function strings(locale: string): Record<string, string> {
  const found = DOCUMENTS.find((document) => document.locale === locale);
  if (!found) throw new Error(`no document for ${locale}`);
  return found.strings;
}

/** Every string the new surfaces must take from the content model. */
function contentLiterals(): Set<string> {
  const literals = new Set<string>();
  for (const locale of LOCALES) {
    for (const key of NEW_KEYS) literals.add(strings(locale)[key] ?? '');
    literals.add(strings(locale)['meta.title'] ?? '');
  }
  return literals;
}

function assertNoLiteral(file: string, literals: ReadonlySet<string>): void {
  if (file.includes('web/content')) return;
  const source = readSource(file);
  if (!source.includes('<')) return;
  for (const literal of jsxTextLiterals(source)) {
    expect(literals.has(literal), `${file} carries a content literal: ${literal}`).toBe(false);
  }
}

/**
 * AC-007-22…24 — the new surfaces live in the content model (spec 007 T10).
 */
describe('AC-007-22: the kicker and page/title strings live in the content model', () => {
  it('AC-007-22: REQUIRED_KEYS declares every new key', () => {
    for (const key of NEW_KEYS) expect(REQUIRED_KEYS as readonly string[], key).toContain(key);
  });

  it('AC-007-22: no component holds a literal copy of the kicker, a page name or a title string', () => {
    const literals = contentLiterals();
    for (const file of [...listSourceFiles('web/components'), ...listSourceFiles('app')]) {
      assertNoLiteral(file, literals);
    }
  });
});

describe('AC-007-23: all five locales carry the new keys, non-blank and set-equal', () => {
  it('AC-007-23: missingKeys and unknownKeys are empty and the five key sets are equal', () => {
    for (const locale of LOCALES) {
      expect(missingKeys(strings(locale)), locale).toEqual([]);
      expect(unknownKeys(strings(locale)), locale).toEqual([]);
      for (const key of NEW_KEYS) {
        expect((strings(locale)[key] ?? '').trim().length, `${locale}/${key}`).toBeGreaterThan(0);
      }
    }
    const reference = Object.keys(strings('es')).sort();
    for (const locale of LOCALES) expect(Object.keys(strings(locale)).sort(), locale).toEqual(reference);
  });
});

describe('AC-007-24: the new keys are translated, not copied, and parity stays set-based', () => {
  it('AC-007-24: every non-es value is non-empty and differs from the es value', () => {
    for (const key of NEW_KEYS) {
      for (const locale of LOCALES.filter((candidate) => candidate !== 'es')) {
        const value = strings(locale)[key] ?? '';
        expect(value.trim().length, `${locale}/${key}`).toBeGreaterThan(0);
        expect(value, `${locale}/${key} copies the Spanish value`).not.toBe(strings('es')[key]);
      }
    }
  });

  it('AC-007-24: parity asserts set equality, never a fixed key count', () => {
    expect(REQUIRED_KEYS.length).toBe(new Set(REQUIRED_KEYS).size);
    const source = readSource('tests/acceptance/AC-007-10-content-keys.test.ts');
    expect(source).not.toMatch(/Object\.keys\([^)]*\)\.length\)\.toBe/);
  });
});

import de from './data/ES/de.json';
import en from './data/ES/en.json';
import es from './data/ES/es.json';
import fr from './data/ES/fr.json';
import it from './data/ES/it.json';
import { missingKeys, unknownKeys } from './keys';
import type { LocaleKey } from './keys';
import { headingCountProblem } from './registers';
import { interpolate, isLocale } from './types';
import type { CountryLocaleContent, Locale, LocaleDocument } from './types';

export const COUNTRY_DOCUMENTS: readonly LocaleDocument[] = [
  es,
  en,
  fr,
  de,
  it,
] as unknown as LocaleDocument[];

export type DocumentProblemCode =
  | 'unsupported-locale'
  | 'missing-keys'
  | 'unknown-keys'
  | 'heading-count';

export interface DocumentProblem {
  country: string;
  locale: string;
  code: DocumentProblemCode;
  detail: string;
}

export function validateDocument(doc: LocaleDocument): DocumentProblem[] {
  const base = { country: doc.country, locale: doc.locale };
  const problems: DocumentProblem[] = [];
  if (!isLocale(doc.locale)) {
    problems.push({ ...base, code: 'unsupported-locale', detail: doc.locale });
  }
  const missing = missingKeys(doc.strings);
  if (missing.length > 0) {
    problems.push({ ...base, code: 'missing-keys', detail: missing.join(', ') });
  }
  const unknown = unknownKeys(doc.strings);
  if (unknown.length > 0) {
    problems.push({ ...base, code: 'unknown-keys', detail: unknown.join(', ') });
  }
  // AC-001-91: a heading that names a count names the number of registers rendered.
  const countProblem = headingCountProblem(doc.strings, doc.locale);
  if (countProblem) {
    problems.push({
      ...base,
      code: 'heading-count',
      detail: `${countProblem.key}: states ${countProblem.stated}, ${countProblem.rendered} registers render`,
    });
  }
  return problems;
}

export type ContentErrorCode = 'unsupported-locale' | 'unsupported-country' | 'incomplete-content';

export interface ContentError {
  code: ContentErrorCode;
  detail: string;
}

export type ContentResult =
  | { ok: true; content: CountryLocaleContent }
  | { ok: false; error: ContentError };

export interface ContentRegistry {
  get(country: string, locale: string): ContentResult;
  countries(): string[];
  locales(country: string): Locale[];
}

function normaliseCountry(country: string): string {
  return country.trim().toUpperCase();
}

function contentError(code: ContentErrorCode, detail: string): ContentResult {
  return { ok: false, error: { code, detail } };
}

function problemDetail(problems: readonly DocumentProblem[]): string {
  return problems.map((problem) => `${problem.code}: ${problem.detail}`).join('; ');
}

function toContent(doc: LocaleDocument): CountryLocaleContent {
  const strings = doc.strings as Record<LocaleKey, string>;
  return {
    country: doc.country,
    locale: doc.locale as Locale,
    strings,
    editorial: doc.editorial,
    t: (key: LocaleKey, vars?: Record<string, string | number>) =>
      interpolate(strings[key] ?? '', vars ?? {}),
  };
}

interface IndexedDocument {
  doc: LocaleDocument;
  problems: DocumentProblem[];
}

/**
 * Content is addressed by (country, locale) and stored as data. A second country is a
 * new document, not a new code path: nothing here branches on the country code.
 */
export function createRegistry(documents: readonly LocaleDocument[]): ContentRegistry {
  const index = new Map<string, Map<string, IndexedDocument>>();
  for (const doc of documents) {
    const country = normaliseCountry(doc.country);
    const byLocale = index.get(country) ?? new Map<string, IndexedDocument>();
    const problems = validateDocument(doc);
    byLocale.set(doc.locale, { doc, problems });
    index.set(country, byLocale);
  }
  return {
    countries: () => [...index.keys()].sort(),
    locales: (country) => [...(index.get(normaliseCountry(country))?.keys() ?? [])].filter(isLocale),
    get(country, locale) {
      const byLocale = index.get(normaliseCountry(country));
      if (!byLocale) {
        return contentError('unsupported-country', normaliseCountry(country));
      }
      const entry = byLocale.get(locale.trim().toLowerCase());
      if (!entry) return contentError('unsupported-locale', `${country}/${locale}`);
      if (entry.problems.length > 0) return contentError('incomplete-content', problemDetail(entry.problems));
      return { ok: true, content: toContent(entry.doc) };
    },
  };
}

export const contentRegistry: ContentRegistry = createRegistry(COUNTRY_DOCUMENTS);

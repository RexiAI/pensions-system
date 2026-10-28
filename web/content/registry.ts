import de from './data/ES/de.json';
import en from './data/ES/en.json';
import es from './data/ES/es.json';
import fr from './data/ES/fr.json';
import it from './data/ES/it.json';
import { HERO_STATEMENT_BUDGETS } from './budgets';
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
  | 'heading-count'
  | 'country-record'
  | 'scope-statement'
  | 'statement-budget';

export interface DocumentProblem {
  country: string;
  locale: string;
  code: DocumentProblemCode;
  detail: string;
}

type Base = Pick<DocumentProblem, 'country' | 'locale'>;

function localeProblems(doc: LocaleDocument, base: Base): DocumentProblem[] {
  return isLocale(doc.locale) ? [] : [{ ...base, code: 'unsupported-locale', detail: doc.locale }];
}

function keyProblems(doc: LocaleDocument, base: Base): DocumentProblem[] {
  const problems: DocumentProblem[] = [];
  const missing = missingKeys(doc.strings);
  if (missing.length > 0) problems.push({ ...base, code: 'missing-keys', detail: missing.join(', ') });
  const unknown = unknownKeys(doc.strings);
  if (unknown.length > 0) problems.push({ ...base, code: 'unknown-keys', detail: unknown.join(', ') });
  return problems;
}

/**
 * AC-001-103: the scope mark is derived from the country record, so a record missing either
 * field is a content bug that must fail here rather than fall back to another country's name.
 */
function countryRecordProblems(doc: LocaleDocument, base: Base): DocumentProblem[] {
  if (!isBlank(doc.countryName) && !isBlank(doc.scopeClause)) return [];
  return [
    {
      ...base,
      code: 'country-record',
      detail: `name "${doc.countryName ?? ''}" scopeClause "${doc.scopeClause ?? ''}"`,
    },
  ];
}

/**
 * AC-001-103: the headline is the only string a social visitor reads, so the country's name
 * belongs in it — in every locale, checked at build time, never as a review habit.
 */
function scopeStatementProblems(doc: LocaleDocument, base: Base): DocumentProblem[] {
  if (isBlank(doc.countryName)) return [];
  const statement = doc.strings['hero.statement'] ?? '';
  if (statement.includes(doc.countryName)) return [];
  return [{ ...base, code: 'scope-statement', detail: `hero.statement omits "${doc.countryName}"` }];
}

/**
 * T8, Revision 3 §P3 F4: the headline is bounded as content-model validation. The budget moved
 * (46 to 42 in `es`, 60 to 55 in `de`) so the display type could rise; a statement over its
 * locale's budget is a content bug and fails the build, rather than shipping a three-line `<h1>`.
 */
function statementBudgetProblems(doc: LocaleDocument, base: Base): DocumentProblem[] {
  if (!isLocale(doc.locale)) return [];
  const statement = doc.strings['hero.statement'] ?? '';
  const budget = HERO_STATEMENT_BUDGETS[doc.locale];
  if (statement.length <= budget) return [];
  return [
    {
      ...base,
      code: 'statement-budget',
      detail: `hero.statement is ${statement.length} characters, budget ${budget}`,
    },
  ];
}

/** AC-001-91: a heading that names a count names the number of registers rendered. */
function headingCountProblems(doc: LocaleDocument, base: Base): DocumentProblem[] {
  const countProblem = headingCountProblem(doc.strings, doc.locale);
  if (!countProblem) return [];
  return [
    {
      ...base,
      code: 'heading-count',
      detail: `${countProblem.key}: states ${countProblem.stated}, ${countProblem.rendered} registers render`,
    },
  ];
}

export function validateDocument(doc: LocaleDocument): DocumentProblem[] {
  const base: Base = { country: doc.country, locale: doc.locale };
  return [
    ...localeProblems(doc, base),
    ...keyProblems(doc, base),
    ...countryRecordProblems(doc, base),
    ...scopeStatementProblems(doc, base),
    ...statementBudgetProblems(doc, base),
    ...headingCountProblems(doc, base),
  ];
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

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim() === '';
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
    country: { code: doc.country, name: doc.countryName, scopeClause: doc.scopeClause },
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

import type { LocaleKey } from './keys';

export const LOCALES = ['es', 'en', 'fr', 'de', 'it'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export interface Citation {
  id: string;
  publisher: string;
  document: string;
  reference: string;
  date: string;
  url: string;
}

export interface AgreementClaim {
  text: string;
  /** Absent means no resolvable citation: the claim must not render (AC-001-38). */
  citationId?: string;
}

export interface DisputePosition {
  name: string;
  proponent: string;
  role: string;
  quote: string;
  citationId?: string;
}

export interface DisputedClaim {
  id: string;
  positions: DisputePosition[];
}

export interface ThesisEditorial {
  statement: string;
  paragraphs: string[];
  signatureName: string;
  signatureRole: string;
  figureLinks: string[];
}

export interface LocaleEditorial {
  agreement: AgreementClaim[];
  disputes: DisputedClaim[];
  thesis: ThesisEditorial;
}

/**
 * The country a locale document describes (T8, T19). `name` and `scopeClause` are content, not
 * code: the scope mark at all three levels is derived from them, so a second country is a new
 * record and not a copy edit.
 */
export interface CountryRecord {
  code: string;
  /** The country's display name in this locale (`country.<GEO>.name`). */
  name: string;
  /** What the figures cover, in that country's own system (`country.<GEO>.scopeClause`). */
  scopeClause: string;
}

export interface LocaleDocument {
  country: string;
  /** The country record's display name, in this document's locale. */
  countryName: string;
  /** The country record's coverage clause, in this document's locale. */
  scopeClause: string;
  locale: string;
  strings: Record<string, string>;
  editorial: LocaleEditorial;
}

/** The typed surface every component reads: strings plus editorial units. */
export interface CountryLocaleContent {
  country: CountryRecord;
  locale: Locale;
  strings: Readonly<Record<LocaleKey, string>>;
  editorial: LocaleEditorial;
  t(key: LocaleKey, vars?: Record<string, string | number>): string;
}

export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

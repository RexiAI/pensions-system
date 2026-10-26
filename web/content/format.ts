import type { Locale } from './types';

/**
 * The single entry point for rendering numbers and dates. No component calls `Intl`
 * directly: locale-aware formatting is pinned here and covered by tests (design §Global
 * Tokens, "Number and date formatting").
 *
 * `percent` and `percentPoints` are deliberately *two kinds*, not one. A fraction (`0.13`) and
 * a percentage point (`13.23`) are different numbers in different units, and the only formatter
 * that may scale by 100 is the one whose unit says so. Collapsing them is what rendered the
 * published `% of GDP` series — stored in points, per AC-001-86 — as `1323 %` on the fig-02
 * plate and in the hero headline.
 */
export type ValueKind =
  | 'ratio'
  | 'percent'
  | 'percentPoints'
  | 'currencyMinor'
  | 'integer'
  | 'decimal'
  | 'years';

type Formatter = (value: number, locale: Locale) => string;

/**
 * The percent sign and the space in front of it, per locale — design §Number and date
 * formatting, "Percent" row: `4,2 %` with a no-break space in es/de/fr/it, `4.2%` in en.
 *
 * Only the suffix is pinned here. The digits always come from `Intl`, so the decimal and group
 * separators stay the locale's own; the record is exhaustive over `Locale`, so adding a locale
 * fails to compile until its percent typography is stated.
 */
const PERCENT_SUFFIX: Readonly<Record<Locale, string>> = {
  es: '\u00A0%',
  de: '\u00A0%',
  en: '%',
  fr: '\u00A0%',
  it: '\u00A0%',
};

/** The `formatToParts` types that carry the number itself; everything else is unit typography. */
const NUMBER_PARTS = new Set(['integer', 'group', 'decimal', 'fraction', 'minusSign', 'plusSign']);

const number =
  (min: number, max: number): Formatter =>
  (value, locale) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    }).format(value);

const decimal = (digits: number): Formatter => number(digits, digits);

/**
 * A ratio expressed as a fraction (`0.13` → `13 %`). `Intl`'s own percent pattern does the
 * scaling and the rounding; its literal and sign are replaced with the pinned suffix above so
 * both percent kinds are spaced identically in a given locale.
 */
const fractionPercent: Formatter = (value, locale) => {
  const parts = new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 1,
  }).formatToParts(value);
  const digits = parts
    .filter((part) => NUMBER_PARTS.has(part.type))
    .map((part) => part.value)
    .join('');
  return `${digits}${PERCENT_SUFFIX[locale]}`;
};

const FORMATTERS: Readonly<Record<ValueKind, Formatter>> = {
  ratio: decimal(2),
  years: decimal(1),
  decimal: decimal(1),
  percent: fractionPercent,
  /**
   * Percentage points (`13.23` → `13,23 %`): already the unit the source publishes, so the value
   * is formatted as it stands. Never scaled — that is the whole point of the separate kind.
   * Two decimals because that is the reporting precision the published series carries (T4).
   */
  percentPoints: (value, locale) => `${decimal(2)(value, locale)}${PERCENT_SUFFIX[locale]}`,
  currencyMinor: (value, locale) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100),
  integer: (value, locale) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value),
};

export function formatValue(
  value: number | null,
  kind: ValueKind,
  locale: Locale,
  nullLabel: string,
): string {
  if (value === null || Number.isNaN(value)) return nullLabel;
  return FORMATTERS[kind](value, locale);
}

export function formatDate(iso: string, locale: Locale): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

/** Counts (row counts, source counts) need no fractional digits. */
export function formatCount(count: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(count);
}

import type { Locale } from './types';

/**
 * The `<h1>`'s length budget, per locale, in characters.
 *
 * This is content-model validation, not a CSS guess (T8, Revision 3 §P3 F4): at 1280px the 7/5
 * hero split leaves about 686px for the headline, and `--text-display` at 64px sets roughly 21
 * characters to the line, so two lines is about 42 characters. Revision 3 moved the budget from
 * 46 to 42 in `es` and from 60 to 55 in `de` rather than shrinking the type.
 *
 * `en`, `fr` and `it` had no separate budget in the design revision; open question 22 resolved
 * them as measured, one step per locale's expansion rate against Spanish (English is shorter,
 * French and Italian sit within about ±10%), and the two-line check at first implementation is
 * what confirms them. A statement over its locale's budget fails the build; the copy is
 * rewritten, never truncated and never set smaller to fit.
 */
export const HERO_STATEMENT_BUDGETS: Readonly<Record<Locale, number>> = {
  es: 42,
  de: 55,
  en: 46,
  fr: 52,
  it: 50,
};

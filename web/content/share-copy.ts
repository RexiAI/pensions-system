import type { Locale } from './types';

/**
 * The `share.*` copy-rule set (spec 003 T3, OQ-5 option B). It is a scoped override of the
 * `countdown.*` register (AC-002-28), not a relaxation of it: `faltan`, the explicit anchor date
 * and the imperative `Compruébalo` are allowed here and only here, because a shared message
 * states calendar arithmetic to a disclosed date and invites the reader to check it.
 *
 * What stays banned in `share.*`: a depletion verb (`Quedan` — the days are not a stock that runs
 * out), any bomb word, an exclamation mark, and urgency adjectives, in every locale.
 */
const COMMON: readonly string[] = ['bomb', '!'];

const BY_LOCALE: Readonly<Record<Locale, readonly string[]>> = {
  es: ['quedan', 'urgente', 'inminente', 'alarmante', 'catastrófico', 'catastrófica', 'desastroso', 'desastrosa'],
  en: [' left', 'remain', 'urgent', 'imminent', 'alarming', 'catastrophic', 'disastrous'],
  fr: ['restent', 'il reste', 'urgent', 'imminent', 'alarmant', 'catastrophique', 'désastreu'],
  de: ['bleiben', 'verbleibend', 'dringend', 'unmittelbar bevorstehend', 'alarmierend', 'katastrophal', 'verheerend'],
  it: ['restano', 'rimangono', 'urgente', 'imminente', 'allarmante', 'catastrofic', 'disastros'],
};

/** The banned terms a `share.*` string contains, case-insensitively; empty means it passes. */
export function shareCopyProblems(text: string, locale: Locale): string[] {
  const haystack = text.toLocaleLowerCase(locale);
  return [...COMMON, ...BY_LOCALE[locale]].filter((term) => haystack.includes(term));
}

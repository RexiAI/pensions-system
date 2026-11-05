import { formatValue } from '../../content/format';
import type { Locale } from '../../content/types';
import { COUNTDOWN_BASE, COUNTDOWN_THRESHOLD } from '../../series/countdown';

/**
 * The two numerals the story states as one fact — `50 per 100` — formatted once.
 *
 * Steps 1 and 2 both state it, and they must state the same numbers: a per-component copy of the
 * formatting is a second definition that only looks identical until one of the two changes.
 */
export function thresholdNumerals(locale: Locale): { threshold: string; base: string } {
  return {
    threshold: formatValue(COUNTDOWN_THRESHOLD, 'integer', locale, ''),
    base: formatValue(COUNTDOWN_BASE, 'integer', locale, ''),
  };
}

import { readFileSync } from 'node:fs';
import { PublicPage } from '../../web/components/PublicPage';
import { publicPageProps } from '../../web/components/public-page-props';
import { formatValue } from '../../web/content/format';
import { interpolate } from '../../web/content/types';
import type { Locale } from '../../web/content/types';
import type { DependencyRatioSeriesValue } from '../../web/metrics/dependency-ratio';
import { renderComponent } from '../fixtures/figures';

/** The instant every spec-005 page render is pinned to (three days before the anchor). */
const SPEC_NOW = Date.parse('2026-10-31T10:00:00Z');

/**
 * The public page as the deployment builds it: committed figures and committed series, never a
 * fixture. The facts register's claim B derives its numerals from `data/derived/fig-01.json`, so
 * a fixture-based page would prove a different figure from the one the reader receives.
 */
export function committedPage(locale: Locale, nowMs: number = SPEC_NOW): string {
  const props = publicPageProps(locale, { now: new Date(nowMs) });
  if (props === null) throw new Error(`no committed page for ${locale}`);
  return renderComponent(PublicPage, { ...props, now: new Date(nowMs) });
}

interface Fig01File {
  value: DependencyRatioSeriesValue;
  manifest: { sourceUrl: string[] };
}

export function committedFig01(): Fig01File {
  return JSON.parse(readFileSync('data/derived/fig-01.json', 'utf8')) as Fig01File;
}

/** The two numerals the fig-01 plate publishes, formatted the way the plate formats them. */
export function fig01Numerals(locale: Locale): { first: string; latest: string } {
  const { value } = committedFig01();
  return {
    first: formatValue(value.first?.ratio ?? null, 'ratio', locale, ''),
    latest: formatValue(value.latest?.ratio ?? null, 'ratio', locale, ''),
  };
}

/** The T1 ageing markers, copied from the task's contract table. */
export const AGEING_MARKERS: Readonly<Record<Locale, readonly string[]>> = {
  es: ['envejec', 'mayores', 'edad'],
  en: ['ageing', 'aging', 'older', 'age'],
  fr: ['vieillis', 'âgé', 'age'],
  de: ['alter', 'älter', 'alterung'],
  it: ['invecchi', 'anzian', 'età'],
};

/** The T1 countdown markers. */
export const COUNTDOWN_MARKERS: Readonly<Record<Locale, readonly string[]>> = {
  es: ['cuenta atrás', 'faltan', 'te quedan', 'días'],
  en: ['countdown', 'days', 'remaining', 'left'],
  fr: ['compte à rebours', 'jours', 'restants'],
  de: ['countdown', 'tage', 'zählt'],
  it: ['conto alla rovescia', 'giorni'],
};

/** The T4 contribution markers (claim A's first half). */
const CONTRIBUTION_MARKERS: Readonly<Record<Locale, readonly string[]>> = {
  es: ['cotizacion', 'cotizan', 'cotizaciones'],
  en: ['contribution'],
  fr: ['cotisation'],
  de: ['beitrag', 'beiträge'],
  it: ['contribut', 'contribuzion'],
};

/** The T4 present-day markers (claim A's second half). */
const PRESENT_DAY_MARKERS: Readonly<Record<Locale, readonly string[]>> = {
  es: ['hoy'],
  en: ['today', 'now'],
  fr: ["aujourd'hui", 'aujourd'],
  de: ['heute'],
  it: ['oggi'],
};

/** The T4 employed-person markers (claim B's subject). */
export const EMPLOYED_MARKERS: Readonly<Record<Locale, readonly string[]>> = {
  es: ['ocupad', 'afiliad', 'trabaja'],
  en: ['employed', 'worker', 'affiliated'],
  fr: ['occupé', 'salarié', 'travaill'],
  de: ['beschäftigt', 'erwerbstätig', 'arbeit'],
  it: ['occupat', 'lavorator', 'lavora'],
};

/** The T5 today's-workers markers. */
const TODAY_WORKERS_MARKERS: Readonly<Record<Locale, readonly string[]>> = {
  es: ['hoy'],
  en: ['today', 'now'],
  fr: ["aujourd'hui", 'aujourd'],
  de: ['heute'],
  it: ['oggi'],
};

/** The T5 tomorrow's-workers markers. */
export const TOMORROW_WORKERS_MARKERS: Readonly<Record<Locale, readonly string[]>> = {
  es: ['mañana', 'futur', 'vienen', 'próxim'],
  en: ['tomorrow', 'future', 'next generation', 'coming'],
  fr: ['demain', 'futur', 'prochaine génération', 'à venir'],
  de: ['morgen', 'zukunft', 'nächste generation', 'kommend'],
  it: ['domani', 'futuro', 'prossima generazione', 'a venire'],
};

export function containsAny(text: string, markers: readonly string[]): boolean {
  const lower = text.toLocaleLowerCase();
  return markers.some((marker) => lower.includes(marker.toLocaleLowerCase()));
}

export interface ClaimLike {
  text: string;
  citationId?: string;
}

/**
 * A claim's text as the page renders it: its `{first}`/`{latest}` placeholders filled from the
 * committed fig-01 numerals, formatted the way the plate formats them. One definition, so an
 * assertion about rendered claim prose cannot disagree with another one.
 */
export function renderedClaim(locale: Locale, claim: ClaimLike): string {
  const { first, latest } = fig01Numerals(locale);
  return interpolate(claim.text, { first, latest });
}

/** Claim A: the pay-as-you-go mechanism, contribution marker plus present-day marker. */
export function claimA(locale: Locale, claims: readonly ClaimLike[]): ClaimLike {
  const matches = claims.filter(
    (claim) =>
      containsAny(claim.text, CONTRIBUTION_MARKERS[locale]) &&
      containsAny(claim.text, PRESENT_DAY_MARKERS[locale]),
  );
  if (matches.length !== 1) throw new Error(`${locale}: expected one mechanism claim, found ${matches.length}`);
  return matches[0] as ClaimLike;
}

/** Claim B: the employed-person marker. */
export function claimB(locale: Locale, claims: readonly ClaimLike[]): ClaimLike {
  const matches = claims.filter((claim) => containsAny(claim.text, EMPLOYED_MARKERS[locale]));
  if (matches.length !== 1) throw new Error(`${locale}: expected one employed-person claim, found ${matches.length}`);
  return matches[0] as ClaimLike;
}

export interface ThesisLike {
  statement: string;
  paragraphs: string[];
}

/** Every thesis string carrying both halves of the intergenerational reading. */
export function readingCandidates(locale: Locale, thesis: ThesisLike): string[] {
  const candidates = [thesis.statement, ...thesis.paragraphs];
  return candidates.filter(
    (candidate) =>
      containsAny(candidate, TODAY_WORKERS_MARKERS[locale]) &&
      containsAny(candidate, TOMORROW_WORKERS_MARKERS[locale]),
  );
}

/** The reading itself: the single candidate, or a loud throw when the copy breaks the contract. */
export function reading(locale: Locale, thesis: ThesisLike): string {
  const candidates = readingCandidates(locale, thesis);
  if (candidates.length !== 1) {
    throw new Error(`${locale}: expected exactly one reading, found ${candidates.length}`);
  }
  return candidates[0] as string;
}

import type { LocaleKey } from './keys';
import type { LocaleEditorial } from './types';

/**
 * The three registers (T10) are structurally separate: separate content types, separate
 * components, and a vocabulary boundary that is mechanically checkable.
 */
export const REGISTER_SECTIONS = ['agreement', 'dispute', 'thesis'] as const;

export type RegisterSection = (typeof REGISTER_SECTIONS)[number];

/**
 * Terms that belong to the site's own reading and may appear only inside the thesis
 * register: the fraud / pyramid-scheme vocabulary, in every shipped locale.
 */
export const THESIS_TERMS = [
  'fraude',
  'fraud',
  'estafa',
  'betrug',
  'frode',
  'pirámide',
  'piramide',
  'pyramid',
  'pyramide',
  'cadena',
  'chain letter',
  'kette',
] as const;

export interface VocabularyHit {
  location: string;
  term: string;
}

export function findThesisTerms(text: string): string[] {
  const haystack = text.toLocaleLowerCase();
  return THESIS_TERMS.filter((term) => haystack.includes(term));
}

/** A location is thesis-owned when its key or path is under the thesis register. */
export function isThesisLocation(location: string): boolean {
  return location.startsWith('thesis.') || location.startsWith('editorial.thesis');
}

function hitsInStrings(strings: Readonly<Record<string, string>>): VocabularyHit[] {
  return Object.entries(strings).flatMap(([key, value]) =>
    findThesisTerms(value)
      .filter(() => !isThesisLocation(key))
      .map((term) => ({ location: key, term })),
  );
}

function hitsInText(text: string, location: string): VocabularyHit[] {
  return findThesisTerms(text).map((term) => ({ location, term }));
}

function hitsInDispute(dispute: LocaleEditorial['disputes'][number]): VocabularyHit[] {
  return dispute.positions.flatMap((position) =>
    hitsInText(`${position.quote} ${position.name}`, `editorial.dispute.${dispute.id}`),
  );
}

function hitsInEditorial(editorial: LocaleEditorial): VocabularyHit[] {
  const agreement = editorial.agreement.flatMap((claim) => hitsInText(claim.text, 'editorial.agreement'));
  return [...agreement, ...editorial.disputes.flatMap(hitsInDispute)];
}

export function thesisVocabularyOutsideThesis(
  strings: Readonly<Record<string, string>>,
  editorial?: LocaleEditorial,
): VocabularyHit[] {
  const hits = hitsInStrings(strings);
  return editorial ? [...hits, ...hitsInEditorial(editorial)] : hits;
}

/** Every thesis term used by the editorial thesis, so a test can prove it is present once. */
export function thesisVocabularyLocations(editorial: LocaleEditorial): VocabularyHit[] {
  const texts = [editorial.thesis.statement, ...editorial.thesis.paragraphs].join(' ');
  return findThesisTerms(texts).map((term) => ({ location: 'editorial.thesis', term }));
}

/**
 * The registers the register key actually renders, in order (T10, AC-001-91). This array is
 * the single source of the rendered count: the heading's number is interpolated from its
 * length, and the content gate rejects a heading whose prose count disagrees with it.
 */
export const REGISTER_ROWS: ReadonlyArray<{ label: LocaleKey; sample: LocaleKey }> = [
  { label: 'register.instrument.label', sample: 'register.instrument.sample' },
  { label: 'register.consensus.label', sample: 'register.consensus.sample' },
  { label: 'register.dispute.label', sample: 'register.dispute.sample' },
  { label: 'register.thesis.label', sample: 'register.thesis.sample' },
];

const NUMBER_WORDS: Readonly<Record<string, readonly string[]>> = {
  es: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
  en: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
  fr: ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'],
  de: ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'],
  it: ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove'],
};

/** The count a heading states, in digits or in the locale's own number word. */
export function statedCount(heading: string, locale: string): number | null {
  const digits = /\b(\d{1,2})\b/.exec(heading);
  if (digits) return Number(digits[1]);
  const tokens = heading.toLocaleLowerCase().split(/[^\p{L}]+/u);
  const words = NUMBER_WORDS[locale] ?? NUMBER_WORDS.en ?? [];
  const found = tokens.map((token) => words.indexOf(token)).filter((index) => index > 0);
  if (found.length === 0) return null;
  return found[0] as number;
}

export type HeadingCountProblem = { key: LocaleKey; stated: number | null; rendered: number };

/**
 * A heading that names a count must name the number of registers actually rendered beneath
 * it (AC-001-91). A prose count that contradicts the DOM is a defect: the document is
 * rejected rather than shipped.
 */
export function headingCountProblem(
  strings: Readonly<Record<string, string>>,
  locale: string,
  rendered: number = REGISTER_ROWS.length,
): HeadingCountProblem | null {
  const key: LocaleKey = 'register.key.heading';
  const heading = strings[key];
  if (typeof heading !== 'string') return null;
  const stated = statedCount(heading, locale);
  if (stated === null || stated === rendered) return null;
  return { key, stated, rendered };
}

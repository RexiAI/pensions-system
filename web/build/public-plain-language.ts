import { stripOperatorSubtrees } from './public-vocabulary';

/**
 * The plain-language gate (spec 004 T9): "no jargon above the fold" as a build check rather than
 * a review habit.
 *
 * The list is hand-written because a term list is the only thing that can name a *phrase* — the
 * dependency ratio's name in five languages, the four dataset identifiers, the projection
 * series' name. It is not the only check: `scanTopRegion` also rejects every identifier
 * `internalTermsOf(figures, series)` returns, so a new source or formula id cannot leak by being
 * absent from the hand-written list.
 *
 * Scope: the story only — the region from `<main>` to the after-story strip. `#metodo` is
 * precision by design and is never scanned, and neither is any `data-operator="true"` subtree.
 */
export const BANNED_TOP_TERMS: readonly string[] = [
  // The dependency ratio's own name, in the five locales it might be written in.
  'ratio de dependencia',
  'relación de dependencia',
  'dependency ratio',
  'old-age dependency',
  'ratio de dépendance',
  'taux de dépendance',
  'altersquotient',
  'abhängigkeitsquotient',
  'rapporto di dipendenza',
  'indice di dipendenza',
  // The four dataset identifiers the story must never name.
  'demo_pjan',
  'esspros',
  'spr_exp_pens',
  'proj_23np',
  // The projection series' name, in the five locales.
  'proyecciones demográficas',
  'demographic projections',
  'projections démographiques',
  'bevölkerungsvorausberechnung',
  'proiezioni demografiche',
];

export interface PlainLanguageHit {
  /** The term or identifier that was found, lowercased. */
  term: string;
  /** The text around the hit, so a failing build names what to fix. */
  context: string;
}

const STRIP_MARKER = 'class="story__strip"';
const MAIN_MARKER = '<main';
const CONTEXT = 60;

/** The story region of a Historia document: `<main>` up to the after-story strip. */
export function topRegionOf(html: string): string {
  const start = html.indexOf(MAIN_MARKER);
  if (start === -1) return '';
  // Only a Historia page carries the story. A precision page (Método, Cifras, Debate) has no
  // `data-top-step` and is out of the top-region scope by construction (spec 007 T11).
  if (html.indexOf('data-top-step', start) === -1) return '';
  const end = html.indexOf(STRIP_MARKER, start);
  return end === -1 ? html.slice(start) : html.slice(start, end);
}

function contextAround(text: string, index: number): string {
  return text.slice(Math.max(0, index - CONTEXT), index + CONTEXT).replace(/\s+/g, ' ').trim();
}

/**
 * Scans one locale's top region. Text nodes **and** `aria-label` / `alt` / `title` values are in
 * scope — an accessible name is copy a reader hears — and `data-operator="true"` subtrees are
 * stripped first, because the operator surface is allowed to name its own sources.
 */
export function scanTopRegion(
  html: string,
  _locale: string,
  internalTerms: readonly string[] = [],
): PlainLanguageHit[] {
  const region = stripOperatorSubtrees(topRegionOf(html));
  const haystack = region.toLowerCase();
  const hits: PlainLanguageHit[] = [];
  const terms = [...BANNED_TOP_TERMS.map((term) => term.toLowerCase()), ...internalTerms.map((term) => term.toLowerCase())];
  for (const term of terms) {
    if (term.trim() === '') continue;
    const index = haystack.indexOf(term);
    if (index === -1) continue;
    hits.push({ term, context: contextAround(region, index) });
  }
  return hits;
}

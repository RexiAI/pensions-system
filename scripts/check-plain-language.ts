/**
 * Build gate for the story's plain language (spec 004 T9).
 *
 * Every public page's Historia story is rendered here from the same components Next renders
 * statically, its top region is isolated (`<main>` up to the after-story strip) and scanned for
 * the banned term list plus every repository identifier the committed derived data carries. Any
 * hit fails the build, per locale, so a term that only appears in one translation cannot pass as
 * a green run. The precision pages (Método, Cifras, Debate) are out of the top-region scope.
 */
import { pathToFileURL } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { internalTermsOf } from '../web/build/public-vocabulary';
import { scanTopRegion } from '../web/build/public-plain-language';
import { PublicPage } from '../web/components/PublicPage';
import { publicPageProps } from '../web/components/public-page-props';
import { LOCALES } from '../web/content/types';
import { readDerivedFigures } from '../web/ingest/write-derived';
import { SERIES_DIR, readDerivedSeries } from '../web/derived/series-store';

const DERIVED_DIR = 'data/derived';

export interface GateResult {
  failures: number;
  hits: string[];
}

/** Runs the gate over one locale's rendered page, with the committed identifiers in scope. */
export function checkLocale(locale: string, internalTerms: readonly string[]): string[] {
  const props = publicPageProps(locale, { derivedDir: DERIVED_DIR, seriesDir: SERIES_DIR });
  if (!props) return [`${locale}: no complete content for this locale`];
  const html = renderToStaticMarkup(createElement(PublicPage, { ...props, pageKind: 'historia' }));
  return scanTopRegion(html, locale, internalTerms).map(
    (hit) => `${locale}: ${hit.term} — …${hit.context}…`,
  );
}

export function main(): number {
  const figures = readDerivedFigures(DERIVED_DIR);
  if (figures.length === 0) {
    console.error('no derived figures found in data/derived');
    return 1;
  }
  const internalTerms = internalTermsOf(figures, readDerivedSeries(SERIES_DIR));
  const hits = LOCALES.flatMap((locale) => checkLocale(locale, internalTerms));
  for (const hit of hits) console.error(hit);
  if (hits.length > 0) {
    console.error(`plain-language gate: ${hits.length} hit(s) in the story`);
    return 1;
  }
  console.log(`plain-language gate: clean (${LOCALES.length} locales)`);
  return 0;
}

const RUN_AS_SCRIPT = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (RUN_AS_SCRIPT) process.exit(main());

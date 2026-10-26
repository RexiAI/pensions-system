/**
 * Build gate for the public/operator vocabulary boundary (D3).
 *
 * Every public route is rendered here from the same components Next renders statically, the
 * `data-operator="true"` subtrees are dropped, and the remaining text is scanned for
 * repository-defined vocabulary: spec filenames, scenario ids, open-question references,
 * digests, repo paths, and any source key or formula id present in `data/derived/*.json`.
 *
 * Wired as `npm run build`'s `prebuild` step, so a leak fails the build instead of shipping.
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { internalTermsOf, scanPublicText, stripOperatorSubtrees } from '../web/build/public-vocabulary';
import { PublicPage } from '../web/components/PublicPage';
import { publicPageProps } from '../web/components/public-page-props';
import { LOCALES } from '../web/content/types';
import { readDerivedFigures } from '../web/ingest/write-derived';

const DERIVED_DIR = 'data/derived';

function checkLocale(locale: string, terms: readonly string[]): number {
  const props = publicPageProps(locale, { derivedDir: DERIVED_DIR });
  if (!props) {
    console.error(`${locale}: no complete content for this locale`);
    return 1;
  }
  const html = renderToStaticMarkup(createElement(PublicPage, props));
  const hits = scanPublicText(stripOperatorSubtrees(html), terms);
  for (const hit of hits) console.error(`${locale}: ${hit.pattern} — …${hit.context}…`);
  return hits.length;
}

function main(): number {
  const figures = readDerivedFigures(DERIVED_DIR);
  if (figures.length === 0) {
    console.error('no derived figures found in data/derived');
    return 1;
  }
  const terms = internalTermsOf(figures);
  const failures = LOCALES.reduce((total, locale) => total + checkLocale(locale, terms), 0);
  if (failures > 0) {
    console.error(`public vocabulary gate: ${failures} operator term(s) reached a public page`);
    return 1;
  }
  console.log(`public vocabulary gate: clean (${LOCALES.length} locales)`);
  return 0;
}

process.exit(main());

/**
 * Build gate for the country scope contract (T8, T19, AC-001-103). Every published locale must
 * carry the country record's `name` and `scopeClause`, and its `hero.statement` must name the
 * country — the headline is the only string a social visitor reads, so the scope belongs in it.
 *
 * This is a build-time check, not a review habit: a locale whose headline omits the country
 * fails `npm run build` with the failing key named, instead of shipping a page whose scope is
 * implied by nothing.
 */
import { COUNTRY_DOCUMENTS, validateDocument } from '../web/content/registry';
import type { DocumentProblem } from '../web/content/registry';

function main(): number {
  const problems: DocumentProblem[] = COUNTRY_DOCUMENTS.flatMap((document) => validateDocument(document));
  for (const problem of problems) {
    console.error(`${problem.country}/${problem.locale} ${problem.code} ${problem.detail}`);
  }
  if (problems.length > 0) {
    console.error(`country scope gate: ${problems.length} content problem(s)`);
    return 1;
  }
  console.log(`country scope gate: clean (${COUNTRY_DOCUMENTS.length} locales)`);
  return 0;
}

process.exit(main());

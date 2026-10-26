/**
 * Build gate: validates the committed derived figures before the site is built. A figure is
 * acceptable only as `computed` (with a value and a complete manifest) or `unavailable`
 * (with no value and a named reason for the absence); every figure must carry a manifest
 * whose five fields validate and whose reproduce path is committed. This is what stops a
 * partial or stale publish from reaching readers.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFINITION_IDS } from '../web/manifest/definitions';
import { FIGURE_IDS } from '../web/ingest/types';
import type { DerivedFigure } from '../web/ingest/types';
import { validateDerivedFigure } from '../web/ingest/validate-figure';
import { readDerivedFigures } from '../web/ingest/write-derived';

const DERIVED_DIR = 'data/derived';

function figureProblems(figure: DerivedFigure): string[] {
  const problems = validateDerivedFigure(figure, {
    fileExists: (path) => existsSync(resolve(process.cwd(), path)),
  }).map((problem) => `${problem.figureId}: ${problem.code} (${problem.detail})`);
  if (figure.availability === 'unavailable' && !figure.unresolvedReason) {
    problems.push(`${figure.figureId}: unavailable figure has no reason`);
  }
  return problems;
}

function missingFigures(figures: readonly DerivedFigure[]): string[] {
  const seen = new Set(figures.map((figure) => figure.figureId));
  return FIGURE_IDS.filter((figureId) => !seen.has(figureId)).map((figureId) => `${figureId}: missing derived file`);
}

/**
 * Every published definition must appear on exactly one figure: a metric's two definitions are
 * published side by side, and none may silently vanish from the deployment (AC-001-82,
 * AC-001-85).
 */
function definitionProblems(figures: readonly DerivedFigure[]): string[] {
  const problems: string[] = [];
  for (const definitionId of DEFINITION_IDS) {
    const published = figures.filter((figure) => figure.definitionId === definitionId);
    if (published.length !== 1) {
      problems.push(`${definitionId}: published by ${published.length} figures, expected 1`);
    }
  }
  return problems;
}

function main(): number {
  const figures = readDerivedFigures(DERIVED_DIR);
  if (figures.length === 0) {
    console.error('no derived figures found in data/derived');
    return 1;
  }
  const problems = [
    ...missingFigures(figures),
    ...definitionProblems(figures),
    ...figures.flatMap(figureProblems),
  ];
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) return 1;
  const computed = figures.filter((figure) => figure.availability === 'computed').length;
  console.log(`derived figures verified: ${figures.length} (${computed} computed, ${figures.length - computed} unavailable)`);
  return 0;
}

process.exit(main());

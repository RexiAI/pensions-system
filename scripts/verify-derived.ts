/**
 * Build gate: validates the committed derived artefacts — figures and series — before the site
 * is built. A figure is
 * acceptable only as `computed` (with a value and a complete manifest) or `unavailable`
 * (with no value and a named reason for the absence); every figure must carry a manifest
 * whose five fields validate and whose reproduce path is committed. This is what stops a
 * partial or stale publish from reaching readers.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DEFINITION_IDS, definitionTextFor, isDefinitionId } from '../web/manifest/definitions';
import { FIGURE_IDS } from '../web/ingest/types';
import type { DerivedFigure } from '../web/ingest/types';
import { SERIES_IDS } from '../web/ingest/series-types';
import type { DerivedSeries } from '../web/ingest/series-types';
import { validateDerivedFigure } from '../web/ingest/validate-figure';
import { readDerivedFigures } from '../web/ingest/write-derived';
import { SERIES_DIR, readDerivedSeries } from '../web/derived/series-store';
import { validateManifest } from '../web/manifest/validate';
import { AGE_BANDS } from '../web/series/age-bands';

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

/**
 * Every published series must be present and `computed`: a series may not ship `unavailable` to
 * dodge a fetch failure, and a missing series is a build failure rather than a silently absent
 * block (T17, T18).
 */
function entryProblems(entry: DerivedSeries): string[] {
  const problems: string[] = [];
  if (!isDefinitionId(entry.definitionId) || entry.definition !== definitionTextFor(entry.definitionId)) {
    problems.push(`${entry.seriesId}: definition does not match its definitionId`);
  }
  const manifest = validateManifest(entry.manifest, {
    fileExists: (path) => existsSync(resolve(process.cwd(), path)),
  });
  if (!manifest.ok) {
    problems.push(
      `${entry.seriesId}: manifest invalid (${manifest.problems.map((p) => `${p.field}:${p.code}`).join(', ')})`,
    );
  }
  return problems;
}

function requiredProblems(seriesId: string, entry: DerivedSeries | undefined): string[] {
  if (!entry) return [`${seriesId}: missing derived series`];
  if (entry.availability === 'computed' && entry.value !== null) return [];
  return [`${seriesId}: published as ${entry.availability}, expected a computed value`];
}

function seriesProblems(series: readonly DerivedSeries[]): string[] {
  return SERIES_IDS.flatMap((seriesId) => {
    const entry = series.find((candidate) => candidate.seriesId === seriesId);
    const required = requiredProblems(seriesId, entry);
    if (required.length > 0 || !entry) return required;
    return entryProblems(entry);
  });
}

/** The pyramid's own invariants, re-checked on the committed file rather than at render time. */
function pyramidProblems(series: readonly DerivedSeries[]): string[] {
  const pyramid = series.find((entry) => entry.seriesId === 'pyramid');
  const value = pyramid?.value as { years?: Array<{ year: number; bands: Array<{ total: number }> }> } | null;
  if (!value?.years) return ['pyramid: no value to check'];
  return value.years.flatMap((year) => {
    const problems: string[] = [];
    if (year.bands.length !== AGE_BANDS.length) {
      problems.push(`pyramid ${year.year}: ${year.bands.length} bands, expected ${AGE_BANDS.length}`);
    }
    const sum = year.bands.reduce((total, band) => total + band.total, 0);
    if (Math.abs(sum - 100) > 0.1) problems.push(`pyramid ${year.year}: band shares sum to ${sum.toFixed(2)}`);
    return problems;
  });
}

function main(): number {
  const figures = readDerivedFigures(DERIVED_DIR);
  const series = readDerivedSeries(SERIES_DIR);
  if (figures.length === 0) {
    console.error('no derived figures found in data/derived');
    return 1;
  }
  const problems = [
    ...missingFigures(figures),
    ...definitionProblems(figures),
    ...figures.flatMap(figureProblems),
    ...seriesProblems(series),
    ...pyramidProblems(series),
  ];
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) return 1;
  const computed = figures.filter((figure) => figure.availability === 'computed').length;
  console.log(`derived figures verified: ${figures.length} (${computed} computed, ${figures.length - computed} unavailable)`);
  console.log(`derived series verified: ${series.length}`);
  return 0;
}

process.exit(main());

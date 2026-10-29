import type { FigureNumber } from '../../content/keys';
import type { DerivedFigure } from '../../ingest/types';
import type { DefinitionId } from '../../manifest/definitions';
import { manifestFieldProblems } from '../../manifest/validate';
import type { PensionShareSeriesValue } from '../../metrics/pension-share';
import type { DependencyRatioSeriesValue } from '../../metrics/dependency-ratio';

export type HeroFigureId = 'fig-01' | 'fig-02';

/**
 * Fixed priority order: the two internationally comparable definitions (D2).
 *
 * The product owner swapped this on 2026-10-26, on the measured series rather than on
 * aesthetics: the pension-expenditure share rises from 9.82% of GDP in 1995 to 13.23% in
 * 2024 (peak 14.39% in 2020), while the dependency ratio is flat across the recent decade
 * (0.3293 in 2016, 0.3314 in 2024), and a flat headline invites "so what" in the first
 * viewport. Do not revert this ordering without the same evidence.
 */
export const HERO_ORDER: readonly HeroFigureId[] = ['fig-02', 'fig-01'];

export interface HeroComparison {
  label: string;
  value: number;
}

export type HeroSubject =
  | {
      kind: 'figure';
      figureId: HeroFigureId;
      definitionId: DefinitionId;
      /**
       * The presentation kind of the figure's own number: `ratio` for the dependency figure,
       * `percentPoints` for the %-of-GDP figure. It is the formatting kind, not a label —
       * `Hero` passes it straight to `formatValue`, so a hero and a plate cannot disagree about
       * whether the stored number is a fraction or percentage points.
       */
      unit: HeroValueKind;
      headline: number;
      comparisons: HeroComparison[];
      /** The years the figure's series actually covers, never a configured range. */
      period: string;
      sourceUrl: string[];
      snapshotIso: string;
    }
  | { kind: 'proposition' };

/** Non-nullable `ValueKind`s a hero figure can carry, so no null label path is reachable here. */
export type HeroValueKind = 'ratio' | 'percentPoints';

interface DatedValue {
  label: string;
  value: number;
}

/**
 * The eligible set is deliberately tiny (D2). `fig-03` is excluded because its headline is
 * the central value of a band, and a hero that shows the central value without its band
 * publishes exactly what AC-001-21 exists to prevent. `fig-04` is excluded because
 * AC-001-25 forbids a single headline implicit-debt number, and the hero is the loudest
 * single-value slot on the site. `fig-05` is excluded because it carries the thesis, and
 * promoting a thesis-adjacent number to the hero would blur the register boundary that
 * AC-001-41 and AC-001-42 protect. `fig-06`/`fig-07` are the national definitions: they are
 * not comparable with the two above and never take the hero.
 */
function eligibleFigure(figure: DerivedFigure | undefined): DerivedFigure | null {
  if (!figure) return null;
  if (figure.availability !== 'computed') return null;
  if (figure.value === null) return null;
  if (manifestFieldProblems(figure.manifest).length > 0) return null;
  return figure;
}

function dated(points: ReadonlyArray<{ label: string; value: number | null }>): DatedValue[] {
  const usable: DatedValue[] = [];
  for (const point of points) {
    if (point.value !== null) usable.push({ label: point.label, value: point.value });
  }
  return usable;
}

/** Three dated values: the first, the middle and the latest of what the series carries. */
export function comparisonsOf(points: readonly DatedValue[]): HeroComparison[] {
  if (points.length === 0) return [];
  const picked = [points[0], points[Math.floor((points.length - 1) / 2)], points[points.length - 1]];
  const seen = new Set<string>();
  const comparisons: HeroComparison[] = [];
  for (const point of picked) {
    if (!point || seen.has(point.label)) continue;
    seen.add(point.label);
    comparisons.push({ label: point.label, value: point.value });
  }
  return comparisons;
}

function periodOf(points: readonly DatedValue[]): string {
  const first = points.at(0);
  const last = points.at(-1);
  if (!first || !last) return '';
  return first.label === last.label ? first.label : `${first.label}-${last.label}`;
}

type HeroFigureSubject = Extract<HeroSubject, { kind: 'figure' }>;

interface HeroReading {
  headline: number;
  points: DatedValue[];
}

/**
 * Everything the hero takes from one figure, one row per figure: the figure's own number (so
 * its label and published definition resolve from the figure, never from the ladder's order
 * or its position) and its unit. Keeping the number, the unit and the value reader in the
 * same row is what makes a label/value mismatch a compile-time impossibility rather than a
 * thing tests have to catch: there is no code path that pairs one figure's reading with
 * another figure's label.
 */
interface HeroFigureSpec {
  figureNumber: FigureNumber;
  unit: HeroValueKind;
  read(figure: DerivedFigure): HeroReading | null;
}

function readDependency(figure: DerivedFigure): HeroReading | null {
  const value = figure.value as DependencyRatioSeriesValue;
  const headline = value.latest?.ratio ?? null;
  if (headline === null) return null;
  return {
    headline,
    points: dated(value.points.map((point) => ({ label: point.period, value: point.ratio }))),
  };
}

function readShare(figure: DerivedFigure): HeroReading | null {
  const value = figure.value as PensionShareSeriesValue;
  const headline = value.latest?.share ?? null;
  if (headline === null) return null;
  return {
    headline,
    points: dated(value.points.map((point) => ({ label: String(point.year), value: point.share }))),
  };
}

const HERO_FIGURE_SPECS: Readonly<Record<HeroFigureId, HeroFigureSpec>> = {
  'fig-01': { figureNumber: 1, unit: 'ratio', read: readDependency },
  'fig-02': { figureNumber: 2, unit: 'percentPoints', read: readShare },
};

/** The figure's own number, so a hero label is never derived from the ladder's order. */
export function heroFigureNumber(figureId: HeroFigureId): FigureNumber {
  return HERO_FIGURE_SPECS[figureId].figureNumber;
}

function figureSubject(
  figureId: HeroFigureId,
  figure: DerivedFigure,
  reading: HeroReading,
): HeroFigureSubject {
  return {
    kind: 'figure',
    figureId,
    definitionId: figure.definitionId,
    unit: HERO_FIGURE_SPECS[figureId].unit,
    headline: reading.headline,
    comparisons: comparisonsOf(reading.points),
    period: periodOf(reading.points),
    sourceUrl: figure.manifest.sourceUrl,
    snapshotIso: figure.manifest.fetchedAt,
  };
}

function subjectFor(figureId: HeroFigureId, figure: DerivedFigure): HeroFigureSubject | null {
  const reading = HERO_FIGURE_SPECS[figureId].read(figure);
  return reading === null ? null : figureSubject(figureId, figure, reading);
}

/**
 * The hero subject ladder, evaluated at build time, first match wins. There is no tier in
 * which the thesis — or any thesis-adjacent figure — becomes the hero: if there is no
 * eligible number, the site leads with what it does, not with what it thinks.
 */
export function selectHeroSubject(figures: readonly DerivedFigure[]): HeroSubject {
  for (const figureId of HERO_ORDER) {
    const candidate = eligibleFigure(figures.find((figure) => figure.figureId === figureId));
    if (candidate === null) continue;
    const subject = subjectFor(figureId, candidate);
    if (subject !== null) return subject;
  }
  return { kind: 'proposition' };
}

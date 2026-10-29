/**
 * The two derived series (T17, T18): what each one needs as input and what it computes. Each
 * carries its own closed `formulaId`/`definitionId` and the sources its manifest must cite.
 */
import { seriesDefinitionFor } from '../manifest/definitions';
import { BASELINE_PROJECTION_LABEL, computeCountdown } from '../series/countdown';
import type { CountdownValue } from '../series/countdown';
import { PYRAMID_PROJECTED_YEAR, computePyramid } from '../series/age-structure';
import type { PyramidValue } from '../series/age-structure';
import type { SourceSnapshot } from '../sources/types';
import type { SeriesDefinition } from './series-types';

/** The snapshot the observed years come from (`demo_pjan`, 1995 and 2025, all ages and sexes). */
export const DEMO_PJAN_SOURCE = 'eurostat-demo-pjan';
/** The projected panel's snapshot (`proj_23np`, baseline, 2050, all ages and sexes). */
export const PROJ_PYRAMID_SOURCE = 'eurostat-proj-23np';
/** The ratio series' snapshot (`proj_23np`, every variant, the two dependency age classes). */
export const PROJ_RATIO_SOURCE = 'eurostat-proj-23np-ratio';

function payloadOf(inputs: ReadonlyMap<string, SourceSnapshot>, sourceId: string): unknown {
  const snapshot = inputs.get(sourceId);
  if (!snapshot?.resolved) throw new Error(`${sourceId} is not resolved`);
  return snapshot.payload;
}

function pyramidAssumptions(value: PyramidValue): Readonly<Record<string, string | number | null>> {
  return {
    bands: value.years[0]?.bands.length ?? 0,
    observedYears: value.years.filter((year) => year.state === 'observed').map((year) => year.year).join(','),
    projectedYear: PYRAMID_PROJECTED_YEAR,
    projectionVariant: BASELINE_PROJECTION_LABEL,
    encoding: 'share of the year total population, percent',
    decimals: value.decimals,
    excludedLabels: value.excludedLabels.join(','),
  };
}

function countdownAssumptions(value: CountdownValue): Readonly<Record<string, string | number | null>> {
  return {
    threshold: value.threshold,
    denominator: '15-64',
    variant: value.variant,
    snapshotYear: value.snapshotYear,
    variantsCrossing: value.variants
      .filter((entry) => entry.thresholdYear !== null)
      .map((entry) => `${entry.variant}:${entry.thresholdYear}`)
      .join(','),
    backCast: value.backCast === null ? null : value.backCast.projected,
    observation: value.backCast === null ? null : value.backCast.observed,
  };
}

export const SERIES: readonly SeriesDefinition[] = [
  {
    seriesId: 'pyramid',
    definitionId: 'age-structure',
    formulaId: seriesDefinitionFor('age-structure').formulaId,
    requirementSources: [DEMO_PJAN_SOURCE, PROJ_PYRAMID_SOURCE],
    compute(inputs) {
      const value = computePyramid({
        observed: payloadOf(inputs, DEMO_PJAN_SOURCE),
        projected: payloadOf(inputs, PROJ_PYRAMID_SOURCE),
      });
      return { value, assumptions: pyramidAssumptions(value) };
    },
  },
  {
    seriesId: 'countdown',
    definitionId: 'old-age-dependency-ratio',
    formulaId: seriesDefinitionFor('old-age-dependency-ratio').formulaId,
    requirementSources: [PROJ_RATIO_SOURCE, DEMO_PJAN_SOURCE],
    compute(inputs, context) {
      const value = computeCountdown({
        projected: payloadOf(inputs, PROJ_RATIO_SOURCE),
        observed: payloadOf(inputs, DEMO_PJAN_SOURCE),
        snapshotYear: context.snapshotYear,
      });
      return { value, assumptions: countdownAssumptions(value) };
    },
  },
];

export function seriesById(seriesId: string): SeriesDefinition | undefined {
  return SERIES.find((series) => series.seriesId === seriesId);
}

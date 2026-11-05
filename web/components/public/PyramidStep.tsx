import type { DerivedSeries } from '../../ingest/series-types';
import { PyramidPlate } from '../series/PyramidPlate';
import { TopStepSection } from './TopStepSection';
import type { StepProps } from './top-steps';

export interface PyramidStepProps extends StepProps {
  /** The age structure; absent or not computed means the step does not exist (AC-004-19). */
  series?: DerivedSeries;
  freshnessWindowDays: number;
}

/**
 * Step 3 — the pyramid moves up and is annotated (spec 004 T4).
 *
 * The step exists only when the series publishes a value. When it does not, nothing renders: no
 * heading, no panel, no "unavailable" row and no method link in its place — the remaining steps
 * keep their order and the reader never meets a section that apologises for itself.
 */
export function PyramidStep({ step, content, series }: PyramidStepProps) {
  if (series === undefined || series.availability !== 'computed' || series.value === null) return null;
  return (
    <TopStepSection step={step} content={content}>
      <PyramidPlate content={content} series={series} />
    </TopStepSection>
  );
}

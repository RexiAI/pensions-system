import { formatWholePercent } from '../../content/format';
import type { DerivedSeries } from '../../ingest/series-types';
import { displayPercent } from '../../series/fuse';
import { FuseLine, fuseValueOf } from '../series/Fuse';
import { TopStepSection } from './TopStepSection';
import type { StepProps } from './top-steps';

export interface DistanceStepProps extends StepProps {
  /** The fuse series; absent or not computed means no step at all (AC-003-18, AC-004-23). */
  series?: DerivedSeries;
}

/**
 * Step 4 — the fuse as a simple percentage (spec 004 T5).
 *
 * The drawing is the one it always was — the same `viewBox`, the same cord and burnt rectangles
 * from `burnPoint`, `aria-hidden` and `focusable="false"`, no `role="progressbar"` and no value
 * attribute — and the face states one quantity and nothing else: the whole percent, computed by
 * `displayPercent` / `formatWholePercent` from the committed value. Its words name what the
 * percentage is a share of, because it is the observed ratio's share of the threshold and not
 * elapsed time (a 62-point difference in a five-step story that reads as one road).
 *
 * The technical label, the dataset name, the reproduce link and the provenance are methodological
 * precision: they render inside `#metodo`, never here.
 */
export function DistanceStep({ step, content, series }: DistanceStepProps) {
  const value = fuseValueOf(series);
  if (value === undefined) return null;
  return (
    <TopStepSection step={step} content={content}>
      <figure className="fuse">
        <FuseLine consumedPercent={value.consumedPercent} />
        <figcaption className="fuse__label">
          {content.t('steps.distance.sentence', {
            percent: formatWholePercent(displayPercent(value.consumedPercent), content.locale),
          })}
        </figcaption>
      </figure>
    </TopStepSection>
  );
}

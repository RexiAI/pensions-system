import { TopStepSection } from './TopStepSection';
import { thresholdNumerals } from './step-numerals';
import type { StepProps } from './top-steps';

/**
 * Step 2 — what breaks, in one plain line (spec 004 T3).
 *
 * One `<p>`, one content key, and both numbers bound to their sources: the threshold is the
 * countdown's own documented parameter and the base is the published ratio's denominator, so the
 * sentence cannot drift from the series it describes. Nothing else renders here — no figure, no
 * chart, no provenance, no link — and the target date belongs to step 1, not to this statement.
 */
export function BreakageStep({ step, content }: StepProps) {
  return (
    <TopStepSection step={step} content={content}>
      <p className="step__statement">
        {content.t('steps.breakage.sentence', thresholdNumerals(content.locale))}
      </p>
    </TopStepSection>
  );
}

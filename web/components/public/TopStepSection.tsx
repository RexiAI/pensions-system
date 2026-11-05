import type { ReactNode } from 'react';
import type { CountryLocaleContent } from '../../content/types';
import type { TopStep } from './top-steps';

export interface TopStepSectionProps {
  step: TopStep;
  content: CountryLocaleContent;
  /** Rendered above the step label: step 1's `<h1>` is the only current user. */
  lead?: ReactNode;
  children: ReactNode;
}

/**
 * One step of the story (spec 004 T1): a labelled `<section>` whose only chrome is its `<h2>`
 * step label. The DOM order is the reading order — this shell declares no `order`, no
 * `grid-column` and no `grid-area`, so a presentation rule cannot re-sequence it (the defect
 * spec 004 exists to remove).
 *
 * The label sits before the step's body except where a `lead` is handed in: step 1 opens with
 * the page's `<h1>` and then its own label, which keeps the heading order monotonic without
 * putting anything but the story above the story.
 */
export function TopStepSection({ step, content, lead, children }: TopStepSectionProps) {
  return (
    <section
      className={`step step--${step.id}`}
      id={step.sectionId}
      data-top-step={step.id}
      aria-labelledby={step.headingId}
    >
      {lead}
      <h2 className="step__label" id={step.headingId}>
        {content.t(step.headingKey)}
      </h2>
      {children}
    </section>
  );
}

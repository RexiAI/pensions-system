import { TopStepSection } from './TopStepSection';
import type { StepProps } from './top-steps';

/**
 * Step 5 — what it means, and the one action (spec 004 T6).
 *
 * One sentence at the statement size, then the page's only primary action: the `hero.ctaPrimary`
 * label pointing at `#figuras`. The reason precedes the ask, and the ask is a real target — the
 * in-page anchor carries `scroll-margin-block-start` so the click does not land under the sticky
 * header. No second button, no accent on anything else, no reassurance copy under the button.
 */
export function MeaningStep({ step, content }: StepProps) {
  return (
    <TopStepSection step={step} content={content}>
      <p className="step__statement">{content.t('steps.meaning.sentence')}</p>
      <a className="hero__cta" href="#figuras">
        {content.t('hero.ctaPrimary')}
      </a>
    </TopStepSection>
  );
}

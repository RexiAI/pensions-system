import { pagePathFor } from '../../seo/routes';
import { TopStepSection } from './TopStepSection';
import type { StepProps } from './top-steps';

/**
 * Step 5 — what it means, and the one action (spec 004 T6, re-pointed by spec 007 T2).
 *
 * One sentence at the statement size, then the page's only primary action: the `hero.ctaPrimary`
 * label pointing at the Cifras page, where the plates live. The reason precedes the ask, and the
 * ask is a real page link — no in-page anchor survives the four-page split. No second button, no
 * accent on anything else, no reassurance copy under the button.
 */
export function MeaningStep({ step, content }: StepProps) {
  return (
    <TopStepSection step={step} content={content}>
      <p className="step__statement">{content.t('steps.meaning.sentence')}</p>
      <a className="hero__cta" href={pagePathFor(content.locale, 'cifras')}>
        {content.t('hero.ctaPrimary')}
      </a>
    </TopStepSection>
  );
}

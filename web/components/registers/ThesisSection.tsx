import { FIGURE_NUMBERS, FIGURE_KEYS } from '../../content/keys';
import type { FigureNumber } from '../../content/keys';
import type { CountryLocaleContent, ThesisEditorial } from '../../content/types';

export interface ThesisSectionProps {
  content: CountryLocaleContent;
  thesis?: ThesisEditorial;
}

function isFigureNumber(value: string): value is `fig-0${FigureNumber}` {
  return FIGURE_NUMBERS.some((number) => value === `fig-0${number}`);
}

/**
 * Register 3 of 3 (T10): the site's own reading, structurally isolated. Its own ground,
 * its own rule, the serif voice, a signature and an explicit disclaimer. No computed
 * figure links into it: the links run one way, out to the figures it rests on.
 */
export function ThesisSection({ content, thesis }: ThesisSectionProps) {
  const unit = thesis ?? content.editorial.thesis;
  return (
    <section className="register register--thesis" data-register="thesis" aria-labelledby="thesis-heading">
      <h2 className="register__label" id="thesis-heading">
        {content.t('thesis.label')}
      </h2>
      <p className="thesis__disclaimer">{content.t('thesis.disclaimer')}</p>
      <p className="thesis__statement">{unit.statement}</p>
      <div className="thesis__prose">
        {unit.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="thesis__signature">{`${unit.signatureName}, ${unit.signatureRole}`}</p>
      <p className="thesis__figures">
        <span className="thesis__figures-label">{content.t('thesis.figuresLabel')}</span>{' '}
        {unit.figureLinks
          .filter(isFigureNumber)
          .map((link) => content.t(FIGURE_KEYS[Number(link.slice(-1)) as FigureNumber].title))
          .join(' · ')}
      </p>
    </section>
  );
}

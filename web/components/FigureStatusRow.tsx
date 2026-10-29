import { FIGURE_KEYS } from '../content/keys';
import type { FigureNumber, LocaleKey } from '../content/keys';
import type { CountryLocaleContent } from '../content/types';

export interface FigureStatusRowProps {
  figureNumber: FigureNumber;
  content: CountryLocaleContent;
  state: 'unavailable' | 'withheld';
  /** The published definition of the figure, so the reader sees what is missing (AC-001-82). */
  definition?: string;
  /** The specific reason this figure has no value; defaults to the state's own sentence. */
  reason?: string;
}

const CHIP_KEYS: Readonly<Record<'unavailable' | 'withheld', LocaleKey>> = {
  unavailable: 'figure.unavailable.chip',
  withheld: 'figure.withheld.chip',
};

const REASON_KEYS: Readonly<Record<'unavailable' | 'withheld', LocaleKey>> = {
  unavailable: 'figure.unavailable.reason',
  withheld: 'figure.withheld.reason',
};

/**
 * An unresolved figure stops being a figure (D1): one ruled row — the figure's name as a
 * link to its own anchor, a two-word state chip, its definition, the specific reason it has
 * no value, one method link. No plate, no chart frame, no numeral at any scale.
 */
export function FigureStatusRow({ figureNumber, content, state, definition, reason }: FigureStatusRowProps) {
  const anchor = `fig-0${figureNumber}`;
  const reasonText = reason ?? content.t(REASON_KEYS[state]);
  return (
    <section
      className="figure-row"
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      data-state={state}
    >
      <div className="figure-row__head">
        <h2 className="figure-row__title" id={`${anchor}-title`}>
          <a href={`#${anchor}`}>{content.t(FIGURE_KEYS[figureNumber].title)}</a>
        </h2>
        <span className="figure-row__chip">{content.t(CHIP_KEYS[state])}</span>
      </div>
      {definition ? (
        <p className="figure-row__definition">
          <span className="figure-row__definition-label">{content.t('fig.definitionLabel')}</span> {definition}
        </p>
      ) : null}
      <p className="figure-row__reason">{reasonText}</p>
      <a className="figure-row__method" href="#metodo">
        {content.t('figure.methodLink')}
      </a>
    </section>
  );
}


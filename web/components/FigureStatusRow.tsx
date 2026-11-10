import { FIGURE_KEYS } from '../content/keys';
import type { FigureNumber, LocaleKey } from '../content/keys';
import type { CountryLocaleContent } from '../content/types';
import { pagePathFor } from '../seo/routes';

type FigureState = 'unavailable' | 'withheld';

export interface FigureStatusRowProps {
  figureNumber: FigureNumber;
  content: CountryLocaleContent;
  state: FigureState;
  /** The published definition of the figure, so the reader sees what is missing (AC-001-82). */
  definition?: string;
  /** The specific reason this figure has no value; defaults to the state's own sentence. */
  reason?: string;
  /**
   * Inside the collapsed "en preparación" block (spec 003 T5): the title steps down one heading
   * level under the block's own heading, and the state chip is not repeated — the block states it
   * once for every row.
   */
  nested?: boolean;
}

const CHIP_KEYS: Readonly<Record<FigureState, LocaleKey>> = {
  unavailable: 'figure.unavailable.chip',
  withheld: 'figure.withheld.chip',
};

const REASON_KEYS: Readonly<Record<FigureState, LocaleKey>> = {
  unavailable: 'figure.unavailable.reason',
  withheld: 'figure.withheld.reason',
};

interface FigureRowHeadProps {
  figureNumber: FigureNumber;
  content: CountryLocaleContent;
  state: FigureState;
  anchor: string;
  nested: boolean;
}

/** The figure's name as a link to its own anchor, and — unless nested — the two-word state chip. */
function FigureRowHead({ figureNumber, content, state, anchor, nested }: FigureRowHeadProps) {
  const Title = nested ? 'h3' : 'h2';
  return (
    <div className="figure-row__head">
      <Title className="figure-row__title" id={`${anchor}-title`}>
        <a href={`#${anchor}`}>{content.t(FIGURE_KEYS[figureNumber].title)}</a>
      </Title>
      {nested ? null : <span className="figure-row__chip">{content.t(CHIP_KEYS[state])}</span>}
    </div>
  );
}

/** The published definition of the missing figure (AC-001-82). */
function FigureRowDefinition({ content, definition }: { content: CountryLocaleContent; definition: string }) {
  return (
    <p className="figure-row__definition">
      <span className="figure-row__definition-label">{content.t('fig.definitionLabel')}</span> {definition}
    </p>
  );
}

/**
 * An unresolved figure stops being a figure (D1): one ruled row — the figure's name as a
 * link to its own anchor, a two-word state chip, its definition, the specific reason it has
 * no value, one method link. No plate, no chart frame, no numeral at any scale.
 */
export function FigureStatusRow({ figureNumber, content, state, definition, reason, nested = false }: FigureStatusRowProps) {
  const anchor = `fig-0${figureNumber}`;
  const reasonText = reason ?? content.t(REASON_KEYS[state]);
  return (
    <section
      className="figure-row"
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      data-state={state}
    >
      <FigureRowHead figureNumber={figureNumber} content={content} state={state} anchor={anchor} nested={nested} />
      {definition ? <FigureRowDefinition content={content} definition={definition} /> : null}
      <p className="figure-row__reason">{reasonText}</p>
      <a className="figure-row__method" href={pagePathFor(content.locale, 'metodo')}>
        {content.t('figure.methodLink')}
      </a>
    </section>
  );
}

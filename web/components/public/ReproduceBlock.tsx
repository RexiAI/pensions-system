import { FIGURE_KEYS } from '../../content/keys';
import type { FigureNumber } from '../../content/keys';
import { formatDate } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import { reproduceCommand } from '../reproduce-command';

export interface ReproduceBlockProps {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
}

/** The harness made visible: formula id, snapshot date, full digest, and the command. */
export function ReproduceBlock({ content, figures }: ReproduceBlockProps) {
  return (
    <section className="reproduce" id="reproducir" aria-labelledby="reproduce-heading" data-operator="true">
      <h2 id="reproduce-heading">{content.t('reproduce.heading')}</h2>
      <p>{content.t('reproduce.body')}</p>
      {figures.map((figure) => {
        const number = Number(figure.figureId.slice(-1)) as FigureNumber;
        return (
          <div className="reproduce__row" key={figure.figureId}>
            <span>{content.t(FIGURE_KEYS[number].title)}</span>
            <code>{figure.formulaId}</code>
            <time dateTime={figure.manifest.fetchedAt}>{formatDate(figure.manifest.fetchedAt, content.locale)}</time>
            <code className="hash hash--full">{figure.manifest.inputHash}</code>
            <code>{reproduceCommand(figure.manifest, figure.figureId)}</code>
          </div>
        );
      })}
    </section>
  );
}

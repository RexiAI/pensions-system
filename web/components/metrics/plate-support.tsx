import type { ReactNode } from 'react';
import { figureReasonKey, FIGURE_KEYS } from '../../content/keys';
import type { FigureNumber, LocaleKey } from '../../content/keys';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import { publisherForUrl } from '../../sources/labels';
import { FigureFrame } from '../FigureFrame';
import { FigureStatusRow } from '../FigureStatusRow';
import { ProvenanceStrip } from '../ProvenanceStrip';
import { isLedgerState } from './figure-state';
import type { FigureState } from './figure-state';

export interface MetricPlateProps {
  figure: DerivedFigure;
  content: CountryLocaleContent;
  freshnessWindowDays: number;
}

export function sourceSummary(figure: DerivedFigure): string {
  const names = [...new Set(figure.manifest.sourceUrl.map(publisherForUrl))];
  return names.join(', ');
}

export interface PlateShellProps extends MetricPlateProps {
  figureNumber: FigureNumber;
  state: FigureState;
  nullReasonKey: LocaleKey;
  children: ReactNode;
}

/**
 * The one place a figure chooses its form. A ledger state (unavailable, withheld) renders the
 * 48px row and never a plate; a computed plate carries the provenance strip; a null-value
 * plate states its reason in the caption and carries no strip, because it publishes no value.
 */
export function PlateShell({
  figure,
  content,
  freshnessWindowDays,
  figureNumber,
  state,
  nullReasonKey,
  children,
}: PlateShellProps) {
  const keys = FIGURE_KEYS[figureNumber];
  if (isLedgerState(state)) {
    return (
      <FigureStatusRow
        figureNumber={figureNumber}
        content={content}
        state={state}
        definition={content.t(keys.definition)}
        reason={state === 'unavailable' ? content.t(figureReasonKey(figureNumber)) : undefined}
      />
    );
  }
  return (
    <FigureFrame
      figureNumber={figureNumber}
      titleId={`fig-0${figureNumber}-title`}
      label={content.t('fig.label')}
      title={content.t(keys.title)}
      caption={content.t(keys.caption)}
      definition={content.t(keys.definition)}
      definitionLabel={content.t('fig.definitionLabel')}
      note={state === 'null-value' ? content.t(nullReasonKey) : null}
      limit={content.t(keys.limit)}
      limitLabel={content.t('fig.limitLabel')}
    >
      {children}
      {state === 'computed' ? (
        <ProvenanceStrip
          manifest={figure.manifest}
          figureId={figure.figureId}
          freshnessWindowDays={freshnessWindowDays}
          content={content}
        />
      ) : null}
    </FigureFrame>
  );
}

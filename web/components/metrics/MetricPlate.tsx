import type { FigureNumber } from '../../content/keys';
import { PlateBody } from './PlateBody';
import { PlateShell } from './plate-support';
import type { MetricPlateProps } from './plate-support';
import { nullReason, VIEW_BUILDERS } from './views';

export interface MetricPlatePropsWithNumber extends MetricPlateProps {
  figureNumber: FigureNumber;
}

/**
 * One plate grammar for all five figures (design §Page inventory, deliberate override): the
 * plate differs by which view builder it reads and which caption keys it uses, so it is one
 * component with a figure number rather than five near-identical ones.
 */
export function MetricPlate({ figureNumber, figure, content, freshnessWindowDays }: MetricPlatePropsWithNumber) {
  const view = VIEW_BUILDERS[figureNumber]({ figure, content });
  return (
    <PlateShell
      figure={figure}
      content={content}
      freshnessWindowDays={freshnessWindowDays}
      figureNumber={figureNumber}
      state={view.state}
      nullReasonKey={nullReason(figure.figureId)}
    >
      <PlateBody
        view={view}
        readoutLabel={content.t('fig.readoutLabel')}
        nullLabel={content.t('table.notDefined')}
      />
    </PlateShell>
  );
}

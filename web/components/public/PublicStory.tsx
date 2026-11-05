import { Fragment, type ReactNode } from 'react';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedSeries } from '../../ingest/series-types';
import type { CountdownValue } from '../../series/countdown';
import { BreakageStep } from './BreakageStep';
import { DistanceStep } from './DistanceStep';
import { MeaningStep } from './MeaningStep';
import { NumberStep } from './NumberStep';
import { PyramidStep } from './PyramidStep';
import { TOP_STEPS } from './top-steps';
import type { TopStep, TopStepId } from './top-steps';

export interface PublicStoryProps {
  content: CountryLocaleContent;
  /** The committed countdown; absent means step 1 states no number. */
  countdown?: CountdownValue;
  /** The age structure; absent or not computed means step 3 does not exist. */
  pyramid?: DerivedSeries;
  /** The fuse; absent or not computed means step 4 does not exist. */
  fuse?: DerivedSeries;
  nowMs: number;
  freshnessWindowDays: number;
}

/**
 * The step's body, chosen from its id — the one place the composition maps a step to a component.
 * `TOP_STEPS` decides the order and the ids; this table decides what each one renders, and its
 * `Record<TopStepId, …>` type is what makes a new step id a compile error until it has a body.
 */
const BODIES: Readonly<Record<TopStepId, (step: TopStep, props: PublicStoryProps) => ReactNode>> = {
  number: (step, props) => (
    <NumberStep step={step} content={props.content} countdown={props.countdown} nowMs={props.nowMs} />
  ),
  breakage: (step, props) => <BreakageStep step={step} content={props.content} />,
  why: (step, props) => (
    <PyramidStep
      step={step}
      content={props.content}
      series={props.pyramid}
      freshnessWindowDays={props.freshnessWindowDays}
    />
  ),
  distance: (step, props) => <DistanceStep step={step} content={props.content} series={props.fuse} />,
  meaning: (step, props) => <MeaningStep step={step} content={props.content} />,
};

/**
 * The page's lead (spec 004 T1): five steps in `TOP_STEPS` order, and nothing else.
 *
 * A step whose data is absent renders nothing at all — no empty shell, no heading with nothing
 * under it, no "unavailable" row in its place (T13's first rule). The reader therefore meets
 * between one and five steps depending on what this deployment publishes, always in this order.
 */
export function PublicStory(props: PublicStoryProps) {
  return (
    <div className="story">
      {TOP_STEPS.map((step) => (
        <Fragment key={step.id}>{BODIES[step.id](step, props)}</Fragment>
      ))}
    </div>
  );
}

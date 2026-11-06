import { formatDate, formatValue } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import { CLOCK_TIME_ZONE, readClock } from '../../series/clock';
import type { CountdownValue } from '../../series/countdown';
import { TopStepSection } from './TopStepSection';
import { thresholdNumerals } from './step-numerals';
import type { StepProps } from './top-steps';

export interface NumberStepProps extends StepProps {
  /** The committed countdown, or `undefined` when the deployment publishes none. */
  countdown?: CountdownValue;
  nowMs: number;
}

/** The anchor's date as the reader sees it: Madrid's calendar, never UTC. */
function anchorDate(countdown: CountdownValue, content: CountryLocaleContent): string {
  return formatDate(countdown.anchor ?? '', content.locale, CLOCK_TIME_ZONE);
}

/**
 * The number group: the day numeral and its unit, one measured quantity (spec 006 T2, T11). The
 * years numeral and the three sub-day fields are absent from the DOM, not hidden. The group
 * carries the render instant it was computed at (D16), so a stale value is attributable rather
 * than invisible, and it carries no accessible name restating the date: the sentence is the
 * date's only accessible path (AC-004-29, AC-005-09).
 */
function NumberGroup({
  content,
  countdown,
  nowMs,
}: {
  content: CountryLocaleContent;
  countdown: CountdownValue;
  nowMs: number;
}) {
  const reading = readClock(countdown.anchor ?? '', nowMs);
  const days = formatValue(reading.days, 'integer', content.locale, '');
  return (
    <div className="clock" data-rendered-at={new Date(nowMs).toISOString()}>
      <p className="clock__field--days">
        <span className="clock__value clock__value--days">{days}</span>{' '}
        <span className="clock__label">{content.t('countdown.clock.days')}</span>
      </p>
    </div>
  );
}

/** The countdown the number group can measure: computed, carrying an anchor, and still ahead. */
function measured(countdown: CountdownValue, nowMs: number): CountdownValue | undefined {
  if (countdown.state !== 'computed' || countdown.anchor === null) return undefined;
  return readClock(countdown.anchor, nowMs).elapsed ? undefined : countdown;
}

/**
 * Step 1's one sentence: the target date, then the two numerals the story states as one fact.
 * The date is stated here and nowhere else in the story.
 */
function NumberSentence({
  content,
  countdown,
}: {
  content: CountryLocaleContent;
  countdown: CountdownValue;
}) {
  return (
    <p className="step__sentence">
      {content.t('steps.number.sentence', {
        date: anchorDate(countdown, content),
        ...thresholdNumerals(content.locale),
      })}
    </p>
  );
}

/** The step's body: the one measurement and one sentence, or the projection's own fallback. */
function NumberBody({
  content,
  countdown,
  nowMs,
}: {
  content: CountryLocaleContent;
  countdown?: CountdownValue;
  nowMs: number;
}) {
  if (countdown?.state === 'not-crossed') {
    return (
      <p className="step__sentence">
        {content.t('countdown.notCrossed', { year: countdown.horizonEnd })}
      </p>
    );
  }
  if (countdown === undefined) return null;
  const value = measured(countdown, nowMs);
  // The elapsed state renders the sentence and no numeral: the date has passed, and nothing more
  // (AC-001-115). Zero days would be a reading, not a statement.
  if (value === undefined) return <NumberSentence content={content} countdown={countdown} />;
  return (
    <>
      <NumberGroup content={content} countdown={value} nowMs={nowMs} />
      <NumberSentence content={content} countdown={value} />
    </>
  );
}

/**
 * Step 1 — the number, in plain words (spec 004 T2, spec 006 T11). The `<h1>` opens the page, the
 * step's label follows it, then the one measured quantity, then one sentence.
 *
 * The numeral is server-rendered and final: there is no client clock, no timer and no placeholder
 * to correct (spec 006 T12). Without a threshold year there is no numeral and the projection's own
 * not-crossed sentence takes its place (AC-001-110); without a countdown at all the step is its
 * title, its label and nothing that claims a number.
 */
export function NumberStep({ step, content, countdown, nowMs }: NumberStepProps) {
  return (
    <TopStepSection
      step={step}
      content={content}
      lead={
        <h1 className="hero__title" id="hero-title">
          {content.t('hero.statement')}
        </h1>
      }
    >
      <NumberBody content={content} countdown={countdown} nowMs={nowMs} />
    </TopStepSection>
  );
}

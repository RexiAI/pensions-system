import { formatDate, formatValue } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import { CLOCK_TIME_ZONE } from '../../series/clock';
import type { CountdownValue } from '../../series/countdown';
import { CountdownClock } from '../series/CountdownClock';
import { TopStepSection } from './TopStepSection';
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
 * The number group: the years numeral, the day count and the three sub-day fields, one measured
 * quantity. It renders only where an anchor exists — no threshold year, no clock (AC-001-110) —
 * and it carries no footnote of any kind (spec 004 T2: no definition, range, source, back-cast,
 * year label, conventional-date line or arithmetic inside the step).
 */
function NumberGroup({ content, countdown, nowMs }: { content: CountryLocaleContent; countdown: CountdownValue; nowMs: number }) {
  return (
    <CountdownClock
      anchor={countdown.anchor ?? ''}
      nowMs={nowMs}
      locale={content.locale}
      strings={{
        a11y: content.t('countdown.clock.a11y', { date: anchorDate(countdown, content) }),
        days: content.t('countdown.clock.days'),
        hours: content.t('countdown.clock.hours'),
        minutes: content.t('countdown.clock.minutes'),
        seconds: content.t('countdown.clock.seconds'),
      }}
      years={formatValue(countdown.years, 'integer', content.locale, '')}
      yearsUnit={content.t('countdown.unit')}
    />
  );
}

/** The countdown the number group can measure: computed, and carrying an anchor to count to. */
function measured(countdown: CountdownValue): CountdownValue | undefined {
  return countdown.state === 'computed' && countdown.anchor !== null ? countdown : undefined;
}

/** The step's body: the measurement and one sentence, or the projection's own fallback. */
function NumberBody({ content, countdown, nowMs }: { content: CountryLocaleContent; countdown?: CountdownValue; nowMs: number }) {
  if (countdown?.state === 'not-crossed') {
    return <p className="step__sentence">{content.t('countdown.notCrossed', { year: countdown.horizonEnd })}</p>;
  }
  if (countdown === undefined) return null;
  const value = measured(countdown);
  if (value === undefined) return null;
  return (
    <>
      <NumberGroup content={content} countdown={value} nowMs={nowMs} />
      <p className="step__sentence">{content.t('steps.number.sentence', { date: anchorDate(value, content) })}</p>
    </>
  );
}

/**
 * Step 1 — the number, in plain words (spec 004 T2, T7). The `<h1>` opens the page, the step's
 * label follows it, then the measurement, then one sentence.
 *
 * The sentence is where the target date appears in the story, and where it appears only once:
 * the three paraphrases the band carried are gone, and the clock's accessible name — an
 * attribute, not a text node — states the same date for assistive technology. Without an anchor
 * there is no date to state, so the projection's own not-crossed sentence takes its place
 * (AC-001-101, AC-001-110), and without a countdown at all the step is its title, its label and
 * nothing that claims a number.
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

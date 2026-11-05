import { formatDate, formatYear } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import { CLOCK_TIME_ZONE, readClock } from '../../series/clock';
import type { CountdownValue } from '../../series/countdown';
import { ratioFormat } from '../metrics/view-support';

export interface CountdownPrecisionProps {
  content: CountryLocaleContent;
  countdown: CountdownValue;
  nowMs: number;
}

/** The one printed quantity of the projection: the threshold year and the label that names it. */
function YearLine({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  if (countdown.thresholdYear === null) return null;
  return (
    <p className="countdown__year-line">
      <span className="countdown__year">{formatYear(countdown.thresholdYear, content.locale)}</span>{' '}
      <span className="countdown__year-label">{content.t('countdown.yearLabel')}</span>
    </p>
  );
}

/** The variant range, absent when the projection publishes none. */
function RangeLine({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  if (countdown.range === null) return null;
  return (
    <p className="countdown__range">
      {content.t('countdown.range', {
        min: formatYear(countdown.range.min, content.locale),
        max: formatYear(countdown.range.max, content.locale),
      })}
    </p>
  );
}

/** The date the countdown counts to, with the label that names it. */
function AnchorLine({ content, date }: { content: CountryLocaleContent; date: string }) {
  if (date === '') return null;
  return (
    <p className="clock__anchor">
      <span className="clock__anchor-label">{content.t('countdown.clock.anchorLabel')}</span>{' '}
      <span className="clock__anchor-date">{content.t('countdown.clock.anchor', { date })}</span>
    </p>
  );
}

/** The back-cast comparison, absent when the projection carries none. */
function BackCastLine({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  if (countdown.backCast === null) return null;
  const formatRatio = ratioFormat(content);
  return (
    <p className="countdown__backcast">
      {content.t('countdown.backCast', {
        projected: formatRatio(countdown.backCast.projected),
        observed: formatRatio(countdown.backCast.observed),
        year: countdown.backCast.year,
      })}
    </p>
  );
}

/** The anchor's calendar date in the reader's locale, or an empty string without an anchor. */
function dateOf(countdown: CountdownValue, content: CountryLocaleContent): string {
  return countdown.anchor === null ? '' : formatDate(countdown.anchor, content.locale, CLOCK_TIME_ZONE);
}

/** Whether the clock has passed its anchor — the state the definition sentence is written in. */
function elapsedAt(countdown: CountdownValue, nowMs: number): boolean {
  return countdown.anchor !== null && readClock(countdown.anchor, nowMs).elapsed;
}

/** The definition of the reading, in the tense the clock's own state selects. */
function DefinitionLine({ content, date, elapsed }: { content: CountryLocaleContent; date: string; elapsed: boolean }) {
  return (
    <p className="clock__definition">
      {content.t(elapsed ? 'countdown.clock.elapsed' : 'countdown.clock.definition', { date })}
    </p>
  );
}

/** The arithmetic the printed years are the difference of. */
function ArithmeticLine({ content, countdown, date }: { content: CountryLocaleContent; countdown: CountdownValue; date: string }) {
  return (
    <p className="clock__arithmetic">
      {content.t('countdown.clock.arithmetic', {
        years: formatYear(countdown.years ?? 0, content.locale),
        thresholdYear: formatYear(countdown.thresholdYear ?? 0, content.locale),
        snapshotYear: formatYear(countdown.snapshotYear, content.locale),
        date,
      })}
    </p>
  );
}

/**
 * The countdown's own precision: what the year means, where it came from and how it is counted
 * (spec 004 T8). Every string is the content model's own, verbatim — the story drops precision by
 * demoting it below the fold, never by deleting it or summarising it.
 */
export function CountdownPrecision({ content, countdown, nowMs }: CountdownPrecisionProps) {
  const date = dateOf(countdown, content);
  return (
    <div className="method__group">
      <p className="countdown__eyebrow">{content.t('countdown.eyebrow')}</p>
      <p className="countdown__definition">{content.t('countdown.definition')}</p>
      <YearLine content={content} countdown={countdown} />
      <RangeLine content={content} countdown={countdown} />
      <AnchorLine content={content} date={date} />
      <DefinitionLine content={content} date={date} elapsed={elapsedAt(countdown, nowMs)} />
      <ArithmeticLine content={content} countdown={countdown} date={date} />
      <BackCastLine content={content} countdown={countdown} />
      <p className="countdown__source">{content.t('countdown.source')}</p>
      <p className="method__note">
        {content.t('provenance.observedAt')} {formatYear(countdown.snapshotYear, content.locale)}
      </p>
    </div>
  );
}

import { formatDate, formatValue, formatYear } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import { CLOCK_TIME_ZONE } from '../../series/clock';
import type { CountdownValue } from '../../series/countdown';
import { CountdownClock } from './CountdownClock';
import type { ClockStrings } from './CountdownClock';

export interface CountdownBlockProps {
  content: CountryLocaleContent;
  countdown: CountdownValue;
  /** The render instant for the clock's server render. Defaults to now; a test pins it. */
  nowMs?: number;
}

function ratio(content: CountryLocaleContent, value: number): string {
  return formatValue(value, 'ratio', content.locale, content.t('table.notDefined'));
}

/**
 * The clock's ten strings, resolved here so the client leaf receives plain text and never the
 * content object. Every one of them comes from `countdown.clock.*`: nothing in the clock's
 * subtree can resolve from the `thesis.*` namespace (AC-001-116).
 */
function clockStrings(content: CountryLocaleContent, countdown: CountdownValue, anchor: string): ClockStrings {
  const date = formatDate(anchor, content.locale, CLOCK_TIME_ZONE);
  const years = countdown.years === null ? 0 : countdown.years;
  return {
    a11y: content.t('countdown.clock.a11y', { date }),
    anchor: content.t('countdown.clock.anchor', { date }),
    anchorLabel: content.t('countdown.clock.anchorLabel'),
    definition: content.t('countdown.clock.definition', { date }),
    arithmetic: content.t('countdown.clock.arithmetic', {
      years: formatYear(years, content.locale),
      thresholdYear: formatYear(countdown.thresholdYear ?? 0, content.locale),
      snapshotYear: formatYear(countdown.snapshotYear, content.locale),
      date,
    }),
    elapsed: content.t('countdown.clock.elapsed'),
    days: content.t('countdown.clock.days'),
    hours: content.t('countdown.clock.hours'),
    minutes: content.t('countdown.clock.minutes'),
    seconds: content.t('countdown.clock.seconds'),
  };
}

/** The clock rail renders only where an anchor exists: no threshold year, no clock (AC-001-110). */
function ClockRail({
  content,
  countdown,
  nowMs,
}: {
  content: CountryLocaleContent;
  countdown: CountdownValue;
  nowMs: number;
}) {
  if (countdown.anchor === null) return null;
  return (
    <CountdownClock
      anchor={countdown.anchor}
      nowMs={nowMs}
      locale={content.locale}
      strings={clockStrings(content, countdown, countdown.anchor)}
    />
  );
}

/**
 * The countdown block (T18, R2; the clock rail T20, Revision 3 §P2).
 *
 * Two quantities, deliberately never merged:
 *
 *  - **The projection** — two printed integers and the year they land on, with the threshold,
 *    the variant range, the source and the definition beside them. Static: it changes when the
 *    projection is revised, not when the clock moves.
 *  - **The clock rail** — days, hours, minutes and seconds to the anchor, the conventional date
 *    the threshold year is assigned. It renders only when the derived `thresholdYear` exists
 *    (`no anchor, no clock`), carries the anchor as visible text, and never states that the
 *    threshold is crossed.
 *
 * The 1px rule between them is not decoration: it is what keeps the years numeral and the day
 * count out of one typographic group, so a reader is never invited to divide one by the other.
 */
export function CountdownBlock({ content, countdown, nowMs = Date.now() }: CountdownBlockProps) {
  if (countdown.state !== 'computed') {
    return (
      <section className="countdown countdown--not-crossed" aria-label={content.t('countdown.eyebrow')}>
        <p className="countdown__eyebrow">{content.t('countdown.eyebrow')}</p>
        <div className="countdown__rule" aria-hidden="true" />
        <p className="countdown__statement">{content.t('countdown.notCrossed', { year: countdown.horizonEnd })}</p>
        <p className="countdown__source">{content.t('countdown.source')}</p>
      </section>
    );
  }
  return (
    <section className="countdown" aria-labelledby="countdown-eyebrow">
      <p className="countdown__eyebrow" id="countdown-eyebrow">
        {content.t('countdown.eyebrow')}
      </p>
      <div className="countdown__rule" aria-hidden="true" />
      <p className="countdown__value">
        <span className="countdown__numeral">{formatValue(countdown.years, 'integer', content.locale, '')}</span>{' '}
        <span className="countdown__unit">{content.t('countdown.unit')}</span>
      </p>
      <p className="countdown__year-line">
        <span className="countdown__year">{formatYear(countdown.thresholdYear ?? 0, content.locale)}</span>{' '}
        <span className="countdown__year-label">{content.t('countdown.yearLabel')}</span>
      </p>
      <p className="countdown__definition">{content.t('countdown.definition')}</p>
      <p className="countdown__range">
        {countdown.range === null
          ? ''
          : content.t('countdown.range', {
              min: formatYear(countdown.range.min, content.locale),
              max: formatYear(countdown.range.max, content.locale),
            })}
      </p>
      <p className="countdown__source">
        {content.t('countdown.source')} · {content.t('provenance.observedAt')}{' '}
        {formatYear(countdown.snapshotYear, content.locale)}
      </p>
      {countdown.backCast === null ? null : (
        <p className="countdown__backcast">
          {content.t('countdown.backCast', {
            projected: ratio(content, countdown.backCast.projected),
            observed: ratio(content, countdown.backCast.observed),
            year: countdown.backCast.year,
          })}
        </p>
      )}
      {/* The clock rail: a sub-group of this block, behind one 1px rule, never a fifth block. */}
      <ClockRail content={content} countdown={countdown} nowMs={nowMs} />
    </section>
  );
}

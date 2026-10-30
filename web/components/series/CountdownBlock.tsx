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

/** The projection's own sentence when the threshold is not projected to be crossed. */
function NotCrossed({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  return (
    <section className="countdown countdown--not-crossed" aria-label={content.t('countdown.eyebrow')}>
      <p className="countdown__eyebrow">{content.t('countdown.eyebrow')}</p>
      <div className="countdown__rule" aria-hidden="true" />
      <p className="countdown__statement">{content.t('countdown.notCrossed', { year: countdown.horizonEnd })}</p>
      <p className="countdown__source">{content.t('countdown.source')}</p>
    </section>
  );
}

/** The one printed quantity of the projection: the threshold year and the label that names it. */
function ThresholdYearLine({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  return (
    <p className="countdown__year-line">
      <span className="countdown__year">{formatYear(countdown.thresholdYear ?? 0, content.locale)}</span>{' '}
      <span className="countdown__year-label">{content.t('countdown.yearLabel')}</span>
    </p>
  );
}

/** The variant range, rendered as an empty paragraph when the projection publishes none. */
function VariantRangeLine({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  return (
    <p className="countdown__range">
      {countdown.range === null
        ? ''
        : content.t('countdown.range', {
            min: formatYear(countdown.range.min, content.locale),
            max: formatYear(countdown.range.max, content.locale),
          })}
    </p>
  );
}

/** The back-cast comparison, absent when the projection carries none. */
function BackCastLine({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  if (countdown.backCast === null) return null;
  return (
    <p className="countdown__backcast">
      {content.t('countdown.backCast', {
        projected: ratio(content, countdown.backCast.projected),
        observed: ratio(content, countdown.backCast.observed),
        year: countdown.backCast.year,
      })}
    </p>
  );
}

/** The source line: where the projection came from and the year it was observed. */
function SourceLine({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  return (
    <p className="countdown__source">
      {content.t('countdown.source')} · {content.t('provenance.observedAt')}{' '}
      {formatYear(countdown.snapshotYear, content.locale)}
    </p>
  );
}

/**
 * The clock rail renders only where an anchor exists: no threshold year, no clock (AC-001-110).
 * It is the block's one group on one axis — the years numeral heads it, then the four fields,
 * then the anchor — with no separator above it (spec 002 §T3).
 */
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
      years={formatValue(countdown.years, 'integer', content.locale, '')}
      yearsUnit={content.t('countdown.unit')}
    />
  );
}

/**
 * The countdown block (T18, R2; the clock rail T20, Revision 3 §P2; the merged group spec 002 §T3).
 *
 * One quantity in two shapes, now inside one centred group:
 *
 *  - **The projection** — the year the threshold is projected to land on, with the threshold, the
 *    variant range, the source and the definition beside it. Static: it changes when the
 *    projection is revised, not when the clock moves.
 *  - **The clock rail** — the years numeral, then days, hours, minutes and seconds to the anchor,
 *    the conventional date the threshold year is assigned. It renders only when the derived
 *    `thresholdYear` exists (`no anchor, no clock`), carries the anchor as visible text, and
 *    never states that the threshold is crossed.
 *
 * **The reversal, recorded rather than deleted.** Until spec 002 a 1px rule separated the years
 * numeral from the clock rail, so that a reader was never invited to divide one by the other. That
 * separator has been removed: the years numeral is the clock group's first child and the two
 * numerals are one centred group, read as `N años` then `M días HH MM SS`. The risk the rule
 * mitigated — that a reader could divide years by days, as if they were a numerator and a
 * denominator — is **accepted**. What carries the distinction instead is typography: the years
 * numeral stays at `--text-num-xl` against the day's `--text-num-l`, and the two label grammars
 * differ (the years unit sits beside its numeral, the day label below its own), so they read as
 * two sentences rather than as members of one series.
 */
export function CountdownBlock({ content, countdown, nowMs = Date.now() }: CountdownBlockProps) {
  if (countdown.state !== 'computed') return <NotCrossed content={content} countdown={countdown} />;
  return (
    <section className="countdown" aria-labelledby="countdown-eyebrow">
      <p className="countdown__eyebrow" id="countdown-eyebrow">
        {content.t('countdown.eyebrow')}
      </p>
      <div className="countdown__rule" aria-hidden="true" />
      <ThresholdYearLine content={content} countdown={countdown} />
      <p className="countdown__definition">{content.t('countdown.definition')}</p>
      <VariantRangeLine content={content} countdown={countdown} />
      <SourceLine content={content} countdown={countdown} />
      <BackCastLine content={content} countdown={countdown} />
      <ClockRail content={content} countdown={countdown} nowMs={nowMs} />
    </section>
  );
}

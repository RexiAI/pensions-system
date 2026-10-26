import { formatValue, formatYear } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { CountdownValue } from '../../series/countdown';

export interface CountdownBlockProps {
  content: CountryLocaleContent;
  countdown: CountdownValue;
}

function ratio(content: CountryLocaleContent, value: number): string {
  return formatValue(value, 'ratio', content.locale, content.t('table.notDefined'));
}

/**
 * The countdown (T18, R2). Two printed integers and the year they land on, with the threshold,
 * the variant range, the source and the definition beside them. No icon, no tick, no animation,
 * no sub-annual unit: the quantity changes when the projection is revised, not when the clock
 * moves, so a moving counter would be a false claim about what the number is.
 */
export function CountdownBlock({ content, countdown }: CountdownBlockProps) {
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
    </section>
  );
}

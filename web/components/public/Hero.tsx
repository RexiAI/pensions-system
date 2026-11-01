import { FIGURE_KEYS, FIGURE_NUMBERS } from '../../content/keys';
import { formatValue } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import { datasetForUrl, publisherForUrl } from '../../sources/labels';
import { chipKey } from '../metrics/figure-state';
import { viewStateFor } from '../metrics/views';
import { HeroLead, leadActions } from './HeroLead';
import { selectHeroSubject, heroFigureNumber } from './hero-subject';
import type { HeroSubject } from './hero-subject';
import { CountdownBlock } from '../series/CountdownBlock';
import type { CountdownValue } from '../../series/countdown';
import type { ScopeEntry } from './ScopeMark';

export interface HeroProps {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  /** Rendered when the projection resolved; absent means the panel is exactly Revision 1's. */
  countdown?: CountdownValue;
  /** The published countries, resolved from the content model (one renders as plain text). */
  countries?: readonly ScopeEntry[];
  /** The render instant the clock's server value is computed from. */
  nowMs?: number;
  /**
   * `true` while the countdown band leads the page (spec 003 T1): the day count is then the
   * largest numeral, so the hero figure takes its demoted style (AC-003-03).
   */
  bandShown?: boolean;
}

type FigureSubject = Extract<HeroSubject, { kind: 'figure' }>;

/** The figure's own label keys, resolved from the figure id — never from the tier it lands on. */
function subjectKeys(subject: FigureSubject) {
  return FIGURE_KEYS[heroFigureNumber(subject.figureId)];
}

function valueText(content: CountryLocaleContent, subject: FigureSubject, value: number): string {
  return formatValue(value, subject.unit, content.locale, content.t('table.notDefined'));
}

/** The four facts beside the number, in the order the panel reads them (T1). */
function subjectFactRows(
  content: CountryLocaleContent,
  subject: FigureSubject,
): { label: string; value: string }[] {
  const publishers = [...new Set(subject.sourceUrl.map(publisherForUrl))].join(', ');
  const datasets = [...new Set(subject.sourceUrl.map(datasetForUrl))].join(' · ');
  return [
    { label: content.t('hero.definitionLabel'), value: content.t(subjectKeys(subject).definition) },
    { label: content.t('hero.periodLabel'), value: subject.period },
    { label: content.t('provenance.source'), value: publishers },
    { label: content.t('provenance.dataset'), value: datasets },
  ];
}

/** Where the number comes from, what it covers, and which definition produced it (T1). */
function SubjectFacts({ content, subject }: { content: CountryLocaleContent; subject: FigureSubject }) {
  return (
    <dl className="hero__subject">
      {subjectFactRows(content, subject).map((fact) => (
        <div className="hero__subject-field" key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The reading beside the panel: the figure's own label and headline value, the two comparisons
 * the figure publishes, the facts behind it and the snapshot stamp.
 */
function ReadingsPanel({
  content,
  subject,
  demoted,
}: {
  content: CountryLocaleContent;
  subject: FigureSubject;
  /** `true` when the countdown holds the panel's headline type, so the value steps down. */
  demoted: boolean;
}) {
  const keys = subjectKeys(subject);
  return (
    <div className="hero__panel-readings">
      <p className="hero__panel-label">{content.t(keys.title)}</p>
      <p className={demoted ? 'hero__value hero__value--demoted' : 'hero__value'}>
        {valueText(content, subject, subject.headline)}
      </p>
      <dl className="hero__comparisons">
        {subject.comparisons.map((comparison) => (
          <div className="hero__comparison" key={comparison.label}>
            <dt>{comparison.label}</dt>
            <dd>{valueText(content, subject, comparison.value)}</dd>
          </div>
        ))}
      </dl>
      <SubjectFacts content={content} subject={subject} />
      <p className="site-header__stamp">
        {content.t('hero.snapshotLabel')}{' '}
        <time dateTime={subject.snapshotIso}>{subject.snapshotIso.slice(0, 10)}</time>
      </p>
    </div>
  );
}

/**
 * The hero section's own class list. While the band leads the page the section carries the
 * `hero--band` marker the desktop sheet keys off — the section then holds the readings panel
 * alone, because the lead moved into the band (D1). One function, so the two tiers cannot
 * disagree about the marker.
 */
function heroClass(tier: 'numeric' | 'proposition', bandShown: boolean): string {
  const base = `hero hero--${tier}`;
  return bandShown ? `${base} hero--band` : base;
}

/**
 * Tier 1 and tier 2: the same numeric hero, labelled by whichever figure is eligible, with
 * the three things a reader needs to judge the number beside it. Which figure lands on
 * which tier is decided by the ladder in `hero-subject.ts`; the label, the definition and
 * the unit always come from the figure itself, so a reordered ladder cannot relabel it.
 */
function NumericHero({
  content,
  subject,
  countdown,
  countries,
  nowMs,
  bandShown = false,
}: {
  content: CountryLocaleContent;
  subject: FigureSubject;
  countdown?: CountdownValue;
  countries?: readonly ScopeEntry[];
  nowMs: number;
  bandShown?: boolean;
}) {
  const actions = leadActions(content, 'figure');
  return (
    <section
      className={heroClass('numeric', bandShown)}
      aria-labelledby="hero-title"
    >
      {bandShown ? null : (
        <HeroLead
          content={content}
          countries={countries}
          primary={actions.primary}
          secondary={actions.secondary}
        />
      )}
      <div className="hero__panel">
        {countdown === undefined ? null : (
          /*
           * The panel is one material block on a desktop, and two stacked blocks on a phone:
           * `display: contents` on these two wrappers means they have no box at all at the
           * desktop breakpoint (the panel's flow is exactly the countdown, the rule, then the
           * readings), while the mobile query can lift the countdown above the headline so the
           * clock rail lands inside the first viewport — see `.hero__panel-countdown` in
           * `globals.css` and the measurement in `tests/acceptance/first-viewport.test.ts`.
           */
          <div className="hero__panel-countdown">
            <CountdownBlock content={content} countdown={countdown} nowMs={nowMs} />
            <hr className="hero__panel-rule" />
          </div>
        )}
        <ReadingsPanel content={content} subject={subject} demoted={bandShown || countdown?.state === 'computed'} />
      </div>
    </section>
  );
}

/** One row per figure: its name, its anchor, and a state chip when it is not calculated. */
function StatusRow({ content, figure }: { content: CountryLocaleContent; figure: DerivedFigure }) {
  const number = Number(figure.figureId.slice(-1)) as (typeof FIGURE_NUMBERS)[number];
  const state = viewStateFor({ figure, content });
  const chip = chipKey(state);
  return (
    <li className="hero__status-row">
      <a href={`#${figure.figureId}`}>{content.t(FIGURE_KEYS[number].title)}</a>
      {chip ? <span className="figure-row__chip">{content.t(chip)}</span> : null}
    </li>
  );
}

/**
 * The proposition tier's subject: the countdown slot, one row per figure, and how many of them
 * computed. The wrapper has no box at the desktop breakpoint and is lifted above the headline on
 * a phone, for the same reason as the numeric tier's countdown slot.
 */
function StatusPanel({
  content,
  figures,
  countdown,
  nowMs,
}: {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  countdown?: CountdownValue;
  nowMs: number;
}) {
  const computed = figures.filter((figure) => viewStateFor({ figure, content }) === 'computed').length;
  return (
    <div className="hero__status">
      <div className="hero__panel-countdown">
        {countdown === undefined ? null : <CountdownBlock content={content} countdown={countdown} nowMs={nowMs} />}
      </div>
      <ul className="hero__status-list" aria-label={content.t('figure.statusLabel')}>
        {figures.map((figure) => (
          <StatusRow content={content} figure={figure} key={figure.figureId} />
        ))}
      </ul>
      <p className="hero__status-count">
        {content.t('figure.statusSummary', { total: figures.length, computed })}
      </p>
    </div>
  );
}

/** Tier 3: no eligible figure, so the largest type on the page is the proposition. */
function PropositionHero({
  content,
  figures,
  countdown,
  countries,
  nowMs,
  bandShown = false,
}: HeroProps & { nowMs: number }) {
  const actions = leadActions(content, 'proposition');
  return (
    <section
      className={heroClass('proposition', bandShown)}
      aria-labelledby="hero-title"
    >
      {bandShown ? null : (
        <HeroLead
          content={content}
          countries={countries}
          primary={actions.primary}
          secondary={actions.secondary}
        />
      )}
      <StatusPanel content={content} figures={figures} countdown={countdown} nowMs={nowMs} />
    </section>
  );
}

/**
 * Viewport 1. The subject comes from the build-time ladder (D2), never from an assumption
 * that either figure exists: the largest type on the page is never spent announcing an
 * absence.
 */
export function Hero({ content, figures, countdown, countries, nowMs = Date.now(), bandShown }: HeroProps) {
  const subject = selectHeroSubject(figures);
  if (subject.kind === 'proposition') {
    return (
      <PropositionHero
        content={content}
        figures={figures}
        countdown={countdown}
        countries={countries}
        nowMs={nowMs}
        bandShown={bandShown}
      />
    );
  }
  return (
    <NumericHero
      content={content}
      subject={subject}
      countdown={countdown}
      countries={countries}
      nowMs={nowMs}
      bandShown={bandShown}
    />
  );
}

import { FIGURE_KEYS, FIGURE_NUMBERS } from '../../content/keys';
import { formatValue } from '../../content/format';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import { datasetForUrl, publisherForUrl } from '../../sources/labels';
import { chipKey } from '../metrics/figure-state';
import { viewStateFor } from '../metrics/views';
import { selectHeroSubject, heroFigureNumber } from './hero-subject';
import type { HeroSubject } from './hero-subject';

export interface HeroProps {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
}

type FigureSubject = Extract<HeroSubject, { kind: 'figure' }>;

/** The figure's own label keys, resolved from the figure id — never from the tier it lands on. */
function subjectKeys(subject: FigureSubject) {
  return FIGURE_KEYS[heroFigureNumber(subject.figureId)];
}

function valueText(content: CountryLocaleContent, subject: FigureSubject, value: number): string {
  return formatValue(value, subject.unit, content.locale, content.t('table.notDefined'));
}

/** Where the number comes from, what it covers, and which definition produced it (T1). */
function SubjectFacts({ content, subject }: { content: CountryLocaleContent; subject: FigureSubject }) {
  const keys = subjectKeys(subject);
  const publishers = [...new Set(subject.sourceUrl.map(publisherForUrl))].join(', ');
  const datasets = [...new Set(subject.sourceUrl.map(datasetForUrl))].join(' · ');
  return (
    <dl className="hero__subject">
      <div className="hero__subject-field">
        <dt>{content.t('hero.definitionLabel')}</dt>
        <dd>{content.t(keys.definition)}</dd>
      </div>
      <div className="hero__subject-field">
        <dt>{content.t('hero.periodLabel')}</dt>
        <dd>{subject.period}</dd>
      </div>
      <div className="hero__subject-field">
        <dt>{content.t('provenance.source')}</dt>
        <dd>{publishers}</dd>
      </div>
      <div className="hero__subject-field">
        <dt>{content.t('provenance.dataset')}</dt>
        <dd>{datasets}</dd>
      </div>
    </dl>
  );
}

/**
 * Tier 1 and tier 2: the same numeric hero, labelled by whichever figure is eligible, with
 * the three things a reader needs to judge the number beside it. Which figure lands on
 * which tier is decided by the ladder in `hero-subject.ts`; the label, the definition and
 * the unit always come from the figure itself, so a reordered ladder cannot relabel it.
 */
function NumericHero({ content, subject }: { content: CountryLocaleContent; subject: FigureSubject }) {
  const keys = subjectKeys(subject);
  return (
    <section className="hero hero--numeric" aria-labelledby="hero-title">
      <div>
        <h1 className="hero__title" id="hero-title">
          {content.t('hero.statement')}
        </h1>
        <p className="hero__sub">{content.t('hero.sub')}</p>
        <div className="hero__actions">
          <a className="hero__cta" href="#figuras">
            {content.t('hero.ctaPrimary')}
          </a>
          <a href="#metodo">{content.t('hero.ctaSecondary')}</a>
        </div>
      </div>
      <div className="hero__panel">
        <p className="hero__panel-label">{content.t(keys.title)}</p>
        <p className="hero__value">{valueText(content, subject, subject.headline)}</p>
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
          {content.t('hero.snapshotLabel')} <time dateTime={subject.snapshotIso}>{subject.snapshotIso.slice(0, 10)}</time>
        </p>
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

/** Tier 3: no eligible figure, so the largest type on the page is the proposition. */
function PropositionHero({ content, figures }: HeroProps) {
  const computed = figures.filter((figure) => viewStateFor({ figure, content }) === 'computed').length;
  return (
    <section className="hero hero--proposition" aria-labelledby="hero-title">
      <div>
        <h1 className="hero__title" id="hero-title">
          {content.t('hero.statement')}
        </h1>
        <p className="hero__sub">{content.t('hero.sub')}</p>
        <div className="hero__actions">
          <a className="hero__cta" href="#metodo">
            {content.t('hero.ctaMethod')}
          </a>
          <a href="#figuras">{content.t('hero.ctaFigures')}</a>
        </div>
      </div>
      <div className="hero__status">
        <ul className="hero__status-list" aria-label={content.t('figure.statusLabel')}>
          {figures.map((figure) => (
            <StatusRow content={content} figure={figure} key={figure.figureId} />
          ))}
        </ul>
        <p className="hero__status-count">
          {content.t('figure.statusSummary', { total: figures.length, computed })}
        </p>
      </div>
    </section>
  );
}

/**
 * Viewport 1. The subject comes from the build-time ladder (D2), never from an assumption
 * that either figure exists: the largest type on the page is never spent announcing an
 * absence.
 */
export function Hero({ content, figures }: HeroProps) {
  const subject = selectHeroSubject(figures);
  if (subject.kind === 'proposition') return <PropositionHero content={content} figures={figures} />;
  return <NumericHero content={content} subject={subject} />;
}

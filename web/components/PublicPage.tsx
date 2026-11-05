import type { DerivedSeries } from '../ingest/series-types';
import type { CountdownValue } from '../series/countdown';
import type { CitationRegistry, ClaimVariables } from '../content/citations';
import type { CountryLocaleContent } from '../content/types';
import { formatValue } from '../content/format';
import type { DependencyRatioSeriesValue } from '../metrics/dependency-ratio';
import type { DerivedFigure } from '../ingest/types';
import type { ScopeEntry } from './public/ScopeMark';
import { AssumptionsLedger } from './public/AssumptionsLedger';
import { FiguresRegion } from './public/FiguresRegion';
import { MethodRegion } from './public/MethodRegion';
import { PublicStory } from './public/PublicStory';
import { ReproduceBlock } from './public/ReproduceBlock';
import { SiteFooter } from './public/SiteFooter';
import { SiteHeader } from './public/SiteHeader';
import { SourceStrip } from './public/SourceStrip';
import { StoryStrip } from './public/StoryStrip';
import { AgreementSection } from './registers/AgreementSection';
import { DisputeSection } from './registers/DisputeSection';
import { ThesisSection } from './registers/ThesisSection';
import { findSeries } from '../derived/series-store';

export interface PublicPageProps {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  citations: CitationRegistry;
  freshnessWindowDays: number;
  stale: boolean;
  /** The derived series (the pyramid, the countdown, the fuse); absent means none is published. */
  series?: readonly DerivedSeries[];
  /** The published countries, resolved from the content model, for the scope mark. */
  countries?: readonly ScopeEntry[];
  /**
   * The render instant. The clock's server render is computed from it, so the page is
   * deterministic when a caller pins it (a test, or the static build's own instant).
   */
  now?: Date;
}

function lifeExpectancyOf(figures: readonly DerivedFigure[]): number | null {
  const cohort = figures.find((figure) => figure.figureId === 'fig-03');
  const assumptions = cohort?.assumptions ?? {};
  const value = assumptions['lifeExpectancyAtRetirement'];
  return typeof value === 'number' ? value : null;
}

/**
 * The countdown is read from the committed series, never recomputed here: its value (and the
 * snapshot year inside it) is fixed at ingest, so a render-time clock cannot make the number
 * disagree with its own provenance (OQ19).
 */
function countdownOf(series: readonly DerivedSeries[]): CountdownValue | undefined {
  const entry = findSeries(series, 'countdown');
  if (entry === undefined || entry.availability !== 'computed' || entry.value === null) return undefined;
  return entry.value as CountdownValue;
}

function snapshotIsoOf(figures: readonly DerivedFigure[]): string {
  const first = figures[0];
  return first ? first.manifest.fetchedAt : '';
}

/**
 * The mechanism claim states fig-01's first and latest ratio; both numerals are formatted from
 * the committed value here, so the sentence cannot drift from the plate it describes. A figure
 * that is absent or publishes no value yields no variables: the claim then keeps its
 * placeholders visible rather than printing an empty string in their place.
 */
function claimVariables(figures: readonly DerivedFigure[], locale: CountryLocaleContent['locale']): ClaimVariables {
  const figure = figures.find((entry) => entry.figureId === 'fig-01');
  if (figure === undefined || figure.value === null) return {};
  const { first, latest } = figure.value as DependencyRatioSeriesValue;
  if (first === null || latest === null) return {};
  return {
    first: formatValue(first.ratio, 'ratio', locale, ''),
    latest: formatValue(latest.ratio, 'ratio', locale, ''),
  };
}

/**
 * The public document (re-composed by spec 004): the five-step story, the way to the method and
 * to share it, the computed figure plates, the method region that holds everything the story
 * dropped, the three registers, the reproduce panel and the assumptions ledger.
 *
 * There is exactly one lead path: the story is composed from `TOP_STEPS`, and nothing else renders
 * between `<main>` and the end of the fifth step. The page is composed from data and content only,
 * so it renders without any admin configuration.
 */
export function PublicPage({
  content,
  figures,
  citations,
  freshnessWindowDays,
  stale,
  series = [],
  countries,
  now = new Date(),
}: PublicPageProps) {
  const countdown = countdownOf(series);
  const scopes = countries ?? [{ geo: content.country.code, name: content.country.name, href: '#' }];
  const snapshotIso = snapshotIsoOf(figures);
  const sources = figures.flatMap((figure) => figure.manifest.sourceUrl);
  return (
    <div className="page">
      <a className="skip-link" href="#main">
        {content.t('site.skipLink')}
      </a>
      {stale ? <p className="banner">{content.t('banner.stale')}</p> : null}
      <SiteHeader content={content} snapshotIso={snapshotIso} />
      <main id="main">
        <PublicStory
          content={content}
          countdown={countdown}
          pyramid={findSeries(series, 'pyramid')}
          fuse={findSeries(series, 'fuse')}
          nowMs={now.getTime()}
          freshnessWindowDays={freshnessWindowDays}
        />
        <StoryStrip content={content} countdown={countdown} />
        <SourceStrip content={content} sources={sources} />
        <FiguresRegion content={content} figures={figures} freshnessWindowDays={freshnessWindowDays} />
        <MethodRegion
          content={content}
          sources={{
            countdown,
            pyramid: findSeries(series, 'pyramid'),
            fuse: findSeries(series, 'fuse'),
          }}
          freshnessWindowDays={freshnessWindowDays}
          nowMs={now.getTime()}
          countries={scopes}
        />
        <div id="debate">
          <AgreementSection
            content={content}
            citations={citations}
            vars={claimVariables(figures, content.locale)}
          />
          <DisputeSection content={content} citations={citations} />
        </div>
        <div id="lectura">
          <ThesisSection content={content} />
        </div>
        <ReproduceBlock content={content} figures={figures} series={series} />
        <AssumptionsLedger
          content={content}
          freshnessWindowDays={freshnessWindowDays}
          lifeExpectancy={lifeExpectancyOf(figures)}
        />
      </main>
      <SiteFooter content={content} snapshotIso={snapshotIso} />
    </div>
  );
}

import type { CountryLocaleContent } from '../../content/types';
import type { DerivedSeries } from '../../ingest/series-types';
import type { CountdownValue } from '../../series/countdown';
import { ProvenanceStrip } from '../ProvenanceStrip';
import { fuseLabelOf, fuseValueOf } from '../series/Fuse';
import { CountdownPrecision } from './CountdownPrecision';
import { RegisterKey } from './RegisterKey';
import { ScopeMark } from './ScopeMark';
import type { ScopeEntry } from './ScopeMark';

/**
 * The computed material the method region documents. Each is absent when this deployment
 * publishes none, and each is what the story demoted into this region.
 */
export interface MethodSources {
  countdown?: CountdownValue;
  pyramid?: DerivedSeries;
  fuse?: DerivedSeries;
}

export interface MethodRegionProps {
  content: CountryLocaleContent;
  sources: MethodSources;
  freshnessWindowDays: number;
  nowMs: number;
  countries: readonly ScopeEntry[];
}

/** The fuse's precision: the ratio, its year and the threshold its percentage is a share of. */
function FusePrecision({ content, fuse }: { content: CountryLocaleContent; fuse: DerivedSeries }) {
  const value = fuseValueOf(fuse);
  if (value === undefined) return null;
  return (
    <div className="method__group">
      <p className="fuse__label">{fuseLabelOf(content, value)}</p>
      <p className="fuse__definition">{content.t('fuse.definition')}</p>
      <a className="fuse__reproduce" href="#reproducir">
        {content.t('fuse.reproduce')}
      </a>
    </div>
  );
}

function seriesStrip(content: CountryLocaleContent, series: DerivedSeries | undefined, freshnessWindowDays: number) {
  if (series === undefined || series.availability !== 'computed' || series.value === null) return null;
  return (
    <ProvenanceStrip
      manifest={series.manifest}
      figureId={series.seriesId}
      freshnessWindowDays={freshnessWindowDays}
      content={content}
      derivedPath="data/derived/series"
    />
  );
}

/**
 * The method region (spec 004 T8): everything the story drops is still on the page, below it, in
 * one region, as visible text — never inside a collapsed disclosure.
 *
 * The order is the countdown's precision, then the fuse's, then the two provenance strips, then
 * the register key: three groups separated by one hairline each. `#metodo` lives here once, and
 * the register key is nested inside it, so every existing in-page reference keeps resolving.
 */
export function MethodRegion({ content, sources, freshnessWindowDays, nowMs, countries }: MethodRegionProps) {
  return (
    <section className="method" id="metodo" aria-labelledby="metodo-heading">
      <h2 className="method__heading" id="metodo-heading">
        {content.t('nav.method')}
      </h2>
      <ScopeMark content={content} countries={countries} />
      {sources.countdown === undefined ? null : (
        <CountdownPrecision content={content} countdown={sources.countdown} nowMs={nowMs} />
      )}
      {sources.fuse === undefined ? null : <FusePrecision content={content} fuse={sources.fuse} />}
      <div className="method__group">
        {seriesStrip(content, sources.pyramid, freshnessWindowDays)}
        {seriesStrip(content, sources.fuse, freshnessWindowDays)}
      </div>
      <RegisterKey content={content} />
    </section>
  );
}

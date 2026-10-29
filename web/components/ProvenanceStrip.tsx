import { formatDate } from '../content/format';
import type { CountryLocaleContent } from '../content/types';
import type { Manifest } from '../manifest/types';
import { datasetForUrl, publisherForUrl } from '../sources/labels';
import { CopyDigest } from './CopyDigest';
import { Icon } from './Icon';

/** A named publisher, a named dataset and a date: never a wall of raw URLs (D3, D6). */
const MAX_INLINE_SOURCES = 3;

export interface ProvenanceStripProps {
  manifest: Manifest;
  figureId: string;
  freshnessWindowDays: number;
  content: CountryLocaleContent;
  /** Where the derived file lives: `data/derived` for a figure, `data/derived/series` for a series. */
  derivedPath?: string;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function Field({ label, values }: { label: string; values: readonly string[] }) {
  return (
    <div className="provenance__field">
      <dt>{label}</dt>
      <dd>
        <ul className="provenance__list">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

function SourceList({ manifest, content }: { manifest: Manifest; content: CountryLocaleContent }) {
  if (manifest.sourceUrl.length <= MAX_INLINE_SOURCES) return null;
  return (
    <details className="provenance__more" data-operator="true">
      <summary>{content.t('provenance.sourcesCount', { count: manifest.sourceUrl.length })}</summary>
      <ul>
        {manifest.sourceUrl.map((url) => (
          <li key={url}>
            <a href={url} rel="noopener noreferrer">
              {publisherForUrl(url)}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function derivedFile(derivedPath: string, figureId: string): string {
  return `${derivedPath}/${figureId}.json`;
}

function Disclosure({
  manifest,
  figureId,
  freshnessWindowDays,
  content,
  derivedPath = 'data/derived',
}: ProvenanceStripProps) {
  const { t, locale } = content;
  return (
    <details className="provenance__methods" data-operator="true">
      <summary>{t('figure.methodLink')}</summary>
      <dl className="provenance__detail">
        <dt>{t('provenance.disclosure.formula')}</dt>
        <dd>
          <code>{manifest.formulaId}</code>
        </dd>
        <dt>{t('provenance.disclosure.source')}</dt>
        <dd>
          <code className="url">{manifest.sourceUrl.join(' ')}</code>
        </dd>
        <dt>{t('provenance.disclosure.series')}</dt>
        <dd>
          <code>{unique(manifest.sourceUrl.map(datasetForUrl)).join(' · ')}</code>
        </dd>
        <dt>{t('provenance.disclosure.observedAt')}</dt>
        <dd>
          <code>{manifest.fetchedAt}</code>
        </dd>
        <dt>{t('provenance.disclosure.hash')}</dt>
        <dd>
          <code className="hash hash--full">{manifest.inputHash}</code>
          <CopyDigest digest={manifest.inputHash} label={t('provenance.copy')} copiedLabel={t('provenance.copied')} />
        </dd>
        <dt>{t('provenance.disclosure.reproduce')}</dt>
        <dd>
          <code>{manifest.reproducePath}</code>
        </dd>
        <dt>{t('provenance.disclosure.freshness')}</dt>
        <dd>
          <code>{`${freshnessWindowDays} · ${derivedFile(derivedPath, figureId)}`}</code>
        </dd>
      </dl>
      <p className="provenance__meaning">{t('provenance.digestMeaning')}</p>
      <p className="provenance__observed">
        <time dateTime={manifest.fetchedAt}>{formatDate(manifest.fetchedAt, locale)}</time>
      </p>
    </details>
  );
}

/**
 * The provenance strip in its designed form (D6, extended by R4): four labelled public fields —
 * publisher, dataset, observation date and scope — and two affordances. The scope field is
 * rendered from the country record so it can never be blank: a strip with an empty scope is a
 * claim without a coverage (`Ámbito` never renders an empty cell). The digest, the formula id, the source
 * URLs and the reproduce path live in the `Cómo se calcula` disclosure, which is marked
 * `data-operator` so the public-vocabulary gate does not treat them as public prose.
 */
export function ProvenanceStrip({
  manifest,
  figureId,
  freshnessWindowDays,
  content,
  derivedPath,
}: ProvenanceStripProps) {
  const { t, locale } = content;
  return (
    <div className="provenance">
      <dl className="provenance__fields">
        <Field label={t('provenance.source')} values={unique(manifest.sourceUrl.map(publisherForUrl))} />
        <Field label={t('provenance.dataset')} values={unique(manifest.sourceUrl.map(datasetForUrl))} />
        <Field
          label={t('provenance.observedAt')}
          values={[formatDate(manifest.fetchedAt, locale)]}
        />
        <Field label={t('provenance.scope')} values={[content.country.name]} />
      </dl>
      <div className="provenance__actions">
        <a className="provenance__original" href={manifest.sourceUrl[0]} rel="noopener noreferrer">
          {t('provenance.original')}
          <Icon name="external" size={16} />
        </a>
        <SourceList manifest={manifest} content={content} />
        <Disclosure
          manifest={manifest}
          figureId={figureId}
          freshnessWindowDays={freshnessWindowDays}
          content={content}
          derivedPath={derivedPath}
        />
      </div>
    </div>
  );
}

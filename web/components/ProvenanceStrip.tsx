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
  /**
   * `true` renders the whole strip inside the `Cómo se calcula` disclosure instead of beside it
   * (D1, AC-003-51): the manifest, the digest and the reproduce path stay published and
   * reproducible, but a figure whose provenance is not the point above the fold does not spend
   * three rows of the first viewport on them.
   */
  collapsed?: boolean;
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

/** The four public fields: publisher, dataset, observation date and scope. Never a raw URL. */
function ProvenanceFields({ manifest, content }: { manifest: Manifest; content: CountryLocaleContent }) {
  const { t, locale } = content;
  return (
    <dl className="provenance__fields">
      <Field label={t('provenance.source')} values={unique(manifest.sourceUrl.map(publisherForUrl))} />
      <Field label={t('provenance.dataset')} values={unique(manifest.sourceUrl.map(datasetForUrl))} />
      <Field label={t('provenance.observedAt')} values={[formatDate(manifest.fetchedAt, locale)]} />
      <Field label={t('provenance.scope')} values={[content.country.name]} />
    </dl>
  );
}

/** The link out to the publisher, beside the fields. */
function OriginalLink({ manifest, content }: { manifest: Manifest; content: CountryLocaleContent }) {
  return (
    <a className="provenance__original" href={manifest.sourceUrl[0]} rel="noopener noreferrer">
      {content.t('provenance.original')}
      <Icon name="external" size={16} />
    </a>
  );
}

/** The complete manifest behind a computed figure, as the disclosure's own detail list. */
function ManifestDetail({
  manifest,
  figureId,
  freshnessWindowDays,
  content,
  derivedPath = 'data/derived',
}: ProvenanceStripProps) {
  const { t, locale } = content;
  return (
    <>
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
    </>
  );
}

/** The affordances beside the four fields: the original source, the extra sources, the disclosure. */
function Actions(props: ProvenanceStripProps & { withDisclosure?: boolean }) {
  return (
    <div className="provenance__actions">
      <OriginalLink manifest={props.manifest} content={props.content} />
      <SourceList manifest={props.manifest} content={props.content} />
      {props.withDisclosure === false ? null : <Disclosure {...props} />}
    </div>
  );
}

/**
 * The `Cómo se calcula` disclosure, in either of its two shapes: the manifest alone (the form
 * every computed figure renders beside its fields), or — `collapsed` — the whole strip inside it,
 * fields and affordances included (D1, AC-003-51). One summary, one manifest; the collapsed form
 * is not a second provenance.
 */
function Disclosure(props: ProvenanceStripProps) {
  return (
    <details className="provenance__methods" data-operator="true">
      <summary>{props.content.t('figure.methodLink')}</summary>
      {props.collapsed === true ? (
        <>
          <ProvenanceFields manifest={props.manifest} content={props.content} />
          <Actions {...props} withDisclosure={false} />
        </>
      ) : null}
      <ManifestDetail {...props} />
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
export function ProvenanceStrip(props: ProvenanceStripProps) {
  if (props.collapsed === true) return <Disclosure {...props} />;
  return (
    <div className="provenance">
      <ProvenanceFields manifest={props.manifest} content={props.content} />
      <Actions {...props} />
    </div>
  );
}

import type { Citation, CountryLocaleContent } from '../content/types';

export interface CitationChipProps {
  citation: Citation;
  content: CountryLocaleContent;
}

/**
 * Inline citation chip: the label names the institution and the document, and the panel
 * carries the full reference. A claim is never rendered without one (T9).
 */
export function CitationChip({ citation, content }: CitationChipProps) {
  return (
    <details className="citation">
      <summary className="citation__chip">
        {`${content.t('provenance.source')}: ${citation.publisher}, ${citation.document}`}
      </summary>
      <dl className="citation__panel">
        <dt>{content.t('provenance.source')}</dt>
        <dd>{citation.publisher}</dd>
        <dt>{content.t('citation.document')}</dt>
        <dd>{citation.document}</dd>
        <dt>{content.t('citation.reference')}</dt>
        <dd>{citation.reference}</dd>
        <dt>{content.t('citation.date')}</dt>
        <dd>
          <time dateTime={citation.date}>{citation.date}</time>
        </dd>
        <dt>{content.t('provenance.source')}</dt>
        <dd>
          <a href={citation.url} rel="noopener noreferrer">
            {citation.url}
          </a>
        </dd>
      </dl>
    </details>
  );
}

import type { CountryLocaleContent } from '../../content/types';
import { publisherForUrl } from '../../sources/labels';

export interface SourceStripProps {
  content: CountryLocaleContent;
  /** Source URLs from the manifests; the strip renders the publishers, never the URLs (D3). */
  sources: readonly string[];
}

/** Attribution row: the official bodies as plain names. A URL is not an attribution (D6). */
export function SourceStrip({ content, sources }: SourceStripProps) {
  const publishers = [...new Set(sources.map(publisherForUrl))];
  return (
    <section className="source-strip" aria-label={content.t('footer.sourcesHeading')}>
      {publishers.map((publisher) => (
        <span key={publisher}>{publisher}</span>
      ))}
      <a href="#metodo">{content.t('sources.calcLink')}</a>
    </section>
  );
}

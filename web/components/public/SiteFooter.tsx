import { CONTACT_EMAIL } from '../../content/site';
import { LOCALES } from '../../content/types';
import type { CountryLocaleContent } from '../../content/types';
import { publicPathFor } from '../../seo/routes';
import { SOURCE_DECLARATIONS } from '../../sources/types';

export interface SiteFooterProps {
  content: CountryLocaleContent;
}

function SourceList() {
  return (
    <ul>
      {SOURCE_DECLARATIONS.map((source) => (
        <li key={source.sourceId}>
          <a href={source.publisherUrl} rel="noopener noreferrer">
            {source.publisher}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The five locale links, each carrying its own `hrefLang`. */
function FooterLocaleLinks() {
  return (
    <ul className="footer__locales">
      {LOCALES.map((locale) => (
        <li key={locale}>
          <a href={publicPathFor(locale)} hrefLang={locale}>
            {locale}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Sources, licence and the locale switcher — the citing half of the footer. */
function FooterSources({ content }: { content: CountryLocaleContent }) {
  return (
    <div>
      <h2>{content.t('footer.sourcesHeading')}</h2>
      <SourceList />
      <p>{content.t('footer.licence')}</p>
      <FooterLocaleLinks />
    </div>
  );
}

/** The one line the footer still publishes besides its sources: how to reach the publisher. */
function FooterContact({ content }: { content: CountryLocaleContent }) {
  return (
    <p>
      {content.t('footer.contact')}: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    </p>
  );
}

export function SiteFooter({ content }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <FooterSources content={content} />
      <div>
        <FooterContact content={content} />
      </div>
    </footer>
  );
}

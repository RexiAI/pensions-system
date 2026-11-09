import { CONTACT_EMAIL, canonicalUrl } from '../../content/site';
import { LOCALES } from '../../content/types';
import type { CountryLocaleContent, PageKind } from '../../content/types';
import { pagePathFor, publicPathFor } from '../../seo/routes';
import { SOURCE_DECLARATIONS } from '../../sources/types';

export interface SiteFooterProps {
  content: CountryLocaleContent;
  snapshotIso: string;
  /** The page being cited: its own route URL is the footer's canonical line (spec 007 T9). */
  pageKind?: PageKind;
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

/** The canonical route URL and the snapshot instant, as the footer's citation stamp. */
function FooterCitation({ content, snapshotIso, pageKind }: { content: CountryLocaleContent; snapshotIso: string; pageKind: PageKind }) {
  return (
    <>
      <p>
        {content.t('footer.canonical')}:{' '}
        <code>{canonicalUrl(pagePathFor(content.locale, pageKind))}</code>
      </p>
      <p>
        {content.t('footer.snapshot')}: <time dateTime={snapshotIso}>{snapshotIso}</time>
      </p>
    </>
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

/** "What this site does not claim", the no-tracking statement, and the citation stamp. */
function FooterClaims({ content, snapshotIso, pageKind }: { content: CountryLocaleContent; snapshotIso: string; pageKind: PageKind }) {
  return (
    <div>
      <h2>{content.t('footer.doesNotClaimHeading')}</h2>
      <p>{content.t('footer.noTracking')}</p>
      <p>
        {content.t('footer.contact')}:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <FooterCitation content={content} snapshotIso={snapshotIso} pageKind={pageKind} />
    </div>
  );
}

export function SiteFooter({ content, snapshotIso, pageKind = 'historia' }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <FooterSources content={content} />
      <FooterClaims content={content} snapshotIso={snapshotIso} pageKind={pageKind} />
    </footer>
  );
}

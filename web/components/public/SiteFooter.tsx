import { CONTACT_EMAIL } from '../../content/site';
import { LOCALES } from '../../content/types';
import type { CountryLocaleContent } from '../../content/types';
import { SOURCE_DECLARATIONS } from '../../sources/types';
import { localePath } from './SiteHeader';

export interface SiteFooterProps {
  content: CountryLocaleContent;
  snapshotIso: string;
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

/** "What this site does not claim", the no-tracking statement, and the citation stamp. */
export function SiteFooter({ content, snapshotIso }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div>
        <h2>{content.t('footer.sourcesHeading')}</h2>
        <SourceList />
        <p>{content.t('footer.licence')}</p>
        <ul className="footer__locales">
          {LOCALES.map((locale) => (
            <li key={locale}>
              <a href={localePath(locale)} hrefLang={locale}>
                {locale}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>{content.t('footer.doesNotClaimHeading')}</h2>
        <p>{content.t('footer.noTracking')}</p>
        <p>
          {content.t('footer.contact')}: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p>
          {content.t('footer.canonical')}: <code>{localePath(content.locale)}</code>
        </p>
        <p>
          {content.t('footer.snapshot')}: <time dateTime={snapshotIso}>{snapshotIso}</time>
        </p>
      </div>
    </footer>
  );
}

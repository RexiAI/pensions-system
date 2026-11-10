import { formatDate } from '../../content/format';
import { PAGE_NAME_KEYS } from '../../content/keys';
import type { LocaleKey } from '../../content/keys';
import { LOCALES, PAGE_KINDS } from '../../content/types';
import type { CountryLocaleContent, Locale, PageKind } from '../../content/types';
import { pagePathFor, publicPathFor } from '../../seo/routes';
import { Icon } from '../Icon';
import { ThemeGroup } from './ThemeGroup';
import { ThemeToggle } from './ThemeToggle';

const LOCALE_NAME_KEY: Readonly<Record<Locale, LocaleKey>> = {
  es: 'locale.es',
  en: 'locale.en',
  fr: 'locale.fr',
  de: 'locale.de',
  it: 'locale.it',
};

export interface SiteHeaderProps {
  content: CountryLocaleContent;
  snapshotIso: string;
  /** The page being viewed: it names the one nav link that carries `aria-current="page"`. */
  pageKind: PageKind;
}

interface DatedHeaderProps extends SiteHeaderProps {
  /** The snapshot instant in the page's own language, formatted once by the header. */
  long: string;
}

function themeLabels(content: CountryLocaleContent): Record<'system' | 'light' | 'dark', string> {
  return {
    system: content.t('theme.system'),
    light: content.t('theme.light'),
    dark: content.t('theme.dark'),
  };
}

/** The four page links, in the fixed reading order, as ordinary anchors (no client JavaScript). */
function PageLinks({ content, pageKind, className }: SiteHeaderProps & { className?: string }) {
  return (
    <nav className={className} aria-label={content.t('nav.index')}>
      {PAGE_KINDS.map((kind) => (
        <a
          key={kind}
          href={pagePathFor(content.locale, kind)}
          aria-current={kind === pageKind ? 'page' : undefined}
        >
          {content.t(PAGE_NAME_KEYS[kind])}
        </a>
      ))}
    </nav>
  );
}

/** Five inverted cells in one bordered group (D8): a filled cell is unmistakable at 36px. */
function LocaleCells({ content }: { content: CountryLocaleContent }) {
  return (
    <div className="locale-group" role="group" aria-label={content.t('locale.group')}>
      {LOCALES.map((locale) => (
        <a
          key={locale}
          className="locale-group__cell"
          href={publicPathFor(locale)}
          hrefLang={locale}
          aria-current={locale === content.locale ? 'page' : undefined}
          aria-label={content.t('nav.localeLabel', { language: content.t(LOCALE_NAME_KEY[locale]) })}
        >
          {locale}
        </a>
      ))}
    </div>
  );
}

/** The wordmark and the ISO 8601 snapshot date: what survives in the 320px row. */
function HeaderBrand({ content, snapshotIso, long }: { content: CountryLocaleContent; snapshotIso: string; long: string }) {
  return (
    <>
      <a className="site-header__wordmark" href={publicPathFor(content.locale)}>
        {content.t('site.wordmark')}
      </a>
      <span className="site-header__iso" aria-label={`${content.t('hero.snapshotLabel')} ${long}`} title={long}>
        <time dateTime={snapshotIso}>{snapshotIso.slice(0, 10)}</time>
      </span>
    </>
  );
}

/** The index panel's locale rows: the language's own name, and a check on the current one. */
function IndexLocaleList({ content }: { content: CountryLocaleContent }) {
  return (
    <ul className="index-panel__locales" aria-label={content.t('locale.group')}>
      {LOCALES.map((locale) => (
        <li key={locale}>
          <a
            href={publicPathFor(locale)}
            hrefLang={locale}
            aria-current={locale === content.locale ? 'page' : undefined}
          >
            <span>{content.t(LOCALE_NAME_KEY[locale])}</span>
            {locale === content.locale ? <Icon name="check" size={16} /> : null}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The panel's contents: the same four page links, the locale rows, the stamp and the theme group. */
function IndexPanelBody({ content, snapshotIso, pageKind, long }: DatedHeaderProps) {
  return (
    <div className="index-panel">
      <PageLinks content={content} snapshotIso={snapshotIso} pageKind={pageKind} className="index-panel__anchors" />
      <hr className="index-panel__rule" />
      <IndexLocaleList content={content} />
      <hr className="index-panel__rule" />
      <p className="index-panel__stamp">
        {content.t('hero.snapshotLabel')} <time dateTime={snapshotIso}>{long}</time>
      </p>
      <hr className="index-panel__rule" />
      <ThemeGroup legend={content.t('theme.label')} labels={themeLabels(content)} />
    </div>
  );
}

/** Below 1024px the index panel is the whole navigation: the same four page links. */
function IndexPanel({ content, snapshotIso, pageKind, long }: DatedHeaderProps) {
  return (
    <details className="site-header__index">
      <summary className="site-header__index-trigger" aria-label={content.t('nav.index')}>
        <Icon name="caret-down" size={20} />
      </summary>
      <IndexPanelBody content={content} snapshotIso={snapshotIso} pageKind={pageKind} long={long} />
    </details>
  );
}

/**
 * One header, two density modes (D8): at 320 the row is the wordmark, the ISO 8601 snapshot date,
 * the index trigger and the theme control. At 768 the full stamp returns inline; at 1024 the four
 * page links and the five-cell locale group appear.
 *
 * Spec 007 T6: the nav items are page links, not in-page anchors. The active page is marked with
 * `aria-current="page"` plus a neutral 2px rule; no transition runs on the row, so the state paints
 * in the same frame and `prefers-reduced-motion` has nothing to suppress.
 */
export function SiteHeader({ content, snapshotIso, pageKind }: SiteHeaderProps) {
  const long = formatDate(snapshotIso, content.locale);
  return (
    <header className="site-header">
      <HeaderBrand content={content} snapshotIso={snapshotIso} long={long} />
      <PageLinks content={content} snapshotIso={snapshotIso} pageKind={pageKind} className="site-header__nav" />
      <p className="site-header__stamp">
        <span>{content.t('hero.snapshotLabel')}</span>{' '}
        <time dateTime={snapshotIso}>{long}</time>
      </p>
      <IndexPanel content={content} snapshotIso={snapshotIso} pageKind={pageKind} long={long} />
      <LocaleCells content={content} />
      <ThemeToggle labels={themeLabels(content)} groupLabel={content.t('theme.label')} />
    </header>
  );
}

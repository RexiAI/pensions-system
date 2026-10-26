import { formatDate } from '../../content/format';
import type { LocaleKey } from '../../content/keys';
import { LOCALES } from '../../content/types';
import type { CountryLocaleContent, Locale } from '../../content/types';
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

const NAV_ANCHORS: ReadonlyArray<{ href: string; label: LocaleKey }> = [
  { href: '#figuras', label: 'nav.figures' },
  { href: '#metodo', label: 'nav.method' },
  { href: '#debate', label: 'nav.debate' },
  { href: '#lectura', label: 'nav.reading' },
];

export function localePath(locale: string): string {
  return locale === 'es' ? '/' : `/${locale}`;
}

export interface SiteHeaderProps {
  content: CountryLocaleContent;
  snapshotIso: string;
}

function themeLabels(content: CountryLocaleContent): Record<'system' | 'light' | 'dark', string> {
  return {
    system: content.t('theme.system'),
    light: content.t('theme.light'),
    dark: content.t('theme.dark'),
  };
}

/** Five inverted cells in one bordered group (D8): a filled cell is unmistakable at 36px. */
function LocaleCells({ content }: { content: CountryLocaleContent }) {
  return (
    <div className="locale-group" role="group" aria-label={content.t('locale.group')}>
      {LOCALES.map((locale) => (
        <a
          key={locale}
          className="locale-group__cell"
          href={localePath(locale)}
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

/** Below 768px the index panel is the whole navigation: no anchors, no locale cells. */
function IndexPanel({ content, snapshotIso }: SiteHeaderProps) {
  const long = formatDate(snapshotIso, content.locale);
  return (
    <details className="site-header__index">
      <summary className="site-header__index-trigger" aria-label={content.t('nav.index')}>
        <Icon name="caret-down" size={20} />
      </summary>
      <div className="index-panel">
        <nav className="index-panel__anchors" aria-label={content.t('nav.index')}>
          {NAV_ANCHORS.map((anchor) => (
            <a key={anchor.href} href={anchor.href}>
              {content.t(anchor.label)}
            </a>
          ))}
        </nav>
        <hr className="index-panel__rule" />
        <ul className="index-panel__locales" aria-label={content.t('locale.group')}>
          {LOCALES.map((locale) => (
            <li key={locale}>
              <a
                href={localePath(locale)}
                hrefLang={locale}
                aria-current={locale === content.locale ? 'page' : undefined}
              >
                <span>{content.t(LOCALE_NAME_KEY[locale])}</span>
                {locale === content.locale ? <Icon name="check" size={16} /> : null}
              </a>
            </li>
          ))}
        </ul>
        <hr className="index-panel__rule" />
        <p className="index-panel__stamp">
          {content.t('hero.snapshotLabel')} <time dateTime={snapshotIso}>{long}</time>
        </p>
        <hr className="index-panel__rule" />
        <ThemeGroup legend={content.t('theme.label')} labels={themeLabels(content)} />
      </div>
    </details>
  );
}

/**
 * One header, two density modes (D8): at 320 the row is exactly 56px with the wordmark, the
 * ISO 8601 snapshot date, the index trigger and the theme control. At 768 the full stamp
 * returns inline; at 1024 the four anchors and the five-cell locale group appear.
 */
export function SiteHeader({ content, snapshotIso }: SiteHeaderProps) {
  const long = formatDate(snapshotIso, content.locale);
  return (
    <header className="site-header">
      <a className="site-header__wordmark" href={localePath(content.locale)}>
        {content.t('site.wordmark')}
      </a>
      <span className="site-header__iso" aria-label={`${content.t('hero.snapshotLabel')} ${long}`} title={long}>
        <time dateTime={snapshotIso}>{snapshotIso.slice(0, 10)}</time>
      </span>
      <nav className="site-header__nav" aria-label={content.t('nav.index')}>
        {NAV_ANCHORS.map((anchor) => (
          <a key={anchor.href} href={anchor.href}>
            {content.t(anchor.label)}
          </a>
        ))}
      </nav>
      <p className="site-header__stamp">
        <span>{content.t('hero.snapshotLabel')}</span>{' '}
        <time dateTime={snapshotIso}>{long}</time>
      </p>
      <IndexPanel content={content} snapshotIso={snapshotIso} />
      <LocaleCells content={content} />
      <ThemeToggle labels={themeLabels(content)} groupLabel={content.t('theme.label')} />
    </header>
  );
}

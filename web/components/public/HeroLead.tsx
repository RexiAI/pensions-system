import type { CountryLocaleContent } from '../../content/types';
import type { HeroSubject } from './hero-subject';
import { ScopeMark } from './ScopeMark';
import type { ScopeEntry } from './ScopeMark';

/** One hero action. The hierarchy between the two is CSS's; which leads is the caller's. */
export interface HeroAction {
  /** The in-page fragment the action goes to. */
  href: string;
  /** The action's visible text, already resolved from the content model. */
  label: string;
}

/** The single-country scope mark: one published country renders as plain text, not a list. */
export function defaultScope(content: CountryLocaleContent): readonly ScopeEntry[] {
  return [{ geo: content.country.code, name: content.country.name, href: '#' }];
}

/**
 * The tier's two actions. Which one leads is the only thing the tiers disagree about, and it is
 * decided here once: the band renders the lead outside the hero (D1), so a second copy of this
 * mapping would be a second place for the hierarchy to drift.
 */
export function leadActions(
  content: CountryLocaleContent,
  kind: HeroSubject['kind'],
): { primary: HeroAction; secondary: HeroAction } {
  if (kind === 'proposition') {
    return {
      primary: { href: '#metodo', label: content.t('hero.ctaMethod') },
      secondary: { href: '#figuras', label: content.t('hero.ctaFigures') },
    };
  }
  return {
    primary: { href: '#figuras', label: content.t('hero.ctaPrimary') },
    secondary: { href: '#metodo', label: content.t('hero.ctaSecondary') },
  };
}

/**
 * The lead block both tiers share: the statement, the scope mark, the sub and the two actions.
 *
 * Extracted because the tiers differ only in *which* action leads — a difference the props carry —
 * while the `<h1>`, its `id` and the `aria-labelledby` that points at it must not drift apart
 * between them. It is also the node the band renders above the clock (D1, AC-003-48): the band
 * takes it as a slot, so the page's identity, its actions and the section that follows cannot
 * disagree about what the promise is.
 */
export function HeroLead({
  content,
  countries,
  primary,
  secondary,
}: {
  content: CountryLocaleContent;
  countries?: readonly ScopeEntry[];
  primary: HeroAction;
  secondary: HeroAction;
}) {
  return (
    <div className="hero__lead">
      <h1 className="hero__title" id="hero-title">
        {content.t('hero.statement')}
      </h1>
      <ScopeMark content={content} countries={countries ?? defaultScope(content)} />
      <p className="hero__sub">{content.t('hero.sub')}</p>
      <div className="hero__actions">
        <a className="hero__cta" href={primary.href}>
          {primary.label}
        </a>
        <a className="hero__cta-secondary" href={secondary.href}>
          {secondary.label}
        </a>
      </div>
    </div>
  );
}

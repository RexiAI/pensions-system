import { formatYear } from '../../content/format';
import { canonicalUrl } from '../../content/site';
import type { CountryLocaleContent } from '../../content/types';
import type { CountdownValue } from '../../series/countdown';
import { DAYS_PLACEHOLDER } from '../../share/links';
import { publicPathFor, pagePathFor } from '../../seo/routes';
import { ShareRow } from '../share/ShareRow';
import type { ShareStrings } from '../share/ShareRow';

export interface StoryStripProps {
  content: CountryLocaleContent;
  /** The countdown the share message counts against; absent means the row does not render. */
  countdown?: CountdownValue;
}

function shareStrings(content: CountryLocaleContent): ShareStrings {
  return {
    label: content.t('share.label'),
    native: content.t('share.native'),
    copy: content.t('share.copy'),
    copied: content.t('share.copied'),
    linkLabel: content.t('share.linkLabel'),
    newWindow: content.t('share.newWindow'),
    networks: {
      whatsapp: content.t('share.whatsapp'),
      telegram: content.t('share.telegram'),
      x: content.t('share.x'),
      linkedin: content.t('share.linkedin'),
    },
  };
}

/**
 * The seam between the story and the appendix (spec 004 T6): the method link at the inline start,
 * the share row at the inline end, one `flex` row that wraps — never a grid, so an absent share
 * row cannot leave a track with nothing in it.
 *
 * It sits after the fifth step and inside no step: the story holds five claims and one action, and
 * the way to the method and the way to spread the page are not claims. Both work without
 * JavaScript — the links, the canonical URL and the no-script message are in the served HTML.
 */
/** A computed countdown with an anchor is the only countdown the share row is built for. */
function anchoredCountdown(countdown: CountdownValue | undefined): CountdownValue | undefined {
  return countdown?.state === 'computed' && countdown.anchor !== null ? countdown : undefined;
}

/** The share row, with its two message templates resolved against the canonical URL. */
function ShareBlock({ content, countdown }: { content: CountryLocaleContent; countdown: CountdownValue }) {
  const url = canonicalUrl(publicPathFor(content.locale));
  const year = formatYear(countdown.thresholdYear ?? 0, content.locale);
  return (
    <ShareRow
      url={url}
      anchor={countdown.anchor ?? ''}
      locale={content.locale}
      withDays={content.t('share.text', { year, url, days: DAYS_PLACEHOLDER })}
      withoutDays={content.t('share.textNoJs', { year, url })}
      strings={shareStrings(content)}
    />
  );
}

export function StoryStrip({ content, countdown }: StoryStripProps) {
  const anchored = anchoredCountdown(countdown);
  return (
    <div className="story__strip">
      <a className="hero__cta-secondary" href={pagePathFor(content.locale, 'metodo')}>
        {content.t('hero.ctaSecondary')}
      </a>
      {anchored === undefined ? null : <ShareBlock content={content} countdown={anchored} />}
    </div>
  );
}

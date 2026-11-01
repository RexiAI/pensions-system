import { formatYear } from '../../content/format';
import { canonicalUrl } from '../../content/site';
import type { CountryLocaleContent } from '../../content/types';
import type { DerivedSeries } from '../../ingest/series-types';
import type { CountdownValue } from '../../series/countdown';
import { DAYS_PLACEHOLDER } from '../../share/links';
import { publicPathFor } from '../../seo/routes';
import type { ReactNode } from 'react';
import { ShareRow } from '../share/ShareRow';
import type { ShareStrings } from '../share/ShareRow';
import { CountdownBlock } from './CountdownBlock';
import { Fuse } from './Fuse';

export interface CountdownBandProps {
  content: CountryLocaleContent;
  /** A computed countdown with its anchor; the caller renders no band otherwise (AC-003-08). */
  countdown: CountdownValue & { anchor: string; thresholdYear: number };
  /** The fuse series; absent or not computed means no fuse renders (AC-003-18). */
  fuse?: DerivedSeries;
  nowMs: number;
  freshnessWindowDays: number;
  /**
   * The page's identity block — the `<h1>`, the scope mark, the sub and the two actions. It leads
   * the band, above the clock (spec 003 layout fix): two screens of numerals before the sentence
   * that says what the page is about put the page's identity and its only way to spread below the
   * fold. The band renders the node it is handed and knows nothing about the hero's tiers.
   */
  lead?: ReactNode;
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

/** A computed countdown that has an anchor is the only countdown the band is built for. */
export function bandCountdown(
  countdown: CountdownValue | undefined,
): CountdownBandProps['countdown'] | undefined {
  if (countdown?.state !== 'computed' || countdown.anchor === null || countdown.thresholdYear === null) {
    return undefined;
  }
  return countdown as CountdownBandProps['countdown'];
}

/**
 * The countdown band (spec 003 T1): one full-width block leading the page — the page's identity
 * block, the countdown with its clock, the fuse, then the share row. The three figures are
 * siblings: the clock's subtree stays exactly the countdown block (no `<svg>`, no live region
 * inside it, AC-001-99/116), and the fuse and the share glyphs live beside it. Not sticky, not
 * floating.
 */
export function CountdownBand({
  content,
  countdown,
  fuse,
  nowMs,
  freshnessWindowDays,
  lead,
}: CountdownBandProps) {
  const year = formatYear(countdown.thresholdYear, content.locale);
  const url = canonicalUrl(publicPathFor(content.locale));
  return (
    <div className="band">
      {lead}
      <CountdownBlock content={content} countdown={countdown} nowMs={nowMs} />
      {fuse === undefined ? null : (
        <Fuse content={content} series={fuse} freshnessWindowDays={freshnessWindowDays} />
      )}
      <ShareRow
        url={url}
        anchor={countdown.anchor}
        locale={content.locale}
        withDays={content.t('share.text', { year, url, days: DAYS_PLACEHOLDER })}
        withoutDays={content.t('share.textNoJs', { year, url })}
        strings={shareStrings(content)}
      />
    </div>
  );
}

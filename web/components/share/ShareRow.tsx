'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { integerFormatter } from '../../content/format';
import type { Locale } from '../../content/types';
import { SHARE_NETWORKS, messageAt, shareHref } from '../../share/links';
import type { ShareNetwork } from '../../share/links';
import { CopyLink } from './CopyLink';
import { ShareIcon } from './ShareIcon';

export interface ShareStrings {
  label: string;
  native: string;
  copy: string;
  copied: string;
  linkLabel: string;
  newWindow: string;
  networks: Readonly<Record<ShareNetwork, string>>;
}

export interface ShareRowProps {
  /** The canonical URL of this locale route: the only URL any control shares. */
  url: string;
  /** The clock's anchor: the click-time day count is read against it, like the clock. */
  anchor: string;
  locale: Locale;
  /** The JS message, year and URL filled, `{days}` left for the click instant. */
  withDays: string;
  /** The year-led message the server HTML carries: no day count (AC-003-24). */
  withoutDays: string;
  strings: ShareStrings;
}

function useMessage(props: ShareRowProps): () => string {
  const formatDays = useMemo(() => integerFormatter(props.locale), [props.locale]);
  const { withDays, withoutDays, anchor } = props;
  return () => messageAt({ withDays, withoutDays }, anchor, Date.now(), formatDays);
}

function NativeShare({ label, message, url }: { label: string; message: () => string; url: string }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => setAvailable(typeof navigator.share === 'function'), []);
  if (!available) return null;
  const share = (): void => {
    navigator.share({ text: message(), url }).catch(() => undefined);
  };
  return (
    <button type="button" className="share__control" onClick={share}>
      <ShareIcon name="native" />
      <span>{label}</span>
    </button>
  );
}

/**
 * The share row (spec 003 T3). Four plain links that work with JavaScript disabled, carrying the
 * year-led message; with JavaScript the link's `href` is rebuilt at the click instant, so the day
 * count is the clock's day value then, never the render instant's (AC-003-25). The navigation
 * itself stays the browser's own: nothing here calls a network, loads a script or sets a cookie.
 */
export function ShareRow(props: ShareRowProps) {
  const { url, strings, withoutDays } = props;
  const message = useMessage(props);
  const retarget = (network: ShareNetwork) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.href = shareHref(network, message(), url);
  };
  return (
    <div className="share" role="group" aria-label={strings.label}>
      <NativeShare label={strings.native} message={message} url={url} />
      {SHARE_NETWORKS.map((network) => (
        <a
          key={network}
          className="share__control"
          href={shareHref(network, withoutDays, url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={retarget(network)}
        >
          <ShareIcon name={network} />
          <span>{strings.networks[network]}</span>
          <span className="visually-hidden"> {strings.newWindow}</span>
        </a>
      ))}
      <CopyLink url={url} copy={strings.copy} copied={strings.copied} linkLabel={strings.linkLabel} />
    </div>
  );
}

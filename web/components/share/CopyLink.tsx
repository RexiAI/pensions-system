'use client';

import { useEffect, useState } from 'react';
import { ShareIcon } from './ShareIcon';

export interface CopyLinkProps {
  url: string;
  copy: string;
  copied: string;
  linkLabel: string;
}

const CONFIRMATION_MS = 2000;

/** The no-JS and no-Clipboard form: the canonical URL as selectable text, with its label. */
function UrlField({ url, linkLabel, focus }: { url: string; linkLabel: string; focus: boolean }) {
  return (
    <label className="share__field">
      <span className="share__field-label">{linkLabel}</span>
      <input
        className="share__url"
        type="text"
        readOnly
        value={url}
        autoFocus={focus}
        onFocus={(event) => event.currentTarget.select()}
      />
    </label>
  );
}

/**
 * Copy link (AC-003-28). The server HTML carries the URL field, so a reader without JavaScript
 * still has the link; once hydrated the field becomes a button. With no Clipboard API the field
 * comes back, focused and selected. The confirmation is a text swap plus a `role="status"`
 * sibling — no toast, no animation (15-design.md §T3).
 */
export function CopyLink({ url, copy, copied, linkLabel }: CopyLinkProps) {
  const [enhanced, setEnhanced] = useState(false);
  const [state, setState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  useEffect(() => setEnhanced(true), []);
  const onCopy = (): void => {
    if (!navigator.clipboard?.writeText) return setState('fallback');
    navigator.clipboard.writeText(url).then(
      () => {
        setState('copied');
        window.setTimeout(() => setState('idle'), CONFIRMATION_MS);
      },
      () => setState('fallback'),
    );
  };
  if (!enhanced || state === 'fallback') return <UrlField url={url} linkLabel={linkLabel} focus={enhanced} />;
  return (
    <>
      <button type="button" className="share__control" onClick={onCopy}>
        <ShareIcon name="copy" />
        <span>{state === 'copied' ? copied : copy}</span>
      </button>
      <span className="visually-hidden" role="status">
        {state === 'copied' ? copied : ''}
      </span>
    </>
  );
}

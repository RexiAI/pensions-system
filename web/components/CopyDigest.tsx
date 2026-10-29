'use client';

import { useState } from 'react';

export interface CopyDigestProps {
  digest: string;
  label: string;
  copiedLabel: string;
}

/**
 * The disclosure's copy control. The `aria-live` region lives here, inside the operator
 * disclosure, and nowhere else on the public site: it is the one place where something
 * appears in response to the reader's own action (D6, D5).
 */
export function CopyDigest({ digest, label, copiedLabel }: CopyDigestProps) {
  const [copied, setCopied] = useState(false);
  const copy = (): void => {
    navigator.clipboard?.writeText(digest).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };
  return (
    <span className="provenance__copy">
      <button type="button" className="provenance__copy-button" onClick={copy}>
        {label}
      </button>
      <span className="provenance__copy-status" aria-live="polite">
        {copied ? copiedLabel : ''}
      </span>
    </span>
  );
}

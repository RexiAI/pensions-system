import type { Metadata } from 'next';
import { contentRegistry } from '../web/content/registry';
import { DEFAULT_LOCALE } from '../web/content/types';
import { RootShell } from '../web/shell/root-shell';
import '../web/styles/globals.css';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The typographic error shell: one sentence, the five locales, no silent fallback.
 *
 * It is `global-not-found` rather than `not-found` because the app has one root layout per
 * locale branch (see `web/shell/root-shell.tsx`): an unmatched URL belongs to none of them, so
 * this file owns its own document shell and declares the base locale — the same `<html lang>`
 * the single-root-layout version emitted before the split, with the stylesheet still attached.
 */
export default function GlobalNotFound() {
  const result = contentRegistry.get('ES', DEFAULT_LOCALE);
  const content = result.ok ? result.content : null;
  if (!content) throw new Error('base locale is missing');
  return (
    <RootShell lang={DEFAULT_LOCALE}>
      <main className="page">
        <h1>{content.t('error.locale.title')}</h1>
        <p>{content.t('error.locale.body')}</p>
        <p>
          <a href="/">{content.t('error.home')}</a>
        </p>
      </main>
    </RootShell>
  );
}

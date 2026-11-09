import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { RootShell } from '../../../web/shell/root-shell';
import { siteMetadata, siteViewport } from '../../../web/seo/site-metadata';
import { DEFAULT_LOCALE } from '../../../web/content/types';
import '../../../web/styles/globals.css';

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

/* Spec 006 T12 (D17): one-hour ISR, declared on the segment's layout (Next folds every segment's
   route config into one policy). The build's route table lists `/` as ISR `1h`. */
export const revalidate = 3600;

/**
 * The root layout of the Spanish-only branch (`/`). The `<html lang>` is this route's own
 * locale, stated here because a shared root layout above both branches could not know it —
 * see `web/shell/root-shell.tsx`.
 */
export default function HomeRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootShell lang={DEFAULT_LOCALE}>
      {children}
      <Analytics />
    </RootShell>
  );
}

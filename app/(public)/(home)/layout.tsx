import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { RootShell } from '../../../web/shell/root-shell';
import { siteMetadata, siteViewport } from '../../../web/seo/site-metadata';
import { DEFAULT_LOCALE } from '../../../web/content/types';
import '../../../web/styles/globals.css';

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

/**
 * The root layout of the Spanish-only branch (`/`). The `<html lang>` is this route's own
 * locale, stated here because a shared root layout above both branches could not know it —
 * see `web/shell/root-shell.tsx`.
 */
export default function HomeRootLayout({ children }: { children: ReactNode }) {
  return <RootShell lang={DEFAULT_LOCALE}>{children}</RootShell>;
}

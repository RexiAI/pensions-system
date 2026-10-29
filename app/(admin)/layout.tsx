import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { siteMetadata, siteViewport } from '../../web/seo/site-metadata';
import { RootShell } from '../../web/shell/root-shell';
import { DEFAULT_LOCALE } from '../../web/content/types';
import '../../web/styles/globals.css';

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

/**
 * The root layout of the admin branch. The operator surface is not localised, so it declares
 * the site's base locale rather than inheriting whatever the public tree happened to emit.
 */
export default function AdminBranchRootLayout({ children }: { children: ReactNode }) {
  return <RootShell lang={DEFAULT_LOCALE}>{children}</RootShell>;
}

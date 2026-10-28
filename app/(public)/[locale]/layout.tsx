import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { siteMetadata, siteViewport } from '../../../web/seo/site-metadata';
import { RootShell } from '../../../web/shell/root-shell';
import { isLocale } from '../../../web/content/types';
import '../../../web/styles/globals.css';

/**
 * Closed locale tuple: a path outside `generateStaticParams` is a 404, never an on-demand
 * render. It sits on the layout rather than the page because Next collects route segment
 * config from every segment of the route — the layout's entry and the page's entry both
 * fold into the same effective policy, so the page keeps its `dynamic = 'force-static'`.
 *
 * This layout is also this branch's root layout, which is why it renders the document shell:
 * `<html lang>` can only be declared by the layout that the `[locale]` segment sits under, and
 * the old single `app/layout.tsx` sat above it and could only ever emit one language.
 */
export const dynamicParams = false;

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <RootShell lang={locale}>{children}</RootShell>;
}

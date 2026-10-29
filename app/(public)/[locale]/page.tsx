import type { Metadata } from 'next';
import { renderPublicPage } from '../../../web/components/render-public-page';
import { metadataFor } from '../../../web/seo/metadata';

export const dynamic = 'force-static';

const LOCALES = ['en', 'fr', 'de', 'it'] as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return metadataFor(locale);
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderPublicPage(locale);
}

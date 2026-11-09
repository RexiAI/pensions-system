import type { Metadata } from 'next';
import { renderPublicPage } from '../../../web/components/render-public-page';
import { metadataFor } from '../../../web/seo/metadata';
import { NON_DEFAULT_LOCALES } from '../../../web/content/types';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return NON_DEFAULT_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return metadataFor(locale);
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderPublicPage(locale);
}

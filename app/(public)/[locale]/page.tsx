import { renderPublicPage } from '../../../web/components/render-public-page';

export const dynamic = 'force-static';
export const dynamicParams = false;

const LOCALES = ['en', 'fr', 'de', 'it'] as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderPublicPage(locale);
}

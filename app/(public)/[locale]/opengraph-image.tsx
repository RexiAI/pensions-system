import { ImageResponse } from 'next/og';
import { DEFAULT_LOCALE } from '../../../web/content/types';
import { shareAlt, shareCard } from '../../../web/seo/share-card';

/** Next's default for an OG image, restated so the card's aspect is visible at the route. */
export const size = { width: 1200, height: 630 };

const LOCALES = ['en', 'fr', 'de', 'it'] as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const alt = shareAlt(DEFAULT_LOCALE);

export default async function Image({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale } = await params;
  const card = shareCard(locale ?? DEFAULT_LOCALE);
  if (!card) throw new Error('no content for this share card locale');
  return new ImageResponse(card.element, size);
}

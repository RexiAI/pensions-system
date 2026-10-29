import { ImageResponse } from 'next/og';
import { DEFAULT_LOCALE } from '../../../web/content/types';
import { shareAlt, shareCard } from '../../../web/seo/share-card';

/** Next's default for an OG image, restated so the card's aspect is visible at the route. */
export const size = { width: 1200, height: 630 };

const LOCALES = ['en', 'fr', 'de', 'it'] as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * `og:image:alt` per locale. The `alt` export of this file is a single string for the whole
 * route, so it could only ever hold one locale's text — which is why `/[locale]` links used to
 * announce themselves in Spanish. `generateImageMetadata` is the metadata-file API that is
 * called with the route's params, so the alt is resolved per rendered locale. It also requires
 * an `id`, which Next appends to the image URL.
 */
export async function generateImageMetadata({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale } = await params;
  return [{ id: 'card', alt: shareAlt(locale ?? DEFAULT_LOCALE), size, contentType: 'image/png' }];
}

export default async function Image({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale } = await params;
  const card = shareCard(locale ?? DEFAULT_LOCALE);
  if (!card) throw new Error('no content for this share card locale');
  return new ImageResponse(card.element, size);
}

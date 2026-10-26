import { ImageResponse } from 'next/og';
import { shareAlt, shareCard } from '../../web/seo/share-card';

export const size = { width: 1200, height: 630 };
export const alt = shareAlt('es');

export default function Image() {
  const card = shareCard('es');
  if (!card) throw new Error('no content for the share card locale');
  return new ImageResponse(card.element, size);
}

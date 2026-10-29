import type { Metadata } from 'next';
import { renderPublicPage } from '../../../web/components/render-public-page';
import { metadataFor } from '../../../web/seo/metadata';

export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
  return metadataFor('es');
}

export default function SpanishHomePage() {
  return renderPublicPage('es');
}

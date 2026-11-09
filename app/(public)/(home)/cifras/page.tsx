import type { Metadata } from 'next';
import { renderPublicPage } from '../../../../web/components/render-public-page';
import { metadataFor } from '../../../../web/seo/metadata';

export const dynamic = 'force-static';

export function generateMetadata(): Metadata {
  return metadataFor('es', 'cifras');
}

export default function SpanishCifrasPage() {
  return renderPublicPage('es', 'cifras');
}

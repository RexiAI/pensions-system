import { renderPublicPage } from '../../web/components/render-public-page';

export const dynamic = 'force-static';

export default function SpanishHomePage() {
  return renderPublicPage('es');
}

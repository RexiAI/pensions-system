import type { Metadata } from 'next';
import { contentRegistry } from '../web/content/registry';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** The typographic error shell: one sentence, the five locales, no silent fallback. */
export default function NotFound() {
  const result = contentRegistry.get('ES', 'es');
  const content = result.ok ? result.content : null;
  if (!content) throw new Error('base locale is missing');
  return (
    <main className="page">
      <h1>{content.t('error.locale.title')}</h1>
      <p>{content.t('error.locale.body')}</p>
      <p>
        <a href="/">{content.t('error.home')}</a>
      </p>
    </main>
  );
}

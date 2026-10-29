import type { Metadata, Viewport } from 'next';
import { BRAND } from '../brand/generated';
import { SITE_URL } from '../content/site';

/**
 * The metadata every root layout shares. A root layout owns the document, so each of them
 * re-exports these two values rather than restating them: the icon set, `metadataBase` and the
 * theme colours are the same on every route, and three copies would drift.
 */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: BRAND.wordmark,
  description: 'Cinco cifras oficiales con su fórmula, su fuente y el comando para reproducirlas.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
};

/** Light and dark variants: the browser chrome follows the reader's OS setting (D7). */
export const siteViewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND.onGround },
    { media: '(prefers-color-scheme: dark)', color: BRAND.ground },
  ],
};

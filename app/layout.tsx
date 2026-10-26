import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { BRAND } from '../web/brand/generated';
import { SITE_URL } from '../web/content/site';
import '../web/styles/globals.css';

export const metadata: Metadata = {
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
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND.onGround },
    { media: '(prefers-color-scheme: dark)', color: BRAND.ground },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

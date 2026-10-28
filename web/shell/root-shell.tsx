import type { ReactNode } from 'react';

/**
 * The document shell for one root layout. `lang` is a required argument on purpose: every
 * route branch states its own locale, so no branch can inherit another language's
 * hyphenation, screen-reader pronunciation or search language by omission.
 *
 * Next's root layout is the only place a `<html>` element may be rendered, and a single root
 * layout cannot see the `[locale]` segment below it. That is why the public tree has one root
 * layout per locale branch (`app/(public)/(home)` for `es`, `app/(public)/[locale]` for the
 * rest) instead of one shared shell: the segment that knows the locale has to sit *above* the
 * element that declares it.
 */
export function RootShell({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}

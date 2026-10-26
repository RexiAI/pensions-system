import type { ReactNode } from 'react';

/**
 * Closed locale tuple: a path outside `generateStaticParams` is a 404, never an on-demand
 * render. It sits on the layout rather than the page because Next collects route segment
 * config from every segment of the route — the layout's entry and the page's entry both
 * fold into the same effective policy, so the page keeps its `dynamic = 'force-static'`.
 * The layout contributes no markup of its own.
 */
export const dynamicParams = false;

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return children;
}

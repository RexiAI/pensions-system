import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import type { PageKind } from '../content/types';
import { publicPageProps } from './public-page-props';
import { PublicPage } from './PublicPage';

export { DEFAULT_FRESHNESS_DAYS } from './public-page-props';

/**
 * Renders one page of the public site from committed data only. There is no admin dependency
 * here: an unconfigured deployment still serves the public page. An unknown locale has no props
 * and becomes a 404, never an on-demand render.
 */
export function renderPublicPage(locale: string, pageKind: PageKind = 'historia'): ReactNode {
  const props = publicPageProps(locale);
  if (!props) notFound();
  return <PublicPage {...props} pageKind={pageKind} />;
}

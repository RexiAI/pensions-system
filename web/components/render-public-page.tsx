import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { publicPageProps } from './public-page-props';
import { PublicPage } from './PublicPage';

export { DEFAULT_FRESHNESS_DAYS } from './public-page-props';

/**
 * Renders one locale of the public site from committed data only. There is no admin
 * dependency here: an unconfigured deployment still serves the public page.
 */
export function renderPublicPage(locale: string): ReactNode {
  const props = publicPageProps(locale);
  if (!props) notFound();
  return <PublicPage {...props} />;
}

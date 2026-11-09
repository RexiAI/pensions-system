import { PAGE_NAME_KEYS } from '../../content/keys';
import { PAGE_KINDS } from '../../content/types';
import type { CountryLocaleContent, PageKind } from '../../content/types';
import { pagePathFor } from '../../seo/routes';

export interface PagerProps {
  content: CountryLocaleContent;
  pageKind: PageKind;
}

const SEQUENCE: readonly PageKind[] = PAGE_KINDS;

function neighbour(kind: PageKind, offset: -1 | 1): PageKind | undefined {
  const index = SEQUENCE.indexOf(kind);
  if (index === -1) return undefined;
  return SEQUENCE[index + offset];
}

/**
 * One pager link (spec 007 T7): direction word plus destination page name, so the accessible name
 * is the visible text and no `aria-label` duplicates it. The absent slot on the first and last
 * page is absent from the DOM, never an empty box that reads as a broken link.
 */
function PagerLink({ content, kind, direction }: { content: CountryLocaleContent; kind: PageKind; direction: 'prev' | 'next' }) {
  return (
    <a className={`pager__link pager__link--${direction}`} href={pagePathFor(content.locale, kind)}>
      <span className="pager__direction">{content.t(direction === 'prev' ? 'pager.previous' : 'pager.next')}</span>{' '}
      <span className="pager__destination">{content.t(PAGE_NAME_KEYS[kind])}</span>
    </a>
  );
}

/**
 * The end-of-page previous/next pair (spec 007 T7, Tesler's pager). Historia has no previous and
 * Debate no next; the two middle pages have both. Static: no transition, no counter, no arrows.
 */
export function Pager({ content, pageKind }: PagerProps) {
  const previous = neighbour(pageKind, -1);
  const next = neighbour(pageKind, 1);
  return (
    <nav className="pager" aria-label={content.t('pager.label')}>
      {previous === undefined ? null : <PagerLink content={content} kind={previous} direction="prev" />}
      {next === undefined ? null : <PagerLink content={content} kind={next} direction="next" />}
    </nav>
  );
}

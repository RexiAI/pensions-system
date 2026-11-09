import { PAGE_NAME_KEYS } from '../../content/keys';
import type { CountryLocaleContent, PageKind } from '../../content/types';

export interface PageHeadingProps {
  content: CountryLocaleContent;
  pageKind: PageKind;
  /** The heading's DOM id: each page's first region points its `aria-labelledby` at it. */
  id: string;
}

/**
 * A sub-page's one `<h1>` (spec 007 T3/T4/T5). It takes the appendix heading's declaration set —
 * a sub-page title is a signpost, not a claim — and the page's first region groups under it
 * through `--page-head-gap` and no hairline.
 */
export function PageHeading({ content, pageKind, id }: PageHeadingProps) {
  return (
    <h1 className="page-heading" id={id}>
      {content.t(PAGE_NAME_KEYS[pageKind])}
    </h1>
  );
}

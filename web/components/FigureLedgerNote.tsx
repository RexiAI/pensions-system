import type { CountryLocaleContent } from '../content/types';

export interface FigureLedgerNoteProps {
  content: CountryLocaleContent;
}

/**
 * Rendered exactly once per page, above the first unresolved figure (D1). It states the
 * situation so the rows do not have to, and it is neither an apology nor a promise.
 */
export function FigureLedgerNote({ content }: FigureLedgerNoteProps) {
  return <p className="figure-ledger-note">{content.t('figure.ledgerNote')}</p>;
}

import type { CitationRegistry, ClaimVariables } from '../../content/citations';
import type { CountryLocaleContent } from '../../content/types';
import { AgreementSection } from '../registers/AgreementSection';
import { DisputeSection } from '../registers/DisputeSection';
import { ThesisSection } from '../registers/ThesisSection';
import { PageHeading } from './PageHeading';

export interface DebatePageProps {
  content: CountryLocaleContent;
  citations: CitationRegistry;
  vars?: ClaimVariables;
}

/**
 * Debate (spec 007 T5): one `<h1>`, then the three registers in fixed order — agreement, dispute,
 * thesis. `#debate` wraps the two argued registers and `#lectura` the reading; both resolve here.
 */
export function DebatePage({ content, citations, vars }: DebatePageProps) {
  return (
    <>
      <PageHeading content={content} pageKind="debate" id="page-title-debate" />
      <div id="debate">
        <AgreementSection content={content} citations={citations} vars={vars} />
        <DisputeSection content={content} citations={citations} />
      </div>
      <div id="lectura">
        <ThesisSection content={content} />
      </div>
    </>
  );
}

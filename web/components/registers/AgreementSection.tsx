import { resolveClaims } from '../../content/citations';
import type { CitationRegistry, ClaimVariables } from '../../content/citations';
import type { AgreementClaim, CountryLocaleContent } from '../../content/types';
import { CitationChip } from '../CitationChip';

export interface AgreementSectionProps {
  content: CountryLocaleContent;
  citations: CitationRegistry;
  /** Overridable so the publication gate can render exactly what it would publish. */
  claims?: readonly AgreementClaim[];
  /** The committed figure's numerals, for a claim that states them rather than types them. */
  vars?: ClaimVariables;
}

/**
 * Register 1 of 3 (T10): what the official data settles. Every claim carries its own
 * citation; a claim whose citation does not resolve is dropped, not rendered bare.
 */
export function AgreementSection({ content, citations, claims, vars }: AgreementSectionProps) {
  const resolved = resolveClaims(claims ?? content.editorial.agreement, citations, vars);
  if (resolved.length === 0) return null;
  return (
    <section className="register register--agreement" data-register="agreement" aria-labelledby="agreement-heading">
      <h2 className="register__label" id="agreement-heading">
        {content.t('agreement.label')}
      </h2>
      <div className="register__prose">
        {resolved.map((claim) => (
          <div className="claim" key={claim.text}>
            <p>{claim.text}</p>
            <CitationChip citation={claim.citation} content={content} />
          </div>
        ))}
      </div>
    </section>
  );
}

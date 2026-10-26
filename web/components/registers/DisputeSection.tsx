import { resolveDisputes } from '../../content/citations';
import type { CitationRegistry } from '../../content/citations';
import type { CountryLocaleContent, DisputedClaim } from '../../content/types';
import { CitationChip } from '../CitationChip';

export interface DisputeSectionProps {
  content: CountryLocaleContent;
  citations: CitationRegistry;
  disputes?: readonly DisputedClaim[];
}

/**
 * Register 2 of 3 (T10): contested positions, rendered as a symmetric two-column dossier.
 * A dispute that loses a position to an unresolvable citation is dropped entirely, because
 * a one-sided dispute is a false statement.
 */
export function DisputeSection({ content, citations, disputes }: DisputeSectionProps) {
  const resolved = resolveDisputes(disputes ?? content.editorial.disputes, citations);
  if (resolved.length === 0) return null;
  return (
    <section className="register register--dispute" data-register="dispute" aria-labelledby="dispute-heading">
      <h2 className="register__label" id="dispute-heading">
        {content.t('dispute.label')}
      </h2>
      {resolved.map((dispute) => (
        <div className="dossier" key={dispute.id}>
          {dispute.positions.map(({ position, citation }) => (
            <article className="dossier__position" key={position.proponent}>
              <h3 className="dossier__name">{position.name}</h3>
              <p className="dossier__proponent">{`${position.proponent}, ${position.role}`}</p>
              <blockquote className="dossier__quote" cite={citation.url}>
                <p>{position.quote}</p>
                <cite>{citation.publisher}</cite>
              </blockquote>
              <CitationChip citation={citation} content={content} />
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}

import type { CountryLocaleContent } from '../../content/types';
import type { DerivedFigure } from '../../ingest/types';
import { selectHeroSubject } from './hero-subject';
import { HeroLead, leadActions } from './HeroLead';
import type { ScopeEntry } from './ScopeMark';

/**
 * The lead block on its own, for the band that now leads the page (D1): it resolves the actions
 * of whichever tier the ladder picked, from the same mapping the hero itself uses, so the band
 * cannot show a different promise than the section it precedes.
 */
export function HeroLeadBlock({
  content,
  figures,
  countries,
}: {
  content: CountryLocaleContent;
  figures: readonly DerivedFigure[];
  countries?: readonly ScopeEntry[];
}) {
  const actions = leadActions(content, selectHeroSubject(figures).kind);
  return (
    <HeroLead
      content={content}
      countries={countries}
      primary={actions.primary}
      secondary={actions.secondary}
    />
  );
}

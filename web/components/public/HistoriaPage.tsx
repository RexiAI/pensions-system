import type { CountryLocaleContent } from '../../content/types';
import type { DerivedSeries } from '../../ingest/series-types';
import type { CountdownValue } from '../../series/countdown';
import { PublicStory } from './PublicStory';
import { StoryStrip } from './StoryStrip';

export interface HistoriaPageProps {
  content: CountryLocaleContent;
  countdown?: CountdownValue;
  pyramid?: DerivedSeries;
  fuse?: DerivedSeries;
  nowMs: number;
  freshnessWindowDays: number;
}

/**
 * Historia (spec 007 T2): the five-step story and the story strip, and nothing else. The strip's
 * method link is a page link to Método, and the share row stays here because the share card is the
 * home card.
 */
export function HistoriaPage({ content, countdown, pyramid, fuse, nowMs, freshnessWindowDays }: HistoriaPageProps) {
  return (
    <>
      <PublicStory
        content={content}
        countdown={countdown}
        pyramid={pyramid}
        fuse={fuse}
        nowMs={nowMs}
        freshnessWindowDays={freshnessWindowDays}
      />
      <StoryStrip content={content} countdown={countdown} />
    </>
  );
}

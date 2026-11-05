import type { CountryLocaleContent } from '../../content/types';
import type { LocaleKey } from '../../content/keys';

/**
 * The five steps of the public page's story, in the order a reader meets them (spec 004 T1).
 *
 * This declaration is the single place the order exists: `PublicStory` maps over it and renders
 * one section per entry, so no component can disagree with it and no second copy can drift. Each
 * entry carries a stable `id` (rendered as `data-top-step`, never as visible text) and the content
 * key of its own `<h2>` — the module holds no literal copy.
 */
export type TopStepId = 'number' | 'breakage' | 'why' | 'distance' | 'meaning';

export interface TopStep {
  /** The stable handle: `data-top-step` and the id the section and its heading are derived from. */
  readonly id: TopStepId;
  /** The section's DOM id (`paso-<id>`). */
  readonly sectionId: string;
  /** The section's `<h2>` id, which `aria-labelledby` points at (`paso-<id>-heading`). */
  readonly headingId: string;
  /** The step label's content key: the step's only chrome, set as its `<h2>`. */
  readonly headingKey: LocaleKey;
}

/**
 * The props every step shares: its own entry in `TOP_STEPS` and the locale's content model. A
 * step that needs data adds to this; the pair itself is declared once, here, because it changes
 * for one reason — the shell `TopStepSection` renders.
 */
export interface StepProps {
  step: TopStep;
  content: CountryLocaleContent;
}

function step(id: TopStepId, headingKey: LocaleKey): TopStep {
  return { id, sectionId: `paso-${id}`, headingId: `paso-${id}-heading`, headingKey };
}

export const TOP_STEPS: readonly TopStep[] = [
  step('number', 'steps.number.label'),
  step('breakage', 'steps.breakage.label'),
  step('why', 'steps.why.label'),
  step('distance', 'steps.distance.label'),
  step('meaning', 'steps.meaning.label'),
];

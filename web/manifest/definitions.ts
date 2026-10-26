import { THESIS_TERMS } from '../content/registers';
import type { FormulaId } from './formula-ids';

/**
 * The published definitions (T1, T2). A definition is a *split figure* boundary, not a
 * formatting variant: `dependency-ratio.international` and `dependency-ratio.national`
 * count different populations, so a reader may never compare two numbers without seeing
 * which definition produced each one. The closed set below is the only vocabulary a
 * `definitionId` may come from, so a definition can never be invented at a call site.
 */
export const DEFINITION_IDS = [
  'dependency-ratio.international',
  'dependency-ratio.national',
  'pension-expenditure-gdp.international',
  'contribution-cover.national',
  'cohort-return.national',
  'implicit-debt.national',
  'required-base-growth.national',
] as const;

export type DefinitionId = (typeof DEFINITION_IDS)[number];

export function isDefinitionId(value: unknown): value is DefinitionId {
  return typeof value === 'string' && (DEFINITION_IDS as readonly string[]).includes(value);
}

/** The metric a definition belongs to. Two definitions of one metric are never one value. */
export const METRIC_IDS = [
  'dependency-ratio',
  'contribution-cover',
  'cohort-return',
  'implicit-debt',
  'required-base-growth',
] as const;

export type MetricId = (typeof METRIC_IDS)[number];

export interface PublishedDefinition {
  definitionId: DefinitionId;
  /** Canonical instrument vocabulary: what is counted, what is excluded. Never an adjective. */
  definition: string;
  formulaId: FormulaId;
  metric: MetricId;
  /**
   * `international` definitions are country-parameterised through a `geo` data value;
   * `national` definitions exist for one country only.
   */
  geography: 'international' | 'national';
  /**
   * Why no value exists for this definition in this deployment, in the spec's own words.
   * Present only for a definition this deployment does not compute.
   */
  unavailableReason?: string;
}

const DEFINITIONS: Readonly<Record<DefinitionId, PublishedDefinition>> = {
  'dependency-ratio.international': {
    definitionId: 'dependency-ratio.international',
    definition:
      'Counts beneficiaries of old age pensions (Eurostat, persons) divided by employed persons aged 15 to 64 (Eurostat, labour force survey). Excludes survivor and disability pension beneficiaries from the numerator and non-employed persons from the denominator.',
    formulaId: 'dependency-ratio.v1',
    metric: 'dependency-ratio',
    geography: 'international',
  },
  'dependency-ratio.national': {
    definitionId: 'dependency-ratio.national',
    definition:
      'Counts all contributory pensioners in force in Spain (jubilación, viudedad, incapacidad, orfandad) divided by contributing affiliates in employment. Excludes non-contributory pensions and persons who do not contribute.',
    formulaId: 'dependency-ratio.v1',
    metric: 'dependency-ratio',
    geography: 'national',
    unavailableReason:
      'contributory pensioners and contributing affiliates are not available in this deployment',
  },
  'pension-expenditure-gdp.international': {
    definitionId: 'pension-expenditure-gdp.international',
    definition:
      'Counts total public pension expenditure as a share of gross domestic product, all pension functions and all schemes, Spain. Excludes social expenditure that is not a pension.',
    formulaId: 'pension-expenditure-gdp.v1',
    metric: 'contribution-cover',
    geography: 'international',
  },
  'contribution-cover.national': {
    definitionId: 'contribution-cover.national',
    definition:
      'Counts social contributions divided by contributory pension expenditure. Excludes transfers from general taxation and debt.',
    formulaId: 'contribution-cover.v1',
    metric: 'contribution-cover',
    geography: 'national',
    unavailableReason:
      'social contributions and contributory pension expenditure are not available in this deployment',
  },
  'cohort-return.national': {
    definitionId: 'cohort-return.national',
    definition:
      'Counts the internal rate of return of a representative cohort: contributions paid over the contributing years against pensions drawn over the expected years of retirement. Excludes survivor and disability benefits and taxes.',
    formulaId: 'cohort-irr.v1',
    metric: 'cohort-return',
    geography: 'national',
    unavailableReason: 'no internationally comparable source for average contributions',
  },
  'implicit-debt.national': {
    definitionId: 'implicit-debt.national',
    definition:
      'Counts the present value of accrued pension obligations minus the Fondo de Reserva balance, at four discount rates. Excludes future accrual and assets other than the Fondo de Reserva.',
    formulaId: 'implicit-debt.v1',
    metric: 'implicit-debt',
    geography: 'national',
    unavailableReason:
      'no internationally comparable source for accrued obligations and system assets',
  },
  'required-base-growth.national': {
    definitionId: 'required-base-growth.national',
    definition:
      'Counts the contributor-base growth the scheme must sustain to pay the cohort return it promises, minus the projected growth of that base. Excludes migration effects and employment-policy effects.',
    formulaId: 'required-base-growth.v1',
    metric: 'required-base-growth',
    geography: 'national',
    unavailableReason:
      'depends on the cohort return, which has no internationally comparable computation',
  },
};

export function definitionFor(definitionId: DefinitionId): PublishedDefinition {
  return DEFINITIONS[definitionId];
}

export function definitionsForMetric(metric: MetricId): PublishedDefinition[] {
  return DEFINITION_IDS.map(definitionFor).filter((definition) => definition.metric === metric);
}

/**
 * Thesis vocabulary plus the evaluative adjectives the acceptance criterion names. A
 * definition states what is counted and what is excluded; it never concludes.
 */
export const DEFINITION_BANNED_TERMS: readonly string[] = [
  ...THESIS_TERMS,
  'insostenible',
  'unsustainable',
  'injusto',
  'injusta',
  'unjust',
] as const;

/** Words that make a string an opinion instead of an instrument reading (AC-001-92). */
export function definitionVocabularyProblems(definition: string): string[] {
  const haystack = definition.toLocaleLowerCase();
  return DEFINITION_BANNED_TERMS.filter((term) => haystack.includes(term));
}

export interface InternationalRendering {
  metric: MetricId;
  definitionId: DefinitionId;
  /** The published figure carrying this definition, when this deployment computes one. */
  figureId: string | null;
  availability: 'computed' | 'unavailable';
  /** The spec's reason when the international rendering does not exist. */
  reason: string | null;
}

interface FigureLike {
  figureId: string;
  definitionId: DefinitionId;
  availability: string;
}

/**
 * The international rendering of a metric (AC-001-88, AC-001-89, AC-001-90). Three metrics
 * have no internationally comparable computation at all: their rendering is `unavailable`
 * with the specific reason, never a substitute number.
 */
function internationalDefinitionFor(metric: MetricId): PublishedDefinition | undefined {
  return DEFINITION_IDS.map(definitionFor).find(
    (definition) => definition.metric === metric && definition.geography === 'international',
  );
}

function renderingOf(
  definition: PublishedDefinition,
  figures: readonly FigureLike[],
): InternationalRendering {
  const figure = figures.find((candidate) => candidate.definitionId === definition.definitionId);
  const computed = figure !== undefined && figure.availability === 'computed';
  return {
    metric: definition.metric,
    definitionId: definition.definitionId,
    figureId: figure === undefined ? null : figure.figureId,
    availability: computed ? 'computed' : 'unavailable',
    reason: computed ? null : definition.unavailableReason ?? null,
  };
}

function firstDefinitionOf(metric: MetricId): PublishedDefinition {
  const [definition] = definitionsForMetric(metric);
  if (!definition) throw new Error(`no published definition for metric ${metric}`);
  return definition;
}

export function internationalRendering(
  metric: MetricId,
  figures: readonly FigureLike[],
): InternationalRendering {
  // Two metrics have an international definition; three have only a national one, and for
  // those the rendering is unavailable by construction, with the spec's own reason.
  return renderingOf(internationalDefinitionFor(metric) ?? firstDefinitionOf(metric), figures);
}

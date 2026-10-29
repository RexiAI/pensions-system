/**
 * Stable formula identifiers. This is a closed set: a manifest's `formulaId` must be one
 * of these, so provenance can never cite an ad-hoc formula name invented at the call site.
 */
export const FORMULA_IDS = [
  'dependency-ratio.v1',
  'pension-expenditure-gdp.v1',
  'contribution-cover.v1',
  'cohort-irr.v1',
  'implicit-debt.v1',
  'required-base-growth.v1',
  'age-structure.v1',
  'old-age-dependency-threshold.v1',
] as const;

export type FormulaId = (typeof FORMULA_IDS)[number];

export function isFormulaId(value: unknown): value is FormulaId {
  return typeof value === 'string' && (FORMULA_IDS as readonly string[]).includes(value);
}

/** Where each formula is documented on the public methodology section. */
export const FORMULA_ANCHORS: Readonly<Record<FormulaId, string>> = {
  'dependency-ratio.v1': '#formula-dependency-ratio',
  'pension-expenditure-gdp.v1': '#formula-pension-expenditure-gdp',
  'contribution-cover.v1': '#formula-contribution-cover',
  'cohort-irr.v1': '#formula-cohort-irr',
  'implicit-debt.v1': '#formula-implicit-debt',
  'required-base-growth.v1': '#formula-required-base-growth',
  'age-structure.v1': '#formula-age-structure',
  'old-age-dependency-threshold.v1': '#formula-old-age-dependency-threshold',
};

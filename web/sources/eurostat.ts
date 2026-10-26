/**
 * Eurostat dissemination API (JSON-stat 2.0) reader. The flat `value` map is decoded
 * against `id`/`size` so a caller can filter by coordinate instead of by array position.
 *
 * Dimension *codes* are resolved from the payload's own category labels at ingest time
 * (T2/T3). No code is hardcoded: a code this module did not read from the response cannot
 * end up in a published figure, and a label that is absent or ambiguous fails loudly
 * instead of silently selecting a neighbouring category.
 */
export interface JsonStatPoint {
  coords: Record<string, string>;
  value: number;
}

interface JsonStatCategory {
  index?: Record<string, number>;
  label?: Record<string, string>;
}

interface JsonStatDimension {
  label?: string;
  category?: JsonStatCategory;
}

interface JsonStatPayload {
  id?: string[];
  size?: number[];
  dimension?: Record<string, JsonStatDimension>;
  value?: Record<string, number | null>;
}

interface DecodedStat {
  ids: string[];
  sizes: number[];
  codes: string[][];
  values: Record<string, number | null>;
  payload: JsonStatPayload;
}

/** A source payload that cannot be resolved into a figure. Always fatal to the build. */
export class IngestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IngestError';
  }
}

function codesFor(stat: JsonStatPayload, id: string): string[] {
  const index = stat.dimension?.[id]?.category?.index ?? {};
  return Object.entries(index)
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code);
}

function readStat(payload: unknown): DecodedStat | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const stat = payload as JsonStatPayload;
  const complete = stat.id !== undefined && stat.size !== undefined && stat.value !== undefined;
  if (!complete) return null;
  const ids = stat.id as string[];
  return {
    ids,
    sizes: stat.size as number[],
    codes: ids.map((id) => codesFor(stat, id)),
    values: stat.value as Record<string, number | null>,
    payload: stat,
  };
}

function decodeCoords(flatIndex: number, stat: DecodedStat): Record<string, string> {
  const coords: Record<string, string> = {};
  let remainder = flatIndex;
  for (let dimension = stat.ids.length - 1; dimension >= 0; dimension -= 1) {
    const size = stat.sizes[dimension] ?? 1;
    const position = remainder % size;
    remainder = Math.floor(remainder / size);
    coords[stat.ids[dimension] as string] = stat.codes[dimension]?.[position] ?? '';
  }
  return coords;
}

export function jsonStatPoints(payload: unknown): JsonStatPoint[] {
  const stat = readStat(payload);
  if (!stat) return [];
  return Object.entries(stat.values)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .map(([flatIndex, value]) => ({ coords: decodeCoords(Number(flatIndex), stat), value }));
}

function normaliseLabel(label: string): string {
  return label.trim().toLocaleLowerCase();
}

/**
 * The code of the one category whose published label equals `expectedLabel`. Zero matches
 * and more than one match are both fatal: a guess here would publish a figure computed on
 * a dimension this build never verified.
 */
function labelsOf(payload: unknown, dimensionId: string): Record<string, string> {
  const stat = readStat(payload);
  if (!stat) throw new IngestError('payload is not a JSON-stat dataset');
  const categories = stat.payload.dimension?.[dimensionId]?.category;
  if (!categories) throw new IngestError(`payload has no dimension "${dimensionId}"`);
  return categories.label ?? {};
}

function codesWithLabel(labels: Record<string, string>, expectedLabel: string): string[] {
  const wanted = normaliseLabel(expectedLabel);
  return Object.entries(labels)
    .filter(([, label]) => normaliseLabel(label) === wanted)
    .map(([code]) => code);
}

export function resolveCategoryCode(payload: unknown, dimensionId: string, expectedLabel: string): string {
  const matches = codesWithLabel(labelsOf(payload, dimensionId), expectedLabel);
  if (matches.length === 0) {
    throw new IngestError(`dimension "${dimensionId}" has no category labelled "${expectedLabel}"`);
  }
  if (matches.length > 1) {
    throw new IngestError(
      `dimension "${dimensionId}" has ${matches.length} categories labelled "${expectedLabel}": ${matches.join(', ')}`,
    );
  }
  return matches[0] as string;
}

function categoryLabel(payload: unknown, dimensionId: string, code: string): string {
  const labels = labelsOf(payload, dimensionId);
  return labels[code] ?? code;
}

/** How a publisher's unit label scales a value into the unit of measure a formula needs. */
export interface UnitScale {
  code: string;
  label: string;
  factor: number;
}

const UNIT_SCALES: ReadonlyArray<{ label: string; factor: number }> = [
  { label: 'Person', factor: 1 },
  { label: 'Thousand persons', factor: 1_000 },
];

/**
 * Resolves the unit dimension from its label and returns the multiplier into persons. A
 * unit this table does not know is not converted: the build fails instead of inventing a
 * factor (T3: beneficiaries and employment must be in the same unit).
 */
export function resolveUnitScale(payload: unknown, expectedLabel: string): UnitScale {
  const code = resolveCategoryCode(payload, 'unit', expectedLabel);
  const scale = UNIT_SCALES.find((entry) => normaliseLabel(entry.label) === normaliseLabel(expectedLabel));
  if (!scale) throw new IngestError(`no scale is defined for unit label "${expectedLabel}"`);
  return { code, label: categoryLabel(payload, 'unit', code), factor: scale.factor };
}

export interface YearValue {
  year: number;
  value: number;
}

export interface EurostatSeries {
  points: YearValue[];
  /** The dimension codes resolved from the payload's own labels (recorded as assumptions). */
  codes: Record<string, string>;
}

function pointsFor(
  payload: unknown,
  matched: Record<string, string>,
  scale: number,
): YearValue[] {
  return jsonStatPoints(payload)
    .filter(
      (point) =>
        typeof point.coords.time === 'string' &&
        Object.entries(matched).every(([dimension, code]) => point.coords[dimension] === code),
    )
    .map((point) => ({ year: Number(point.coords.time), value: point.value * scale }))
    .filter((point) => Number.isFinite(point.year))
    .sort((a, b) => a.year - b.year);
}

/**
 * Beneficiaries of *old age* pensions, in persons, for one country. The pension-type code
 * is the one whose label is `Old age pension` — the `TOTAL old age pensions` and
 * `old age and survivors'` categories are deliberately not it, and the exact-label match
 * is what keeps that distinction from drifting.
 */
export function readOldAgeBeneficiaries(payload: unknown, geo = 'ES'): EurostatSeries {
  const pensionType = resolveCategoryCode(payload, 'spdepb', 'Old age pension');
  const meansTesting = resolveCategoryCode(payload, 'spdepm', 'Total');
  const sex = resolveCategoryCode(payload, 'sex', 'Total');
  const unit = resolveUnitScale(payload, 'Person');
  const points = pointsFor(
    payload,
    { geo, spdepb: pensionType, spdepm: meansTesting, sex, unit: unit.code },
    unit.factor,
  );
  if (points.length === 0) throw new IngestError('spr_pns_ben has no old-age beneficiaries for this country');
  return { points, codes: { pensionType, meansTesting, sex, unit: unit.code } };
}

export interface EmploymentSeries extends EurostatSeries {
  /** The age class the employment denominator covers, resolved from its label. */
  ageCode: string;
  ageLabel: string;
}

/**
 * Employed persons aged 15 to 64, in persons, for one country. The age class is resolved
 * from the payload's label (`From 15 to 64 years`), so the denominator's population is
 * published as a resolved code rather than assumed.
 */
export function readEmployedPersons(payload: unknown, geo = 'ES'): EmploymentSeries {
  const indicator = resolveCategoryCode(payload, 'indic_em', 'Total employment (resident population concept - LFS)');
  const sex = resolveCategoryCode(payload, 'sex', 'Total');
  const age = resolveCategoryCode(payload, 'age', 'From 15 to 64 years');
  const unit = resolveUnitScale(payload, 'Thousand persons');
  const points = pointsFor(payload, { geo, indic_em: indicator, sex, age, unit: unit.code }, unit.factor);
  if (points.length === 0) throw new IngestError('lfsi_emp_a has no employment for this country');
  return {
    points,
    codes: { indicator, sex, age, unit: unit.code },
    ageCode: age,
    ageLabel: categoryLabel(payload, 'age', age),
  };
}

/** Total public pension expenditure as a percentage of GDP, for one country. */
export function readPensionExpenditureShare(payload: unknown, geo = 'ES'): EurostatSeries {
  const pensionType = resolveCategoryCode(payload, 'spdepb', 'Total');
  const meansTesting = resolveCategoryCode(payload, 'spdepm', 'Total');
  const unit = resolveCategoryCode(payload, 'unit', 'Percentage of gross domestic product (GDP)');
  const points = pointsFor(payload, { geo, spdepb: pensionType, spdepm: meansTesting, unit }, 1);
  if (points.length === 0) throw new IngestError('spr_exp_pens has no %-of-GDP series for this country');
  return { points, codes: { pensionType, meansTesting, unit } };
}

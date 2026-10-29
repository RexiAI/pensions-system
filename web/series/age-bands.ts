/**
 * Five-year age bands for the age-structure series (T17, AC-001-93).
 *
 * The two Eurostat datasets spell the open-ended band differently — `demo_pjan` publishes
 * `Y_OPEN` labelled "Open-ended age class", `proj_23np` publishes `Y_GE100` labelled "100
 * years or over". A hardcoded code would silently drop the 100+ band from one of them, which is
 * exactly the quiet omission this page cannot afford. Every code below is resolved from the
 * payload's own labels, so neither a code nor a label drift can produce a hidden gap: an
 * unrecognised label is excluded from the bands and reported, never guessed at.
 */
export const AGE_BAND_WIDTH = 5;

/** The open-ended band's start year. `100+` is one band, not a range. */
export const OPEN_BAND = 100;

/** 0–4 … 95–99, 100+: twenty-one bands, age increasing upward. */
export const AGE_BANDS: readonly number[] = Array.from({ length: OPEN_BAND / AGE_BAND_WIDTH + 1 }, (_, index) => index * AGE_BAND_WIDTH);

/** The labels the two datasets publish for the open-ended band (`Y_OPEN`, `Y_GE100`). */
const OPEN_BAND_LABELS: readonly string[] = ['open-ended age class', '100 years or over'];

const SINGLE_YEAR_LABEL = /^(\d+)\s*years?$/;

/**
 * The band an age label belongs to, or `null` for a label that is not a single age: `Total`
 * and `Unknown` are excluded by construction, and so are any aggregate classes a dataset
 * happens to publish alongside the single years.
 */
export function bandOfAgeLabel(label: string): number | null {
  const text = label.trim().toLocaleLowerCase();
  if (text === 'less than 1 year') return 0;
  if (OPEN_BAND_LABELS.includes(text)) return OPEN_BAND;
  const match = SINGLE_YEAR_LABEL.exec(text);
  if (!match) return null;
  const age = Number(match[1]);
  return age >= OPEN_BAND ? OPEN_BAND : Math.floor(age / AGE_BAND_WIDTH) * AGE_BAND_WIDTH;
}

/** The band as the table and the chart label it: `0–4`, `95–99`, `100+`. */
export function bandLabel(band: number): string {
  return band >= OPEN_BAND ? `${OPEN_BAND}+` : `${band}–${band + AGE_BAND_WIDTH - 1}`;
}

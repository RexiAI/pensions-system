/**
 * Ingests the INE population projection (table 36643) into the committed snapshot: the
 * working-age (16 to 64) population per projected year, aggregated from the age series the
 * publisher exposes. The aggregation lives here, once, so the reader in `web/sources/ine.ts`
 * stays a pure parser and the committed file is the data the figure consumes.
 *
 * Usage: tsx scripts/ingest-population-projection.ts
 */
import { writeFileSync } from 'node:fs';
import { stableStringify } from '../web/ingest/deterministic-json';
import { datasetForUrl } from '../web/sources/labels';

const SOURCE_ID = 'ine-population-projection-working-age';
const URL = 'https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/36643';
const PATH = `data/snapshots/${SOURCE_ID}.json`;

interface IneSeries {
  COD: string;
  Nombre: string;
  Data?: Array<{ Anyo: number; Valor: number }>;
}

/**
 * The age class a series names ("16 años"), or `null` for aggregates such as
 * "Todas las edades". The table publishes each age three times (total, men, women), so the
 * sum must take the total series only: adding the sex splits triple-counts the population.
 */
export function ageOf(seriesName: string): number | null {
  if (!seriesName.startsWith('Total.')) return null;
  const match = /(\d+)\s*años?\.?\s*$/.exec(seriesName.trim());
  return match ? Number(match[1]) : null;
}

function addSeries(totals: Map<number, number>, series: IneSeries): void {
  for (const observation of series.Data ?? []) {
    totals.set(observation.Anyo, (totals.get(observation.Anyo) ?? 0) + observation.Valor);
  }
}

export function workingAgeByYear(series: readonly IneSeries[]): Array<{ year: number; population: number }> {
  const totals = new Map<number, number>();
  for (const entry of series) {
    const age = ageOf(entry.Nombre);
    if (age !== null) addSeries(totals, entry);
  }
  return [...totals.entries()]
    .map(([year, population]) => ({ year, population: Math.round(population) }))
    .sort((a, b) => a.year - b.year);
}

async function main(): Promise<number> {
  const response = await fetch(URL, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${SOURCE_ID}: HTTP ${response.status}`);
  const series = (await response.json()) as IneSeries[];
  const years = workingAgeByYear(series);
  const used = series.filter((entry) => {
    const age = ageOf(entry.Nombre);
    return age !== null && age >= 16 && age <= 64;
  });
  const file = {
    meta: {
      sourceId: SOURCE_ID,
      sourceClass: 'machine',
      publisher: 'Instituto Nacional de Estadística (INE)',
      dataset: datasetForUrl(URL),
      seriesCodes: used.map((entry) => entry.COD).sort(),
      sourceUrl: URL,
      retrievedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      units: 'persons',
      filter: 'ages 16 to 64, summed per projected year',
    },
    payload: { years },
  };
  writeFileSync(PATH, stableStringify(file), 'utf8');
  console.log(`wrote ${PATH}: ${years.length} projected years, ${used.length} age series`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'ingest failed');
    process.exit(1);
  });

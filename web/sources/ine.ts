/**
 * INE `tempus3` readers. The API returns either a single series object
 * (`DATOS_SERIE`) or a list (`SERIES_TABLA`); both are handled here, and nothing in this
 * module performs IO, so fixtures exercise the same code the fetcher uses.
 */
export interface IneObservation {
  Anyo: number;
  Valor: number;
}

export interface IneSeries {
  COD: string;
  Nombre: string;
  Data?: IneObservation[];
}

export interface IneLatest {
  year: number;
  value: number;
}

export function readIneSeries(payload: unknown): IneSeries | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const candidate = payload as Partial<IneSeries>;
  if (typeof candidate.COD !== 'string' || !Array.isArray(candidate.Data)) return null;
  return candidate as IneSeries;
}

export function latestObservation(payload: unknown): IneLatest | null {
  const series = readIneSeries(payload);
  if (!series || !series.Data) return null;
  const usable = series.Data.filter((point) => Number.isFinite(point.Valor));
  if (usable.length === 0) return null;
  const latest = usable.reduce((best, point) => (point.Anyo > best.Anyo ? point : best));
  return { year: latest.Anyo, value: latest.Valor };
}

export interface PopulationYear {
  year: number;
  population: number;
}

/** Reads the committed working-age projection snapshot (aggregated by year). */
export function readPopulationProjection(payload: unknown): PopulationYear[] {
  if (typeof payload !== 'object' || payload === null) return [];
  const years = (payload as { years?: unknown }).years;
  if (!Array.isArray(years)) return [];
  return years
    .filter((entry): entry is PopulationYear => {
      if (typeof entry !== 'object' || entry === null) return false;
      const record = entry as Partial<PopulationYear>;
      return typeof record.year === 'number' && typeof record.population === 'number';
    })
    .sort((a, b) => a.year - b.year);
}

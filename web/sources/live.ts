import { stableStringify } from '../ingest/deterministic-json';
import { SOURCE_DECLARATIONS } from './types';
import type { SourceSnapshot } from './types';

/**
 * Live fetchers for the machine sources. Only the INE `tempus3` series and the three
 * Eurostat datasets are fetched: every other publisher stays a committed,
 * operator-supplied snapshot (T2).
 *
 * The Eurostat filters select the dimensions *around* the ones the ingest resolves from
 * the payload's own labels (`spdepb`, `age`, `unit`), so the label resolution still runs
 * against a response that carries the category labels it needs.
 */
export const LIVE_URLS: Readonly<Record<string, string>> = {
  'ine-life-expectancy-at-65': 'https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/TM1657?nult=5',
  'ine-population-projection-working-age':
    'https://servicios.ine.es/wstempus/js/ES/SERIES_TABLA/36643',
  'eurostat-spr-pns-ben':
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/spr_pns_ben?format=JSON&lang=EN&geo=ES&spdepm=TOTAL&sex=T&unit=PER',
  'eurostat-spr-exp-pens':
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/spr_exp_pens?format=JSON&lang=EN&geo=ES&spdepm=TOTAL&unit=PC_GDP',
  'eurostat-lfsi-emp-a':
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/lfsi_emp_a?format=JSON&lang=EN&geo=ES&indic_em=EMP_LFS&sex=T&unit=THS_PER',
  // The pyramid's two datasets (T17). `demo_pjan` carries the observed years and every sex; the
  // projected panel is the baseline variant alone, named on the page and resolved by label.
  'eurostat-demo-pjan':
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan?format=JSON&lang=EN&geo=ES&time=1995&time=2025',
  'eurostat-proj-23np':
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/proj_23np?format=JSON&lang=EN&geo=ES&projection=BSL&time=2050',
  // The countdown's view of the same projection: every variant, the two dependency age classes,
  // seventy-nine years. It is a separate snapshot because the API filters by dimension, and
  // because the ratio must never be built from a payload that also carries single-year ages.
  'eurostat-proj-23np-ratio':
    'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/proj_23np?format=JSON&lang=EN&geo=ES&sex=T&age=Y_GE65&age=Y15-64',
};

function declaration(sourceId: string) {
  return SOURCE_DECLARATIONS.find((source) => source.sourceId === sourceId);
}

export interface LiveFetchResult {
  snapshots: SourceSnapshot[];
  failures: Array<{ sourceId: string; reason: string }>;
}

export async function fetchLiveSnapshots(
  fetchImpl: typeof fetch,
  now: Date,
): Promise<LiveFetchResult> {
  const snapshots: SourceSnapshot[] = [];
  const failures: Array<{ sourceId: string; reason: string }> = [];
  for (const [sourceId, url] of Object.entries(LIVE_URLS)) {
    const source = declaration(sourceId);
    if (!source) continue;
    try {
      const response = await fetchImpl(url, { headers: { accept: 'application/json' } });
      if (!response.ok) {
        failures.push({ sourceId, reason: `HTTP ${response.status}` });
        continue;
      }
      const payload: unknown = await response.json();
      const file = { meta: { sourceId, sourceUrl: url }, payload };
      snapshots.push({
        sourceId,
        bytes: stableStringify(file),
        resolved: true,
        retrievedAt: now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
        sourceUrl: [url],
        publisher: source.publisher,
        dataset: source.dataset,
        payload,
      });
    } catch {
      failures.push({ sourceId, reason: 'fetch failed' });
    }
  }
  return { snapshots, failures };
}

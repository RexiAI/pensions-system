import { describe, expect, it } from 'vitest';
import {
  COUNTRY_CONFIGURATIONS,
  PUBLISHED_GEO,
  countryConfiguration,
  definitionAvailabilityForCountry,
  isPublishedGeo,
  publishedGeos,
  sourcesForDefinition,
} from '../../web/sources/countries';
import type { CountryConfiguration } from '../../web/sources/countries';
import { MACHINE_SOURCE_IDS, SOURCE_DECLARATIONS, findSource } from '../../web/sources/types';
import { datasetForUrl, publisherForUrl } from '../../web/sources/labels';
import { LIVE_URLS, fetchLiveSnapshots } from '../../web/sources/live';
import { stableStringify } from '../../web/ingest/deterministic-json';

/**
 * Branch-level coverage for the source catalogue, the link labeller, and the live fetchers
 * (T2, AC-001-79/80/81).
 *
 * `geo.test.ts` proves a second country is a configuration row. This file pins the catalogue's
 * own invariants and the two fallbacks that keep a citation honest: an unknown host is labelled
 * with its host rather than an invented institution, and a fetch that fails produces a named
 * failure rather than a snapshot with no data.
 */

const PORTUGAL: CountryConfiguration = {
  geo: 'PT',
  sources: { 'pension-expenditure-gdp.international': ['eurostat-spr-exp-pens'] },
};

describe('country configuration is a data row', () => {
  it('resolves a code regardless of case or surrounding space', () => {
    expect(countryConfiguration('ES')?.geo).toBe('ES');
    expect(countryConfiguration(' es ')?.geo).toBe('ES');
    expect(countryConfiguration('es')?.geo).toBe('ES');
    expect(countryConfiguration('DE')).toBeUndefined();
  });

  it('publishes exactly the geos the publication list names', () => {
    expect(PUBLISHED_GEO).toBe('ES');
    expect(publishedGeos()).toEqual(['ES']);
    // A configured country absent from the publication list is not published.
    expect(publishedGeos([...COUNTRY_CONFIGURATIONS, { geo: 'PT', sources: {} }])).toEqual(['ES']);
    // Publication is decided by that list, matched case-insensitively, and the row's own
    // spelling is what is returned.
    expect(publishedGeos([{ geo: 'es', sources: {} }])).toEqual(['es']);
  });

  it('accepts a published geo only when it is both listed and configured', () => {
    expect(isPublishedGeo('ES')).toBe(true);
    expect(isPublishedGeo('es')).toBe(true);
    expect(isPublishedGeo('PT')).toBe(false);
    expect(isPublishedGeo('DE')).toBe(false);
  });
});

describe('per-definition availability for a country', () => {
  it('marks the national definitions as not country-parameterised, with no sources', () => {
    const national = definitionAvailabilityForCountry('ES').filter(
      (entry) => entry.availability === 'not-country-parameterised',
    );

    expect(national).toHaveLength(5);
    for (const entry of national) expect(entry.sourceIds).toEqual([]);
  });

  it('lists the snapshots backing an available international definition', () => {
    const entry = definitionAvailabilityForCountry('ES').find(
      (candidate) => candidate.definitionId === 'dependency-ratio.international',
    );

    expect(entry?.availability).toBe('available');
    expect(entry?.sourceIds).toEqual(['eurostat-spr-pns-ben', 'eurostat-lfsi-emp-a']);
  });

  it('reports an unconfigured country as unavailable for every international definition', () => {
    const entries = definitionAvailabilityForCountry('DE');

    expect(entries).toHaveLength(7);
    for (const entry of entries) {
      if (entry.definitionId.endsWith('.international')) {
        expect(entry.availability, entry.definitionId).toBe('unavailable');
        expect(entry.sourceIds, entry.definitionId).toEqual([]);
      }
    }
  });

  it('distinguishes a definition the country lacks from one with an empty source list', () => {
    const entries = definitionAvailabilityForCountry('PT', [PORTUGAL]);
    const dependency = entries.find((entry) => entry.definitionId === 'dependency-ratio.international');
    const cover = entries.find((entry) => entry.definitionId === 'pension-expenditure-gdp.international');

    expect(dependency?.availability).toBe('unavailable');
    expect(cover?.availability).toBe('available');
    expect(cover?.sourceIds).toEqual(['eurostat-spr-exp-pens']);
  });
});

describe('sources for one definition', () => {
  it('returns the configured snapshot ids, or null when there are none', () => {
    expect(sourcesForDefinition('ES', 'dependency-ratio.international')).toEqual([
      'eurostat-spr-pns-ben',
      'eurostat-lfsi-emp-a',
    ]);
    expect(sourcesForDefinition('ES', 'pension-expenditure-gdp.international')).toEqual([
      'eurostat-spr-exp-pens',
    ]);
    // A national definition carries no country-resolved sources at all.
    expect(sourcesForDefinition('ES', 'cohort-return.national')).toBeNull();
    expect(sourcesForDefinition('PT', 'dependency-ratio.international', [PORTUGAL])).toBeNull();
    expect(sourcesForDefinition('DE', 'dependency-ratio.international')).toBeNull();
  });
});

describe('the source catalogue', () => {
  it('finds a declaration by id and reports an unknown id as absent', () => {
    expect(findSource('eurostat-spr-pns-ben')?.publisher).toBe('Eurostat');
    expect(findSource('ss-pensioners')?.sourceClass).toBe('document');
    expect(findSource('invented-source')).toBeUndefined();
  });

  it('lists exactly the machine-verifiable sources', () => {
    expect(MACHINE_SOURCE_IDS).toEqual([
      'ine-life-expectancy-at-65',
      'ine-population-projection-working-age',
      'eurostat-spr-pns-ben',
      'eurostat-spr-exp-pens',
      'eurostat-lfsi-emp-a',
    ]);
    for (const sourceId of MACHINE_SOURCE_IDS) {
      expect(findSource(sourceId)?.sourceClass).toBe('machine');
    }
  });

  it('gives every declaration an id, a publisher, a dataset and a public page', () => {
    const ids = SOURCE_DECLARATIONS.map((source) => source.sourceId);

    expect(new Set(ids).size).toBe(ids.length);
    for (const source of SOURCE_DECLARATIONS) {
      expect(source.publisher, source.sourceId).not.toBe('');
      expect(source.dataset, source.sourceId).not.toBe('');
      expect(source.publisherUrl, source.sourceId).toMatch(/^https:\/\//);
      expect(['machine', 'document']).toContain(source.sourceClass);
    }
  });

  it('names what an operator must supply for every manual source', () => {
    const manual = SOURCE_DECLARATIONS.filter((source) => source.sourceClass === 'document');

    expect(manual.length).toBeGreaterThan(0);
    for (const source of manual) {
      expect(source.requiresManualSnapshot, source.sourceId).toBeTruthy();
    }
  });
});

describe('citation labelling', () => {
  it('names the institution, not the bare domain', () => {
    expect(publisherForUrl('https://ec.europa.eu/eurostat/api/x')).toBe('Eurostat');
    expect(publisherForUrl('https://www.ine.es/dyngs/x')).toBe(
      'Instituto Nacional de Estadística (INE)',
    );
  });

  it('resolves a publisher across its own subdomains', () => {
    // The declared page is on www.ine.es; the cited data URL is on servicios.ine.es.
    expect(publisherForUrl('https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/TM1657')).toBe(
      'Instituto Nacional de Estadística (INE)',
    );
  });

  it('falls back to the host for an unknown publisher, without its www prefix', () => {
    expect(publisherForUrl('https://unknown.example/path')).toBe('unknown.example');
    expect(publisherForUrl('https://www.unknown.example/path')).toBe('unknown.example');
    expect(publisherForUrl('not a url')).toBe('not a url');
  });

  it('names the exact dataset a publisher URL cites, not the first table on that host', () => {
    expect(datasetForUrl('https://ec.europa.eu/eurostat/databrowser/view/lfsi_emp_a/defaulttable')).toContain(
      'lfsi_emp_a',
    );
    expect(datasetForUrl('https://ec.europa.eu/eurostat/databrowser/view/spr_exp_pens/defaulttable')).toContain(
      'spr_exp_pens',
    );
  });

  it('falls back to the host for a dataset, never to an internal source id', () => {
    expect(datasetForUrl('https://unknown.example/path')).toBe('unknown.example');
    expect(datasetForUrl('not a url')).toBe('not a url');
  });
});

describe('live fetchers', () => {
  const now = new Date('2026-10-25T12:00:00.987Z');

  function jsonResponse(payload: unknown, status = 200): Response {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  }

  it('turns every successful response into a resolved snapshot with its declaration', async () => {
    const seen: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      seen.push({ url, init });
      return jsonResponse({ id: ['time'], size: [1], dimension: {}, value: { '0': 1 } });
    }) as unknown as typeof fetch;

    const result = await fetchLiveSnapshots(fetchImpl, now);

    expect(result.failures).toEqual([]);
    expect(result.snapshots.map((snapshot) => snapshot.sourceId)).toEqual(Object.keys(LIVE_URLS));
    expect(seen).toHaveLength(Object.keys(LIVE_URLS).length);
    // The publisher is asked for JSON explicitly.
    expect(seen[0]?.init).toEqual({ headers: { accept: 'application/json' } });
  });

  it('records the bytes, the second-precision retrieval time and the declaration', async () => {
    const payload = { id: ['time'], size: [1], dimension: {}, value: { '0': 1 } };
    const fetchImpl = (async () => jsonResponse(payload)) as unknown as typeof fetch;

    const [first] = (await fetchLiveSnapshots(fetchImpl, now)).snapshots;

    expect(first).toMatchObject({
      resolved: true,
      retrievedAt: '2026-10-25T12:00:00Z',
      publisher: 'Instituto Nacional de Estadística (INE)',
      sourceUrl: [first?.sourceUrl[0]],
    });
    // The bytes are the deterministic JSON of the file the snapshot stands for.
    expect(first?.bytes).toBe(
      stableStringify({ meta: { sourceId: first?.sourceId, sourceUrl: first?.sourceUrl[0] }, payload }),
    );
    expect(JSON.parse(first?.bytes as string).payload).toEqual(payload);
  });

  it('reports a non-2xx response as a named failure and keeps the other sources', async () => {
    const fetchImpl = (async (url: string) =>
      url.includes('spr_exp_pens') ? jsonResponse({}, 500) : jsonResponse({})) as unknown as typeof fetch;

    const result = await fetchLiveSnapshots(fetchImpl, now);

    expect(result.failures).toEqual([{ sourceId: 'eurostat-spr-exp-pens', reason: 'HTTP 500' }]);
    expect(result.snapshots).toHaveLength(Object.keys(LIVE_URLS).length - 1);
  });

  it('reports a transport failure as a named failure rather than an empty snapshot', async () => {
    const fetchImpl = (async () => {
      throw new Error('ECONNRESET');
    }) as unknown as typeof fetch;

    const result = await fetchLiveSnapshots(fetchImpl, now);

    expect(result.snapshots).toEqual([]);
    expect(result.failures).toHaveLength(Object.keys(LIVE_URLS).length);
    expect(result.failures.every((failure) => failure.reason === 'fetch failed')).toBe(true);
  });
});

describe('the live endpoints the build fetches', () => {
  it('points each machine source at its own publisher series', () => {
    expect(Object.keys(LIVE_URLS).sort()).toEqual([...MACHINE_SOURCE_IDS].sort());
    for (const [sourceId, url] of Object.entries(LIVE_URLS)) {
      expect(url, sourceId).toMatch(/^https:\/\//);
      expect(url, sourceId).not.toBe('');
    }
    // The Eurostat filters keep the dimensions the ingest resolves by label.
    expect(LIVE_URLS['eurostat-spr-pns-ben']).toContain('spr_pns_ben');
    expect(LIVE_URLS['eurostat-spr-exp-pens']).toContain('spr_exp_pens');
    expect(LIVE_URLS['eurostat-lfsi-emp-a']).toContain('lfsi_emp_a');
    expect(LIVE_URLS['ine-life-expectancy-at-65']).toContain('TM1657');
    expect(LIVE_URLS['ine-population-projection-working-age']).toContain('36643');
  });
});

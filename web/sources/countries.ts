import type { MetricDefinitionId } from '../manifest/definitions';
import { DEFINITION_IDS, definitionFor } from '../manifest/definitions';

/**
 * `geo` is data (T2, AC-001-79). Computing a second country is a new configuration entry —
 * a country code plus the snapshots that back each of its definitions — never a new code
 * path. Nothing in this module branches on a specific country: the shipped entry below is
 * a row in a table, and the publishers' endpoints are addressed by the same `geo` value.
 */
export interface CountryConfiguration {
  /** The publisher's country code (Eurostat `geo`). */
  geo: string;
  /**
   * The definition ids this country has a source for. A definition absent from this map
   * renders `unavailable` for the country, with its `definitionId` unchanged — never a
   * substituted definition (AC-001-81).
   */
  sources: Partial<Record<MetricDefinitionId, readonly string[]>>;
}

/**
 * v1 publishes Spain only (T2, AC-001-80). This list, not a flag on the row, is what decides
 * publication: a second country is a configuration row plus its `geo` here.
 */
export const PUBLISHED_GEOS: readonly string[] = ['ES'];

/** The country this deployment publishes. The compute step defaults to it. */
export const PUBLISHED_GEO = 'ES';

export const COUNTRY_CONFIGURATIONS: readonly CountryConfiguration[] = [
  {
    geo: 'ES',
    sources: {
      'dependency-ratio.international': ['eurostat-spr-pns-ben', 'eurostat-lfsi-emp-a'],
      'pension-expenditure-gdp.international': ['eurostat-spr-exp-pens'],
    },
  },
];

function normalise(geo: string): string {
  return geo.trim().toUpperCase();
}

export function countryConfiguration(
  geo: string,
  configurations: readonly CountryConfiguration[] = COUNTRY_CONFIGURATIONS,
): CountryConfiguration | undefined {
  return configurations.find((configuration) => normalise(configuration.geo) === normalise(geo));
}

/** The countries this deployment publishes, in configuration order. */
export function publishedGeos(
  configurations: readonly CountryConfiguration[] = COUNTRY_CONFIGURATIONS,
): string[] {
  return configurations
    .filter((configuration) => PUBLISHED_GEOS.includes(normalise(configuration.geo)))
    .map((configuration) => configuration.geo);
}

export function isPublishedGeo(
  geo: string,
  configurations: readonly CountryConfiguration[] = COUNTRY_CONFIGURATIONS,
): boolean {
  return PUBLISHED_GEOS.includes(normalise(geo)) && countryConfiguration(geo, configurations) !== undefined;
}

export type CountryAvailability = 'available' | 'unavailable' | 'not-country-parameterised';

export interface DefinitionAvailability {
  definitionId: MetricDefinitionId;
  /** The snapshots backing this definition for this country; empty when it has none. */
  sourceIds: readonly string[];
  availability: CountryAvailability;
}

/**
 * Per-definition availability for one country, over the whole closed definition set. A
 * definition with sources for the country is `available`; a definition the country has no
 * source for is `unavailable` with its `definitionId` unchanged, so the reader sees that
 * this country has no value for that exact definition rather than a substituted one
 * (AC-001-81). A national definition is not country-parameterised: it carries its own
 * fixed sources and is only ever asked for by the country it describes.
 */
export function definitionAvailabilityForCountry(
  geo: string,
  configurations: readonly CountryConfiguration[] = COUNTRY_CONFIGURATIONS,
): DefinitionAvailability[] {
  const configuration = countryConfiguration(geo, configurations);
  return DEFINITION_IDS.map((definitionId) => {
    if (definitionFor(definitionId).geography === 'national') {
      return { definitionId, sourceIds: [], availability: 'not-country-parameterised' };
    }
    const sourceIds = [...(configuration?.sources[definitionId] ?? [])];
    return {
      definitionId,
      sourceIds,
      availability: sourceIds.length > 0 ? 'available' : 'unavailable',
    };
  });
}

/** The snapshot ids backing one definition for one country, or `null` when absent. */
export function sourcesForDefinition(
  geo: string,
  definitionId: MetricDefinitionId,
  configurations: readonly CountryConfiguration[] = COUNTRY_CONFIGURATIONS,
): readonly string[] | null {
  const configuration = countryConfiguration(geo, configurations);
  const sourceIds = configuration?.sources[definitionId];
  return sourceIds && sourceIds.length > 0 ? sourceIds : null;
}

import { SOURCE_DECLARATIONS } from './types';
import type { SourceDeclaration } from './types';

function hostOf(url: string): string | null {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * `servicios.ine.es` and `www.ine.es` are the same publisher. Comparing the registrable
 * domain (last two labels) keeps a declared institution's name on every one of its hosts;
 * a subdomain-exact comparison leaked the bare host `servicios.ine.es` onto the page.
 */
function registeredDomain(host: string): string {
  const labels = host.split('.');
  return labels.slice(-2).join('.');
}

function declarationForUrl(url: string): SourceDeclaration | undefined {
  const host = hostOf(url);
  if (!host) return undefined;
  const domain = registeredDomain(host);
  // A publisher with several datasets: the dataset code inside the URL identifies which
  // one is being cited, so the public `Serie` field names the exact table, not the first
  // declaration that happens to share the host.
  const byDataset = SOURCE_DECLARATIONS.find((source) => source.datasetCode !== undefined && url.includes(source.datasetCode));
  if (byDataset) return byDataset;
  return SOURCE_DECLARATIONS.find((source) => {
    const declared = hostOf(source.publisherUrl);
    return declared !== null && declared === host;
  }) ?? SOURCE_DECLARATIONS.find((source) => {
    const declared = hostOf(source.publisherUrl);
    return declared !== null && registeredDomain(declared) === domain;
  });
}

/**
 * A source link is labelled with the publishing institution's name, never a bare domain
 * (design §Task 9 anti-patterns). Known publishers resolve by host; an unknown host
 * falls back to the host itself rather than inventing an institution name.
 */
export function publisherForUrl(url: string): string {
  const host = hostOf(url);
  if (!host) return url;
  const declaration = declarationForUrl(url);
  return declaration ? declaration.publisher : host;
}

/**
 * The dataset as the publisher titles it (D3, D6): the public `Serie` field. An unknown
 * host falls back to its own domain, never to an internal source id.
 */
export function datasetForUrl(url: string): string {
  const declaration = declarationForUrl(url);
  if (declaration) return declaration.dataset;
  return hostOf(url) ?? url;
}

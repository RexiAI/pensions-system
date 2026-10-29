/**
 * Site-level configuration that is data, not translatable copy: the canonical origin and the
 * contact address.
 *
 * Both are read from the environment when the deployment is built, with the deployed values as
 * the committed defaults, so a custom domain or a different inbox is one environment variable
 * away and no component carries a URL or an address literal. Nothing here is a secret: these
 * are the site's own public identity, and `SITE_URL` is the single origin every absolute URL the
 * site publishes derives from — the canonical `<link>`, `og:url`, the sitemap, `robots.txt` and
 * the footer's citation line.
 */
const DEFAULT_SITE_URL = 'https://pensions-system-danielbueno76-4270s-projects.vercel.app';
const DEFAULT_CONTACT_EMAIL = 'info@rexi-ai.com';

/** An unset or blank variable is not an override: it falls back to the committed default. */
function fromEnvironment(value: string | undefined, fallback: string): string {
  const configured = value?.trim() ?? '';
  return configured === '' ? fallback : configured;
}

/**
 * A canonical origin never carries a trailing slash: every URL is built with `new URL`, and a
 * malformed origin fails the build here rather than shipping as a broken `<link rel="canonical">`.
 */
function originOf(value: string | undefined): string {
  const origin = fromEnvironment(value, DEFAULT_SITE_URL).replace(/\/+$/, '');
  try {
    new URL(origin);
  } catch {
    throw new Error(`SITE_URL is not an absolute URL: ${origin}`);
  }
  return origin;
}

/**
 * Conservative on purpose: a permissive pattern accepts `<`, `>`, quotes and apostrophes, which
 * would then reach the footer's `mailto:` href and its visible text (docs/SECURITY.md
 * §Escape User Data in Outbound HTML).
 */
const CONTACT_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

function contactOf(value: string | undefined): string {
  const email = fromEnvironment(value, DEFAULT_CONTACT_EMAIL);
  if (email.length > 254 || !CONTACT_PATTERN.test(email)) {
    throw new Error(`CONTACT_EMAIL is not a plain e-mail address: ${email}`);
  }
  return email;
}

export const SITE_URL = originOf(process.env.SITE_URL);
export const CONTACT_EMAIL = contactOf(process.env.CONTACT_EMAIL);
export const COOKIELESS_COUNTER_ENABLED = false;

/**
 * The absolute URL of one public path, from the origin above. The canonical `<link>`, `og:url`,
 * every `hreflang` alternate and the footer line all call this with the same path, which is what
 * makes them unable to drift: there is one origin, and one function that applies it.
 *
 * A root URL serialises as its origin with no trailing slash — the form the `<link>` and `og:url`
 * carry once Next resolves them — so the three places print one string rather than three
 * spellings of it. `hreflang` follows the same rule for the same reason: an alternate for `es`
 * that read `…/` while its canonical read `…` would be two spellings of one URL, and a crawler
 * reading both has to decide whether they are the same page.
 *
 * `baseUrl` is a parameter, not a second source of truth: the build gate that checks the sitemap
 * has to evaluate one origin against another to prove they agree, and `SITE_URL` stays the
 * default for every caller that publishes a URL.
 */
export function canonicalUrl(path: string, baseUrl: string = SITE_URL): string {
  const url = new URL(path, baseUrl);
  return url.pathname === '/' && url.search === '' && url.hash === '' ? url.origin : url.toString();
}

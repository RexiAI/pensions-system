import type { MetadataRoute } from 'next';
import { sitemapEntries } from '../web/seo/routes';

import { SITE_URL } from '../web/content/site';

const BASE_URL = SITE_URL;

/** Generated from the explicit public manifest, never from filesystem discovery. */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(BASE_URL).map((entry) => ({
    url: entry.url,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    alternates: {
      languages: Object.fromEntries(entry.alternates.map((alternate) => [alternate.hreflang, alternate.href])),
    },
  }));
}

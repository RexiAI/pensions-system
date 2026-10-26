import type { MetadataRoute } from 'next';
import { robotsPolicy } from '../web/seo/routes';

import { SITE_URL } from '../web/content/site';

const BASE_URL = SITE_URL;

/** No `Disallow: /admin`: the `noindex` header is the correct control, not a disallow. */
export default function robots(): MetadataRoute.Robots {
  const policy = robotsPolicy(BASE_URL);
  return { rules: policy.rules, sitemap: policy.sitemap };
}

# AC-006: The share link is canonical

Task 13. The criterion may not be self-referential: comparing a control with the same constant that
builds it is how the wrong host shipped (`10-tasks.md` §1b defect 4, §6 D11).

## AC-006-34 — One origin, and it is not a project alias

Given `web/content/site.ts` and every absolute URL the page publishes
When the origins are collected from the canonical link, `og:url`, every `hreflang` alternate, the sitemap and all four share controls
Then the committed default origin contains no `-projects.vercel.app` project-alias segment
And every one of those URLs resolves to that single origin
And `SITE_URL` still overrides the default when the deployment sets it
And no share URL gains a tracking parameter while the origin is corrected.

## AC-006-35 — On production, the shared origin is the serving origin

Given the deployed page on the production origin
When every share control's `href` is parsed and its embedded page URL extracted
Then each embedded URL's origin equals the origin that served the page
And no share control carries a different host
And this is checked against the live deployment, not against a build-time constant.

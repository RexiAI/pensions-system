# AC-007-01 — Four-page route model

## AC-007-01 — twenty static public routes, Spanish slugs, closed locale tuple
Given the public route manifest `PUBLIC_ROUTE_PATHS`
When the manifest is read
Then it lists exactly 20 paths — `/`, `/en`, `/fr`, `/de`, `/it` plus
`/cifras`, `/metodo`, `/debate` and their `/{locale}/…` variants for `en`, `fr`, `de`, `it`
And it contains no admin path
And it is declared by hand, not produced by filesystem discovery

## AC-007-02 — every public route is force-static and prerendered
Given a production build of the site
When the route table is inspected
Then each of the 20 public routes is listed as static (`force-static`, ISR or SSG),
never server-rendered on demand
And no public page carries an on-demand (`λ`) render for a published locale

## AC-007-03 — an unknown locale on a page path is a 404, never an on-demand render
Given a request for `/xx`, `/xx/cifras`, `/xx/metodo` or `/xx/debate` where `xx` is not a
locale in the tuple
When the route is resolved
Then the response status is 404
And `dynamicParams` remains `false` for the locale branch

## AC-007-04 — the locale branch enumerates the three sub-pages for every non-default locale
Given the `[locale]` route segment's `generateStaticParams`
When it is called
Then it yields, for each of `en`, `fr`, `de`, `it`, the three page slugs `cifras`,
`metodo`, `debate`
And the default locale's sub-pages resolve as their own static segments under `/`

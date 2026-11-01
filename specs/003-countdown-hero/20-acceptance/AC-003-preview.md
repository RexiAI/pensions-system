# AC-003: Link preview built on 2042 (T4)

## AC-003-34 — Title and og:title carry the year in every locale
Given thresholdYear 2042 in derived data
When each of the five public routes is prerendered
Then <title> and og:title contain 2042
And both keep the scope suffix from the country record

## AC-003-35 — og:description and the share card carry the year
Given thresholdYear 2042
When each locale's og:description and share card image are generated
Then og:description contains 2042
And the share card's rendered text contains 2042
And og:image:alt is distinct per locale

## AC-003-36 — The year is derived, never typed
Given the threshold parameter changed so thresholdYear becomes 2043
When the site is rebuilt
Then title, og:title, og:description and the share card contain 2043 and not 2042
And no locale file, component or generated source contains a hand-typed 2042

## AC-003-37 — No day count in any static artefact
Given the prerendered public routes and generated assets
When title, meta description, every og: and twitter: tag, og:image:alt, the share card, the sitemap and the web manifest are inspected
Then none contains a day count, an hour, minute or second value, or the anchor's full date

## AC-003-38 — No threshold year, no year in the preview
Given countdown data in the not-crossed, unavailable or withheld state
When the site is built
Then title, og:title, og:description and the share card contain no threshold year and no substitute year

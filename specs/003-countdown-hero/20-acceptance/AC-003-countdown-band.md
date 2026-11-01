# AC-003: Countdown hero band (T1)

## AC-003-01 — The band spans the full content width
Given the public page in each of the five locales
When it is rendered in Chromium at 390×844, 1366×768 and 1440×900
Then the countdown band's bounding-box width equals the document's content width
And no other block shares the band's row

## AC-003-02 — The day numeral is larger than the h1 on the numeral ladder
Given the public page in each of the five locales
When it is rendered at 390×844, 1366×768 and 1440×900
Then the day numeral's computed font size resolves to --text-num-xl (80px at 1366×768 and 1440×900, 44px at 390×844)
And it is strictly greater than the h1's computed font size
And --text-display still resolves to 4rem (the display cap is unchanged)

## AC-003-03 — The day numeral is the largest numeral on the page
Given the public page with the countdown band shown, rendered at 390×844, 1366×768 and 1440×900
When every element rendering a numeral is measured
Then none has a computed font size greater than the day numeral's
And the "16 años" years numeral's computed font size is 32px
And the hero figure uses its demoted style

## AC-003-04 — The seconds tick at display size on desktop
Given the public page rendered at 1366×768 and at 1440×900 with motion allowed
When the seconds field is measured
Then its computed font size is at least 32px

## AC-003-05 — Anchor and both disclosures are retained
Given the countdown in the computed state, in each of the five locales
When the page is rendered
Then the anchor date with its conventional-date label is visible text
And the sentence stating the threshold year is a projection is visible text
And the two-reference sentence (years are year arithmetic; days are counted to the anchor date) is visible text
And none of them is inside a details element, a title attribute or a tooltip

## AC-003-06 — Clock and fuse inside the first viewport at every measured width; AC-001-107's demography clause retired (D2)
Given the public page in each of the five locales
When it is rendered at 390×844, 1366×768 and 1440×900 without scrolling
Then the bounding box from the day numeral to the seconds field lies inside the viewport
And the fuse's drawn line and its label lie inside the viewport
And the demography-heading-and-finding-at-fold clause of AC-001-107 is not asserted at 390×844, 1366×768, 1440×900 or 1280×800 (D2: retired at every width)
And AC-001-107's remaining clause still holds: the hero does not fill the viewport at 1280×800 and at 390×844, and no breakpoint sets a viewport-height minimum on the hero

## AC-003-07 — Reduced motion hides the tick and does not freeze it
Given prefers-reduced-motion is reduce
When the page is rendered at a known instant
Then the hour, minute and second fields are display:none
And no interval is created
And the day count shown equals the day count computed for that render instant

## AC-003-08 — No clock without a threshold year, band included
Given countdown data in the not-crossed, unavailable or withheld state
When the page is rendered
Then no day, hour, minute or second field and no anchor render
And the band renders no numeral and no substitute threshold

## AC-003-09 — Clock behaviour is unchanged by the band
Given the band layout
When the archived clock scenarios AC-001-111, AC-001-113, AC-001-114 and AC-001-115 run
Then they all pass without their assertions being edited

## AC-003-10 — Fold measurements are re-measured, budgets are not relaxed
Given the first-viewport measurement table in tests/acceptance/first-viewport.test.ts
When the band changes the clock's geometry and moves the h1 and the share row into it
Then the pinned values are updated from real Chromium measurement for the clock, the fuse, the h1 and the share row at 390×844, 1366×768 and 1440×900
And the clock and fuse rows keep a whole-box assertion and the same 50px clearance margin
And the h1 and share-row rows assert the top edge only, which is the target D1 states
And no clearance margin, budget or viewport size is changed

## AC-003-48 — Band composition: hero copy, eyebrow, clock, fuse, share row (D1)
Given the public page in each of the five locales
When the band is rendered at 390×844, 1366×768 and 1440×900
Then the h1's top edge precedes the day numeral's, which precedes the fuse's, which precedes the share row's
And the countdown eyebrow lies between the h1 and the day numeral
And no element rendering text lies between the fuse's bottom edge and the share row's top edge
And the share row is a descendant of the band element
And the band contains the page's single h1, the hero sub line and both hero actions
And the hero's figure panel is not a descendant of the band
And the band precedes the figure strip in document order

## AC-003-49 — The h1 is inside the first viewport at all three widths (D1)
Given the public page in each of the five locales
When it is rendered at 1440×900, 1366×768 and 390×844 without scrolling
Then the h1's bounding-box top is greater than or equal to 0 and less than or equal to the viewport height
And the h1's computed font size still equals --text-display's resolved value (the move relocates the element, it does not restyle it)

# AC-004: No empty column at any width, in any locale

## AC-004-55 — No unoccupied grid track on the page
Given the app served and loaded in a real Chromium at 1440×900 in `es`
When every element inside `<main>` whose computed `display` is `grid` is enumerated
And its resolved `grid-template-columns` yields two or more tracks
Then no track of width 8 px or more is unoccupied
Where unoccupied means no in-flow direct child's horizontal bounding box intersects the track's range

## AC-004-56 — The guarantee holds at every measured width
Given the same scan
When it runs at widths 320, 360, 390, 768, 1024, 1280, 1366 and 1440 px, each 900 px tall
Then the unoccupied-track count is 0 at every width
And the test reports the number of grid containers scanned at each width

## AC-004-57 — The guarantee holds in all five locales
Given the same scan run once per locale
When it covers `es`, `en`, `fr`, `de` and `it` at 390, 768 and 1440 px
Then the unoccupied-track count is 0 in every locale
And a failing locale names itself in the assertion message

## AC-004-58 — No horizontal overflow at the 320 floor
Given the app served and loaded at 320×900 in each of the five locales
Then `document.documentElement.scrollWidth` does not exceed the viewport width
And no element inside `<main>` has a computed width of 0 while containing text

## AC-004-59 — The retired shape cannot return structurally
Given `web/styles/globals.css`
Then no rule places a sole grid child into a column other than the first
And no rule declares a two-column track list on an element that the page renders with a single child

# AC-001: First viewport composition (R5)

## AC-001-107 — The hero does not fill the viewport and the demography heading is at the fold
Given a viewport of 1280×800
And a viewport of 390×844
When the page renders
Then at 1280×800 the hero does not occupy the full viewport height (min-height 560px, not the
  full-viewport height), and the demography block's heading and finding sentence are visible
  without scrolling
And at 390×844 the hero also does not occupy the full viewport height

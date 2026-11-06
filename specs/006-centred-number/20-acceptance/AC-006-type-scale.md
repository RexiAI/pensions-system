# AC-006: Spend fewer type sizes above the fold

Task 6. The distinct type size count is defined in `10-tasks.md` §2.9 and is measured over rendered
text leaves above the fold.

## AC-006-14 — The distinct sizes above the fold decrease

Given the served page at each of the five locales and each of the three viewports
And the count before this spec: 10 distinct sizes at every measured viewport
When the distinct computed `font-size` values of the rendered text leaves above the fold are counted
Then the count is at most 9
And every counted size equals the resolved value of a `--text-*` token at that viewport, so no ad-hoc literal such as `13.5px` is introduced to dodge the count
And the pinned display scale still resolves to its shipped values (`--text-display`, `--text-h2`, `--text-plate`, `--text-body-lg`, `--measure`), so the count is not reduced by moving the display or heading scale.

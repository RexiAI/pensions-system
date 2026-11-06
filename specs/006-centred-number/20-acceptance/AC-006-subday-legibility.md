# AC-006: Remove the sub-day row (was: make it legible)

Task 3, **superseded by Task 11**. Revision 1 required the three sub-day fields to grow from 13 px to
a legible size. Revision 2 removes them. The two scenarios keep their ids and now assert the removal
and the survival of the detail elsewhere, so the record of what changed is in the suite rather than
only in a changelog.

## AC-006-05 — The sub-day row is gone from step 1

Given step 1 at each of the five locales and each of the three viewports
And **the number group**, defined as the nearest ancestor of the day numeral that also contains the unit `días` — by AC-006-04 that element holds the numeral and the unit and nothing else
When the DOM is searched for the hours, minutes and seconds fields and their labels
Then no cell, value or label for a sub-day quantity is present anywhere in step 1
And no element **inside the number group** computes a `font-size` of 12 px or 13 px, because the text those sizes carried is gone
And the step label's 12 px caps treatment is a label, not a measurement: it is not a descendant of the number group and is outside this criterion's boundary, so the criterion says nothing about it
And the empty row left no spacing artefact: the gap between the number and the sentence is the sentence's own `--space-5`, not a stack of collapsed containers.

## AC-006-06 — The sub-day quantities are gone from the page, not moved around it

Given the served page in each of the five locales
When the rendered text of the whole page is searched for the three sub-day strings
Then none of `countdown.clock.hours`, `countdown.clock.minutes` or `countdown.clock.seconds` appears in the rendered page, in the story or in `#metodo`
And no element anywhere on the page renders a value beside one of those strings
And the page still has no horizontal overflow at 320 px (AC-004-58 stays green).

> Revision 1's second scenario required the enlarged row to stay inside the content box at 320 px;
> revision 2's draft said the detail was "either present in Method or deliberately absent", which is
> an assertion that cannot fail. Neither survives: the sub-day quantities are a *reading*, not
> published data, so the honest criterion is that they are no longer rendered anywhere. The data
> that does survive in Method — the years quantity and its arithmetic — is AC-006-31's subject.

# AC-006: One number

Task 11. Step 1 carries one quantity, its unit, the label and the sentence. The years numeral and
the three sub-day fields leave the story; the detail they carried lives in `#metodo`.

## AC-006-29 — Step 1 renders exactly one quantity

Given step 1 at each of the five locales
When its DOM and its visible text are read
Then it renders the day numeral, the unit `días`, the step label and the sentence
And the day numeral is the committed countdown's day value at the render instant, and it appears exactly once on the page
And inside the number group exactly **one** text node contains a digit — the day numeral — so "no time-of-day text" is a count rather than a judgement about what looks like a clock
And it renders no years numeral, no hours, minutes or seconds field, no second unit and no time-of-day value
And those elements are absent from the DOM rather than hidden by CSS
And the five steps still render in their declared order.

## AC-006-30 — The sentence still carries the date and binds to the one numeral

Given step 1 in each of the five locales
When the sentence is read against the numeral above it
Then it names the anchor date
And that date occurs exactly once across the five steps, in step 1
And its only reference to a quantity is the one that resolves to the day numeral above it
And it refers to no years, hours, minutes or seconds
And its text is the shipped string, unchanged except in a locale whose string referenced a removed quantity, which is recorded in the change.

## AC-006-31 — The detail survives in Method

Given `#metodo` in each of the five locales
When its visible text is read, outside any `<details>`
Then the years quantity and its two printed integers are present
And the anchor date and the arithmetic that derives the years are present
And the years quantity carries no sub-annual unit.

# AC-004: Step 5 — what it means, and the one action

## AC-004-24 — One sentence and one button
Given the page rendered in any locale
When step 5's markup is inspected
Then it contains exactly one `<p>`
And exactly one `<a>`
And no other element that renders text

## AC-004-25 — The action is the page's primary promise
Given the page rendered in any locale
Then that anchor's visible text is the `hero.ctaPrimary` string
And its `href` is `#figuras`
And it is the only `--accent`-filled action above the fold

## AC-004-26 — Step 5 closes the story
Given the page rendered in any locale
Then step 5 is the fifth element carrying `data-top-step`
And no step follows it

## AC-004-27 — The share row follows the steps and works without JavaScript
Given the page rendered in any locale, server-side only
Then the share row renders after the fifth step
And it renders inside no element carrying `data-top-step`
And its links, its canonical URL and its no-script text are present in the served HTML
And it issues no third-party request

## AC-004-28 — The secondary action survives, outside the steps
Given the page rendered in any locale
Then `hero.ctaSecondary` or `hero.ctaMethod` renders somewhere on the page with `href="#metodo"`
And neither renders inside steps 1 to 5
And `#metodo` resolves to an existing element id

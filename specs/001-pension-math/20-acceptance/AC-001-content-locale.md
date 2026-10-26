# AC-001: Content model keyed by country + locale

## AC-001-33 — All five locales return content for Spain
Given country `ES`
When content is requested for each of `es`, `en`, `fr`, `de`, and `it`
Then each locale returns complete content (no locale is missing)

## AC-001-34 — An unsupported locale yields a defined error
Given country `ES`
And a locale outside {`es`, `en`, `fr`, `de`, `it`}
When content is requested
Then the result is a defined error, never a silent fallback to another language

## AC-001-35 — No user-facing string literal in a component
Given a metric-rendering component
When the component's source is inspected
Then no user-facing string literal appears inline; every user-facing string resolves through a locale resource key

## AC-001-36 — A second country is data, not code
Given a second country's content entry
When it is added to the content data
Then the same rendering code serves it with no new country-specific code branch

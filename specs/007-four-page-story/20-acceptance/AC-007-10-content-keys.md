# AC-007-10 — Content keys + locale parity

## AC-007-22 — the kicker and page/title strings live in the content model
Given `REQUIRED_KEYS` and the five locale documents
When the new surfaces are implemented
Then `REQUIRED_KEYS` declares the kicker key and the page-name/title keys the header,
pager and metadata use
And no component holds a literal copy of the kicker, a page name or a title string

## AC-007-23 — all five locales carry the new keys, non-blank and set-equal
Given the five locale documents
When `missingKeys` and `unknownKeys` are evaluated for each
Then both are empty for every locale
And the five key sets are mutually equal
And every new value is non-blank in all five locales

## AC-007-24 — the new keys are translated, not copied, and parity stays set-based
Given the new keys added by this spec
When each non-`es` locale's value is read
Then it is non-empty and not byte-identical to the `es` value
And the parity test still asserts set equality and never a fixed key count

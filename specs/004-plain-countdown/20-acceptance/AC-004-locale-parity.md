# AC-004: Locale parity for the new and retired keys

## AC-004-69 — `REQUIRED_KEYS` matches what the page renders
Given `web/content/keys.ts`
Then it lists every key the new composition resolves
And it lists no key the composition no longer resolves, and no retired `pending.*` or `countdown.*` key that nothing renders

## AC-004-70 — All five locales carry exactly the required set
Given the five locale documents
When `missingKeys` and `unknownKeys` run against each
Then both return an empty list for `es`, `en`, `fr`, `de` and `it`
And no locale carries a key another locale lacks

## AC-004-71 — Every new key is translated, not copied
Given each key this spec introduces
Then its value is non-blank in all five locales
And no locale's value is byte-identical to the Spanish value unless the word is the same word in both languages
And every value passes the plain-language gate of AC-004-39

## AC-004-72 — Five routes, five languages
Given the production build
Then five public routes prerender successfully
And each served document's `<html lang>` matches its locale
And no locale 404s

## AC-004-73 — Parity replaces the key freeze
Given the parity tests
Then they assert set equality against `REQUIRED_KEYS`
And they do not assert a fixed key count
And they do not assert that no key was added

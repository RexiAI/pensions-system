# AC-001: Country scope mark (Spain only, three levels, from data)

## AC-001-102 — The scope mark renders from the country record in every locale
Given the country record `country.ES` with `name` and `scopeClause` in each of the five locales
When the scope mark renders at the first viewport, on every figure strip, and in the `<title>` /
  `og:title` and share card
Then every occurrence is derived from `country.ES.name` and `country.ES.scopeClause` in the
  requested locale
And no component hardcodes a country name string
And the `Ámbito` field never renders an empty cell

## AC-001-103 — A hero statement that omits the country name fails the build
Given a locale whose `hero.statement` does not contain `country.ES.name` in that locale
When the content model is validated at build time
Then the build fails with a non-zero exit
And a country record missing `name` or `scopeClause` in any published locale also fails the build

## AC-001-104 — One geo is text, two or more is the index, never a disabled control
Given exactly one published geo
When the scope mark renders
Then it is plain text, not a control
And with two or more published geos it renders as the country index (a bare `<details>`)
And it is never a disabled or single-option control

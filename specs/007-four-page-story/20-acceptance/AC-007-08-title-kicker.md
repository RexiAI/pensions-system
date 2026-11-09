# AC-007-08 — Title formula + kicker

## AC-007-14 — the home title is the promise framing, per locale, ending in the country
Given the home route for a locale, with a committed threshold year
When the page metadata is resolved
Then the `<title>` and `og:title` equal the locale's promise framing with `{year}`
interpolated from the committed threshold year:
- es `Sistema de pensiones: la promesa que no se sostiene · {year}`
- en `Pension system: the promise that does not hold · {year}`
- de `Rentensystem: das Versprechen, das nicht trägt · {year}`
- fr `Système de retraites : la promesse qui ne tient pas · {year}`
- it `Sistema pensionistico: la promessa che non regge · {year}`
And the title still ends with the country name (the existing scope suffix)

## AC-007-15 — the kicker names the mechanism above the h1, exact per locale
Given the home page for a locale
When the page is rendered
Then a kicker renders above the `<h1>`, from a content key, with the exact string:
- es `Sistema de pensiones: esquema de reparto`
- en `Pension system: pay-as-you-go`
- de `Rentensystem: Umlageverfahren`
- fr `Système de retraites : répartition`
- it `Sistema pensionistico: ripartizione`
And the kicker is not the `<h1>` and not an `<h2>`

## AC-007-16 — sub-page titles follow the same shape and end in the country
Given a sub-page (Cifras, Método or Debate) for a locale, with a committed threshold year
When the page metadata is resolved
Then the `<title>` carries the page name, the year, the wordmark and the country name
And the title ends with the country name

## AC-007-17 — the promise title and kicker stay inside the thesis-vocabulary boundary
Given the promise title and kicker strings for every locale
When `findThesisTerms` scans each string
Then it returns no hit in any locale
And neither string contains `estafa`, `fraud`, `fraude`, `frode`, `betrug`, `pirámide`,
`piramide`, `pyramid`, `pyramide`, `cadena`, `chain letter` or `kette`
And when no threshold year is committed the home title falls back to the year-free
`wordmark · country` form, and the kicker still renders (it carries no year)

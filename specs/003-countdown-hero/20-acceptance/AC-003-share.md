# AC-003: Sharing without tracking (T3)

## AC-003-23 — Share links exist in server HTML and work without JavaScript
Given the prerendered HTML of each public route with JavaScript disabled
When the share region is inspected
Then plain anchor links to WhatsApp, X, Telegram and LinkedIn share URLs are present
And each carries rel="noopener noreferrer"

## AC-003-24 — The no-JS share text leads with the derived year, no day count
Given thresholdYear 2042 in derived data and locale es
When the server-rendered share links are inspected
Then their encoded text begins with 2042, contains the Eurostat-projection clause and the canonical URL
And it contains no day count and no "Faltan"
And given thresholdYear changed to 2043 the links contain 2043 and not 2042

## AC-003-25 — The share text computes days at click time from the approved template
Given locale es, thresholdYear 2042, the page rendered at instant T0 and a share link clicked at instant T1 one day later
When the share URL is built
Then its decoded text equals "Faltan {days} días para el 1 de enero de 2042: el año en que, según la proyección de Eurostat, España llega a 50 mayores de 65 por cada 100 personas en edad de trabajar. Compruébalo: {url}"
And {days} equals the clock's day value at T1, not at T0
And {url} equals canonicalUrl for the route

## AC-003-26 — The shared URL is canonical and clean
Given each locale route
When any share control builds its URL
Then the shared page URL equals canonicalUrl for that route
And it carries no utm_ or other tracking parameter

## AC-003-27 — Native share appears only when available
Given navigator.share is undefined
When the page is hydrated
Then no native-share button is in the DOM
And given navigator.share is defined, the button is present and calling it passes the same text and URL as the links

## AC-003-28 — Copy link writes the canonical URL and confirms
Given the Clipboard API is available
When copy link is activated
Then the clipboard contains the canonical URL
And a visible confirmation from a locale key appears
And given the Clipboard API is unavailable, the URL is shown as selectable text

## AC-003-29 — No third-party element in the markup
Given the HTML of each public route
When script, iframe, img, link and source elements are inspected
Then none references a third-party origin
And no preconnect, dns-prefetch or prefetch hint targets a share network

## AC-003-30 — Zero third-party requests during load
Given a Chromium page recording every network request
When a public route loads and stays idle for 3 seconds
Then every request's origin is the site's own origin

## AC-003-31 — Zero third-party requests when sharing
Given a Chromium page recording every request made by the page's own browsing context
When copy link, native share and each network link are activated
Then the page's own context makes no request to a third-party origin
And the only navigation to a share network is a user-initiated top-level navigation in a new browsing context

## AC-003-32 — The no-tracking promise stays true
Given any public route
When it loads and share controls are used
Then no cookie is set
And the footer's no-cookies, no-third-party-analytics, no-tracking string is unchanged

## AC-003-33 — Share strings are localised and named; countdown bans stay outside share.*
Given the five locales
When the share region is rendered in each
Then every visible string and accessible name comes from a locale key present in all five locales
And the share text comes from share.* keys only
And no countdown.* or hero.* string contains faltan, Compruébalo or any term the countdown.* bans forbid (AC-002-28 unchanged outside share.*)

## AC-003-47 — The share.* rule set accepts the approved template and rejects alarm copy
Given the share.* copy-rule set
When the approved share template in each of es, en, fr, de and it is checked
Then each passes, the es template containing "Faltan", the explicit anchor date "1 de enero de {year}" and "Compruébalo"
And each other locale states the same facts (day count, anchor date, year, Eurostat projection, 50 per 100 ratio, URL) in equivalent factual wording
And a share.* string containing "Quedan" fails
And a share.* string containing "bomba" fails
And a share.* string containing "!" fails
And a share.* string containing an urgency adjective (e.g. "urgente", "inminente", "alarmante") fails

## AC-003-50 — The share row's top is inside the first viewport at both desktop widths (D1)
Given the public page in each of the five locales
When it is rendered at 1440×900 and at 1366×768 without scrolling
Then the share row's bounding-box top is greater than or equal to 0 and less than or equal to the viewport height
And at 390×844 the share row's top is not asserted (the row wraps to two lines there)

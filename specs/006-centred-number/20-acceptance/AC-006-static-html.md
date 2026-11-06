# AC-006: Step 1 is static HTML

Task 12. There is nothing to tick, so the served markup is the value. "Static" here means the
numeral in the response body is final and no client code corrects or advances it.

## AC-006-32 — The served HTML is the value, and says when it was rendered

Given the served route at one locale
And the public routes are statically generated with a one-hour revalidation window (`revalidate = 3600`, `dynamic = 'force-static'` retained), so the numeral is the value of the last generation and at most an hour old
When the numeral, the instant declared beside it, and the DOM two seconds after load are read
Then the numeral equals `readClock(anchor, declaredInstant).days`
And the declared instant is machine-readable and identifies the render the numeral came from
And step 1's visible text two seconds after load is identical to the served markup's, which a ticking field would break
And there is no placeholder, no pending state and no zero rendered before a correction
And comparing two HTTP requests is not the assertion, because within the revalidation window the same bytes are returned even if a clock were baked into them.

## AC-006-33 — No client clock remains

Given the number step's render path and the scripts the page serves
When the module graph, the created timers and step 1's attributes are inspected
Then no module reachable from the number step carries the `'use client'` directive
And no interval, timeout or animation frame is created for the story
And step 1 carries no `data-clock-state` attribute, no `aria-hidden` ticking region and no `role="group"` clock wrapper.

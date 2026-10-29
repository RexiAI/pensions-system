# AC-002: One dominant CTA, one subordinate secondary

The brief names two attraction levers — a saturated accent and a single dominant CTA.
Today both hero actions inherit the global `a { color: var(--accent) }`, so raising the
accent's chroma makes the secondary action louder, not quieter. This task fixes the
hierarchy in CSS; wording is not touched (it belongs to T6).

## AC-002-31 — One visually dominant primary action
Given the hero actions (`.hero__actions`)
When the primary CTA (`.hero__cta`) is rendered
Then it is a filled `--accent` block with `--on-accent` ink
And it has no underline
And it has `--radius: 0`
And it is the only accent-coloured action above the fold

## AC-002-32 — A clearly subordinate secondary action
Given the hero actions
When the secondary link is rendered
Then it is a text link in `--ink-2` (not accent-coloured)
And it has a visible 1px underline
And it has no fill
And its type is no larger than the primary's (`--text-body-lg` or `--text-body`)

## AC-002-33 — CTA styling is token-only, with no literal
Given `web/styles/globals.css`
When the CTA rules (`.hero__cta` and the secondary link) are read
Then every colour, size, spacing and radius resolves a token
(`--accent`, `--on-accent`, `--ink-2`, `--text-body`, `--text-body-lg`, `--space-*`, `--radius`)
And no literal hex / rgba / px appears in those rules

## AC-002-34 — The secondary no longer competes on hue
Given `web/styles/globals.css`
When the secondary link's colour is read
Then it is not `var(--accent)`
And after T2 raises the accent's chroma, the secondary's prominence is unchanged by it
(the accent does one job above the fold: the primary CTA's material)

## AC-002-35 — Both links keep their href targets and accessible names
Given both hero tiers (numeric and proposition)
When the two actions are rendered
Then the numeric tier's primary targets `#figuras` and its secondary targets `#metodo`
And the proposition tier's primary targets `#metodo` and its secondary targets `#figuras`
And each link's visible text is unchanged and remains its accessible name

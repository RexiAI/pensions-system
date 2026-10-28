# AC-001: Palette and label-system migration (Revision 3)

## AC-001-117 — The palette meets its contrast minimums; no retired value survives; the deficit hue is unchanged
Given the token file `web/styles/tokens.css`
When a test reads the declared token values and computes WCAG 2.1 relative-luminance ratios
Then every pair in the Revision 3 §P1 contrast table meets its stated minimum in both the light and
  dark themes (AA 4.5:1 for text, AAA 7:1 where stated, 3:1 for non-text graphics)
And the public palette declares exactly three chromatic hues — `--accent` (green band),
  `--data-projection` (yellow band), `--data-deficit` (terracotta) — and no fourth hue
And `--data-deficit` is byte-identical to its Revision 2 value (`#96472A` light, `#D08A63` dark)
And `--data-projection` carries its Revision 3 value (`#6B520A` light, `#D8BF60` dark)
And no retired value string (from the Revision 3 "pairs retired" table: `#141A1B`, `#F4F5F2`,
  `#384446`, `#5A6769`, `#17564A`, `#6A5A12`, `#6E7A79`, `#E4E7DF`, `#ECEEE8`, `#C9CFC7`) remains
  anywhere in `web/`
And the admin state colours (`--state-pending`, `--state-danger`) still pass AA on the new grounds
  (light `--surface-1/2/3` and dark `--surface-1/2/3`)

## AC-001-118 — Labels are not measurements
Given any element whose role is a field label, eyebrow, chip word, state word, table caption, scope
  mark, or provenance label
When the element's resolved font family is inspected
Then it resolves `--font-label` (sans), never `--font-mono`
And every numeral (hero value, readout values, numeric table cells, hashes, identifiers, the
  two-letter locale codes) still resolves `--font-mono`

# AC-001: Projection colour never carries the meaning alone

## AC-001-106 — A projected value is encoded by dash, position, and a printed word, not hue alone
Given any projected value rendered with the `--data-projection` hue
When the rendered output is inspected
Then the projected extent is additionally encoded by a dash pattern (`--dash-projection`) and by a
  printed word (`proyectado`, `umbral`) — or by position (its own panel) — in addition to the hue
And no projected datum is distinguishable by colour alone

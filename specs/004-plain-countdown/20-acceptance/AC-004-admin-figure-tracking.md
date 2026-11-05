# AC-004: Figures 3–7 are tracked in admin

## AC-004-47 — The admin panel lists every figure and its availability
Given an authenticated admin session and the committed derived figures
When the panel home renders
Then it renders one row per figure in `FIGURE_IDS` order
And each row carries the figure id and its `availability` value
And the row count equals the derived store's length

## AC-004-48 — The list is data, not a literal
Given the admin view's source
Then it reads the figures from `createFileDerivedStore().readAll()`
And it contains no literal figure id, figure count or availability value
And every string it renders resolves from `adminT`

## AC-004-49 — The five unavailable figures are visible to the operator only
Given the committed derived figures
Then the admin list shows all seven figures, five of them `unavailable`
And the public page renders two plates
And no public route renders the admin list or links to it

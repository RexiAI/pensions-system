# AC-002: Close the pipeline scratch in `.gitignore`

## AC-002-01 — The scratch directory is ignored
Given the repository's `.gitignore`
And a `reports/` directory can exist at the repository root
When `.gitignore` is read
Then it contains a directory entry `reports/` (with the trailing slash)
And a `reports/` directory is not reported as untracked by `git status`

## AC-002-02 — The runs log is ignored
Given the repository's `.gitignore`
And a `runs.jsonl` file can exist at the repository root
When `.gitignore` is read
Then it contains an entry `runs.jsonl`
And a `runs.jsonl` file is not reported as untracked by `git status`

## AC-002-03 — Every pre-existing entry is preserved
Given the `.gitignore` before this change
When the change is applied
Then every pre-existing entry remains present and unchanged:
`node_modules/`, `.next/`, `out/`, `coverage/`, `*.tsbuildinfo`, `.envrc`, `.env`,
`.env.local`, `data/pending/*.json`, `data/proposals/*.json`, `.vitest/`,
`.stryker-tmp/`, `.playwright-mcp/`
And no entry is removed, reordered, or otherwise altered

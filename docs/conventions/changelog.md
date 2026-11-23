# Changelog convention

Every repository in the Vidoxlabs family maintains `docs/CHANGELOG.md` alongside its contract `## Changes` sections and `docs/capabilities/index.json`.

## Exact file shape

Every `docs/CHANGELOG.md` uses this exact order:

1. `# Changelog`
2. Blank line.
3. One plain sentence stating where earlier history lives (always above `## Unreleased`, never inside `## Unreleased` and never at the bottom).
4. Blank line.
5. `## Unreleased`
6. Blank line, followed by only the non-empty subsections from `### Added`, `### Changed`, `### Fixed`, and `### Removed` in that order (zero empty subsections).

Example layout:

```markdown
# Changelog

Earlier history lives in the `Changes` sections of `docs/contracts/`.

## Unreleased

### Added

- Add capability ledger scaffold (CAP-01, seed#1).
```

## Earlier history pointers

- Repositories with `docs/contracts/` (`seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`): point to the `Changes` sections in `docs/contracts/` (and `docs/bloom-interop.md` in `seed`).
- `bloom`: point to git history and `docs/architecture.md`.
- `docs`: point to git history and `docs/sync.md` (never `docs/sources-index.md`, which is generated on sync runs).

## Entry rules

1. **Line format**: Each bullet summarizes one change and ends with `(CAP-NN, <repo>#<n>)`, for example `(CAP-01, seed#1)`. Never write `PR pending`.
2. **Version-bump pull requests**: When cutting a release, a version-bump PR moves items under `## Unreleased` into a new `## <version> - <YYYY-MM-DD>` section below `## Unreleased`, leaving `## Unreleased` ready for subsequent work.
3. **Contract `Changes` stay in place**: Individual contract documents (`docs/contracts/*.md` or hub `docs/sync.md`) continue to keep their own `## Changes` sections for contract-level version history.
4. **Same-PR ledger rule**: Any pull request that implements or changes a capability updates `docs/CHANGELOG.md` in the same pull request as the code, test, and `docs/capabilities/index.json` update.

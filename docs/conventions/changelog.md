# Changelog convention

Every repository in the Vidoxlabs family maintains `docs/CHANGELOG.md` alongside its contract `## Changes` sections and `docs/capabilities/index.json`.

## File structure

1. **`## Unreleased` at the top**: Every repository's `docs/CHANGELOG.md` starts with `## Unreleased` above dated release sections.
2. **Standard subsections**: Group entries under `### Added`, `### Changed`, `### Fixed`, and `### Removed` (omit empty subsections if desired, or keep them ready under `## Unreleased`).
3. **Line format**: Each bullet summarizes one change and ends with the capability ID and pull request number in parentheses, for example:
   `- Add capability ledger scaffold (CAP-01, PR #1)`
4. **Version-bump pull requests**: When cutting a release, a version-bump PR moves items under `## Unreleased` into a new `## <version> - <YYYY-MM-DD>` section and leaves a fresh `## Unreleased` heading at the top.
5. **Contract `Changes` stay in place**: Individual contract documents (`docs/contracts/*.md` or hub `docs/sync.md`) continue to keep their own `## Changes` sections for contract-level version history.
6. **Same-PR ledger rule**: Any pull request that implements or changes a capability updates `docs/CHANGELOG.md` in the same pull request as the code, test, and `docs/capabilities/index.json` update.

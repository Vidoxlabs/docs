# CAP-02: Docs freshness check

- ID: `CAP-02`
- Title: Docs freshness check
- Lead: `docs`
- Touches: `seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`, `bloom`
- Horizon: `now`
- Milestone: `M2`
- CLI phase: `none`
- Status: `proposed`
- Claim: `planned`
- Depends on: `CAP-01`

## Why

Hand-maintained ledgers and cross-repository capability specs inevitably drift as slice PRs land across eight repositories. Without automated freshness tests in both the hub (`docs`) and each standalone repository, broken spec paths, invalid status/claim pairs, cyclic or milestone-inverted dependencies, malformed tool IDs, or stale `ledger.md` tables can merge silently.

## What it does

Enforces four deterministic freshness rules offline, without network access:

1. **Hub cross-repo check (`CAP-02.1`, `test/timeline.test.mjs` in `docs`)**:
   - Reads the `docs` repository's `docs/timeline/capabilities.json`, `docs/timeline/ledger.md`, `docs/capabilities/index.json`, and lead specs alongside synced sibling artifacts under `sources/<repo>/docs/capabilities/` (`index.json` and spec Markdown files).
   - Verifies JSON schema validity, exact 1-to-1 `lead` and symmetric `touches` alignment between `capabilities.json` and synced `index.json` files, slice `"milestone"` fields matching the capability's earliest slice milestone (`D14`), full slice coverage on `lead` entries vs per-repo slices on `touches` entries (`D14`), acyclic `dependsOn` graph resolving both `CAP-NN` and `CAP-NN.k` slice IDs against the `lead` entry with every dependency milestone less than or equal to the dependent's milestone (`D14`), valid two-field `status`/`claim` pairs (`D2`), and resolution of every `lead` repo-relative `spec`, `touches` `<repo>/<path>` `spec`, and `contracts[]` target (`D14`).
   - Compares deterministic `ledger.md` generation (from `capabilities.json` and `lead` entries, preserving `# Capability ledger` on line 1 and existing columns) byte-for-byte against committed `docs/timeline/ledger.md` and fails on drift.
   - Fails closed if a synced source carries an unknown status/claim pair, invalid spec heading sequence, or malformed tool ID.
2. **Standalone repository self-tests (`CAP-02.2` to `CAP-02.8`, `test/capabilities.test.mjs` in each sibling repo)**:
   - Runs as part of `npm test` inside each repository (`seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`, `bloom`) without requiring any sibling checkout on disk.
   - Verifies local files on disk: `docs/capabilities/index.json` schema and entry keys (including `"milestone"` on every slice), valid `status`/`claim` pairs, existence of every `lead` `spec` file and every listed `contracts[]` file inside the repository, existence and shape of `docs/CHANGELOG.md` (earlier-history line above `## Unreleased`, non-empty subsections only, `(CAP-NN, <repo>#<n>)` lines), `docs/adr/README.md`, and the 12-section order in local lead specs.
   - Checks only `lead` `spec` paths on disk; validates cross-repository `touches` `spec` paths syntactically (`<repo>/docs/capabilities/CAP-NN-<slug>.md` naming a known family repository) without reading outside the repository tree (`D14`).
3. **Sync-time `ledger.md` regeneration (`CAP-02.9`, `docs` sync + `docs/sync.md` + sync tests in one commit)**:
   - Extends `scripts/sync-sources.mjs` alongside `docs/sync.md` and sync tests in a single commit so sync runs regenerate `docs/timeline/ledger.md` deterministically (preserving `# Capability ledger` on line 1, `Hand-maintained until CAP-02 lands; generated afterward.`, and the pure function of `capabilities.json` + `lead` entries) whenever synced `sources/` updates.
4. **Grammar source (`D3`) and build order (`D14`)**:
   - Enforces `seed` tool-ID grammar (`domain . [resource . [sub .]] verb`, closed verb set, no forbidden vendor/infrastructure/persona segments) across all `toolIds[]` arrays and spec `### Tool IDs` tables.
   - Pending owner ruling `D3`, `CAP-02.1` sources the grammar from `seed` as a commit-pinned `devDependency` of `docs` (one grammar, zero runtime dependencies), while sibling self-tests run standalone without sibling checkouts.
   - Build order (`D14`): land `CAP-02.2` to `CAP-02.8` self-tests first, then `CAP-02.1` (`test/timeline.test.mjs` in `docs`), then `CAP-02.9` (sync regeneration with `docs/sync.md` and sync tests in one commit).

## Contract touchpoints

- `docs/sync.md`: synced `sources/<repo>/docs/capabilities/` files and `manifest.json` digests feed `test/timeline.test.mjs` (`CAP-02.1`), and `CAP-02.9` updates `docs/sync.md` alongside sync code and tests in one commit for `ledger.md` regeneration.
- `docs/engineering-law.md`: zero runtime dependencies, offline deterministic `npm test`, and fail-closed unknown handling.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Owner gate | Third-party egress | Summary |
| --- | --- | --- | --- | --- |
| none | n/a | n/a | n/a | This capability defines no runtime tool IDs. |

### Events

| Event | Emitted by | Payload summary |
| --- | --- | --- |
| none | n/a | This capability emits no runtime events. |

## Acceptance tests

- `hub-timeline-validates-repo-and-synced-sources` (`CAP-02.1`): `test/timeline.test.mjs` validates `capabilities.json`, `docs/capabilities/index.json`, and synced `sources/*/docs/capabilities/` records together, resolving `<repo>/<path>` on `touches` entries and `lead` repo-relative paths.
- `hub-ledger-drift-fails-closed` (`CAP-02.1`): modifying `capabilities.json` or synced `index.json` status without regenerating `docs/timeline/ledger.md` causes `test/timeline.test.mjs` to fail.
- `slice-depends-on-resolves-against-lead` (`CAP-02.1`): slice IDs in `dependsOn` (`CAP-NN.k`) resolve against the capability's `lead` entry and fail if missing, cyclic, or milestone-inverted.
- `repo-self-test-runs-without-siblings` (`CAP-02.2` to `CAP-02.8`): `test/capabilities.test.mjs` passes in every sibling repository with zero sibling directories mounted, checking only `lead` `spec` paths on disk and syntactic `<repo>/<path>` on `touches`.
- `invalid-status-claim-or-tool-id-rejected` (`CAP-02.1` to `CAP-02.8`): an unpermitted `status`/`claim` pair, cyclic `dependsOn`, missing `contracts[]` file, missing spec section, or invalid tool ID fails the test deterministically.
- `sync-regenerates-ledger-in-same-run` (`CAP-02.9`): sync updates `docs/timeline/ledger.md` deterministically alongside `manifest.json` and `docs/sources-index.md`, verified with `docs/sync.md` and sync tests in one commit.

## Slices

Build order: `CAP-02.2`..`CAP-02.8` -> `CAP-02.1` -> `CAP-02.9`.

1. `CAP-02.1` (`docs`, `M2`, `proposed`): Hub timeline test `test/timeline.test.mjs`.
2. `CAP-02.2` (`seed`, `M2`, `proposed`): Self-test `test/capabilities.test.mjs` in `seed`.
3. `CAP-02.3` (`capillary`, `M2`, `proposed`): Self-test `test/capabilities.test.mjs` in `capillary`.
4. `CAP-02.4` (`myosotis`, `M2`, `proposed`): Self-test `test/capabilities.test.mjs` in `myosotis`.
5. `CAP-02.5` (`aestivation`, `M2`, `proposed`): Self-test `test/capabilities.test.mjs` in `aestivation`.
6. `CAP-02.6` (`drosera`, `M2`, `proposed`): Self-test `test/capabilities.test.mjs` in `drosera`.
7. `CAP-02.7` (`trellis`, `M2`, `proposed`): Self-test `test/capabilities.test.mjs` in `trellis`.
8. `CAP-02.8` (`bloom`, `M2`, `proposed`): Self-test `test/capabilities.test.mjs` in `bloom`.
9. `CAP-02.9` (`docs`, `M2`, `proposed`): Sync regenerates `docs/timeline/ledger.md` with `docs/sync.md` and sync tests in the same commit.

## Non-goals

- Reading sibling repositories directly from disk during `npm test` (cross-repo checks run in `docs` against `sources/`, while each sibling runs standalone).
- Auto-committing changes across sibling repositories or bypassing PR review.
- Adding runtime dependencies to any repository (`CAP-02.1` grammar sourcing via `devDependency` is governed by `D3`).

## Family rules and conflicts

- Must respect zero runtime dependencies (`docs/engineering-law.md`) and standalone repository CI isolation (`test/capabilities.test.mjs` never reaches `../seed` or other siblings on disk).
- Must keep `docs/sources/` strictly read-only during tests and ledger generation, and change sync code, `docs/sync.md`, and sync tests together in `CAP-02.9`.

## Open owner decisions

- `D2` (unratified / pending owner ruling): Two-field status (`status` lifecycle plus `claim` truth label) with fixed pairings enforced by `CAP-02`.
- `D3` (unratified / pending owner ruling): Grammar source for the hub's `CAP-02.1` test (review recommendation: `seed` as a commit-pinned `devDependency` of `docs`, keeping one grammar and zero runtime dependencies).
- `D14` (unratified / pending owner ruling): Review conventions made under delegation: `CAP-02` nine-slice split (`CAP-02.1` hub test only, `CAP-02.2` to `CAP-02.8` self-tests, `CAP-02.9` sync ledger regeneration, build order `CAP-02.2`..`CAP-02.8` -> `CAP-02.1` -> `CAP-02.9`), slice milestones, slice IDs in `dependsOn`, and `lead` vs `touches` slice and spec rules.

## Evidence

None yet (`proposed`, `planned`).

## Changes

- `2026-11-23`: Initial `CAP-02` specification drafted (`CAP-01.1`).
- `2026-11-23`: Review updates: split `CAP-02.1` and `CAP-02.9` with build order, apply slice milestone, slice dependency, and `lead` vs `touches` spec resolution rules, and align `D2`, `D3`, and `D14` (`CAP-01.1`).

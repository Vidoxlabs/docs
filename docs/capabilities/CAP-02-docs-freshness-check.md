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

Hand-maintained ledgers and cross-repository capability specs inevitably drift as slice PRs land across eight repositories. Without automated freshness tests in both the hub (`docs`) and each standalone repository, broken spec paths, invalid status/claim pairs, cyclic dependencies, malformed tool IDs, or stale `ledger.md` tables can merge silently.

## What it does

Enforces four deterministic freshness rules offline, without network access:

1. **Hub cross-repo check (`test/timeline.test.mjs` in `docs`)**:
   - Reads the `docs` repository's `docs/timeline/capabilities.json`, `docs/timeline/ledger.md`, `docs/capabilities/index.json`, and lead specs alongside synced sibling artifacts under `sources/<repo>/docs/capabilities/` (`index.json` and spec Markdown files).
   - Verifies JSON schema validity, exact 1-to-1 `lead` and symmetric `touches` alignment between `capabilities.json` and synced `index.json` files, acyclic `dependsOn` graph, valid `status`/`claim` pairs, and resolution of every synced `spec` and `contracts[]` target.
   - Fails closed if a synced source carries an unknown status/claim pair, invalid spec heading sequence, or malformed tool ID.
2. **Standalone repository self-tests (`test/capabilities.test.mjs` in each sibling repo)**:
   - Runs as part of `npm test` inside each repository (`seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`, `bloom`) without requiring any sibling checkout on disk.
   - Verifies local files on disk: `docs/capabilities/index.json` schema and entry keys, valid `status`/`claim` pairs, existence of every `lead` spec file and every listed `contracts[]` file inside the repository, existence of `docs/CHANGELOG.md` (`## Unreleased` at top) and `docs/adr/README.md`, and the 12-section order in local lead specs.
   - Validates cross-repository `touches` spec paths syntactically (`<repo>/docs/capabilities/CAP-NN-<slug>.md` naming a known family repository) without reading outside the repository tree.
3. **Generated `ledger.md` synchronization**:
   - Replaces hand maintenance of `docs/timeline/ledger.md` with a deterministic generator (preserving the generated header and sorted `CAP-01`..`CAP-19` Markdown table derived from `docs/timeline/capabilities.json` and synced `sources/<repo>/docs/capabilities/index.json` statuses).
   - `test/timeline.test.mjs` compares the generated output byte-for-byte against committed `docs/timeline/ledger.md` and fails on drift.
4. **Grammar source (`D3`)**:
   - Enforces `seed` tool-ID grammar (`domain . [resource . [sub .]] verb`, closed verb set, no forbidden vendor/infrastructure/persona segments) across all `toolIds[]` arrays and spec `### Tool IDs` tables.
   - How `docs` and non-`seed` repositories source the grammar check without adding runtime dependencies or requiring sibling checkouts remains governed by open owner decision `D3`.

## Contract touchpoints

- `docs/sync.md`: synced `sources/<repo>/docs/capabilities/` files and `manifest.json` digests feed `test/timeline.test.mjs` and ledger generation without changing the read-only GitHub sync boundary.
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

- `hub-timeline-validates-repo-and-synced-sources`: `test/timeline.test.mjs` validates `capabilities.json`, `docs/capabilities/index.json`, and synced `sources/*/docs/capabilities/` records together.
- `hub-ledger-drift-fails-closed`: modifying `capabilities.json` or synced `index.json` status without regenerating `docs/timeline/ledger.md` causes `test/timeline.test.mjs` to fail.
- `repo-self-test-runs-without-siblings`: `test/capabilities.test.mjs` passes in every sibling repository with zero sibling directories mounted, checking local paths and syntactic cross-repo spec paths.
- `invalid-status-claim-or-tool-id-rejected`: an unpermitted `status`/`claim` pair, cyclic `dependsOn`, missing `contracts[]` file, missing spec section, or invalid tool ID fails the test deterministically.

## Slices

1. `CAP-02.1` (`docs`, `proposed`): Hub timeline freshness test (`test/timeline.test.mjs`) and deterministic `ledger.md` generator.
2. `CAP-02.2` (`seed`, `proposed`): Self-test `test/capabilities.test.mjs` in `seed`.
3. `CAP-02.3` (`capillary`, `proposed`): Self-test `test/capabilities.test.mjs` in `capillary`.
4. `CAP-02.4` (`myosotis`, `proposed`): Self-test `test/capabilities.test.mjs` in `myosotis`.
5. `CAP-02.5` (`aestivation`, `proposed`): Self-test `test/capabilities.test.mjs` in `aestivation`.
6. `CAP-02.6` (`drosera`, `proposed`): Self-test `test/capabilities.test.mjs` in `drosera`.
7. `CAP-02.7` (`trellis`, `proposed`): Self-test `test/capabilities.test.mjs` in `trellis`.
8. `CAP-02.8` (`bloom`, `proposed`): Self-test `test/capabilities.test.mjs` in `bloom`.

## Non-goals

- Reading sibling repositories directly from disk during `npm test` (cross-repo checks run in `docs` against `sources/`, while each sibling runs standalone).
- Auto-committing changes across sibling repositories or bypassing PR review.
- Adding third-party schema validation or markdown parsing runtime dependencies.

## Family rules and conflicts

- Must respect zero runtime dependencies (`docs/engineering-law.md`) and standalone repository CI isolation (`test/capabilities.test.mjs` never reaches `../seed` or other siblings on disk).
- Must keep `docs/sources/` strictly read-only during tests and ledger generation.

## Open owner decisions

- `D2` (unratified / pending owner decision): Whether `scripts/sync-sources.mjs` automatically regenerates `docs/timeline/ledger.md` on scheduled sync runs or whether ledger drift is flagged for manual PR update.
- `D3` (unratified / pending owner decision): Source of the tool-ID grammar check across `test/timeline.test.mjs` and non-`seed` `test/capabilities.test.mjs` suites (inline offline grammar check matching `seed/docs/contracts/tool-id.md`, synced `sources/seed/` in `docs`, or optional dev check against `seed`).

## Evidence

None yet (`proposed`, `planned`).

## Changes

- `2026-11-23`: Initial `CAP-02` specification drafted (`CAP-01.1`).

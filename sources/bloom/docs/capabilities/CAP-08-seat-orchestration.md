# CAP-08: Seat orchestration

- ID: `CAP-08`
- Title: Seat orchestration
- Lead: `bloom`
- Touches: `seed`
- Horizon: `next`
- Milestone: `M3`
- CLI phase: `P3`
- Status: `proposed`
- Claim: `planned`
- Depends on: `CAP-07`

## Why

Bloom's team loop (`src/teams.mjs`) coordinates a head planner and specialist stages sequentially, while `docs/backend/agent-runtime.md` tracks team seats in database `members` rows. Multi-seat runs need declarative seat definitions keyed by role IDs rather than hardcoded character names or per-agent instruction files, pre-run validation so broken team documents fail before any model call, and bounded parallel fan-out that merges results deterministically in plan order.

## What it does

- Preserves deterministic coordinator and verifier roles: the head (`chair`) plans seat assignments, specialists execute in plan order, a `revise` verdict stops downstream assembly, and the deterministic verifier checks file integrity and invariants without calling any model.
- Stores seats strictly as structured data in `src/seats.mjs` alongside persisted `members` rows in `src/team-store.mjs`: stored rows, events, tool IDs, and model prompts carry closed role IDs only (`chair`, `framing`, `risk`, `coherence`, `sequencing`), never per-agent instruction files and never display names; display labels come from the design canon and are read **only by renderers** (pending owner ruling `D12`).
- Validates the declarative team document before a run starts (`CAP-08.1` in `seed`, wired in `CAP-08.2`): passes parsed `agents` and `tools` documents through `seed`'s `checkRegistryDocuments` plus tool-ID grammar checks (`parseToolId` / `checkRegistry`) and stops before any model call if any reference or ID is invalid.
- Adds bounded parallel fan-out (`CAP-08.3`): independent steps marked for parallel execution run under a strict concurrency cap, a per-step timeout, and a per-seat tool subset strictly contained within the objective's `allowedTools`, merging outputs deterministically in plan order.

## Contract touchpoints

- `docs/architecture.md`: coordinator, specialist, and deterministic verifier roles, admission checks, and review hold behavior.
- `docs/backend/agent-runtime.md`: `members` table persistence, direct vs planned execution paths, and deterministic verifier step semantics.
- `seed/docs/contracts/tool-id.md` (`CAP-08.1`): `checkRegistryDocuments`, tool-ID grammar checks, and `allowedTools` constraints.
- `seed/docs/contracts/run-model.md`: objective `allowedTools` and deterministic ordering rules.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Third-party egress | Owner gate | Summary |
| --- | --- | --- | --- | --- |

None. This capability introduces no tool IDs.

### Events

| Event | Producer | Payload fields | Notes |
| --- | --- | --- | --- |
| `team.call` | `bloom` (`src/teams.mjs`) | `actor`, `roleId`, `calls`, `limit`, `phase`, `stepIndex` | Records seat role ID and step order for planned and fan-out calls |
| `team.message` | `bloom` (`src/teams.mjs`) | `author`, `roleId`, `text`, `epoch`, `assignments`, `verdict` | Carries ordered assignments, review verdicts, and deterministic verifier output |
| `team.usage` | `bloom` (`src/teams.mjs`) | `actor`, `roleId`, `calls`, `limit`, `model`, `usage`, `costUSD` | Records per-seat usage independently through `src/provider.mjs` |

## Acceptance tests

- `invalid-team-document-stops-before-model-call`: malformed `agents` or `tools` document, unknown tool in `allowedTools`, or invalid tool ID stops via `checkRegistryDocuments` before invoking the provider.
- `revise-verdict-blocks-assembly`: a specialist review returning `revise` halts assembly and downstream assignments.
- `deterministic-verifier-makes-zero-model-calls`: verifier seat validates hashes and invariants deterministically with zero calls to `provider.generate`.
- `seats-data-uses-role-ids-only-no-instruction-files`: `src/seats.mjs`, `members` rows, emitted events, tool IDs, and model prompts carry only `chair`, `framing`, `risk`, `coherence`, and `sequencing` role IDs with no display names or instruction markdown files, while display labels come from the design canon and are read only by renderers (pending `D12`).
- `bounded-fanout-respects-concurrency-timeout-and-tool-subset`: parallel fan-out enforces max concurrency, cancels/times out slow steps at per-step limit, and rejects tools outside the seat's subset of objective `allowedTools`.
- `fanout-merges-results-in-plan-order`: regardless of completion arrival order, merged messages and artifacts match original plan step order.

## Slices

- `CAP-08.1` (`seed`, milestone `M3`, status `proposed`): Declarative team document validation checks.
- `CAP-08.2` (`bloom`, milestone `M3`, status `proposed`): Declarative seats data, role IDs, and deterministic verifier handoff.
- `CAP-08.3` (`bloom`, milestone `M3`, status `proposed`): Bounded parallel fan-out with timeout, tool subset, and plan-order merge.

## Non-goals

- Storing per-seat prompt or instruction markdown files in the repository (`AGENTS.md` prohibits agent instruction directories).
- Allowing any seat to expand `allowedTools` beyond the objective's admitted set.
- Defining the plan review state machine or owner plan-gate records (`CAP-07` in `aestivation`).

## Family rules and conflicts

- Stored seat rows (`src/seats.mjs` and `members` rows), events, tool IDs, and model prompts carry only the five closed role IDs (`chair`, `framing`, `risk`, `coherence`, `sequencing`); display labels come from the design canon and are read **only by renderers** (pending `D12`).
- Pre-run validation delegates to `seed`'s `checkRegistryDocuments` and `parseToolId` rather than duplicating registry validation in Bloom.
- Sequencing note: `CAP-08` (`M3`) depends on `CAP-07` (`M3`), which depends on `CAP-06.1` (owner-gate decision record at `M3`, with `CAP-07.3` plan-digest binding folded into `CAP-06.1` under `D14`), keeping all of `CAP-08` inside `M3`.

## Open owner decisions

- `D12` (pending owner ruling): seats ruling confirming that `src/seats.mjs` and `members` rows store closed role IDs (`chair`, `framing`, `risk`, `coherence`, `sequencing`) while display labels live in the design canon and are read only by renderers, how `src/seats.mjs` aligns with or supersedes starter `members` rows in `docs/backend/agent-runtime.md`, plus default concurrency cap and step timeout values.
- `D14` (pending owner confirmation unless overridden): `CAP-06.1` ships at `M3` with `CAP-07.3` folded in so `CAP-07` depends on `CAP-06.1` at `M3`.

## Evidence

- None yet (`claim: planned`).

## Changes

- `2026-11-23`: Clarified role-ID storage vs renderer-only design-canon display labels (`D12`), updated `CAP-07` sequencing note to `CAP-06.1` at `M3` (`D14`), and added `M3` slice milestones.
- `2026-11-23`: Initial capability specification created in Phase 0 timeline scaffold.

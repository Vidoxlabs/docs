# CAP-10: Trace and observability

- ID: `CAP-10`
- Title: Trace and observability
- Lead: `bloom`
- Touches: `seed`
- Horizon: `next`
- Milestone: `M4`
- CLI phase: `P4`
- Status: `proposed`
- Claim: `planned`
- Depends on: `CAP-04`

## Why

`Store` (`src/store.mjs`) and SSE streaming (`src/http.mjs`) already persist and stream numbered events, but team and coding turns emit different payloads without uniform correlation IDs, there is no `bloom trace` replay or static HTML export command, and private content plus endpoint privacy rules require explicit digest redaction across stored events and exports.

## What it does

- Unifies team and coding runs onto one append-only typed event stream with monotonic sequence numbers (`seq`) and correlation IDs (`run`, `attempt`, `step`, `seat`) specified in `CAP-10.1` (`seed`) and emitted by `bloom` (`CAP-10.2`).
- Supports four read-only renderer views driven strictly from the persisted event stream (renderers never mutate run state or call providers):
  1. Full state post-step view
  2. Deltas-only view
  3. Debug view (correlation IDs, digests, counts, refusal codes)
  4. Token deltas view (streamed model text chunks)
- Implements `bloom trace <run>` (`CAP-10.3`) to replay a stored run step-by-step in the terminal or export a self-contained static HTML trace report with zero external network links or third-party assets.
- Enforces digest redaction and endpoint privacy: private content (private notes, redacted tool or memory payloads) is logged using SHA-256 digests and byte/character counts rather than raw private text, and configured provider endpoint addresses and credentials are never recorded in events or exports.
- Aggregates per-seat and per-step usage across `seed`'s five-field token record (`input`, `output`, `total`, `cacheRead`, `cacheWrite`) and optional reported `costUSD`, keeping unreported metrics `null`.

## Contract touchpoints

- `docs/architecture.md`: durable event sequence numbers, SSE replay, provider usage ledger (`costUSD` beside usage), and private-note scoping.
- `seed/docs/contracts/run-model.md` (`CAP-10.1`): correlation IDs (`run`, `attempt`, `step`, `seat`) on run trace records.
- `seed/docs/contracts/provider.md`: normalized five-field `usage` record.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Third-party egress | Owner gate | Summary |
| --- | --- | --- | --- | --- |

None. This capability introduces no tool IDs.

### Events

| Event | Producer | Payload fields | Notes |
| --- | --- | --- | --- |
| `turn.started` | `bloom` (`src/store.mjs`) | `seq`, `run`, `attempt`, `model`, `title` | Starts correlated trace span for a run attempt |
| `assistant.delta` | `bloom` (`src/harness.mjs`) | `seq`, `run`, `attempt`, `step`, `seat`, `text` | Streamed text delta consumed by the token-delta view |
| `tool.updated` | `bloom` (`src/harness.mjs`) | `seq`, `run`, `attempt`, `step`, `seat`, `toolId`, `status`, `outputSha256`, `truncatedBytes` | Typed tool lifecycle record with digest metadata |
| `team.call` | `bloom` (`src/teams.mjs`) | `seq`, `run`, `attempt`, `step`, `seat`, `actor`, `phase` | Correlated model dispatch marker |
| `team.usage` | `bloom` (`src/teams.mjs`) | `seq`, `run`, `attempt`, `step`, `seat`, `model`, `usage`, `costUSD` | Per-seat and per-step token usage and reported cost |
| `team.recall` | `bloom` (`src/teams.mjs`) | `seq`, `run`, `attempt`, `step`, `seat`, `hit`, `count`, `digests` | Records memory participation using digests/counts under strict redaction |
| `turn.finished` | `bloom` (`src/store.mjs`) | `seq`, `run`, `attempt`, `status`, `reason` | Closes correlated trace span |

## Acceptance tests

- `stream-preserves-monotonic-seq-and-correlation-ids`: every emitted event carries strictly increasing `seq` and valid `run`, `attempt`, `step`, and `seat` correlation IDs.
- `four-renderer-views-read-only-over-same-stream`: full-state, deltas-only, debug, and token-deltas views render deterministically from the persisted event stream without mutating state.
- `bloom-trace-replays-steps-and-exports-self-contained-html`: `bloom trace <run>` replays events step-by-step and emits a single self-contained HTML file with zero external requests.
- `private-content-stored-as-digests-and-endpoint-address-never-recorded`: private memory text and endpoint addresses/credentials never appear in stored events or exported HTML.
- `per-seat-and-per-step-usage-preserves-null-for-missing-metrics`: usage summaries break down token fields and `costUSD` by `seat` and `step` while keeping missing counts as `null`.

## Slices

- `CAP-10.1` (`seed`, milestone `M4`, status `proposed`): Correlation IDs on run trace records.
- `CAP-10.2` (`bloom`, milestone `M4`, status `proposed`): Unified append-only typed event stream and four renderer views.
- `CAP-10.3` (`bloom`, milestone `M4`, status `proposed`): Trace replay command, HTML export, digest redaction, and per-seat usage.

## Non-goals

- Adding a third-party terminal UI library (zero runtime dependencies remain law).
- Streaming traces to a remote observability backend or loading external scripts/styles in HTML exports.
- Estimating missing token counts or fabricating monetary cost savings.

## Family rules and conflicts

- Zero new runtime dependencies: terminal renderer and HTML export use Node.js built-ins and Bloom's self-hosted Nocturne CSS snapshot.
- Renderers are strictly read-only consumers of the event stream.
- Endpoint URLs, credentials, and raw private notes must never reach stored traces or exports.

## Open owner decisions

- `D12` (pending owner ruling): renderer ruling without a third-party TUI library, governing terminal view formatting and planned for `docs/adr/0001-terminal-renderer.md`.

## Evidence

- None yet (`claim: planned`).

## Changes

- `2026-11-23`: Added `M4` slice milestones across `CAP-10.1`..`CAP-10.3` and aligned `D12` ADR status reference.
- `2026-11-23`: Initial capability specification created in Phase 0 timeline scaffold.

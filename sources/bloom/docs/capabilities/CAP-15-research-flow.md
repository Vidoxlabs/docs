# CAP-15: Research flow

- ID: `CAP-15`
- Title: Research flow
- Lead: `bloom`
- Touches: `capillary`, `aestivation`, `drosera`
- Horizon: `later`
- Milestone: `M8`
- CLI phase: `none`
- Status: `proposed`
- Claim: `planned`
- Depends on: `CAP-05`, `CAP-07`, `CAP-08`

## Why

Today `src/sources.mjs` (`importURL`) only retrieves literal HTTPS URLs pasted into a brief by the user (`src/teams.mjs`). Complex investigations need coordinator routing between a direct answer and a structured research workflow, optional local context scanning, an owner-approved research plan before external egress, owner-gated source searches, and a reporter that ties every factual claim to recorded sources or labels gaps explicitly.

## What it does

- **Coordinator routing (`CAP-15.4`)**: The coordinator (`chair`) evaluates whether the prompt can be answered directly from admitted local context or requires a multi-step research workflow.
- **Optional background scan**: When local context is needed first, a bounded workspace scan gathers project context via `capillary`'s context packer (`CAP-05`) before planning external research.
- **Owner-approved typed research plan (`CAP-15.2` in `aestivation`)**: Proposes a plan with typed steps (`research`, `analysis`, `processing`) routed through `CAP-07` (`aestivation` validation plus owner approval or edit) before any search or processing step executes.
- **Owner-gated search and read (`CAP-15.1` in `drosera`, `CAP-15.4` in `bloom`)**: External search runs through `research.source.search` (`effect: read`, `thirdPartyEgress: true`), passing through the `CAP-06` owner gate before leaving the owner's system. Retrieved public documents are stored as recorded `capillary` sources with SHA-256 digests (`CAP-15.3`).
- **Cited reporter (`CAP-15.3` in `capillary`, `CAP-15.4` in `bloom`)**: Final research output cites recorded `capillary` source IDs and digests for claims; any claim lacking a supporting recorded source is explicitly flagged as uncited rather than presented as verified.
- **Plan revision and step caps**: Research plans enforce strict per-run step limits and plan revision limits; reaching either limit stops further exploration and reports the limit reason cleanly.

## Contract touchpoints

- `docs/architecture.md`: public source retrieval rules (`src/sources.mjs`), coordinator planning, evidence packet bounds.
- `drosera/docs/contracts/tools.md` (`CAP-15.1`): `research.source.search` tool face with `thirdPartyEgress: true`.
- `aestivation/docs/contracts/plan.md` (`CAP-15.2`): typed research steps (`research`, `analysis`, `processing`) and step/revision caps.
- `capillary/docs/contracts/retrieval.md` (`CAP-15.3`): cited source attachment and uncited-claim flagging.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Third-party egress | Owner gate | Summary |
| --- | --- | --- | --- | --- |
| `research.source.search` | `read` | `true` | `true` | Search public sources through an owner-gated external connector |

### Events

| Event | Producer | Payload fields | Notes |
| --- | --- | --- | --- |
| `plan.proposed` | `bloom` / `aestivation` | `run`, `planDigest`, `steps`, `stepTypes` | Emitted when coordinator proposes a typed research plan |
| `plan.decision` | `bloom` | `run`, `planDigest`, `decision` | Records owner approval, edit, or rejection via `CAP-07` before research egress |
| `permission.requested` | `bloom` (`src/harness.mjs`) | `id`, `toolId`, `argsDigest`, `thirdPartyEgress` | Owner gate prompt for `research.source.search` per `CAP-06` |
| `context.packet` | `bloom` / `capillary` | `run`, `sourceIds`, `digests`, `omissions` | Records scan and fetched source attachments without raw private leaks |

## Acceptance tests

- `coordinator-routes-direct-answer-vs-research-plan`: simple local requests answer directly while multi-source investigations enter the research flow.
- `research-plan-requires-owner-approval-before-egress`: typed research steps (`research`, `analysis`, `processing`) pause for `CAP-07` owner approval before calling search or processing.
- `research-source-search-triggers-third-party-egress-gate`: invoking `research.source.search` enforces `thirdPartyEgress: true` and `ownerGate: true` via `CAP-06`.
- `reporter-cites-recorded-sources-and-labels-uncited-claims`: factual claims link to recorded `capillary` source IDs and any unsupported claim carries an explicit uncited label.
- `step-and-revision-caps-halt-run-with-reason`: exceeding research step cap or plan revision cap terminates further research deterministically with a stated reason.

## Slices

- `CAP-15.1` (`drosera`, milestone `M8`, status `proposed`): Research source search face with third-party egress metadata.
- `CAP-15.2` (`aestivation`, milestone `M8`, status `proposed`): Typed research plan steps and step/revision caps.
- `CAP-15.3` (`capillary`, milestone `M8`, status `proposed`): Cited source attachment and uncited-claim flagging.
- `CAP-15.4` (`bloom`, milestone `M8`, status `proposed`): Coordinator research routing, scan, gated search, and cited reporter.

## Non-goals

- Allowing a model to initiate unapproved outbound web searches or crawl private networks (`src/sources.mjs` keeps public IPv4/HTTPS restrictions).
- Fabricating citations or concealing unverified claims as source-backed findings.
- Adopting `capillary`, `aestivation`, or `drosera` inside `bloom` before their `M2`/`M3` integration slices land.

## Family rules and conflicts

- Model output never initiates unapproved network egress; `research.source.search` carries `thirdPartyEgress: true` and `ownerGate: true` per `seed/docs/contracts/tool-id.md`.
- Unknown or missing source support stays explicitly labeled uncited per the family engineering law.

## Open owner decisions

- Default step cap, plan revision cap, and permitted public search connector bindings remain open for owner decision ahead of `M8`.

## Evidence

- None yet (`claim: planned`).

## Changes

- `2026-11-23`: Added `M8` slice milestones across `CAP-15.1`..`CAP-15.4`.
- `2026-11-23`: Initial capability specification created in Phase 0 timeline scaffold.

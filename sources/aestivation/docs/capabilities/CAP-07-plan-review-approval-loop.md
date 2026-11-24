# CAP-07: Plan review and approval loop

- ID: `CAP-07`
- Title: Plan review and approval loop
- Lead: `aestivation`
- Touches: `seed`, `bloom`
- Horizon: `next`
- Milestone: `M3`
- CLI phase: `P3`
- Status: `proposed`
- Claim: `planned`
- Depends on: `CAP-06.1`

## Why

Multi-step workspace runs need an explicit, deterministic plan-review and owner-approval loop so plans carry role-bound steps, hold when a clarifying question is open, enforce a strict step status machine, bound revisions per run, and never mistake a reviewer verdict or model belief for owner ratification.

## What it does

- **Plan payload extensions (`CAP-07.1`)**: a plan proposal carries `request` (the task request), `seats` (role IDs only from the closed set `chair`, `framing`, `risk`, `coherence`, `sequencing`), `knownFacts` (explicit grounded facts), `steps` (each carrying a seat role ID from that closed set, a stage, a title, and an `action`), `summary`, and an optional `clarifyingQuestion`. When `clarifyingQuestion` is present, the plan is held until the owner answers; no execution step advances while held.
- **Step status machine (`CAP-07.1`)**: every plan step holds a status in the closed set `{ planned, awaiting-review, approved, rejected, running, done, failed, cancelled }`. Transitions follow the full deterministic table below; every transition absent from the table (including skipping review, reversing direction, or leaving terminal statuses `rejected`, `done`, `failed`, `cancelled`) is illegal and refused.

| From status | Allowed next statuses | Meaning |
| :--- | :--- | :--- |
| `planned` | `awaiting-review`, `cancelled` | Submitted for review or cancelled before review |
| `awaiting-review` | `approved`, `rejected`, `cancelled` | Review outcome recorded or cancelled while awaiting review |
| `approved` | `running`, `cancelled` | Execution begins after assembly gate and owner approval, or cancelled |
| `rejected` | (none, terminal) | Rejected step ends; revision opens a new proposal version |
| `running` | `done`, `failed`, `cancelled` | Step finishes, fails, or is cancelled |
| `done` | (none, terminal) | Completed step |
| `failed` | (none, terminal) | Failed step |
| `cancelled` | (none, terminal) | Cancelled step |

- **Review verdicts and assembly gate**: review verdicts remain `aestivation`'s responsibility (`approve`, or `revise` with mandatory reasons). `assemblyGate` stays closed on `plan-invalid`, `ledger-unsound` (any malformed verdict record or dangling plan reference), `awaiting-verdict`, `review-stale` (digest mismatch), and `revisions-requested`.
- **Owner plan approval separated from review (`CAP-07.2`, `CAP-06.1`)**: owner approval is a separate act. The owner accepts, edits, or rejects the plan; the decision is recorded as a `seed` owner-gate record (`CAP-06.1` at `M3`) bound to the plan's canonical SHA-256 `planDigest`. `aestivation` never ratifies on the owner's behalf, and memory records, model beliefs, or reviewer `approve` verdicts never count as owner approval. Editing the plan produces a new `planDigest` and invalidates prior verdicts or owner approvals.
- **Per-run revision cap (`CAP-07.2`)**: each run enforces an explicit per-run revision cap. Reaching the cap stops further revision rounds and holds the plan with a stated reason instead of looping without bound.

## Contract touchpoints

- `aestivation/docs/contracts/plan.md`: plan payload fields (`request`, `seats`, `knownFacts`, `steps` with seat role ID and `action`, `summary`, optional `clarifyingQuestion`), step status machine, and per-run revision cap (`CAP-07.1`, `CAP-07.2`).
- `aestivation/docs/contracts/verdict.md`: `approve` and `revise` verdict records with mandatory reasons on `revise` and append-only ledger soundness checks.
- `aestivation/docs/contracts/gate.md`: `assemblyGate` precedence (`plan-invalid`, `ledger-unsound`, `awaiting-verdict`, `review-stale`, `revisions-requested`) and non-ratification guarantee.
- `seed/docs/contracts/run-model.md`: `seed` owner-gate decision record binding to `planDigest` (`CAP-06.1` at `M3`).
- `bloom/docs/architecture.md`: loop wiring and emission of `plan.*` events (`CAP-07.4`).

## Tool IDs and events

### Tool IDs

No new tool IDs are introduced by `CAP-07`.

| Tool ID | Effect class | Description |
| :--- | :--- | :--- |

### Events

| Event | Emitted by | Payload summary |
| :--- | :--- | :--- |
| `plan.proposed` | `bloom` | `planId`, `planDigest`, `request`, `seats` (role IDs), `steps`, `summary`, optional `clarifyingQuestion` |
| `plan.verdict` | `bloom` | `planId`, `planDigest`, `decision` (`approve` or `revise`), `judge` role ID, `reasons` |
| `plan.gate` | `bloom` | `planId`, `planDigest`, `permitted`, `held` reason (if held), ledger soundness status |
| `plan.decision` | `bloom` | `seed` owner-gate decision (`approve`, `edit`, `reject`, `respond`) bound to `planDigest` |

## Acceptance tests

- `step-status-legal-transitions`: every legal transition in the eight-status table succeeds and returns a frozen step record.
- `step-status-illegal-moves-refused`: every illegal move not listed in the transition table (across all 8 x 8 pairs plus unknown statuses, including `planned` to `running`, `planned` to `approved`, and any exit from terminal states `rejected`, `done`, `failed`, `cancelled`) is explicitly tested and refused.
- `clarifying-question-holds-plan`: a plan containing `clarifyingQuestion` holds execution until the owner answers.
- `unsound-ledger-closes-assembly-gate`: a malformed verdict or unknown plan reference causes `assemblyGate` to hold with `ledger-unsound` and `verdict: null`.
- `review-verdict-and-memory-never-ratify`: a reviewer `approve` verdict, model belief, or memory entry never counts as owner approval; execution remains blocked until a `seed` owner-gate record (`CAP-06.1`) bound to `planDigest` records owner acceptance or edit.
- `owner-edit-updates-plan-digest`: an owner edit yields a new `planDigest`, invalidating any earlier verdict or decision for the superseded digest.
- `revision-cap-holds-with-stated-reason`: reaching the per-run revision cap refuses further revision attempts and holds the plan with a stated reason.

## Slices

- `CAP-07.1` (`aestivation`, `M3`, `proposed`): Plan payload extensions, clarifying question hold, and step status machine.
- `CAP-07.2` (`aestivation`, `M3`, `proposed`): Revision cap and separation of review verdict from owner approval.
- `CAP-07.4` (`bloom`, `M3`, `proposed`): Plan review loop wiring and plan events (`plan.proposed`, `plan.verdict`, `plan.gate`, `plan.decision`).

## Non-goals

- Executing or scheduling plan steps inside `aestivation` (execution belongs to `bloom` and `seed`).
- Letting `aestivation`, a model reviewer, or memory ratify a plan on the owner's behalf.
- Defining seat instruction files or character personas (seats use closed role IDs only).
- Adding persistence or I/O inside `aestivation` (durable storage belongs to `CAP-13`).

## Family rules and conflicts

- Role IDs only: `seats` and step assignments use only `chair`, `framing`, `risk`, `coherence`, and `sequencing`, never persona names.
- Deterministic checks outrank reviewer judgment: `assemblyGate` rejects invalid plans and unsound ledgers regardless of any `approve` verdict.
- `aestivation` remains a zero-dependency pure reference library with no I/O, no model calls, and no sibling imports.

## Open owner decisions

- **D14 (pending owner decision)**: Under the review sequencing convention, `CAP-06.1` (`seed` owner-gate record binding to `planDigest`) lands at `M3` with `CAP-07.3` folded into `CAP-06.1` (`CAP-07.4` preserved without renumbering), and `CAP-07` depends on `CAP-06.1` at `M3` ahead of `CAP-06.2` through `CAP-06.4` at `M4`.
- Per-run revision cap default and owner plan-gate threshold (pending owner decision, not yet numbered): confirm the default per-run revision cap and whether owner plan approval gates every multi-step plan or only plans exceeding declared effect thresholds.

## Evidence

- Status `planned`: Phase 0 specification created. Baseline plan validation, verdict ledger soundness, `assemblyGate`, read-only intent assessment, and bounded two-replan corrections are implemented and verified by `npm test` in `aestivation` (`0.5.0`); `CAP-07.1` and `CAP-07.2` extensions remain to be implemented.

## Changes

- `2026-11-23`: Initial Phase 0 specification (`CAP-01`).
- `2026-11-23`: Folded `CAP-07.3` into `CAP-06.1` and updated dependency to `CAP-06.1` (`D14`).
- `2026-11-23`: Removed `D12` attribution from the unnumbered revision-cap and owner plan-gate threshold open question and formatted capability IDs in Changes (`CAP-01.5`).

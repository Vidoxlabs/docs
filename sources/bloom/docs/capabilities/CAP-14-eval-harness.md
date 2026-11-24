# CAP-14: Eval harness

- ID: `CAP-14`
- Title: Eval harness
- Lead: `bloom`
- Touches: `seed`, `trellis`
- Horizon: `next` (`CAP-14.1`, `CAP-14.2` in `M5`; `CAP-14.3`, `CAP-14.4` in `later` `M8`)
- Milestone: `M5` (`CAP-14.1`, `CAP-14.2` at `M5`; `CAP-14.3`, `CAP-14.4` at `M8`)
- CLI phase: `P5`
- Status: `in-progress`
- Claim: `specified`
- Depends on: `CAP-10`

## Why

Bloom needs repeatable, deterministic evaluation over coding and team workflows so changes to prompts, tool schemas, context packing, or orchestration can be measured locally against known cases and saved baselines without manual testing or opaque scores.

## What it does

- Defines a structured dataset format of evaluation cases, each carrying `id`, `input` (prompt, workspace fixture, admitted tools), `expected` assertions, and `metadata` (tags, suite tier, baseline reference).
- Runs deterministic evaluators first on every case:
  - `exact`: exact normalized text equality.
  - `contains`: required substring or pattern presence.
  - `schema-valid`: output conformance via `CAP-03` schema validation.
  - `tool-trajectory`: invoked tool IDs checked in exact order or as an unordered set.
  - `files-changed`: expected modified file paths and content digests inside the isolated fixture workspace.
  - `tests-pass`: deterministic command exit check inside the fixture workspace.
- Supports an optional model-based evaluator only when explicitly enabled, always labeled `judge` in outputs and reports, and never allowed as the sole pass criterion (any deterministic evaluator failure fails the case).
- Executes offline cases against scripted response queues and pure function model test doubles behind `seed`'s provider seam (`CAP-14.1` in `seed`, `src/provider.mjs`).
- Generates an experiment report recording per-case verdict, deterministic evaluator outcomes, optional `judge` score, five-field token usage, reported `costUSD`, duration in milliseconds, and delta against a saved baseline report (`CAP-14.3`).
- Adds `bloom eval --smoke` (`CAP-14.2`) to execute the fast offline smoke dataset deterministically, and exposes `eval.suite.execute` as the neutral tool face.

## Contract touchpoints

- `docs/architecture.md`: provider seam (`src/provider.mjs`), scripted verification boundaries.
- `seed/docs/contracts/provider.md` (`CAP-14.1`): scripted and function model test doubles conforming to `validateProvider` and `normalizeGeneration`.
- `trellis/docs/contracts/probes.md` (`CAP-14.4`): consistency and determinism probes from outside the call path.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Third-party egress | Owner gate | Summary |
| --- | --- | --- | --- | --- |
| `eval.suite.execute` | `read` | `false` | `false` | Execute an evaluation suite over a dataset of cases and return a structured report |

### Events

| Event | Producer | Payload fields | Notes |
| --- | --- | --- | --- |
| `eval.case.started` | `bloom` | `run`, `caseId`, `dataset`, `smoke` | Marks start of an isolated case run |
| `eval.case.finished` | `bloom` | `run`, `caseId`, `passed`, `evaluators`, `judge`, `usage`, `costUSD`, `durationMs` | Records deterministic results, labeled `judge` if run, usage, and duration |
| `eval.report.written` | `bloom` | `run`, `dataset`, `passedCount`, `failedCount`, `baselineDiff` | Summarizes suite outcome and baseline comparison |

## Acceptance tests

- `smoke-dataset-runs-offline-with-deterministic-evaluators`: `bloom eval --smoke` runs the smoke dataset with zero network calls and produces a deterministic pass/fail report.
- `deterministic-evaluators-cover-exact-contains-schema-trajectory-files-tests`: all six deterministic evaluator kinds (`exact`, `contains`, `schema-valid`, `tool-trajectory`, `files-changed`, `tests-pass`) pass on matching fixtures and fail on mismatches.
- `judge-output-always-labeled-and-never-sole-pass-criterion`: enabling a model judge labels its output `judge` and keeps overall `passed: false` whenever any deterministic check fails.
- `scripted-and-function-doubles-conform-to-seed-provider-seam`: scripted and function model doubles pass `validateProvider` and `normalizeGeneration`.
- `experiment-report-captures-usage-duration-and-baseline-diff`: report emits per-case result, token usage, duration, and baseline diff cleanly.

## Slices

- `CAP-14.1` (`seed`, milestone `M5`, status `proposed`): Scripted and function model test doubles.
- `CAP-14.2` (`bloom`, milestone `M5`, status `proposed`): Smoke eval dataset, deterministic evaluators, and smoke command (`next`, `M5`, `P5`).
- `CAP-14.3` (`bloom`, milestone `M8`, status `proposed`): Full eval suite, labeled judge option, and baseline diff reports (`later`, `M8`).
- `CAP-14.4` (`trellis`, milestone `M8`, status `proposed`): Eval harness consistency and determinism probes (`later`, `M8`).

## Non-goals

- Calling hosted or live network models during `npm test` or `bloom eval --smoke`.
- Allowing an ungrounded model judge to override failing deterministic assertions.
- Mutating the user's real workspace during evaluation (cases run in isolated temporary copies).

## Family rules and conflicts

- Model test doubles belong in `seed` (`CAP-14.1`); eval execution belongs in `bloom` (`CAP-14.2`, `CAP-14.3`); consistency probes belong in `trellis` (`CAP-14.4`) without importing `bloom`.
- Smoke evaluation (`M5`, `P5`) stays decoupled from the full suite (`M8`, `Later`) so `P5` ships early and reliably.

## Open owner decisions

- Decided 2026-11-24 in bloom#16: Should the scripted and pure-function model doubles move to Seed in a later draft PR? I recommend proving them in Bloom first, then upstreaming them. Owner's answer, relayed (owner typed in code-agent chat, not seen by reviewers): "Upstream them later".
- Baseline report storage path and full-suite dataset curation criteria for `M8` (`CAP-14.3`) remain open for owner guidance; `CAP-14.1` and `CAP-14.2` require no blocking decision.

## Evidence

- `test/smoke-eval.test.mjs` runs the smoke command twice with a denied transport, checks deterministic assertions, and exercises both fixture provider doubles through Seed.

## Changes

- 2026-11-24. Add the offline smoke command, six deterministic assertions and case/report events (CAP-14, bloom#16).
- `2026-11-23`: Added explicit `M5` (`CAP-14.1`, `CAP-14.2`) and `M8` (`CAP-14.3`, `CAP-14.4`) slice milestones.
- `2026-11-23`: Initial capability specification created in Phase 0 timeline scaffold.

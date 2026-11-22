# Contract: plan

Label: `specified` (shape), `implemented` (rule pack in `src/plan.mjs`).

## Shape

```
proposal { id, objective, steps[], digest }
step     { stage, title }
stage    one of: research, work, review, assemble, verify
```

## The closed set of stages

| Stage | Meaning |
| :--- | :--- |
| `research` | Gathering evidence and reading context. |
| `work` | Making changes, producing artifacts. |
| `review` | Judgment on the proposal's outputs, recorded as verdicts. |
| `assemble` | Automatic assembly of the plan's outputs. |
| `verify` | Deterministic verification of the assembled result. |

## Baseline rule pack

1. **Non-empty.** A plan with zero steps is not a plan.
2. **Known stages.** A step naming an unknown stage is rejected, not guessed.
3. **Titled.** A step without a title is rejected.
4. **Review precedes assemble.** When both are present, the first `review` step comes before the first `assemble` step. Assembly without review before it is the failure mode this loop exists to prevent.
5. **Verify is final.** When a `verify` step is present, it is the last step. Deterministic verification comes after assembly, before anything opens.

All five are shape and order rules. None of them judges content.

## Validation output

```
{ ok: boolean, errors: string[] }   — errors carries every violated rule, not the first
```

A validation result is data. The gate consumes it; a caller may not string-match a validation's prose, because prose changes and rules stay.

## The plan digest

`implemented` in `src/plan.mjs`. `planDigest(proposal)` is the SHA-256, in 64 lowercase hex, of the proposal's content as canonical JSON: `{ id, objective, steps }`, every step with all of its fields, object keys sorted, undefined members dropped, no whitespace. `planProposal` stores it as `digest`. Key order does not change the digest; any change to the id, the objective, a step's fields, or the step list does. A verdict names this digest to say which version of the plan it reviewed (see the verdict contract), and that is how "the proposal reviewed is the proposal assembled" is checked.

## Intent assessment

`implemented` in `src/intent.mjs`. An intent assessment is advice about a request:
`{ label, needs, confidence, authority: 'advisory', evidencePolicy }`, frozen. `needs` lists evidence
needs from `project-knowledge`, `live-state`, `durable-memory`, and `none`.

1. **It grants nothing.** An input carrying `tools`, `allowedTools`, `memoryWrites`,
   `grants`, `scopes`, or `actions` is refused.
2. **It is read-only.** `admitWithIntent(admission, assessment)` returns the admission's
   `allowedTools` and `memoryWrites`, copied and frozen, unchanged. The input is not
   mutated. A `durable-memory` need sets `memoryRecallAdvised`: advice to read, never a
   write.
3. **Only a real record composes.** A look-alike object, or a copy of a record, is
   refused, so a forged assessment cannot add a tool.
4. **Missing evidence is named.** `evidencePolicy.missingSource` is `state-unavailable`.
   The caller can supply `availableSources` with evidence types it verified. Composition
   returns a frozen `evidence` record with `missingSources` and a `statement` naming
   each gap. The statement is `null` when all required evidence is available.
5. **Personal recall uses admitted memory.** `evidencePolicy.personalRecall` is
   `admitted-memory-only`. A `durable-memory` need is met only by nonempty
   `admission.admittedMemory`, a list of references already admitted by the caller.
   The evidence record copies those references for a recall need. Conversation history,
   an assessment's input fields and the generic source list cannot satisfy that need.

## Corrections

`implemented` in `src/correction.mjs`. `correctPlan({ previous, verdict, author,
objective?, steps? })` answers a revise verdict:

1. The verdict must be a `revise` of `previous.id` at `previous.digest`. An approval is
   refused with `correction-not-needed`; a review of another version, or of no named
   version, with `review-mismatch`.
2. The previous proposal is not edited. The correction is a new frozen proposal with the
   same id and a new digest, and a record `{ planId, previousDigest, digest, reviewedBy,
   author, reasons }`. A correction that leaves the digest unchanged is refused with
   `correction-unchanged`.
3. The judge who asked for the revision cannot apply it: an `author` equal to the
   verdict's judge, or no author, is refused with `reviewer-cannot-apply`.
4. An approval of the previous digest does not open the gate for the correction. The
   gate holds it as `review-stale` until the new digest is reviewed.
5. Each parent proposal can spend two successful replans in its in-process lineage.
   `correctPlan` retires the old digest when it returns the next proposal. A correction
   from a retired proposal or back to a retired digest is refused with `order-superseded`.
   The third replan is refused with `replan-exhausted`. Refusals spend no replan.
6. Before consuming a result, call `assertCurrentPlanResult(proposal, { planId,
   planDigest })` with the proposal instance held by the run. The check refuses retired
   digests with `order-superseded` and other mismatches with `result-mismatch`. Retain
   the returned proposal for the next review or result check. A reconstructed proposal
   starts a separate in-memory lineage.
7. The caller declares expansion with `scopeExpanding`, `expandWorkspace`,
   `expandPaths`, or `newCriterionGrant`. Both flags default to `false` and both
   scope values default to `null`. A true flag or a non-null scope value throws
   `ScopeExpansionError` with code `authority-required` before any change to the
   lineage or budget. The previous proposal remains current.

## Prohibitions

- No silent step injection. The proposal reviewed is the proposal assembled; steps appearing after review are a new proposal.
- No stage migration inside a plan object. A plan is frozen on creation.
- No rule pack may approve on a reviewer's behalf, and no reviewer verdict may waive a rule.

## Changes

- `0.5.0` — `correctPlan` accepts optional scope fields and refuses requested
  expansion. `ScopeExpansionError` extends `CorrectionError`. Calls within the
  existing scope keep the original correction contract.

- `0.4.0` — intent assessments and corrections are new. Additive: no existing export
  changed.

- `0.3.0` — `planDigest` and the proposal's `digest` field are new. Additive: validation and proposal construction are otherwise unchanged.

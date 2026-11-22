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

## Prohibitions

- No silent step injection. The proposal reviewed is the proposal assembled; steps appearing after review are a new proposal.
- No stage migration inside a plan object. A plan is frozen on creation.
- No rule pack may approve on a reviewer's behalf, and no reviewer verdict may waive a rule.

## Changes

- `0.3.0` — `planDigest` and the proposal's `digest` field are new. Additive: validation and proposal construction are otherwise unchanged.

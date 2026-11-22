# Contract: the assembly gate

Label: `specified` (rules), `implemented` (in `src/gate.mjs`).

## Shape

```
assemblyGate({ validation, verdicts, planId, planDigest?, knownPlanIds? }) → { permitted, held, validation, ledger, verdict }
```

## The gate's one question

Is automatic assembly of this plan permitted? The answer is composed from the validation and the verdict ledger, in a fixed order:

| Order | Condition | Held reason |
| :--- | :--- | :--- |
| 1 | `validation.ok === false` | `plan-invalid` |
| 2 | the verdict ledger is unsound | `ledger-unsound` |
| 3 | no verdict exists for the plan | `awaiting-verdict` |
| 4 | a `planDigest` was given and the latest verdict names a different one, or none | `review-stale` |
| 5 | latest verdict is `revise` | `revisions-requested` |
| — | none of the above: valid plan, sound ledger, latest verdict `approve` (of this exact version, when a digest was given) | (permitted) |

The held reasons are closed and exported in this order as `HELD_REASONS`.

## Why the order is the order

1. **Deterministic outranks judgment.** An invalid plan is held even when a reviewer approved. The rule pack's rejection cannot be overruled by a pen, and this ordering is what makes that principle structural rather than aspirational.
2. **Judgment counts only from a ledger the gate can trust.** The gate checks the whole ledger with the verdict contract's soundness rules before it reads any verdict. One malformed record anywhere, such as an approval with no judge or a revise with no reason, makes the ledger unsound and holds the gate. When `knownPlanIds` is given, a verdict naming an unknown plan, or a gated `planId` that is not itself known, is also unsound. Without `knownPlanIds` the gate checks record well-formedness only.
3. **Unreviewed never self-assembles.** A valid plan with no verdict waits. Silence is not approval and absence is not consent.
4. **A review covers the version it read.** Given the plan's `planDigest`, the gate holds as `review-stale` when the latest verdict for the plan names a different digest or none. A step added, removed, or retitled after review changes the digest, so the old approval no longer opens the gate. The latest verdict still counts: a later review of another version leaves this version stale rather than reaching back to an older approval. Without `planDigest` the gate does not check versions and answers as before.
5. **Revise is a stop, not a pause of opinion.** The latest revise verdict holds assembly until a new proposal earns a new verdict. The title of the held reason names the path out: the revisions were requested, so make them.

## Output semantics

- `permitted: true` means the two lanes passed over a sound ledger: valid, approved. Nothing more.
- `permitted: false` always carries a `held` reason from the table above. There is no naked refusal.
- The gate returns the validation, the ledger soundness result (`{ ok, errors }`), and the latest verdict alongside its answer, so a caller never re-derives what the gate already judged.
- When the ledger is unsound, `verdict` is `null`: a verdict from an untrusted ledger is never surfaced as the answer.

## Prohibitions

- The gate never ratifies. Permission to assemble is not owner assent; effects exceeding the plan's scope route the owner's gate in the harness.
- The gate never judges content. If the rule pack and the reviewers both passed it, the gate opens whether or not a third party would have preferred different work.
- The gate never mutates its inputs. It composes; it does not rewrite the ledger or re-validate with different rules.

## Changes

- `0.2.0` — the gate checks ledger soundness, adding held reason `ledger-unsound` (order 2), the optional `knownPlanIds` input, the `ledger` output, and `HELD_REASONS`. Before `0.2.0` the verdict contract said an unsound ledger is refused by the gate, but the gate read verdicts unchecked, so a hand-built approval with no judge could permit assembly. Gate answers over ledgers built with `verdictRecord` are unchanged. A caller that matches on `held` values should handle the new reason.
- `0.3.0` — the optional `planDigest` input and held reason `review-stale` (order 4). A malformed `planDigest` is refused with an error. Without `planDigest`, answers are unchanged. A caller that matches on `held` values should handle the new reason.

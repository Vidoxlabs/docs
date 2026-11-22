# Aestivation charter

## Mission

Build the loop that decides, before work opens, whether the work may open. Aestivation holds the contracts for planning: propose, validate deterministically, review with reasons, and hold assembly at a gate. The loop's judgments are recorded, its rules are plain, and nothing automatic assembles until the plan has passed both lanes.

The name is the doctrine. Aestivation is the arrangement of petals in the bud before it opens. Petals that never arrange do not open well; work that never gets planned does not assemble well. Everything here happens before the opening — and the opening itself is a gated, stated event.

## Principles

1. **Deterministic first, judgment second.** The rule pack runs on every plan, the same way every time. An invalid plan is held no matter who approved it. Rules and review are separate lanes; the gate composes them, and neither can substitute for the other.
2. **Verdicts carry their reasons.** A revise verdict always states what to change. An approve verdict may carry reasons too — an approval with no explanation is weaker than one with its basis on its face, but it is a valid verdict.
3. **The ledger is append-only.** A verdict is a record of a moment in review. It is never edited. Re-review after revision is a new verdict appended to the plan's history.
4. **Revise stops assembly.** When a plan's latest verdict is revise, the gate holds. Automatic assembly does not proceed on a maybe.
5. **The loop never ratifies for the owner.** A verdict records review; a gate opening permits assembly. Neither is the owner's assent. Effects that exceed the plan's scope — publishing, deploying, deleting, spending — are gated effects, and they route the owner's gate in the harness, not the reviewer's pen.
6. **Held states say why.** A gate that holds names the reason: plan-invalid, ledger-unsound, awaiting-verdict, review-stale, revisions-requested. "No" without a reason teaches nothing.

## Non-goals

- **Not a scheduler.** Aestivation does not run the steps. The harness runs work; this loop decides whether the arrangement admits it.
- **Not a judge of quality.** The rule pack checks shape and order. Reviewers judge content. Neither claims to measure whether the work is good, and the gate certifies neither.
- **Not an approval substitute.** The loop's outputs are records and a gate state. Ratification — the owner's act of accepting the outcome — happens outside this loop, always.

# Aestivation interop

How aestivation meets the family. Every behavior attributed to a sibling below is sourced from that sibling's published repository at the time of writing; where a sibling has not shipped the behavior, it is not claimed.

## bloom: the proved shape

Bloom describes the plan-and-review loop as the interplay of its planner, validators, and review specialists:

> The head proposes an ordered plan... A deterministic rule validates the response and the stage order. A reviewer records approve or revise. A revision verdict stops automatic assembly... A review verdict of "revise" pauses assembly... address the author with the requested changes and attach the review when continuing.

Mapping onto aestivation's contracts:

| Bloom behavior | Aestivation contract |
| :--- | :--- |
| The head proposes an ordered plan | `planProposal`: objective plus frozen, ordered steps. |
| A deterministic rule validates response and stage order | The rule pack: `validatePlan` with the baseline five rules. |
| A reviewer records approve or revise | `verdictRecord`: decision from `{approve, revise}`, judge, reasons. |
| A revision verdict stops automatic assembly | `assemblyGate` held reason `revisions-requested`. |
| Review "revise" pauses, author re-proposes with changes attached | Append-only ledger: the revise verdict stays; the revised plan is a new proposal; the latest verdict counts. |
| "Review approved" / "Changes requested" strings | `decision: 'approve'` / `decision: 'revise'` as data, not prose. |

The one deliberate difference: bloom's review specialists emit strings into a message stream; aestivation holds the same loop as typed records a harness can compose deterministically.

## seed: carrying the effects

Aestivation has no tool domain of its own on seed's registry. It is not a connector; it is the loop code the harness runs. Three integrations, all in-process:

1. **Plan validation is a deterministic check.** In bloom the rule is stated as a validator the harness runs without model agency; on seed's run model the same rule runs as verification code the harness executes — the plan enters a `verify`-class checkpoint as data, and the rule pack's output is read as data.
2. **Verdict recording is work product.** A review specialist's judgment lands in the ledger through ordinary harness messages; the verdict record is constructed from the decision, the judge, and the reasons, and it is `data`, not an effect.
3. **Gated effects route the owner gate.** When assembly, publishing, or any scope-exceeding effect follows from a permitted gate, that effect is a gated effect on the harness, with the owner's assent required — permission to assemble is the loop's verdict, ratification is the owner's act, and the loop never confuses the two.

Nothing in this section requires myosotis: verdicts and plans are loop records, not memory. If a harness chooses to remember a review, that act crosses into myosotis under its own contracts.

## capillary: evidence into review

Review reads evidence. When a reviewer's reasons cite material, the retrieval of that material is capillary's province — packets with provenance, budgets, and bounded reads. Aestivation consumes none of it directly; the harness hands the reviewer what capillary retrieved, and the verdict records what the reviewer said. The boundary stays clean: capillary proves where evidence came from, aestivation records what was judged and gates what follows.

## Family

The family law and the full table live in the [capillary repository's family doc](https://github.com/Vidoxlabs/capillary/blob/main/docs/family.md). Short form: seed for the harness foundation, capillary for retrieval, myosotis for memory, aestivation for admission and review, bloom for the harness. Names are ordinary botanical words; provinces stay distinct.

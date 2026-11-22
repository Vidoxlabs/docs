# aestivation

Plan proposal, deterministic validation, review verdicts, and the assembly gate.

Aestivation is the admission and review member of the bloom agent family. Before work opens, it happens here: a plan is proposed, a deterministic rule pack validates it, reviewers record approve or revise verdicts, and a gate holds automatic assembly until the plan is both valid and approved. A revision verdict stops assembly; the reasons say what to change; the next plan is a new proposal.

## Status

Version 0.5.0. The plan rule pack, verdict ledger, and assembly gate are `implemented` as a tested reference library. A durable ledger, live reviewers, and service interfaces remain `specified` or `planned`.

## Install

```bash
npm install @vidoxlabs/aestivation
```

Requires Node >= 22.13. Zero runtime dependencies.

## Modules

| Module | What it holds | Label |
| :--- | :--- | :--- |
| `plan.mjs` | Plan proposals: objective plus ordered steps, the SHA-256 digest of each proposal's content, and the deterministic rule pack that validates stages, titles, and order. | `implemented` |
| `verdict.mjs` | Verdict records (approve or revise) that may name the plan digest they reviewed, the append-only ledger, and the soundness check over every record. | `implemented` |
| `intent.mjs` | Read-only intent assessments that name missing sources and ground personal recall in admitted memory references. Tool and memory-write lists stay under caller admission. | `implemented` |
| `correction.mjs` | Corrections within existing scope after an exact-digest revise verdict, with new frozen proposals, a two-replan limit per in-process lineage, and a check that refuses superseded results. The judge cannot apply the patch. | `implemented` |
| `gate.mjs` | The assembly gate: one function that checks the ledger, holds a review of a different plan version as stale, and composes validation and verdicts into permitted or held, with the reason. | `implemented` |

## The name

Aestivation is the arrangement of petals in a bud before it opens. That is the entire doctrine: the work of arranging before the opening. Nothing assembles until the arrangement has been validated and reviewed. When it opens, it opens because the gate said so for stated reasons.

## The rule pack

The baseline deterministic rules a plan must pass:

1. A plan has at least one step.
2. Every step names a known stage: `research`, `work`, `review`, `assemble`, or `verify`.
3. Every step has a non-empty title.
4. When review and assemble are both present, review precedes the first assemble.
5. When verify is present, it is the final step.

The same plan validates the same way every time, and no review can wave it through. The split runs both ways: no rule pack approves a plan on a reviewer's behalf. Judgment and rules are separate lanes; the gate composes them.

## The family

The family follows one design law: ordinary botanical words for public products, mirroring five flower-named personas.

| Name | Province |
| :--- | :--- |
| [`seed`](https://github.com/Vidoxlabs/seed) | Harness foundation: runs, tools, providers |
| [`capillary`](https://github.com/Vidoxlabs/capillary) | Context retrieval and relations, provenance-first |
| [`myosotis`](https://github.com/Vidoxlabs/myosotis) | Memory with consent and structural forget |
| `aestivation` (this repo) | Plans, verdicts, and the gate before assembly |
| [`drosera`](https://github.com/Vidoxlabs/drosera) | Tool faces, skills, hooks, cookbooks |
| [`trellis`](https://github.com/Vidoxlabs/trellis) | Multi-point testing with dated evidence |
| [`bloom`](https://github.com/Vidoxlabs/bloom) | The team workspace harness |
| [`docs`](https://github.com/Vidoxlabs/docs) | Family documentation, synced from every public repository |

## Documentation

- `AGENTS.md`: start here before editing. Stay in this repository's province.
- `docs/charter.md`: mission, principles, non-goals.
- `docs/architecture.md`: the bud and its four whorls.
- `docs/contracts/`: the plan, verdict, and gate contracts.
- `docs/interop.md`: how bloom runs the loop, and how seed carries its effects.

## Development

```bash
npm test
```

Tests use the Node built-in runner. Adding a rule means adding the test that holds it.

## License

MIT

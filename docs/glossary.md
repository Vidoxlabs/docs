# Family glossary

This glossary establishes shared terminology for public timeline specifications, contracts, and capability ledgers. For naming rules across the botanic product family, see [seed's docs/lexicon.md](https://github.com/Vidoxlabs/seed/blob/main/docs/lexicon.md) and [capillary's docs/family.md](https://github.com/Vidoxlabs/capillary/blob/main/docs/family.md).

## Generalized family and role terms

Public repositories use only two naming forms: proper nouns for the public repositories (`seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`, `bloom`, `docs`, `videsign`) and generalized role terms for concepts and roles:

| Generalized term | Public product | Meaning |
| --- | --- | --- |
| `native client` | none (private surface) | The desktop application a person works from. |
| `intelligence backend` | none (private service) | The private backend service behind client applications. |
| `coding workspace` | none (private session) | A direct session in which an agent edits a real work tree. |
| `step admission and scaling` | none | Planning which worker, timeout, and context a chain step receives. |
| `documentation base` | `docs` (hub) | The governed documentation repository and synced knowledge surface. |
| `design system` | `videsign` | The shared visual design tokens and canon. |
| `tooling fabric` | `drosera` | Declarative tool faces, skills, hooks, and cookbooks. |
| `local cluster` | none | Private local infrastructure; never described further in public repositories. |
| `memory fabric` | `myosotis` | Governed memory with explicit consent, correction, and forget epochs. |
| `storage triangle` | none | Record authority, cache projection, and graph projection. |
| `admission and ratification loop` | `aestivation` | Plan proposal, independent review verdicts, and the assembly gate. |
| `context retrieval system` | `capillary` | Provenance-honest, bounded context retrieval and source relations. |
| `persona seats` | none | General role term for saved team seats; specifications and run documents use closed `role ID` values only. |
| `coordinator` | `bloom` role term | Team role that frames tasks and plans assignments. |
| `model-backed specialist` | `bloom` role term | Team role executed by a model generation under an assigned task. |
| `deterministic verifier` | `bloom` role term | Team role that verifies admitted outputs deterministically without calling a model. |

## Timeline and harness terms

- **`capability`**: A tracked unit of family behavior (`CAP-01` to `CAP-19`) with one lead repository, optional touched repositories, an acceptance specification, and ordered slices.
- **`ledger`**: The capability status table in [docs/timeline/ledger.md](timeline/ledger.md) backed by [docs/timeline/capabilities.json](timeline/capabilities.json) and each repository's `docs/capabilities/index.json`.
- **`milestone`**: A numbered delivery checkpoint (`M0` to `M9`) grouping capabilities that ship together when their tests land.
- **`horizon`**: Planning bucket for milestones and capabilities: `now` (`M0` to `M2`), `next` (`M3` to `M6`), or `later` (`M7` to `M9`).
- **`slice`**: The smallest independently testable, shippable increment of a capability (`CAP-NN.k`), delivered with its ledger and changelog updates in one PR.
- **`proposal`**: An intake document (`docs/proposals/P-YYYYMMDD-<slug>.md`) proposing a new capability or cross-repository change prior to owner decision.
- **`ADR`**: Architecture Decision Record (`docs/adr/NNNN-<slug>.md`) recording context, decision, consequences, and alternatives; moves from `Proposed` to `Accepted` only by owner decision.
- **`owner gate`**: A runtime pause requiring a digest-bound owner decision record (`seed`) before an effect, scope expansion, plan approval, or third-party egress action may proceed.
- **`plan gate`**: Deterministic assembly gate (`aestivation` `assemblyGate`) checking plan validation, verdict ledger soundness, version digest match, and review verdict before automatic assembly proceeds.
- **`packet`**: A bounded, provenance-honest retrieval bundle (`capillary`) carrying admitted excerpts, declared cuts (`shortened`, `carried`, `cut`), explicit `omitted` reasons, `unknown` records, and character or token budgets.
- **`face`**: A declarative tool definition (`drosera` `toolFace`) pairing a neutral `toolId`, `effect` class, `connector` name, and falsifiable `summary` without granting runtime admission.
- **`skill`**: Packaged deterministic instructions (`drosera` `skill`) loaded into context; skills add guidance only and never grant tools, scopes, or authority.
- **`hook`**: A deterministic, fail-closed check function (`drosera` `hook`) attached to a lifecycle event (`run-start`, `before-tool`, `after-tool`, `run-end`, `before-model`, `after-model`, `skill-promoted`, `skill-deprecated`) that cannot widen scope.
- **`recipe`**: A named, repeatable sequence of tool and skill steps (`drosera` `recipe`) validated against tool and skill packs without bypassing runtime gates.
- **`probe`**: An external deterministic verification check (`trellis` `probe`) executed outside the call path against one point (`shape`, `behavior`, `consistency`, or `operational`) returning `pass`, `fail`, or `unknown`.
- **`seat`**: A configured team participant entry in `bloom` holding a closed role ID, charter, and admitted tool subset.
- **`role ID`**: One of the five closed seat role identifiers used in plans and specifications: `chair`, `framing`, `risk`, `coherence`, `sequencing`.
- **`checkpoint`**: A post-step durable snapshot in a step graph (`CAP-12`) recording parent link, state digest, completed steps, and pending writes for deterministic resume or fork.
- **`interrupt`**: A controlled pause at a step or gate boundary that stops progress safely until external or owner input arrives and resumes without repeating completed effects.
- **`run store`**: The durable persistence boundary (`CAP-13`) storing objectives, attempts, intents, receipts, leases, and checkpoints across process restarts and verified by a conformance suite.

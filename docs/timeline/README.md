# Development timeline

This folder is the public development timeline and capability ledger for the seven Vivarium systems and this hub. It coordinates work across `docs`, `seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`, and `bloom` without putting code implementation inside the documentation hub.

## How to use the timeline

1. **Milestones and horizons** live in [roadmap.md](roadmap.md), grouped into Now, Next, and Later.
2. **The canonical capability catalog** lives in [capabilities.json](capabilities.json), naming every capability, its lead repository, touched repositories, dependencies, horizon, milestone, CLI phase, and lead spec path.
3. **The generated ledger** lives in [ledger.md](ledger.md), summarizing current status and claim strength for every capability.
4. **Owner rulings** live in [decisions.md](decisions.md), keeping ratified decisions and unratified pending items separated.
5. **The per-slice agent workflow** lives in [agent-guide.md](agent-guide.md), and the required capability specification layout lives in [spec-template.md](spec-template.md).

## Read order for a code agent

Before writing code or changing contracts for any capability slice, read in this exact order:

1. `docs/timeline/README.md` (this page).
2. `docs/timeline/roadmap.md` (horizons, milestones, dependencies, and pending owner rulings).
3. `docs/timeline/capabilities.json` (capability metadata, lead repository, touched repositories, and spec location).
4. The lead capability spec at the path named in `capabilities.json` (in the lead repository, or under `sources/<lead>/docs/capabilities/` after sync).
5. The target repository's `AGENTS.md`, contracts, and local `docs/capabilities/index.json`.

## Continual integration workflow

Work moves through four stages so design, review, implementation, and documentation stay aligned:

1. **Review docs**: Check [index.md](../index.md), [engineering-law.md](../engineering-law.md), [decisions.md](decisions.md), and current synced contracts in `sources/`.
2. **Brainstorm via proposals**: Open a proposal under [proposals/](../proposals/README.md) (`P-YYYYMMDD-<slug>.md`) in its own pull request on `docs` before adding new capabilities or changing cross-repo scope. Keep private operational context out of public proposals.
3. **Plan via specs and ADRs**: Draft or refine the lead capability spec using [spec-template.md](spec-template.md) and write any cross-cutting architecture or dependency proposal as an ADR (`Status: Proposed`) per [adr/](../adr/README.md). Only an owner decision logged in [decisions.md](decisions.md) ratifies proposals, ADRs, or `accepted`/`deferred` capability states.
4. **Implement slice-by-slice**: Work one slice (`CAP-NN.k`) per branch and pull request, test-first, enforcing the **same-PR ledger rule**: every implementation or contract pull request updates that repository's `docs/capabilities/index.json`, the spec's `Evidence` and `Changes` sections (when in the lead repo), `docs/CHANGELOG.md`, and touched contract `Changes` sections in the same pull request.

## Related conventions

- [Proposals](../proposals/README.md) and [proposal template](../proposals/template.md)
- [Architecture Decision Records](../adr/README.md) and [ADR template](../adr/template.md)
- [Changelog convention](../conventions/changelog.md)
- [Family glossary](../glossary.md)
- [Hub capabilities folder](../capabilities/README.md)

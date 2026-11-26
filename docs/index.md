# Documentation index

Ownership splits in two: pages this repository writes, and pages synced verbatim from the family's public repositories.

## Owned pages

- [Family](family.md): the systems, the product they make, and where this hub stands.
- [Engineering law](engineering-law.md): the discipline every public repository keeps.
- [Sync contract](sync.md): how sources arrive, on what schedule, with what provenance.
- [Site integration](site-integration.md): the specified handoff to vidoxlabs.dev.
- [Timeline guide](timeline/README.md): how to use the development timeline, read order, and continual integration workflow.
- [Roadmap](timeline/roadmap.md): milestones `M0` to `M9`, horizons, Bloom CLI phase mapping, and pending owner rulings.
- [Capability catalog](timeline/capabilities.json): machine-readable registry of `CAP-01` through `CAP-19`.
- [Capability ledger](timeline/ledger.md): status and claim table for all family capabilities.
- [Owner decisions](timeline/decisions.md): owner ruling log format and pending decisions `D1` to `D14`.
- [Agent working guide](timeline/agent-guide.md): nine-step slice loop, status/claim rules, and governance boundaries.
- [Capability spec template](timeline/spec-template.md): required 12-section specification layout.
- [Hub capabilities](capabilities/README.md): hub capability index ([index.json](capabilities/index.json)), [CAP-01](capabilities/CAP-01-development-timeline-ledger.md), and [CAP-02](capabilities/CAP-02-docs-freshness-check.md).
- [Proposals](proposals/README.md): intake process and [proposal template](proposals/template.md).
- [Architecture Decision Records](adr/README.md): family ADR numbering, lifecycle, and [ADR template](adr/template.md).
- [Changelog convention](conventions/changelog.md): shared `docs/CHANGELOG.md` structure and same-PR rule.
- [Glossary](glossary.md): generalized family terms, timeline terms, and closed role IDs.
- [Changelog](CHANGELOG.md): unreleased and released hub documentation changes.

## Synced sources

[sources-index.md](sources-index.md) is the generated map of every synced repository, written by the sync run itself. Each copy under `sources/<name>/` carries the words of the repository that owns them. Editing happens there, never here.

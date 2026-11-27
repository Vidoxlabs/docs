# Changelog

Earlier hub history lives in git history and [docs/sync.md](sync.md).

## Unreleased

### Added

- Sync `vivarium`'s `README.md`, `AGENTS.md`, and `docs/` as a source, so the umbrella's product brief and decision records reach readers with every other member's pages (docs#4).
- Phase 0 hub development timeline scaffold (`docs/timeline/`), proposal and ADR templates (`docs/proposals/`, `docs/adr/`), changelog convention (`docs/conventions/changelog.md`), family glossary (`docs/glossary.md`), and hub capability ledger (`docs/capabilities/`) for `CAP-01` and `CAP-02` (CAP-01, docs#1).
- Owner questions workflow and pull request decision records (CAP-01, docs#2).

### Changed

- Owner decisions show their true status: each pending item says whether its review default was taken, `D12` is split into three questions with the seat roster question superseded, and the two `vivarium` decisions quoted from the owner's design text are indexed as awaiting confirmation (CAP-01).
- `vivarium` ADRs `0002` and `0003` move to Ratified and ADR `0004` is indexed as `D-20261127-01`, each quoting the owner's confirmation recorded in vivarium#13 and scoped to the substance it covers; ADR `0005` stays unindexed (CAP-01).
- The roadmap no longer waits on bloom#1, which has merged, and the ledger rows for `CAP-03`, `CAP-04`, `CAP-14`, and `CAP-16` match their lead repositories (CAP-01).

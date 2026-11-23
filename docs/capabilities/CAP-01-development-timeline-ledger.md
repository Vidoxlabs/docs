# CAP-01: Development timeline and capability ledger

- ID: `CAP-01`
- Title: Development timeline and capability ledger
- Lead: `docs`
- Touches: `seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`, `bloom`
- Horizon: `now`
- Milestone: `M0`
- CLI phase: `none`
- Status: `in-progress`
- Claim: `planned`
- Depends on: `none`

## Why

The family spans eight public repositories (`docs`, `seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`, `bloom`), each with its own contracts, tests, and release cadence. Without a shared capability catalog and per-repository ledger convention, milestones, cross-repository dependencies, owner rulings, and implementation claims drift apart across checkouts.

## What it does

- Establishes the canonical hub timeline under `docs/timeline/`:
  - `docs/timeline/README.md`: usage guide, agent read order, and continual integration workflow.
  - `docs/timeline/roadmap.md`: milestones `M0` to `M9` across `Now`, `Next`, and `Later`, mapped onto Bloom CLI phases `P1` to `P6`.
  - `docs/timeline/capabilities.json`: machine-readable catalog of all 19 capabilities (`CAP-01` to `CAP-19`) with `id`, `title`, `lead`, `touches`, `horizon`, `milestone`, `cliPhase`, `dependsOn`, and `spec`.
  - `docs/timeline/ledger.md`: human-readable capability status table (hand-maintained until `CAP-02` lands, generated afterward).
  - `docs/timeline/decisions.md`: owner decision log format (`D-YYYYMMDD-NN`) and reference table of pending owner rulings (`D1` to `D12`).
  - `docs/timeline/agent-guide.md`: nine-step per-slice working loop, status/claim fixed pairing rules, and hard governance constraints.
  - `docs/timeline/spec-template.md`: standardized 12-section capability specification layout.
- Establishes hub governance and terminology conventions:
  - `docs/proposals/`: proposal intake rules and template (`P-YYYYMMDD-<slug>.md`).
  - `docs/adr/`: cross-family ADR numbering (`NNNN-<slug>.md`) and owner ratification rule.
  - `docs/conventions/changelog.md`: standardized `docs/CHANGELOG.md` layout across all eight repositories.
  - `docs/glossary.md`: generalized family terminology linked to `seed`'s `docs/lexicon.md` plus definitions for 20 timeline and harness terms and closed role IDs (`chair`, `framing`, `risk`, `coherence`, `sequencing`).
- Establishes `docs/capabilities/` in every family repository (`README.md`, `index.json`, and lead capability specifications `CAP-NN-<slug>.md`), plus `docs/adr/README.md`, `docs/CHANGELOG.md`, and `AGENTS.md` read-order and same-PR ledger rule updates.

## Contract touchpoints

- `docs/sync.md`: `sources.json` already syncs `docs/` (`.md` and `.json`) from every sibling repository into `sources/<repo>/docs/`, carrying per-repo `docs/capabilities/` updates to the hub automatically after merge.
- `docs/engineering-law.md`: preserves zero runtime dependencies, strict claim honesty (`implemented`, `specified`, `planned`, `observed`), public safety, and zero em-dashes.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Owner gate | Third-party egress | Summary |
| --- | --- | --- | --- | --- |
| none | n/a | n/a | n/a | This capability defines no runtime tool IDs. |

### Events

| Event | Emitted by | Payload summary |
| --- | --- | --- |
| none | n/a | This capability emits no runtime events. |

## Acceptance tests

- `timeline-catalog-valid`: `docs/timeline/capabilities.json` parses cleanly, declares `version: 1`, holds 19 unique capabilities `CAP-01`..`CAP-19` with valid horizons (`now`, `next`, `later`), and forms an acyclic dependency graph.
- `cross-repo-ledger-consistent`: all eight `docs/capabilities/index.json` files parse cleanly, match `capabilities.json` lead/touches assignments 1-to-1, use valid status/claim pairs, and resolve every `spec` and `contracts[]` file on disk.
- `spec-template-conformance`: all 19 capability specs contain the exact 12 sections in order, separate `### Tool IDs` and `### Events` tables, and valid tool IDs under `seed` grammar and `drosera` face rules.
- `public-hygiene-clean`: zero YAML frontmatter, zero em-dashes, zero `@`-prefixed strings, zero private addresses/paths/credentials, and zero internal story or persona names appear in any committed timeline artifact.

## Slices

1. `CAP-01.1` (`docs`, `in-progress`): Hub timeline scaffold (`docs/timeline/*`, `docs/proposals/*`, `docs/adr/*`, `docs/conventions/changelog.md`, `docs/glossary.md`, `docs/capabilities/*`, `docs/CHANGELOG.md`, `docs/index.md`, `AGENTS.md`).
2. `CAP-01.2` (`seed`, `in-progress`): Seed capability docs and roadmap mapping (`CAP-03`, `CAP-06`, `CAP-12`, `CAP-13`, `CAP-16`, `CAP-17` specs, `index.json`, roadmap mapping, ADR pointer, changelog, `AGENTS.md`).
3. `CAP-01.3` (`capillary`, `in-progress`): Capillary capability docs and packer spec (`CAP-05`, `CAP-18` specs, `index.json`, ADR pointer, changelog, `AGENTS.md`).
4. `CAP-01.4` (`myosotis`, `in-progress`): Myosotis capability docs and memory integration spec (`CAP-11` spec, `index.json`, ADR pointer, changelog, `AGENTS.md`).
5. `CAP-01.5` (`aestivation`, `in-progress`): Aestivation capability docs and plan loop spec (`CAP-07` spec, `index.json`, ADR pointer, changelog, `AGENTS.md`).
6. `CAP-01.6` (`drosera`, `in-progress`): Drosera capability docs and run guard / scan specs (`CAP-09`, `CAP-19` specs, `index.json`, ADR pointer, changelog, `AGENTS.md`).
7. `CAP-01.7` (`trellis`, `in-progress`): Trellis capability docs and ledger entries (`index.json`, ADR pointer, changelog, `AGENTS.md`).
8. `CAP-01.8` (`bloom`, `in-progress`): Bloom capability docs and workspace/orchestration specs (`CAP-04`, `CAP-08`, `CAP-10`, `CAP-14`, `CAP-15` specs, `index.json`, ADR pointer, changelog, `AGENTS.md`).

## Non-goals

- Implementing `test/timeline.test.mjs`, `test/capabilities.test.mjs`, or automated `ledger.md` generation (deferred to `CAP-02`).
- Modifying any source code, runtime test suite, `package.json`, `sources/`, `manifest.json`, or existing `docs/contracts/` documents during Phase 0.
- Ratifying proposals, ADRs, or pending owner decisions (`D1` to `D12`).

## Family rules and conflicts

- Honors `docs` hub neutrality: the hub edits only its own pages and never patches sibling repositories from `docs` automation (`sources/` remains a verbatim read-only mirror).
- Preserves existing contract invariants across siblings (for example `seed`'s Stage 2 roadmap table row assertion and `bloom`'s separate open PR #1 branch ancestry).
- Avoids all internal story names and persona names in public hub pages and glossary definitions.

## Open owner decisions

- `D1` (unratified / pending owner decision): Ratify the initial timeline structure, horizon assignments, milestones `M0` to `M9`, and capability catalog (`CAP-01` to `CAP-19`).
- `D2` (unratified / pending owner decision): Confirm ledger regeneration and reconciliation behavior between hub `capabilities.json`, `ledger.md`, and synced per-repo `index.json` files.
- `D7` (unratified / pending owner decision): Confirm cross-repository PR landing order (lead before touches) and squash-merge SHA backfill on next touch.
- `D8` (unratified / pending owner decision): Confirm public/private proposal boundary rules and recording `bloom` `P1` work under `M1` when PR #1 merges.

## Evidence

None yet (`CAP-01.1` scaffold PR in progress across the eight repositories; `npm test` and Phase 0 cross-repo Stage 2 verification cover docs consistency and hygiene).

## Changes

- `2026-11-23`: Initial `CAP-01` specification drafted and Phase 0 scaffold prepared across `docs` and the seven sibling repositories (`CAP-01.1`).

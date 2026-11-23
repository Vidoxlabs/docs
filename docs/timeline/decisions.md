# Owner decisions

This log records owner rulings that ratify proposals, move capabilities to `accepted` or `deferred`, accept Architecture Decision Records, or resolve cross-repository design questions. Agents never self-ratify entries here.

## Recording format

Every ratified entry uses these fields in order:

- **Anchor**: `D-YYYYMMDD-NN` (unique heading anchor, for example `### D-20261124-01`)
- **Date**: `YYYY-MM-DD`
- **Scope**: Capability IDs, proposal IDs, or ADR numbers governed by the ruling
- **Decision**: One plain sentence stating what the owner decided
- **Attribution**: Exact sentence `Recorded from the owner's message in the task that opened this PR.`

Public safety rules for entries:

- Never name a person, account handle, or tool chat anywhere in an entry.
- Keep private hostnames, credentials, and operational configuration out of this log.

## Ratified decisions

No owner decisions have been ratified yet.

## Pending owner decisions (unratified)

The items below are open questions surfaced across the Phase 0 capability specifications. Every item remains **unratified** and **pending owner decision**.

| ID | Scope | Summary | Status |
| --- | --- | --- | --- |
| `D1` | `CAP-01`, `M0` to `M9` | Ratify the initial timeline structure, horizon assignments (`now`, `next`, `later`), milestone groupings (`M0` to `M9`), and move `CAP-01` through `CAP-19` from `proposed` to `accepted` where approved. | unratified (pending owner decision) |
| `D2` | `CAP-01`, `CAP-02` | Confirm how hub `docs/timeline/ledger.md` regenerates when synced `sources/` updates (automatic regeneration in the sync run versus explicit PR check) and how `capabilities.json` and per-repository `index.json` reconcile status transitions. | unratified (pending owner decision) |
| `D3` | `CAP-02` | Choose the tool-ID grammar source for `CAP-02` freshness checks (`test/timeline.test.mjs` in `docs` and `test/capabilities.test.mjs` in sibling repositories): local grammar check matching `seed/docs/contracts/tool-id.md`, synced `sources/seed/` in `docs`, or an explicit check against `seed`, while preserving zero runtime dependencies and standalone repository test execution. | unratified (pending owner decision) |
| `D4` | `CAP-03`, `CAP-09` | Decide whether `drosera` mirrors `seed`'s schema subset validator with a `trellis` parity probe (keeping peers free of cross-imports) or imports `seed` directly, including how `CAP-09` guard hooks interact with schema checks. | unratified (pending owner decision) |
| `D5` | `CAP-05` | Confirm character-based token budget estimation (explicitly labeled `estimate`) as `capillary`'s default budget unit rather than model-specific tokenizers. | unratified (pending owner decision) |
| `D6` | `CAP-05` | Confirm restricting custom packet templates in `capillary` to fixed placeholders (`{{tree}}`, `{{files}}`, `{{diff}}`, `{{log}}`, `{{budget}}`, `{{omissions}}`) with no conditionals, loops, or expression logic. | unratified (pending owner decision) |
| `D7` | `CAP-01` | Confirm cross-repository pull request landing order (lead repository contract/interface slices before downstream consumers) and squash-merge commit SHA backfill on the next touch to `index.json` and spec `Changes`. | unratified (pending owner decision) |
| `D8` | `CAP-01`, `M1` | Confirm the public/private boundary for proposals and decisions (keeping private operational details off the public hub) and confirm recording `bloom` `P1` terminal shell work under `M1` once PR #1 merges. | unratified (pending owner decision) |
| `D9` | `CAP-05` | Confirm the default secret-file deny list patterns in `capillary` and whether an explicit override on a denied path requires a `CAP-06` owner approval record or stays unconditionally denied. | unratified (pending owner decision) |
| `D10` | `CAP-05` | Confirm the change-context boundary (`capillary` reads caller-supplied diff/log text while `bloom` runs read-only system `git`, recording `unknown` when absent) and default packet/per-item budgets (`28000` / `12000` characters) plus format-aware shortening caps. | unratified (pending owner decision) |
| `D11` | `CAP-11` | Confirm that agents may write experience receipts in `myosotis` (what ran, on which digest, with what result) while never writing any record that reads as an owner decision. | unratified (pending owner decision) |
| `D12` | `CAP-04`, `CAP-06`, `CAP-07`, `CAP-08`, `CAP-10`, `M3`, `M4` | Resolve pending `bloom` CLI and orchestration rulings: `P2` workspace and finish tool IDs (`CAP-04`), declarative seat storage in `src/seats.mjs` plus member rows using closed role IDs rather than instruction files or persona names (`CAP-08`), terminal renderer without a third-party TUI library (`CAP-10`, planned `bloom/docs/adr/0001-terminal-renderer.md`), and cross-milestone sequencing where `CAP-07` (`M3`, `P3`) depends on `CAP-06` (`M4`, `P4`). | unratified (pending owner decision) |

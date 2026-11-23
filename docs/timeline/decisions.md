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

The items below are open questions surfaced across the Phase 0 capability specifications and review. Every item remains **unratified** and **PENDING owner ruling**.

| ID | Decision | Review recommendation | Status |
| --- | --- | --- | --- |
| `D1` | Spec placement: plan of record in the hub; specs and progress in owner repos | Accept | PENDING owner ruling |
| `D2` | Two-field status (`status` lifecycle plus `claim` truth label) with fixed pairings | Accept | PENDING owner ruling |
| `D3` | Grammar source for the hub's `CAP-02.1` test | `seed` as a commit-pinned devDependency of `docs` (one grammar, no runtime dependency) | PENDING owner ruling |
| `D4` | Home of the schema subset and validator (`CAP-03`) | `seed` owns it; `drosera` mirrors it with a parity test, the same way it mirrors the tool grammar | PENDING owner ruling |
| `D5` | Token estimate (`CAP-05`) | Character-based estimate labeled `estimate`; exact counts only from the configured provider at run time, never in tests | PENDING owner ruling |
| `D6` | Template model (`CAP-05`) | Built-in `markdown`, `tagged`, `json` formats plus a placeholder-only custom template with no logic | PENDING owner ruling |
| `D7` | Proposal intake | Files under the hub's `docs/proposals/`; anything needing private detail goes to the owner, not the hub | PENDING owner ruling |
| `D8` | Changelog location | `docs/CHANGELOG.md` per repo, so the sync carries it without a `sources.json` change | PENDING owner ruling |
| `D9` | Bloom calls the system `git` binary read-only for diff and log (`CAP-05`) | Accept; absent `git` is `unknown`, never an empty diff | PENDING owner ruling |
| `D10` | Secret-file deny list (`CAP-05`) | Always on; an explicit include of a denied path needs a per-call owner approval record (`CAP-06.1`); symlinks not followed by default | PENDING owner ruling |
| `D11` | Experience-only memory receipts (`CAP-11`) | Accept: experience kind only, never anything shaped as an owner decision | PENDING owner ruling |
| `D12` | Pending `bloom` rulings: P2 tool IDs `workspace.file.update`, `workspace.shell.execute`, `run.answer.create` (`CAP-04`); seats as role IDs with renderer-only display labels (`CAP-08`); terminal renderer without a third-party TUI library, ADR `0001` Proposed (`CAP-10`) | Accept all three | PENDING owner ruling |
| `D13` | Accept the timeline structure, milestones `M0` to `M9`, and the capability catalog | Accept the structure now; move `CAP-01` to `CAP-05` to `accepted` now; leave `CAP-06` to `CAP-19` `proposed` until their milestone opens | PENDING owner ruling |
| `D14` | Review conventions made under delegation: changelog shape (`A1.1`), slice milestones and slice IDs in `dependsOn` (`A1.3`, `A1.4`), `CAP-06.1` at `M3` with `CAP-07.3` folded in (`A2`), `CAP-02` slice split (`A3`), reuse of `out-of-budget` (`A4`) | Keep, unless the owner overrides | PENDING owner ruling |

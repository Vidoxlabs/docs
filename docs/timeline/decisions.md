# Owner decisions

This log indexes answers already given under [Owner questions](agent-guide.md#owner-questions), including decisions that ratify proposals, change capability status, accept Architecture Decision Records, or resolve cross-repository design questions. Agents never self-ratify entries here.

Vivarium's product decisions are written as architecture decision records in the `vivarium` repository (`docs/adr/`). This log indexes each one once the owner's words for it are on record.

## Recording format

Every ratified entry uses these fields in order:

- **Anchor**: `D-YYYYMMDD-NN` (unique heading anchor, for example `### D-20261124-01`)
- **Date**: `YYYY-MM-DD`
- **Scope**: Capability IDs, proposal IDs, or ADR numbers governed by the ruling
- **Decision**: The owner's answer quoted from the pull request that acted on it, with private details redacted
- **Attribution**: Exact sentence `Quoted from the owner's answer recorded in <repo>#<n>.`

An entry whose quote comes from design text supplied for the product, rather than from an owner answer in a pull request, says so: its attribution reads `Quoted from the design text recorded in <repo>#<n>.`, and its status stays `Relayed (owner-supplied design text, unconfirmed)` until the owner confirms it in a pull request. Such an entry is not ratified, and the label is about attribution only. It does not approve the underlying capability or implementation.

Public safety rules for entries:

- Never name a person, account handle, or tool chat anywhere in an entry.
- Keep private hostnames, credentials, and operational configuration out of this log.

## Ratified decisions

No owner decision has been ratified by an owner answer in a pull request yet.

## Relayed design text (unconfirmed)

These two entries quote design text supplied for the product. Its authorship is not confirmed. Each awaits the owner's confirmation in a pull request before it can be listed as ratified.

### D-20261125-01

- **Date**: 2026-11-25
- **Scope**: `vivarium` ADR `0002` (internal agents use the public setup)
- **Decision**: "There is no private overlay. Vidoxlabs' own internal agents are created in the app through the same first-run setup and editors any user goes through, so the team uses the product exactly as users do."
- **Attribution**: Quoted from the design text recorded in vivarium#9.
- **Status**: Relayed (owner-supplied design text, unconfirmed)

### D-20261125-02

- **Date**: 2026-11-25
- **Scope**: `vivarium` ADR `0003` (first-run setup and no default autonomy)
- **Decision**: "No default autonomy level. A scripted first-run setup has the person choose autonomy and simple or advanced workflows, and shows where to change both later."
- **Attribution**: Quoted from the design text recorded in vivarium#9.
- **Status**: Relayed (owner-supplied design text, unconfirmed). The status covers the quoted substance; the rest of the ADR is not confirmed either.

`vivarium` ADRs `0004` (model access routes) and `0005` (web-app context routes) are not indexed here yet: no owner words for them have been found on record.

## Pending owner decisions (unratified)

The items below are open questions surfaced across the Phase 0 capability specifications and review. None is ratified. Each carries one of these statuses:

- **Default taken, awaiting owner**: work proceeds on the review recommendation, and the owner's ruling is still pending. A "no" from the owner means a change.
- **Superseded**: a later owner decision replaced the question, so it will not be ruled on as written.

| ID | Decision | Review recommendation | Status |
| --- | --- | --- | --- |
| `D1` | Spec placement: plan of record in the hub; specs and progress in owner repos | Accept | Default taken, awaiting owner |
| `D2` | Two-field status (`status` lifecycle plus `claim` truth label) with fixed pairings | Accept | Default taken, awaiting owner. The pairs are in use; their enforcement (`CAP-02`) is not built |
| `D3` | Grammar source for the hub's `CAP-02.1` test | `seed` as a commit-pinned devDependency of `docs` (one grammar, no runtime dependency) | Default taken, awaiting owner. Nothing is built on it yet |
| `D4` | Home of the schema subset and validator (`CAP-03`) | `seed` owns it; `drosera` mirrors it with a parity test, the same way it mirrors the tool grammar | Default taken, awaiting owner |
| `D5` | Token estimate (`CAP-05`) | Character-based estimate labeled `estimate`; exact counts only from the configured provider at run time, never in tests | Default taken, awaiting owner |
| `D6` | Template model (`CAP-05`) | Built-in `markdown`, `tagged`, `json` formats plus a placeholder-only custom template with no logic | Default taken, awaiting owner |
| `D7` | Proposal intake | Files under the hub's `docs/proposals/`; anything needing private detail goes to the owner, not the hub | Default taken, awaiting owner |
| `D8` | Changelog location | `docs/CHANGELOG.md` per repo, so the sync carries it without a `sources.json` change | Default taken, awaiting owner |
| `D9` | Bloom calls the system `git` binary read-only for diff and log (`CAP-05`) | Accept; absent `git` is `unknown`, never an empty diff | Default taken, awaiting owner |
| `D10` | Secret-file deny list (`CAP-05`) | Always on; an explicit include of a denied path needs a per-call owner approval record (`CAP-06.1`); symlinks not followed by default | Default taken, awaiting owner |
| `D11` | Experience-only memory receipts (`CAP-11`) | Accept: experience kind only, never anything shaped as an owner decision | Default taken, awaiting owner |
| `D12a` | `bloom` P2 tool IDs `workspace.file.update`, `workspace.shell.execute`, `run.answer.create` (`CAP-04`) | Accept | Default taken, awaiting owner. The IDs are in use on `bloom` main (bloom#4, bloom#5) |
| `D12b` | Seats as role IDs with renderer-only display labels (`CAP-08`) | Accept | Superseded. On 2026-11-25 the owner decided that the product carries no fixed agent roster: each person creates agents in setup, from generic templates (`vivarium` ADR `0002`). Fixed seat IDs would be that roster. The `CAP-08` rewrite starts in bloom#18 |
| `D12c` | Terminal renderer without a third-party TUI library, ADR `0001` Proposed (`CAP-10`) | Accept | Default taken, awaiting owner. `bloom` ADR `0001` is not written yet |
| `D13` | Accept the timeline structure, milestones `M0` to `M9`, and the capability catalog | Accept the structure now; move `CAP-01` to `CAP-05` to `accepted` now; leave `CAP-06` to `CAP-19` `proposed` until their milestone opens | Default taken in part, awaiting owner. The structure is in use; no capability has been moved to `accepted` |
| `D14` | Review conventions made under delegation: changelog shape; slice milestones and slice IDs in `dependsOn`; `lead` lists all slices and `touches` list their own; `prs` as `"<repo>#<n>"` and full squash SHAs in `commits`; `CAP-06.1` at `M3` with `CAP-07.3` folded in; the `CAP-02` nine-slice split; reuse of `out-of-budget` | Keep, unless the owner overrides | Default taken, awaiting owner |

`D12` was one row covering three separate questions. It is split into `D12a`, `D12b`, and `D12c` so each can be answered on its own.

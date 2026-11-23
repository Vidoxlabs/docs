# Family development roadmap

Dates are not promised; milestones land when their tests land.

This roadmap organizes family capabilities (`CAP-01` through `CAP-19`) across horizons (`Now`, `Next`, `Later`) and maps Bloom's terminal and workspace delivery phases (`P1` through `P6`) onto shared milestones (`M0` through `M9`). No item here implies shipped code until its claim label (`implemented` or `observed`) and test receipts are on record in the owning repository.

## Horizons and milestones

### Now (M0 to M2)

| Milestone | Title | CLI phase | Depends on | Capabilities | Notes |
| --- | --- | --- | --- | --- | --- |
| `M0` | Docs timeline scaffold | none | none | `CAP-01` | Cross-repo timeline docs, ledger indexes, and capability specs across all 8 repositories. Pending owner ruling on timeline structure (`D13`). |
| `M1` | Terminal shell | `P1` (open PR #1 in `bloom`) | `M0` | none new in ledger | Existing `P1` terminal shell work in `bloom` is recorded in the ledger when PR #1 merges (`D13`, pending owner ruling). |
| `M2` | Agent loop and typed tools | `P2` (plus `CAP-05` library slices) | `M0`, `M1` | `CAP-02`, `CAP-03`, `CAP-04`, `CAP-05` (library slices) | Adds automated docs freshness checks (`CAP-02`), typed tool schemas (`CAP-03`), workspace tools and coding loop (`CAP-04`), and `capillary`/`drosera` packer library slices (`CAP-05.1` to `CAP-05.4`). Pending owner ruling on `P2` tool IDs (`D12`), `CAP-02.1` grammar source (`D3`), `CAP-03` validator home (`D4`), `CAP-05` packer options (`D5`, `D6`, `D9`, `D10`), and `CAP-02` slice split (`D14`). |

### Next (M3 to M6)

| Milestone | Title | CLI phase | Depends on | Capabilities | Notes |
| --- | --- | --- | --- | --- | --- |
| `M3` | Composition | `P3` | `M2` | `CAP-05` (`bloom` and `trellis` slices), `CAP-06.1`, `CAP-07`, `CAP-08`, `CAP-09`, `CAP-11` | Adds owner-gate decision record (`CAP-06.1`, including plan-digest binding), wires packer into `bloom` and `trellis` (`CAP-05.5` to `CAP-05.7`), plan review/approval loop (`CAP-07`), seat orchestration (`CAP-08`), run guards (`CAP-09`), and memory integration (`CAP-11`). Pending owner ruling on seat role IDs and renderer-only display labels (`D12`), experience-only receipts (`D11`), and `CAP-06.1` at `M3` (`D14`). |
| `M4` | Renderer, trace, approvals | `P4` | `M2`, `M3` (`CAP-06.1`) | `CAP-06` (`CAP-06.2` to `CAP-06.4`), `CAP-10`, `CAP-16` | Completes deferred tool-call approval pauses, face metadata, and approval UX (`CAP-06.2` to `CAP-06.4`), append-only trace and renderer views (`CAP-10`), and provider conformance and model profiles (`CAP-16`). Pending owner ruling on renderer without a third-party TUI library (`D12`). |
| `M5` | Eval smoke | `P5` | `M4` | `CAP-14` (smoke slice) | Ships initial deterministic evaluation dataset, `seed` model test doubles, and `bloom` smoke eval command (`CAP-14.1`, `CAP-14.2`). |
| `M6` | Quickstart | `P6` | `M3`, `M4`, `M5` | none new | End-to-end documentation, onboarding walkthrough, and stability polish over landed `P1` to `P5` work. |

### Later (M7 to M9)

| Milestone | Title | CLI phase | Depends on | Capabilities | Notes |
| --- | --- | --- | --- | --- | --- |
| `M7` | Durable runs | none | `M4` | `CAP-12`, `CAP-13` | Step graph state merge, checkpoints, resume, interrupts (`CAP-12`), and durable run store with conformance suite (`CAP-13`). |
| `M8` | Research and deep context | none | `M3`, `M5` | `CAP-15`, `CAP-18`, `CAP-14` (full) | Coordinator research flow (`CAP-15`), zero-dependency symbol outlines (`CAP-18`), and full evaluation suite (`CAP-14.3`, `CAP-14.4`). |
| `M9` | Safety scopes | none | `M2`, `M7` | `CAP-17`, `CAP-19` | Per-run sandbox scopes and default-off shell policy (`CAP-17`) and deterministic skill safety scan (`CAP-19`). |

## Bloom CLI phase mapping

| Bloom CLI phase | Milestone | Horizon | Mapped capabilities | Pending owner ruling |
| --- | --- | --- | --- | --- |
| `P1` | `M1` | `now` | Existing `P1` terminal shell work (recorded when PR #1 merges) | Timeline structure and `M1` recording (`D13`, pending owner ruling) |
| `P2` | `M2` | `now` | `CAP-03`, `CAP-04` (alongside `CAP-02` and `CAP-05` library slices) | `P2` tool IDs (`D12`), `CAP-02`/`CAP-03`/`CAP-05` rulings (`D3`, `D4`, `D5`, `D6`, `D9`, `D10`), `CAP-02` slice split (`D14`), all pending owner ruling |
| `P3` | `M3` | `next` | `CAP-05` (`bloom` and `trellis` slices), `CAP-06.1`, `CAP-07`, `CAP-08`, `CAP-09`, `CAP-11` | Seat role IDs with renderer-only labels (`D12`), experience receipts (`D11`), `CAP-06.1` at `M3` with `CAP-07.3` folded in (`D14`), all pending owner ruling |
| `P4` | `M4` | `next` | `CAP-06` (`CAP-06.2` to `CAP-06.4`), `CAP-10`, `CAP-16` | Renderer without third-party TUI library (`D12`, pending owner ruling) |
| `P5` | `M5` | `next` | `CAP-14` (smoke slice) | Timeline structure and catalog acceptance (`D13`, pending owner ruling) |
| `P6` | `M6` | `next` | none new | Timeline structure and catalog acceptance (`D13`, pending owner ruling) |

## Milestone dependency summary

- `M0`: no prerequisite milestones.
- `M1`: depends on `M0` for ledger recording convention once merged.
- `M2`: depends on `M0` (for `CAP-02` freshness checks over the ledger) and `M1` (terminal shell surface for `P2` coding loop work).
- `M3`: depends on `M2` (`CAP-03`, `CAP-04`, and `CAP-05` library slices). Within `M3`, `CAP-07` depends on `CAP-06.1` (owner-gate decision record placed in `M3`), and `CAP-08` depends on `CAP-07`.
- `M4`: depends on `M2` (`CAP-03`, `CAP-04`) and `M3` (`CAP-06.1`, extended by `CAP-06.2` to `CAP-06.4`).
- `M5`: depends on `M4` (`CAP-10` trace stream consumed by `CAP-14`).
- `M6`: depends on `M3`, `M4`, and `M5`.
- `M7`: depends on `M4` (`CAP-06`, `CAP-10`).
- `M8`: depends on `M3` (`CAP-05`, `CAP-07`, `CAP-08`) and `M5` (`CAP-14` smoke).
- `M9`: depends on `M2` (`CAP-04`) and `M7` (`CAP-12`).

## Sequencing note and pending owner rulings

- **`CAP-06.1` at `M3` (`D14`)**: `CAP-06.1` (the owner-gate decision record, with plan-digest binding folded in from `CAP-07.3`) lands at `M3` while `CAP-06.2` to `CAP-06.4` remain at `M4` (`P4`). `CAP-07` (`M3`, `P3`) declares `dependsOn: ["CAP-06.1"]`, keeping every dependency milestone at or before its dependent (`M3` <= `M3`) while awaiting owner confirmation under `D14` (pending owner ruling).
- **`P2` tool IDs (`CAP-04`)**: The proposed workspace and finish tool IDs (`workspace.file.read`, `workspace.dir.list`, `workspace.text.search`, `workspace.file.write`, `workspace.file.update`, `workspace.shell.execute`, `run.answer.create`) are **pending owner ruling** (`D12`).
- **Seat role IDs (`CAP-08`)**: Storing seats as closed role IDs (`chair`, `framing`, `risk`, `coherence`, `sequencing`) with renderer-only display labels rather than separate instruction files or persona names is **pending owner ruling** (`D12`).
- **Terminal renderer (`CAP-10`)**: Implementing the terminal renderer without adding a third-party TUI library is **pending owner ruling** (`D12`, tracked alongside `bloom`'s planned `ADR-0001`).
- **All Phase 0 rulings (`D1` to `D14`)**: Every item `D1` to `D14` in [decisions.md](decisions.md) remains **pending owner ruling**.

Agents must not decide or ratify any pending ruling on the owner's behalf.

# Family development roadmap

Dates are not promised; milestones land when their tests land.

This roadmap organizes family capabilities (`CAP-01` through `CAP-19`) across horizons (`Now`, `Next`, `Later`) and maps Bloom's terminal and workspace delivery phases (`P1` through `P6`) onto shared milestones (`M0` through `M9`). No item here implies shipped code until its claim label (`implemented` or `observed`) and test receipts are on record in the owning repository.

## Horizons and milestones

### Now (M0 to M2)

| Milestone | Title | CLI phase | Depends on | Capabilities | Notes |
| --- | --- | --- | --- | --- | --- |
| `M0` | Docs timeline scaffold | none | none | `CAP-01` | Cross-repo timeline docs, ledger indexes, and capability specs across all 8 repositories. |
| `M1` | Terminal shell | `P1` (open PR #1 in `bloom`) | `M0` | none new in ledger | Existing `P1` terminal shell work in `bloom` is recorded in the ledger when PR #1 merges. |
| `M2` | Agent loop and typed tools | `P2` (plus `CAP-05` library slices) | `M0`, `M1` | `CAP-02`, `CAP-03`, `CAP-04`, `CAP-05` (library slices) | Adds automated docs freshness checks (`CAP-02`), typed tool schemas (`CAP-03`), workspace tools and coding loop (`CAP-04`), and `capillary`/`drosera` packer library slices (`CAP-05.1` to `CAP-05.4`). Pending owner ruling on `P2` tool IDs (`D12`, pending owner decision). |

### Next (M3 to M6)

| Milestone | Title | CLI phase | Depends on | Capabilities | Notes |
| --- | --- | --- | --- | --- | --- |
| `M3` | Composition | `P3` | `M2` (see sequencing note below) | `CAP-05` (`bloom` slices), `CAP-07`, `CAP-08`, `CAP-09`, `CAP-11` | Wires packer into `bloom` (`CAP-05.5` to `CAP-05.7`), plan review/approval loop (`CAP-07`), seat orchestration (`CAP-08`), run guards (`CAP-09`), and memory integration (`CAP-11`). Pending owner ruling on seat storage (`D12`, pending owner decision). |
| `M4` | Renderer, trace, approvals | `P4` | `M2` | `CAP-06`, `CAP-10`, `CAP-16` | Adds digest-bound tool-call approval decisions (`CAP-06`), append-only trace and renderer views (`CAP-10`), and provider conformance and model profiles (`CAP-16`). Pending owner ruling on renderer without a third-party TUI library (`D12`, pending owner decision). |
| `M5` | Eval smoke | `P5` | `M4` | `CAP-14` (smoke slice) | Ships initial deterministic evaluation dataset and `bloom` smoke eval command (`CAP-14.1`, `CAP-14.2`). |
| `M6` | Quickstart | `P6` | `M3`, `M4`, `M5` | none new | End-to-end documentation, onboarding walkthrough, and stability polish over landed `P1` to `P5` work. |

### Later (M7 to M9)

| Milestone | Title | CLI phase | Depends on | Capabilities | Notes |
| --- | --- | --- | --- | --- | --- |
| `M7` | Durable runs | none | `M4` | `CAP-12`, `CAP-13` | Step graph state merge, checkpoints, resume, interrupts (`CAP-12`), and durable run store with conformance suite (`CAP-13`). |
| `M8` | Research and deep context | none | `M3`, `M5` | `CAP-15`, `CAP-18`, `CAP-14` (full) | Coordinator research flow (`CAP-15`), zero-dependency symbol outlines (`CAP-18`), and full evaluation suite (`CAP-14.3`, `CAP-14.4`). |
| `M9` | Safety scopes | none | `M2`, `M7` | `CAP-17`, `CAP-19` | Per-run sandbox scopes and default-off shell policy (`CAP-17`) and deterministic skill safety scan (`CAP-19`). |

## Bloom CLI phase mapping

| Bloom CLI phase | Milestone | Horizon | Mapped capabilities | Pending owner decision |
| --- | --- | --- | --- | --- |
| `P1` | `M1` | `now` | Existing `P1` terminal shell work (recorded when PR #1 merges) | Recording existing `P1` work (`D8`) |
| `P2` | `M2` | `now` | `CAP-03`, `CAP-04` (alongside `CAP-02` and `CAP-05` library slices) | `P2` tool IDs (`D12`, pending owner decision) |
| `P3` | `M3` | `next` | `CAP-05` (`bloom` slices), `CAP-07`, `CAP-08`, `CAP-09`, `CAP-11` | Seat storage (`D12`, pending owner decision) and `CAP-07`/`CAP-06` sequencing |
| `P4` | `M4` | `next` | `CAP-06`, `CAP-10`, `CAP-16` | Renderer without third-party TUI library (`D12`, pending owner decision) |
| `P5` | `M5` | `next` | `CAP-14` (smoke slice) | none beyond `D1` |
| `P6` | `M6` | `next` | none new | none beyond `D1` |

## Milestone dependency summary

- `M0`: no prerequisite milestones.
- `M1`: depends on `M0` for ledger recording convention once merged.
- `M2`: depends on `M0` (for `CAP-02` freshness checks over the ledger) and `M1` (terminal shell surface for `P2` coding loop work).
- `M3`: depends on `M2` (`CAP-03`, `CAP-04`, and `CAP-05` library slices). In addition, `CAP-07` (`M3`) depends on `CAP-06` (`M4`), and `CAP-08` (`M3`) depends on `CAP-07`; see the sequencing note below.
- `M4`: depends on `M2` (`CAP-03`, `CAP-04`).
- `M5`: depends on `M4` (`CAP-10` trace stream consumed by `CAP-14`).
- `M6`: depends on `M3`, `M4`, and `M5`.
- `M7`: depends on `M4` (`CAP-06`, `CAP-10`).
- `M8`: depends on `M3` (`CAP-05`, `CAP-07`, `CAP-08`) and `M5` (`CAP-14` smoke).
- `M9`: depends on `M2` (`CAP-04`) and `M7` (`CAP-12`).

## Sequencing note and pending owner rulings

- **Cross-milestone dependency (`CAP-07` and `CAP-06`)**: `CAP-07` (assigned to `M3`, `P3`) currently declares `dependsOn: ["CAP-06"]`, while `CAP-06` is assigned to `M4` (`P4`). This cross-milestone dependency remains flagged as **pending owner decision** (`D12` in [decisions.md](decisions.md)) pending owner sequencing guidance (for example, moving `CAP-06` into `M3`, moving `CAP-07` owner-gate wiring into `M4`, or splitting `CAP-07` contract slices from `CAP-06` runtime wiring).
- **`P2` tool IDs (`CAP-04`)**: The proposed workspace and finish tool IDs (`workspace.file.read`, `workspace.dir.list`, `workspace.text.search`, `workspace.file.write`, `workspace.file.update`, `workspace.shell.execute`, `run.answer.create`) are **pending owner decision** (`D12`).
- **Seat storage (`CAP-08`)**: Storing declarative seat data in `src/seats.mjs` alongside member rows with closed role IDs (`chair`, `framing`, `risk`, `coherence`, `sequencing`) rather than separate instruction files or persona names is **pending owner decision** (`D12`).
- **Terminal renderer (`CAP-10`)**: Implementing the terminal renderer without adding a third-party TUI library is **pending owner decision** (`D12`, tracked alongside `bloom`'s planned `ADR-0001`).

Agents must not decide or ratify any pending ruling on the owner's behalf.

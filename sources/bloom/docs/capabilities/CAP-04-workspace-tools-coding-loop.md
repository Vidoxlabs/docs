# CAP-04: Workspace tool set and coding loop

- ID: `CAP-04`
- Title: Workspace tool set and coding loop
- Lead: `bloom`
- Touches: `drosera`
- Horizon: `now`
- Milestone: `M2`
- CLI phase: `P2`
- Status: `proposed`
- Claim: `planned`
- Depends on: `CAP-03`

## Why

Bloom's coding sessions (`src/harness.mjs`) currently run only the scripted demonstration adapter (`src/demo.mjs`) and ship no live coding runtime (`docs/architecture.md`). A local coding loop needs deterministic workspace tools bound to the session workspace root so an agent can inspect, search, edit, test, and finish cleanly without escaping the workspace or racing on concurrent writes.

## What it does

- Defines seven neutral tools whose faces and recipe live in `drosera` (`CAP-04.1`) and whose execution runs inside `bloom` (`CAP-04.2`, `CAP-04.3`):
  - Read tools: `workspace.file.read`, `workspace.dir.list`, `workspace.text.search`, and `run.answer.create`.
  - Write tools: `workspace.file.write`, `workspace.file.update`, and `workspace.shell.execute`.
- Enforces strict workspace root containment: every path parameter resolves relative to the session's canonical workspace root (`realpath` of `session.workspace` in `src/harness.mjs`), verifies symlink targets stay inside the root, and refuses any path outside the workspace root before I/O.
- Serializes writes per canonical file path: concurrent `workspace.file.write` and `workspace.file.update` calls targeting the same file wait on a per-path queue so updates never interleave or drop edits.
- Caps tool output deterministically: output exceeding the configured budget is truncated, and the tool record reports `truncatedBytes` along with the SHA-256 hex digest of the full untruncated output.
- Integrates the coding loop into Bloom's runtime: each model call passes through `src/provider.mjs` (`validateProvider` and `normalizeGeneration`), validates inputs and outputs per `CAP-03`, checks tool admission against `allowedTools`, executes workspace tools locally, and finishes explicitly when `run.answer.create` runs.

## Contract touchpoints

- `docs/architecture.md`: coding runtime seam (`run(input, hooks)`), provider seam (`src/provider.mjs`), and OS-account / workspace trust boundary.
- `drosera/docs/contracts/tools.md` and `drosera/docs/contracts/cookbook.md` (`CAP-04.1`): workspace and finish tool face pack and coding-loop recipe.
- `seed/docs/contracts/tool-id.md` and `seed/docs/contracts/run-model.md`: tool-ID grammar, reading classes, intent-first recording, and `allowedTools` admission.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Third-party egress | Owner gate | Summary |
| --- | --- | --- | --- | --- |
| `workspace.file.read` | `read` | `false` | `false` | Read file contents or bounded line ranges inside the workspace root |
| `workspace.dir.list` | `read` | `false` | `false` | List directory entries inside the workspace root |
| `workspace.text.search` | `read` | `false` | `false` | Search text patterns across files inside the workspace root |
| `workspace.file.write` | `write` | `false` | `false` | Create or overwrite a file inside the workspace root |
| `workspace.file.update` | `write` | `false` | `false` | Apply targeted edits to an existing file inside the workspace root |
| `workspace.shell.execute` | `write` | `false` | `false` | Run a bounded command inside the workspace root |
| `run.answer.create` | `read` | `false` | `false` | Emit the structured final response that ends the coding loop |

### Events

| Event | Producer | Payload fields | Notes |
| --- | --- | --- | --- |
| `tool.updated` | `bloom` (`src/harness.mjs`) | `id`, `toolId`, `kind`, `title`, `status`, `truncatedBytes`, `outputSha256` | Existing harness tool lifecycle event extended with capped digest metadata |
| `assistant.delta` | `bloom` (`src/harness.mjs`) | `text` | Final or streamed coding-loop answer text emitted via `run.answer.create` |
| `turn.finished` | `bloom` (`src/harness.mjs`) | `status`, `reason` | Emitted when the coding loop terminates via finish action, cancel, or error |

## Acceptance tests

- `workspace-root-containment-refuses-escape`: traversal segments and symlinks escaping the workspace root fail closed before any read or write.
- `per-path-write-serialization`: concurrent `workspace.file.write` and `workspace.file.update` calls on one canonical path execute sequentially with no lost edits.
- `capped-output-reports-truncated-bytes-and-sha256`: oversized tool output truncates to budget and includes exact `truncatedBytes` plus SHA-256 of the untruncated output.
- `coding-loop-finishes-via-run-answer-create`: coding loop dispatches provider generations behind `src/provider.mjs`, runs admitted tools, and stops cleanly on `run.answer.create`.
- `unadmitted-tool-rejected-before-execution`: any tool outside the objective's `allowedTools` list is refused before execution.

## Slices

- `CAP-04.1` (`drosera`, milestone `M2`, status `proposed`): Workspace and finish tool faces pack and recipe.
- `CAP-04.2` (`bloom`, milestone `M2`, status `proposed`): Workspace root path containment, write serialization, capped digest output.
- `CAP-04.3` (`bloom`, milestone `M2`, status `proposed`): Coding loop integration with workspace tools and finish action.

## Non-goals

- Importing `drosera` inside `bloom` at runtime before an explicit package adoption task.
- Virtual path remapping or default-off shell scope isolation across custom roots (`CAP-17`).
- Interactive tool-call approval prompt UX (`CAP-06`) or trace HTML export (`CAP-10`).

## Family rules and conflicts

- Tool faces and recipe definitions belong in `drosera` (`CAP-04.1`); execution and workspace I/O belong in `bloom` (`CAP-04.2`, `CAP-04.3`).
- Every tool ID conforms to `seed` grammar and every provider call runs behind `src/provider.mjs`.
- Zero new runtime dependencies.

## Open owner decisions

- `D12` (pending owner ruling): P2 tool-ID rulings on the workspace and finish tool IDs (`workspace.file.update`, `workspace.shell.execute`, and `run.answer.create`, alongside `workspace.file.read`, `workspace.dir.list`, `workspace.text.search`, and `workspace.file.write`), including whether `run.answer.create` remains a tool face or a harness finish action and default owner-gate flags for write and shell actions.

## Evidence

- None yet (`claim: planned`).

## Changes

- `2026-11-23`: Added `M2` slice milestones across `CAP-04.1`..`CAP-04.3` and aligned `D12` wording.
- `2026-11-23`: Initial capability specification created in Phase 0 timeline scaffold.

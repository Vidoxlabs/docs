# CAP-04: Workspace tool set and coding loop

- ID: `CAP-04`
- Title: Workspace tool set and coding loop
- Lead: `bloom`
- Touches: `drosera`
- Horizon: `now`
- Milestone: `M2`
- CLI phase: `P2`
- Status: `in-progress`
- Claim: `specified`
- Depends on: `CAP-03`

## Why

Bloom's coding sessions (`src/harness.mjs`) currently run only the scripted demonstration adapter (`src/demo.mjs`) and ship no live coding runtime (`docs/architecture.md`). A local coding loop needs deterministic workspace tools bound to the session workspace root so an agent can inspect, search, edit, test, and finish cleanly without escaping the workspace or racing on concurrent writes.

## What it does

- Defines seven neutral tools whose faces and recipe live in `drosera` (`CAP-04.1`) and whose execution runs inside `bloom` (`CAP-04.2`, `CAP-04.3`):
  - Read tools: `workspace.file.read`, `workspace.dir.list`, `workspace.text.search`, and `run.answer.create`.
  - Write tools: `workspace.file.write`, `workspace.file.update`, and `workspace.shell.execute`.
- Read takes `path` and optional one-based inclusive `startLine` and `endLine`. List and literal search use an optional `path` rooted at the workspace. Search requires `query`. Write takes `path` and `content`. Update takes `path`, `oldText`, and `newText`. Command takes `command` and optional string array `args`. Finish takes `text`.
- Contains file tool paths: file tool path parameters resolve relative to the session's canonical workspace root (`realpath` of `session.workspace` in `src/harness.mjs`). File tools check symlink targets and refuse outside paths before content I/O.
- Serializes writes per canonical file path: concurrent `workspace.file.write` and `workspace.file.update` calls targeting the same file wait on a per-path queue so updates never interleave or drop edits.
- Caps tool output deterministically: retain a UTF-8 prefix with no partial code point, report `truncatedBytes`, and include the SHA-256 hex digest of the full decoded output.
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
| `workspace.shell.execute` | `write` | `false` | `false` | Run an allowlisted command with the workspace as the working directory, after per-call approval |
| `run.answer.create` | `read` | `false` | `false` | Emit the structured final response that ends the coding loop |

### Events

| Event | Producer | Payload fields | Notes |
| --- | --- | --- | --- |
| `tool.updated` | `bloom` (`src/coding-loop.mjs`) | `id`, `toolId`, `effect`, `summary`, `status`, `durationMs`, `approval`, `bytes`, `truncatedBytes`, `outputSha256`, and for commands `exitCode`, `timedOut`, `output`, `homeCleanupFailed` | One trace row per call; the summary names paths and commands, never file contents |
| `model.call` | `bloom` (`src/coding-loop.mjs`) | `call`, `durationMs`, `model`, `complete`, `usage` | One trace row per generation; `usage` is `null` when unreported |
| `permission.requested` | `bloom` (`src/coding-loop.mjs`) | `id`, `toolId`, `effect`, `summary`, `detail`, `options`, and for commands `command`, `args` | Raised before every write and command |
| `assistant.delta` | `bloom` (`src/coding-loop.mjs`) | `text`, `final` | Streamed reply text; `final: true` marks the answer from `run.answer.create` |
| `turn.finished` | `bloom` (`src/harness.mjs`) | `status`, `reason` | Emitted when the coding loop terminates via finish action, cancel, or error |

## Acceptance tests

- `workspace-root-containment-refuses-escape`: traversal segments and symlinks escaping the workspace root fail closed before any read or write.
- `per-path-write-serialization`: concurrent `workspace.file.write` and `workspace.file.update` calls on one canonical path execute sequentially with no lost edits.
- `capped-output-reports-truncated-bytes-and-sha256`: oversized tool output truncates to budget and includes exact `truncatedBytes` plus SHA-256 of the untruncated output.
- `coding-loop-finishes-via-run-answer-create`: coding loop dispatches provider generations behind `src/provider.mjs`, runs admitted tools, and stops cleanly on `run.answer.create`.
- `unadmitted-tool-rejected-before-execution`: any tool outside the objective's `allowedTools` list is refused before execution.
- `coding-loop-fixes-fixture-offline`: the loop fixes the synthetic project's failing test through approved calls with zero network calls.
- `demo-session-fixture-is-lf`, `demo-session-export-is-byte-stable`: the recorded session stays LF and matches a fresh stable export on every platform.
- `reject-is-never-executed`, `allow-session-binds-args-digest`, `headless-never-writes`, `trace-row-per-call-without-file-contents`, `endpoint-marker-never-in-events-or-export`.
- `shell-refuses-unlisted-command`, `shell-refuses-absolute-and-parent-args`, `shell-refuses-symlinked-outside-arg`, `shell-refuses-eval-flags`, `shell-home-is-isolated`, `shell-home-cleanup-failure-flagged`, `command-access-has-one-production-caller`.
- `stream-usage-null-when-unreported`, `abort-returns-no-completed-record`.
- `make-sandbox-creates-baseline-commit`, `make-sandbox-refuses-non-empty-or-inside-clone`, `web-workspace-runs-coding-loop-from-private-config`, `web-workspace-refuses-cloud-and-has-no-endpoint-option`, `web-coding-view-formats-rows`, `live-test-runbook-commands-exist`, `live-test-runbook-keeps-endpoint-private`.
- `cloud-refused-without-flag-and-config`, `cloud-refused-outside-sandbox`, `cloud-reads-ask-first`, `key-and-endpoint-markers-never-printed`, `npm-test-does-not-load-live-tests`.

## Slices

- `CAP-04.1` (`drosera`, milestone `M2`, status `landed`): Workspace and finish tool faces pack and recipe.
- `CAP-04.2` (`bloom`, milestone `M2`, status `landed`): Workspace root path containment, write serialization, capped digest output.
- `CAP-04.3` (`bloom`, milestone `M2`, status `landed`): Coding loop integration with workspace tools and finish action. Before `workspace.shell.execute` runs outside tests, all of these hold: the exact command allowlist `node`, `npm` and `git`, resolved against a fixed search path; refusal of interpreter eval and redirect flags (`node -e`, `--eval`, `-p`, `--print`, `-r`, `--require`, `--import`, `--input-type`; `npm exec`, `npm x`, `npm --prefix`; `git -C`, `--git-dir`, `--work-tree`, `-c`, `--exec-path`; and `sh`, `bash`, `cmd` and `powershell` as commands); refusal of arguments that are absolute, contain `..`, or resolve outside the workspace, including through links and in `--flag=value`; an isolated per-run `HOME` (and `USERPROFILE` on Windows); per-call approval with no session-wide allow for commands; the owner's network answer, verbatim (2026-11-24): "I accept option A for bloom's coding shell: network not blocked; npm offline; git local-only; risk documented"; and tests for each in `test/shell-gate.test.mjs` and `test/coding-loop.test.mjs`.

## Non-goals

- Importing `drosera` inside `bloom` at runtime before an explicit package adoption task.
- Virtual path remapping or default-off shell scope isolation across custom roots (`CAP-17`).
- The approval modal and resume (`CAP-06.4`) or trace HTML export (`CAP-10`).
- An operating-system sandbox or network block for commands.

## Family rules and conflicts

- Tool faces and recipe definitions belong in `drosera` (`CAP-04.1`); execution and workspace I/O belong in `bloom` (`CAP-04.2`, `CAP-04.3`).
- Every tool ID conforms to `seed` grammar and every provider call runs behind `src/provider.mjs`.
- Zero new runtime dependencies.

## Open owner decisions

- `D12` Decided 2026-11-24 in drosera#4: Approve the workspace update, shell, and finish tool IDs? Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Continue with work and assume D12 is approved".
- `D15` Decided 2026-11-24 in bloom#4: Adopt pinned family peers as their slices need them? Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Assume D15 approval and continue working on CAP-04.2".
- `D16` Decided 2026-11-24 in bloom#5: Action format: each model reply holds exactly one fenced json block `{ "tool": "<tool id>", "args": { } }`, parsed strictly with one repair turn, then malformed, and nothing malformed runs? Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Assume recommended and continue".
- `D17` Decided 2026-11-24 in bloom#5: Command allowlist: exactly `node`, `npm` and `git`? Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Assume recommended and continue".
- `D18` Decided 2026-11-24 in bloom#5: Approvals: write tools always ask, "Allow for session" binds the tool ID plus an arguments digest, and is never offered for `workspace.shell.execute`? Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Assume recommended and continue".
- `D19` Decided 2026-11-24 in bloom#5: Should shell commands be able to reach the network in the first live run? Owner's answer, verbatim (2026-11-24): "I accept option A for bloom's coding shell: network not blocked; npm offline; git local-only; risk documented". Confirmed again (2026-11-24): "I confirm D29 A, D30 yes, D31 yes, D19 A".
- Decided 2026-11-24 in bloom#5: Did “approved continue” authorize a follow-up on #5 for the Windows fixture and resolved-path check, with verified fixes merged down the stack, or should I keep the review freeze in place? Owner's answer, verbatim: "Yes approved follow up".
- Decided 2026-11-24 in bloom#5: Which author should I use for new Bloom commits? Owner's answer, verbatim: "Use the configured author".
- `D25` Decided 2026-11-24 in bloom#8: Web view in this PR? Yes, recommended. The browser client already renders streamed text, tool rows and approvals through the existing permission route. The new work is server-side: read the endpoint from the private config, open a coding session for the workspace, and add model-call rows. Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Accept all".
- `D26` Decided 2026-11-24 in bloom#8: `--api-base` on `npm start`: remove the flag entirely, so the web workspace reads the endpoint only from the private config file (recommended)? The alternative keeps it working but undocumented. Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Accept all".
- `D27` Decided 2026-11-24 in bloom#8: Web key: the web workspace uses the same key rule as the terminal, the config's named variable. That drops the `[key variable name]` default. (Recommend yes.) Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Accept all".
- `D28` Decided 2026-11-24 in bloom#8: Opening a web coding session: `npm start -- --workspace <sandbox folder>` opens a coding session for that folder when the private config has a provider. This reuses the existing `--workspace` flag. (Recommend yes.) Owner's answer, relayed from the Codex session (not yet confirmed in the owner's own typed words): "Accept all".
- Decided 2026-11-24 in bloom#8: May I keep every entry from both branches under its existing heading, in stack order, then test and push #8 and #9? Owner's answer, verbatim: "You may assume approval and continue".
- `D29` Decided 2026-11-24 in bloom#9: Cloud opt-in for AI Studio. How should bloom allow a cloud provider? Owner's answer, verbatim (2026-11-24): "I confirm D29 A, D30 yes, D31 yes, D19 A".
- `D30` Decided 2026-11-24 in bloom#9: May docs and tests name GEMINI_API_KEY as the example variable? Owner's answer, verbatim (2026-11-24): "I confirm D29 A, D30 yes, D31 yes, D19 A".
- `D31` Decided 2026-11-24 in bloom#9: Live tests opt in with BLOOM_LIVE=1 and npm run test:live, at most 20 model calls? Owner's answer, verbatim (2026-11-24): "I confirm D29 A, D30 yes, D31 yes, D19 A".

## Evidence

- `CAP-04.3`: `test/shell-gate.test.mjs` checks Git metadata refusal and keeps ordinary directories writable. Its Git fixture reads back the repository settings and requires status, add, commit, and diff to succeed without running the configured programs.
- Cloud opt-in and Gemini (bloom#9): `src/sandbox-marker.mjs` and `scripts/make-sandbox.mjs` mark throwaway sandboxes; `--allow-cloud` gates cloud providers in the terminal; `src/provider-errors.mjs` maps Google rate-limit errors; `test/cloud-gemini.test.mjs` covers the offline gate and probe shape; `test/live/live-suite.live.mjs` is loaded only by `npm run test:live`.
- Live-test kit (bloom#8): `scripts/make-sandbox.mjs` makes the throwaway sandbox, `src/web.mjs` builds the web workspace from the private config only, `public/coding-view.js` formats the browser's model and tool rows, and `docs/live-test.md` is the runbook. `test/live-test-kit.test.mjs` covers each, and checks that every command the runbook names exists.
- `CAP-04.1`: drosera#4 exports the workspace tool pack and coding recipe. Bloom pins its head pending upstream merge.
- `CAP-04.3`: `test/coding-loop.test.mjs` runs the loop over a synthetic project with a scripted provider and zero network calls, writes the byte-stable session `test/fixtures/demo-session.jsonl` through the export path, and covers the repair budget, admission, approvals, headless refusal, trace rows and endpoint masking. `test/shell-gate.test.mjs` covers the command gate, `test/model-stream.test.mjs` the streamed client, and `test/cli-coding.test.mjs` the headless terminal path.
- `CAP-04.2`: `test/workspace-tools.test.mjs` exercises file path containment, canonical root revalidation, concurrent writes, exact matching, capped output and digests, the disabled-by-default command gate, command environment, and timeout.

## Changes

- `2026-11-24`: Use native resolved Git metadata paths on Windows and make the command gate fixture portable (CAP-04, bloom#5).

- `2026-11-24`: Harden the command gate (distinct refusal reasons, linked-folder containment, `.git` write refusal, git config overrides, npm network flags, attached short options, `node --run`, allow-only approvals) and record the typed D19 answer (CAP-04, bloom#5).
- `2026-11-24`: Add cloud opt-in, Gemini OpenAI-compatible probe and error mapping, opt-in live tests, and record D29 to D31 (CAP-16 / CAP-04, bloom#9).
- `2026-11-24`: Add the live-test kit and the web coding view, read the web endpoint only from the private config, and record D25 to D28 (CAP-04, bloom#8).
- `2026-11-24`: Add the coding loop, the streamed model client, and the allowlisted command gate, and record the L2 owner decisions (CAP-04, bloom#5).
- `2026-11-24`: Record the D12 tool face and D15 dependency decisions and add workspace executors (CAP-04, bloom#4).
- `2026-11-24`: Align root canonicalization with the native resolver used for tool paths (CAP-04, bloom#4).
- `2026-11-24`: Disable commands by default and isolate command home directories in test mode (CAP-04, bloom#4).
- `2026-11-23`: Added `M2` slice milestones across `CAP-04.1`..`CAP-04.3` and aligned `D12` wording.
- `2026-11-23`: Initial capability specification created in Phase 0 timeline scaffold.

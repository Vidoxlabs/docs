# How Bloom works

Bloom runs as one Node.js webserver with an embedded SQLite database, a directory of Markdown artifacts and a browser client. One head owns a team conversation. Every group post names its author. Durable sequence numbers let a disconnected browser replay activity. A model adapter supplies generations. The harness decides which files to read, which specialist owns the next step and when to stop.

## Terminal shell

**Implemented.** The terminal shell shares the team loop, demo adapter, provider selection and SQLite event stream with the browser. Headless JSON ends with an unstored `run.result` record. Missing usage stays unreported. The terminal reads provider addresses from its private data directory configuration. A configured address is masked before events are stored or rendered. Session exports also mask the stored workspace path. File replay reads the exported events without opening a store or starting a runtime.

## The shared computer

Grok Bot’s published design gives a user one persistent cloud computer. The bots share files and browser state, have individual screens, and can hand tasks to another bot in a group. Its primary bot can create specialists. Each responding bot consumes usage. These are product behaviors described by xAI. Its internal prompts and scheduling algorithms are proprietary. [How Grok Bot works](https://docs.x.ai/grok-bot/how-grok-bot-works) · [Shared computer](https://docs.x.ai/grok-bot/computer-and-apps) · [Group messaging](https://docs.x.ai/grok-bot/chat-and-collaboration)

Bloom implements the shared-computer idea locally. Every team can discover ordinary files from the same desktop. Each output gets an immutable ID, a readable filename, a hash and directed input edges. Specialists can change files they were given: a revision, rename or move into a folder writes a new immutable file in the same revision chain, linked to the version it replaces. The desktop lists the newest revision each team may see, and every earlier revision stays readable. A revision derived from team notes is private to that team, so other teams keep the last shareable revision, and Forget withdraws it. Folders are catalog metadata; files on disk stay flat. The shell and browser in the optional graphical desktop belong to the user. Agent-controlled mouse, keyboard, separate screens and browser-login handoff are future integrations. The OS account remains the trust boundary.

## Agent and memory contracts

| Concept | Local implementation |
| --- | --- |
| VI (Virtual Intelligence) | The head holds a name and charter. The planner assigns work by name to saved personas or current team members. Bloom drops unknown names and stops when no assignment matches. Recruiting a persona copies its saved jurisdiction, voice, stage and optional model onto the team. The scripted demo supplies its own example profiles. |
| OAI (Open AI Instance) | A provider-backed generation fulfills a role. The same profile can run on another configured model, and a persona with a preferred model runs on it. Each dispatch owns its input and reports its usage independently. |
| LA (Logical Agent) | The head can assign the verify stage to a named deterministic worker. It re-reads the admitted files and verifies their hashes without spending a model call. |
| Memory recall | Memory keeps the recall distinctions apart. Owner-confirmed notes are either rules, which always apply, or facts, recalled only when they match the task. A note belongs to one team or is shared with every team on the installation. Agent suggestions stay unconfirmed and are never recalled until the owner keeps them. Correct supersedes a note; Correct and Forget both move the epoch of every team that could use the note, so derived files and pending suggestions are withdrawn. Recall ranks notes with a portable floatation reading (`synaptic.score.v1`): lexical relevance in place of vector similarity (0.45), provenance (0.15), confidence (0.08), logarithmic use mass (0.07), a 30-day freshness half-life (0.05) and usefulness (0.05, +0.08 per approved review). A near-duplicate filter applies, with at most eight notes and 2,000 characters per call. Each call records which notes it received. Reading evidence or posting a message creates no durable note. |
| Local roles | Three logical roles run locally. SQLite holds authoritative records and provenance edges. A bounded in-process TTL cache serves the hot note set, and ranking runs per call. File-to-file edges connect inputs with resulting artifacts. There is no external graph or cache daemon to install. |
| Ordered plan and review | The head proposes an ordered plan. A deterministic rule validates the response and the stage order. A reviewer records approve or revise. A revision verdict stops automatic assembly. These are the admission and review behaviors implemented in this edition. |
| Event history | An append-only event history records roles, calls, review decisions and artifact references for inspection. The team receives bounded group posts and selected artifacts. Ambient development telemetry is outside the model’s context. |

These are portable implementations of selected Vidoxlabs behaviors. Full semantic ranking, multi-store replication and the historical seven-stage transport are outside this release. Public background on each behavior is available in the corresponding system's own public documentation.

## Teams talk to each other

A head agent sees the other teams on the installation by name and jurisdiction. It may ask one of them one question per task. Bloom opens a turn in the other team's conversation, so that team shows as busy, cannot start its own task meanwhile, and can stop the answer. The other team's head answers once from shareable material only: its jurisdiction, notes shared with every team, its unscoped group posts and its shareable desktop titles. Private notes never cross a team boundary. The asking head sees no notes, so its question cannot carry them either. The answering head sees no other teams, so a question cannot be passed along. The question and answer are recorded in both conversations' event histories. The answer reaches the asking team's specialists, labelled as coming from another team. The asking team's call and token limits cover the answer.

## Model calls and evidence

The head receives the brief, roster and ordinary desktop file titles. Worker calls receive the jurisdiction, explicit assignment, the ranked notes admitted for that assignment, recent group handoffs (including answers from other teams) and attached evidence. The text budget for all file excerpts in a worker packet is 28,000 characters, with a per-file cap of 12,000 characters. Character caps protect packet size. The usage ledger uses provider-reported token counts. Stable system instructions precede the changing evidence, allowing supporting providers to reuse their prompt prefix.

A team provider implements `generate({system, prompt, model, signal, ...})` and returns `{text, complete, model, usage, costUSD}`. `text` is always a string; a reply with no text body is returned as an empty, incomplete record. `usage` holds token counts only, in five fields: `input`, `output`, `total`, `cacheRead` and `cacheWrite`. A reported monetary cost is `costUSD`, beside usage rather than inside it. Missing metrics use null. Since 0.7.0 Bloom imports seed and runs every team provider behind its provider seam (`src/provider.mjs`): seed's `validateProvider` checks the adapter when Bloom starts, and seed's `normalizeGeneration` checks every reply before the team loop reads it. A reply outside the record stops the turn with `PROVIDER_CONTRACT`. Seed's record has no money field, so Bloom carries a reported `costUSD` beside it. `test/generation-record.test.mjs` holds both halves. A custom provider that still puts `costUSD` inside usage is now refused. Bloom ships one network adapter, for chat completions, with no default service: the private `config.json` in the data directory names the endpoint and the environment variable that holds its key, for the terminal and the web workspace alike. Chat completions commonly includes cached reads in its input count. Bloom keeps the provider’s reported total and never converts absent usage into a monetary saving. Without an endpoint, team turns stop with `PROVIDER_UNCONFIGURED`.

Stopping or losing a server never implicitly repeats a model call. In-progress team outputs appear only after the model returns a complete structured response. A coding session runs on a pluggable runtime: `run(input, hooks)` streams text, plan and tool events, asks for approvals through the harness and returns a stop reason. Bloom offers each option the runtime sends, such as **Allow once**, **Always allow** and **Reject**. The coding loop is the runtime for `--workspace` sessions; the scripted runtime is demo-only.

## Workspace tools

`src/workspace-tools.mjs` binds Drosera's workspace tool pack to the canonical
session directory from `workspacePath`. Its file tools check relative paths
and resolved link targets before content I/O. A recursive text search
visits regular workspace files in path order. Directory output and search
matches use workspace-relative names.

Writes queue by canonical path in the Bloom process and replace the target
atomically. A targeted update needs one exact match, including the check for
overlapping matches. Command execution uses the canonical workspace as its
working directory and takes an executable and arguments without shell
expansion. Bloom forwards `PATH`, `LANG`, and `TERM`. Each command gets a fresh
temporary `HOME`, and `USERPROFILE` on Windows, outside the workspace and the
user's home. Bloom removes it after the run. The command deadline
stops output capture and terminates the launched process. On POSIX it targets
the process group. Commands run under the local OS account and the coding
adapter owns the approval and dispatch flow.
Commands are off by default. The executor runs `workspace.shell.execute` only
when it is created with the `workspaceCommandAccess` symbol, which
`src/workspace-tools.mjs` exports and only `src/coding-loop.mjs` passes (a
guard test checks this). There is no test-only command mode: tests use the
same allowlisted gate.

The executor returns `output`, `truncatedBytes`, and `outputSha256`. It keeps a
UTF-8 prefix ending at a complete code point and hashes the full decoded text
before truncation. For commands, stdout and stderr contribute in observed
order, and a timeout reports the text captured up to the deadline alongside
`timedOut` and a null `exitCode`.

## Coding loop

**Implemented.** `src/coding-loop.mjs` is a coding runtime on the harness seam
`run(input, hooks)`. `bloom chat --workspace PATH` and `bloom run --headless
--workspace PATH` use it when no `--team` is named, and the browser workspace
lists it as a runtime when an endpoint is configured. Every model call runs
behind `src/provider.mjs`, so seed's `normalizeGeneration` checks each record.

Each model reply holds a short note and exactly one fenced json block,
`{ "tool": "<tool id>", "args": { } }`. Parsing is strict. Bloom checks the tool
against the admitted tools and the arguments against the face `inputSchema`
with seed's `validateValue`, and checks a result against an `outputSchema` when
the face declares one. Argument and output checks share one repair turn; a
call that runs resets it. A second failure stops the turn as `malformed`, and
nothing malformed runs. A reply the model did not finish (`complete: false`)
counts as malformed. `run.answer.create` ends the turn with `turn.finished`.

Read tools run without a prompt. `workspace.file.write`, `workspace.file.update`
and `workspace.shell.execute` raise `permission.requested` first, showing the
full content, the edit, or the command with every argument verbatim. A
rejection never executes, and the model is told "denied by owner". "Allow this
exact call for the session" binds the tool ID plus a SHA-256 digest of the
arguments, and is never offered for `workspace.shell.execute`. A headless run
refuses every write and command without asking.

The client streams when it passes a delta callback: `stream: true`, with the
server-sent events read into `assistant.delta` as they arrive. A reply is
complete only on `finish_reason: "stop"`, usage is `null` when the server does
not report it, never `0`, and an abort rejects so no completed record exists.
Streamed text passes the endpoint redactor with a held-back tail, so an address
split across chunks is still masked.

The trace has one `model.call` row per generation (duration and usage, or
"usage unreported") and one `tool.updated` row per tool call: time, tool ID, a
short argument summary (paths, queries and the command, never file contents),
the result status, bytes or the exit code, and the duration in milliseconds.
Command rows carry the tail of the command output.

### Command gate

Before a command runs outside tests, all of these hold:

1. Only `node`, `npm` and `git` run, by exact name, resolved against the search
   path fixed when the tools are created. Relative entries and entries inside the
   workspace are skipped. A command containing `/`, `\`, `..`, a drive letter
   or an absolute path is refused, and so are `sh`, `bash`, `cmd` and `powershell`.
   On Windows a name that resolves to a `.cmd` or `.bat` file is refused, because
   it needs a shell.
2. Arguments that are absolute, start with `~`, contain a `..` segment, have a
   drive or UNC root, or start with `file:` are refused, and the same check
   applies to the value in `--flag=value` and to the remainder of an attached
   short option such as `-O<path>`. An argument is resolved through the nearest
   existing ancestor and through links, so a new file under a linked folder
   outside the workspace is refused.
3. Evaluation and redirection are refused: for `node`, `-e`, `--eval`, `-p`,
   `--print`, `-r`, `--require`, `--import`, `--input-type`, `--loader`,
   `--experimental-loader`, `--run` and any short option cluster holding `e`,
   `p` or `r`; for `npm`, `exec`, `x`, `explore`, `edit`, `--prefix`, `-C`,
   `-g`, `--global`, `--location`, `--script-shell`, `--node-options`,
   `--offline`, `--no-offline`, `--prefer-online`, `--registry`, `--userconfig`,
   `--globalconfig`, `--cache`, `--proxy` and `--https-proxy`; for `git`, `-C`,
   `--git-dir`, `--work-tree`, `-c` and `--exec-path`, with the subcommand limited
   to `status`, `diff`, `log`, `add` and `commit`.
4. The command environment is `PATH`, `LANG` and `TERM` from Bloom's own
   environment; a fresh temporary `HOME`, and `USERPROFILE` on Windows, outside
   the workspace and the user's home; `npm_config_offline=true` with npm's
   update notifier, fund and audit messages off; and `GIT_CONFIG_NOSYSTEM=1`,
   `GIT_TERMINAL_PROMPT=0`, `GIT_PAGER=cat` and `PAGER=cat`. Every git command
   also forces `core.fsmonitor=false`, an empty `core.hooksPath` under the
   temporary home, and `core.pager=cat` through `GIT_CONFIG_COUNT` overrides,
   and adds `--no-ext-diff` on `git diff` and `git log` so a planted
   `diff.external` never runs. If removing the temporary home fails, the
   command result is kept and its trace row says "home cleanup failed".
5. Every command asks for approval and shows the command and every argument.
   There is no session-wide allow for commands. A call runs only on
   `allow-once` or `allow-session`; any other choice is a rejection.
6. File tools refuse any write or update under `.git/` at any depth: a
   case-insensitive string check on path segments before any existence or
   realpath lookup, then a second check on the resolved target that treats
   trailing dots and spaces on a segment as insignificant. On Windows, the
   check also compares native resolved paths to refuse targets inside the
   actual `.git` directory, including targets reached by a short alias.

### Residual risk

Approval of each call is the boundary. `npm test` runs whatever the
`package.json` scripts say, and the model may have written those scripts in an
approved write. Commands can reach the network: npm is set offline (flags that
change registry, cache or online mode are refused, including unambiguous npm
option prefixes) and git is limited to local subcommands with fsmonitor, hooks,
`diff.external` and the pager forced off, but Bloom does not block network
access from the process. The repository's own git config is trusted input and
can still name programs (`textconv`, filters, `core.editor`); only fsmonitor,
hooks, `diff.external` and the pager are forced off. The isolated `HOME` only
changes the environment variable, so a command can still find your real home
folder through the operating system's account lookup, and ssh-based git uses
that account entry too. A detached grandchild process can outlive the call,
because Bloom stops only the process group it launched. Writes under `.git/`
are refused; other repository metadata outside `.git/` can still be written if
approved.

## Cloud providers

A provider with `locality` set to `cloud` is refused in the terminal until
`--allow-cloud` is passed, and only inside a folder created by
`scripts/make-sandbox.mjs` for the coding loop. Team sessions never use a cloud
provider. While cloud is on, Bloom asks before the first message leaves the
machine and before every tool call, including reads, and does not offer
session-wide allow. Model rows say cloud. The web workspace stays local only.
Opt-in live tests run with `BLOOM_LIVE=1 npm run test:live` (and
`BLOOM_LIVE_ALLOW_CLOUD=1` when the provider is cloud) and never from offline
`npm test`.

In cloud mode these leave the machine and go to the provider named in your
config (for AI Studio, Google): each task you approve, Bloom's fixed tool
instructions, short summaries of earlier tasks and answers in the same session,
the model's own replies within the turn, and every tool result you approve,
including file contents and command output. Bloom asks before each task is sent
and before each tool call; the follow-up requests inside a turn carry only
results you already approved and are sent without a further prompt. Your key
travels only in the request's Authorization header. What the provider keeps,
and for how long, is set by its terms, not by Bloom: Google's Gemini API terms
say that on unpaid use, including AI Studio and free quota, Google uses
submitted content and responses to improve its products. Use a throwaway
sandbox and send nothing you would not publish.

## Model profiles

`bloom doctor --probe` asks the configured provider what it supports and saves
the answer as a seed model profile in `profiles.json` in Bloom's data
directory, keyed by the provider's config name and the model alias. The file
holds no address, and the printed checks name the provider only by its config
name and locality.

The probe sends two requests. The models list, with a 5 second limit, shows
whether the server answers, which model IDs it lists, and whether the
configured alias's backend model is among them. A failure is reported as
`refused`, `timeout`, `tls` or `http-<code>`. One fixed one-token streaming
request, with a 30 second limit, shows whether the server streams; it carries
the same short message every time and nothing from the user. Context length,
tool calling and constrained output are `reported` only when the models list
entry publishes them, and `unknown` otherwise. No probe request carries a tools
or schema field, and an unknown check is never a pass. `doctor --probe` exits 1
on any failed check.

The coding loop reads the saved profile for the provider and alias it runs
with. A reported or probed context length sets the prompt budget, and a probed
"no" for streaming makes it ask for whole replies. Anything unknown falls back
to the default budget and to streaming. The action format stays the fenced json
block whatever the profile says, so tool calling and constrained output are
recorded but do not change the requests yet.

## Local note writes

The HTTP handler checks the local host and rejects a mismatched Origin before looking up the team. Add note, Correct, Keep and Forget require `confirmed: true` in the request body after that lookup. The browser sends it on the corresponding user action. An authenticated seat gate would require independently verified browser identity and a seat binding. Bloom's session IDs identify local conversations, and the OS account is the trust boundary.

## ViDesign continuity

Bloom’s original UI uses ViDesign’s emitted Nocturne property names for surfaces, contrast, Geist typography, radii and spacing. The conversation uses solid reading surfaces and a single composer. The application self-hosts its OFL fonts and requires no remote art or font requests. Team identity uses names, charters and voices.

The project includes the numerical and typographic properties it consumes. A maintainer with a ViDesign checkout can verify the public snapshot against its generated CSS:

```sh
npm run design:sync -- ../videsign/dist/tokens.css --check
```

Omit `--check` to update the used properties. A fresh Bloom checkout runs from the included snapshot. The upstream design handbook, source layouts, character artwork and brand marks are separate works.

## Verification

The portable suite exercises the budgets, group handoffs, review hold, restart, deletion fence, file-integrity checks, the chat-completions adapter, the provider seam, the coding-session harness against a scripted runtime, the command gate, the provider probe against a fake server, the coding loop against a scripted provider and a synthetic project with zero network calls, and the smoke eval over the same synthetic project. The hosted checks start a real Bloom listener on Windows, macOS and Linux. A Chromium journey opens a reviewed document and tests a narrow viewport. These checks use synthetic briefs and source files. A hosted, billed generation and a graphical desktop session have distinct verification requirements.

## Changes

- 2026-11-24: Run the deterministic coding smoke dataset with `bloom eval --smoke`, which emits case and report events and makes no network call (CAP-14, bloom#16).
- 2026-11-24: Compare resolved Git metadata paths on Windows and verify the Git command fixture with portable repository configuration (CAP-04, bloom#5).

- 2026-11-24: Harden the command gate and file tools for the coding loop (CAP-04, bloom#5).
- 2026-11-24: Add `bloom doctor --probe` and drive the coding loop's budget and streaming from the saved model profile (CAP-16, bloom#7).
- 2026-11-24: Read the web workspace's endpoint only from the private config and show coding rows and approval detail in the browser (CAP-04, bloom#8).
- 2026-11-24: Add cloud opt-in with `--allow-cloud` in a make-sandbox folder, Gemini OpenAI-compatible probe and error mapping, and opt-in live tests (CAP-16, bloom#9).
- 2026-11-24: Add the coding loop with strict actions, one shared repair turn, per-call approvals, streamed text, a trace row per call, and the allowlisted command gate (CAP-04, bloom#5).
- 2026-11-24: Add workspace executors with contained file paths, a disabled-by-default command executor, and bounded output records behind the internal tool interface (CAP-04, bloom#4).
- 2026-11-24: Use one native path resolver for workspace root and tool path comparisons (CAP-04, bloom#4).

# How Bloom works

Bloom runs as one Node.js webserver with an embedded SQLite database, a directory of Markdown artifacts and a browser client. One head owns a team conversation. Every group post names its author. Durable sequence numbers let a disconnected browser replay activity. A model adapter supplies generations. The harness decides which files to read, which specialist owns the next step and when to stop.

## The shared computer

Grok Bot’s published design gives a user one persistent cloud computer. The bots share files and browser state, have individual screens, and can hand tasks to another bot in a group. Its primary bot can create specialists. Each responding bot consumes usage. These are product behaviors described by xAI. Its internal prompts and scheduling algorithms are proprietary. [How Grok Bot works](https://docs.x.ai/grok-bot/how-grok-bot-works) · [Shared computer](https://docs.x.ai/grok-bot/computer-and-apps) · [Group messaging](https://docs.x.ai/grok-bot/chat-and-collaboration)

Bloom implements the shared-computer idea locally. Every team can discover ordinary files from the same desktop. Each output gets an immutable ID, a readable filename, a hash and directed input edges. Specialists can change files they were given: a revision, rename or move into a folder writes a new immutable file in the same revision chain, linked to the version it replaces. The desktop lists the newest revision each team may see, and every earlier revision stays readable. A revision derived from team notes is private to that team, so other teams keep the last shareable revision, and Forget withdraws it. Folders are catalog metadata; files on disk stay flat. The shell and browser in the optional graphical desktop belong to the user. Agent-controlled mouse, keyboard, separate screens and browser-login handoff are future integrations. The OS account remains the trust boundary.

## Agent and memory contracts

| Concept | Local implementation |
| --- | --- |
| VI (Virtual Intelligence) | The head holds a name and charter. A structured model response creates or updates persistent specialist profiles with a jurisdiction, voice and stage. A persona library, shared by every team on the installation, keeps saved profiles. The head sees it while planning; recruiting a persona copies its saved jurisdiction, voice, stage and optional model onto the team, and the head writes only the assignment. |
| OAI (Open AI Instance) | A provider-backed generation fulfills a role. The same profile can run on another configured model, and a persona with a preferred model runs on it. Each dispatch owns its input and reports its usage independently. |
| LA (Logical Agent) | The head can assign the verify stage to a named deterministic worker. It re-reads the admitted files and verifies their hashes without spending a model call. |
| Memorix | Memory keeps the Memorix distinctions apart. Owner-confirmed notes are either rules, which always apply, or facts, recalled only when they match the task. A note belongs to one team or is shared with every team on the installation. Agent suggestions stay unconfirmed and are never recalled until the owner keeps them. Correct supersedes a note; Correct and Forget both move the epoch of every team that could use the note, so derived files and pending suggestions are withdrawn. Recall ranks notes with a portable reading of Memorix floatation (`synaptic.score.v1`): lexical relevance in place of vector similarity (0.45), provenance (0.15), confidence (0.08), logarithmic use mass (0.07), a 30-day freshness half-life (0.05) and usefulness (0.05, +0.08 per approved review). A near-duplicate filter applies, with at most eight notes and 2,000 characters per call. Each call records which notes it received. Reading evidence or posting a message creates no durable note. |
| Tri-Cluster | Three logical roles run locally. SQLite holds authoritative records and provenance edges. A bounded in-process TTL cache serves the hot note set, and ranking runs per call. File-to-file edges connect inputs with resulting artifacts. There is no external graph or cache daemon to install. |
| ARKSRRA | The head proposes an ordered plan. A deterministic rule validates the response and the stage order. A reviewer records approve or revise. A revision verdict stops automatic assembly. These are the admission and review behaviors implemented in this edition. |
| CRS | An append-only event history records roles, calls, review decisions and artifact references for inspection. The team receives bounded group posts and selected artifacts. Ambient development telemetry is outside the model’s context. |

These are portable implementations of selected Vidoxlabs behaviors. Full semantic ranking, multi-store replication and the historical seven-stage ARKSRRA transport are outside this release. The private ViWeb harness blueprint informed the scoped handoffs, per-run budgets, deletion boundaries and visible tool activity. Public background is available in the [Memorix](https://vidoxlabs.dev/research/library/memorix), [Tri-Cluster](https://vidoxlabs.dev/research/library/tri-cluster) and [ARKSRRA](https://vidoxlabs.dev/research/library/arksrra) articles.

## Teams talk to each other

A head agent sees the other teams on the installation by name and jurisdiction. It may ask one of them one question per task. Bloom opens a turn in the other team's conversation, so that team shows as busy, cannot start its own task meanwhile, and can stop the answer. The other team's head answers once from shareable material only: its jurisdiction, notes shared with every team, its unscoped group posts and its shareable desktop titles. Private notes never cross a team boundary. The asking head sees no notes, so its question cannot carry them either. The answering head sees no other teams, so a question cannot be passed along. The question and answer are recorded in both conversations' event histories. The answer reaches the asking team's specialists, labelled as coming from another team. The asking team's call and token limits cover the answer.

## Model calls and evidence

The head receives the brief, roster and ordinary desktop file titles. Worker calls receive the jurisdiction, explicit assignment, the ranked notes admitted for that assignment, recent group handoffs (including answers from other teams) and attached evidence. The text budget for all file excerpts in a worker packet is 28,000 characters, with a per-file cap of 12,000 characters. Character caps protect packet size. The usage ledger uses provider-reported token counts. Stable system instructions precede the changing evidence, allowing supporting providers to reuse their prompt prefix.

A team provider implements `generate({system, prompt, model, signal, ...})` and returns `{text, complete, model, usage, costUSD}`. `text` is always a string; a reply with no text body is returned as an empty, incomplete record. `usage` holds token counts only, in five fields: `input`, `output`, `total`, `cacheRead` and `cacheWrite`. A reported monetary cost is `costUSD`, beside usage rather than inside it. Missing metrics use null. Since 0.7.0 Bloom imports seed and runs every team provider behind its provider seam (`src/provider.mjs`): seed's `validateProvider` checks the adapter when Bloom starts, and seed's `normalizeGeneration` checks every reply before the team loop reads it. A reply outside the record stops the turn with `PROVIDER_CONTRACT`. Seed's record has no money field, so Bloom carries a reported `costUSD` beside it. `test/generation-record.test.mjs` holds both halves. A custom provider that still puts `costUSD` inside usage is now refused. Bloom ships one network adapter, for chat completions, with no default service: `--api-base` names the endpoint and `BLOOM_API_KEY` its key. Chat completions commonly includes cached reads in its input count. Bloom keeps the provider’s reported total and never converts absent usage into a monetary saving. Without an endpoint, team turns stop with `PROVIDER_UNCONFIGURED`.

Stopping or losing a server never implicitly repeats a model call. In-progress team outputs appear only after the model returns a complete structured response. A coding session runs on a pluggable runtime: `run(input, hooks)` streams text, plan and tool events, asks for approvals through the harness and returns a stop reason. Bloom offers each option the runtime sends, such as **Allow once**, **Always allow** and **Reject**. No coding runtime ships with this release; the scripted demo runtime is the only one, and without a runtime the page offers teams only.

## ViDesign continuity

Bloom’s original UI uses ViDesign’s emitted Nocturne property names for surfaces, contrast, Geist typography, radii and spacing. The conversation uses solid reading surfaces and a single composer. The application self-hosts its OFL fonts and requires no remote art or font requests. Team identity uses names, charters and voices.

The project includes the numerical and typographic properties it consumes. A maintainer with a ViDesign checkout can verify the public snapshot against its generated CSS:

```sh
npm run design:sync -- ../videsign/dist/tokens.css --check
```

Omit `--check` to update the used properties. A fresh Bloom checkout runs from the included snapshot. The upstream design handbook, source layouts, character artwork, brand marks and private blueprint are separate works.

## Verification

The portable suite exercises the budgets, group handoffs, review hold, restart, deletion fence, file-integrity checks, the chat-completions adapter, the provider seam and the coding-session harness against a scripted runtime. The hosted checks start a real Bloom listener on Windows, macOS and Linux. A Chromium journey opens a reviewed document and tests a narrow viewport. These checks use synthetic briefs and source files. A hosted, billed generation and a graphical desktop session have distinct verification requirements.

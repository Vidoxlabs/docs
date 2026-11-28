# Agent runtime patterns

> **Withdrawn in part.** This pass planned five fixed starter seats with set names. Vivarium ships no fixed roster: agents are created by each person in setup, from generic templates ([vivarium ADR-0002](https://github.com/Vidoxlabs/vivarium/blob/main/docs/adr/0002-internal-agents-use-the-public-setup.md)). The starter-seat steps below are kept as history with placeholder names and are not to be built.

> **Note, 2026-11-22 (Bloom 0.7.0).** Bloom no longer runs OpenCode in any form, and it now imports seed for the provider seam. The OpenCode and swarm-plugin sections below describe other products as they were read that day. They are evidence about those products, not Bloom behavior. The rest of this report is unchanged.

Checkable notes for Bloom's team loop, the installed swarm plugin, and the public harness pages opened on 2026-11-22. OBSERVED claims cite a file or a URL from that day. RECOMMENDED claims are proposals a reviewer can accept or reject. They are not current Bloom behavior.

This file does not paste system prompts. `docs/architecture.md` uses several Vidoxlabs names as labels for local notes, the review stop, and the session event log. The running code is `Teams`, `TeamStore`, and the session event table.

## 1. What Bloom does today

OBSERVED from `src/teams.mjs`, `src/team-store.mjs`, `src/http.mjs`, `src/harness.mjs`, `src/store.mjs`, `src/models.mjs`, `public/index.html`, `public/team.js`, `public/app.js`, `test/team.test.mjs`, and `docs/ui/interface-contract.md`.

### Create

`POST /api/teams` is the only team-create route. `createHandler` returns 201 from `Teams.create`.

`Teams.create` reads a name (`Head agent` when the body omits one), a charter, a call limit (default 6, range 1–20), an optional token limit, and an optional model. Inside one transaction it creates a session with adapter `team` and inserts one `teams` row. It does not insert `members` rows.

The screen copy that submits this call, quoted from `public/index.html` and `docs/ui/interface-contract.md` section 0, is:

- Empty heading: `What should we work on?`
- Primary button: `Create a team`
- Kind: `Team`
- Field: `Head agent name`, initial value `Lead`, hint `Plans the work and creates specialists for it.`
- Field: `Jurisdiction`, placeholder `What should this head agent be responsible for?`, hint `What this agent is responsible for.`
- Submit: `Create team`

The head is the `teams` row and the session title. The roster paints that row with display stage `Head agent`. Stored specialist stages stay `research`, `review`, `assemble`, `work`, and `verify`.

### Delegate

`POST /api/sessions/:id/turns` calls `Harness.start`. For a team session, `Teams.input` chooses the recipient.

- `To`, or a leading `@Name:`, selects one existing member. `Teams.run` then sets a single assignment to that member's stored profile and the user's text. It does not call the planner and does not upsert. `test/team.test.mjs` checks `@Reviewer:` and `to: 'Researcher'`.
- A message to the head (the `To` control's first option, which `teamView.target` omits from the body, or text that does not name a member) calls the planner. `planOf` requires 1 to 5 agents. Each agent has `name`, `charter`, `voice`, `stage`, and `assignment`. Stage must be one of the five stored ids. A review stage after an assemble stage is rejected. Names must be unique and must differ from the head.
- The planner path upserts those specialists, posts one `team.message` from the head with `assignments`, then runs the assignments in array order.
- `TeamStore.upsert` inserts or, on the same team and name, overwrites `charter`, `voice`, and `stage`.
- A specialist cap of 32 is checked before that upsert. The verify stage re-reads supplied files and writes a hash report with no model call. Any other stage makes one provider call.
- A review `verdict` of `revise` finishes that reviewer's post, sets `reviewBlocked`, and does not run later specialists. The turn finishes `revision` / `review_requested_changes`. `test/team.test.mjs` expects authors `Head agent`, `Researcher`, `Reviewer` and no assembler. `approve` lets later specialists run.
- The scripted demo in `src/models.mjs` returns Researcher, Reviewer, and Assembler. That roster is the demo provider, not a seeded product roster.

### Communicate

Group speech is `team.message`. The author, text, epoch, and optional `assignments`, `file`, `scoped`, and `verdict` are stored on the session event. There is no recipient field.

The next specialist sees up to six `team.message` rows for the current epoch, loaded by `Teams.recent`, plus saved notes from `TeamStore.recall`. Those notes are team notes. `Forget` deletes one note, bumps `teams.epoch`, and stops an active turn.

`Harness.event` also records, on this path:

- `user.message` and `turn.started` from `Store.startTurn`
- `team.call` with `phase` `plan` or `work`
- `team.usage`
- `team.recall`
- `tool.updated` for a URL read or a desktop move
- `turn.finished`, and `turn.stopping` if the user presses `Stop`

The transcript in `public/app.js` paints `user.message` and `team.message` in the same log. A head post with `assignments` shows `name — assignment`. A review post shows `Review approved` or `Changes requested`. `team.call` is appended to `#plan` as `Actor · Planning` or `Actor · Working`. `team.recall` is appended to `#tools` as `{actor} · notes reused · {count} notes` or `{actor} · notes loaded · {count} notes`.

### What the user can see or edit afterward

OBSERVED screen, matching the interface contract:

- `To` lists the head first, then members in `rowid` order. `Send` starts a turn. `Stop` aborts it.
- The `Team` list is read-only `<details>`. Summary pattern: `name · Head agent`, `name · Research`, `name · Review`, `name · Assemble`, `name · Work`, `name · Check`.
- Hint lines on those rows: `VI · Team coordinator` for the head, `LA · Deterministic verification` for `verify`, `OAI · Model-backed specialist` otherwise, plus the voice when a specialist has one.
- The user can add a shared-desktop file, check up to six files, open a file, save a note, and `Forget` a note.
- `Shared desktop` heading and hint: `Files every agent on this computer can open and reuse. Check files to include with the next task.`
- `Notes`, `Activity`, and `Usage` are the inspector headings. Waiting copy: `Give the head agent a task. Check the shared desktop when the team needs evidence.`
- The user cannot change a member's name, charter, voice, or stage after create. `createHandler` has no member path. Its team pattern covers the team id plus `sources`, `notes`, and `files` only. A search of `src/http.mjs` finds no `PATCH` or `PUT`.
- A later message to the head can still overwrite an existing member through `TeamStore.upsert`. That is the planner, not an edit form.
- One model id is selected for the turn. Members have no model column.

Coordinator checks re-verified against this code:

| Claim | Result |
| --- | --- |
| `POST /api/teams` creates the head | Observed. `Teams.create` writes the session and the `teams` row. |
| The planner upserts 1 to 5 specialists, posts one group message, then runs them in order | Observed on the head path in `Teams.run`. |
| `To` or `@Name` runs one existing member and does not plan | Observed in `Teams.input` and the direct branch of `Teams.run`. |
| `TeamStore.upsert` exists and no HTTP route edits a member | Observed. |
| Events include `team.message`, `team.call`, `team.usage`, `team.recall`, and `tool.updated` | Observed. The turn also emits `user.message`, `turn.started`, and `turn.finished`. |
| A review verdict of `revise` stops later specialists | Observed. The reviewer still posts. |

## 2. What the installed swarm plugin does

OBSERVED from the installed package `opencode-swarm-plugin` 0.63.2 at the vidoxlabs swarm-tools package path, dependency `swarm-mail` 1.11.2. The plugin `package.json` `repository` is `https://github.com/joelhooks/swarm-tools`. The README badge links `https://github.com/joelhooks/opencode-swarm-plugin`. There is no `swarm-mail.js` in the plugin `dist`. Mail tools are the bundled `src/swarm-mail.ts` section of `dist/index.js`. Cell creation and message append are in `swarm-mail` `dist/index.js`. The state database was not opened.

The README in that install still has a "What's New in v0.33" section. The behavior below is from the 0.63.2 bundle, not from that older section.

### How a cell is created

`hive_create` is described as "Create a new cell in the hive with type-safe validation". Arguments: `title`, optional `type` (`bug`, `feature`, `task`, `epic`, `chore`), optional `priority` 0–3, optional `description`, optional `parent_id`.

`hive.js` `execute` parses those args, takes the hive working directory as the project key, and calls `adapter.createCell`. In `swarm-mail` `src/hive/adapter.ts`, `createCell` builds a `cell_created` event. `generateBeadId` builds the id from a project-name prefix (or `cell` when `package.json` has no usable name), a short hash of the project key, a base-36 timestamp, and three random base-36 characters. `appendCellEventDrizzle` inserts that event and updates projections. The tool then emits another `cell_created` via `safeEmitEvent` and returns the formatted cell. This creates a work record. It does not start an agent process.

`hive_create_epic` creates one epic cell, then one task cell per subtask with `parent_id` set to the epic, and emits `epic_created`, `decomposition_generated`, and `swarm_started`. On failure it deletes the cells it already created.

`hive_update` is declared with `id` plus optional `status`, `description`, and `priority`. `hive_close` is declared with `id` and `reason`.

### How a worker is spawned

`swarm_spawn_subtask` is described as "Prepare a subtask for spawning. Returns prompt with Agent Mail/hive tracking instructions." Its `execute` builds a prompt, selects a model, records a coordinator `worker_spawned` decision, and, when `project_path` is set, appends a `worker_spawned` event whose `worker_agent` is the literal `worker`. The return value is JSON: `prompt`, ids, files, `recommended_model`, and post-completion instructions. The function does not start a process.

`swarm_delegate_planning` is described as "Delegate task decomposition to a swarm/planner subagent. Returns a prompt to spawn the planner." Its `execute` returns that prompt. It does not create the planner process.

`swarm_spawn_researcher` and `swarm_spawn_retry` likewise return prompts.

### How mail is sent

`swarmmail_init` loads session state. If that session already has a state, it returns `already_initialized` and the existing `agent_name`. It does not register the name passed on the second call. On a fresh session, `initSwarmAgent` appends `agent_registered` and stores `projectKey` and `agentName`.

`swarmmail_send` requires that session. `sendSwarmMessage` classifies the subject into `progress`, `blocked`, `question`, `status`, or `general`, appends `message_sent` (recipients, subject, body, thread, importance, ack flag), and appends `thread_created` when the thread id is new. It then reads back a message id. `swarmmail_inbox` returns at most five messages and omits bodies. `swarmmail_read_message` loads one body.

`swarmmail_reserve` grants exclusive path locks through `reserveSwarmFiles`. It does not deliver chat.

On this research run, `swarmmail_init` for `bloom-runtime-researcher` returned `already_initialized` as `bloom-ui-coordinator`. `swarmmail_reserve` for this file still returned a grant. `hivemind_find` returned no matches. `skills_list` returned no skills.

## 3. Public harness observations

Pages opened on 2026-11-22. HTML conversions of the GitHub repo homes did not list source files. Raw files and the GrokBot contents API did.

### GrokBot repository

OBSERVED. These pages disagree with each other. None of them is Bloom.

- `https://github.com/Franzferdinan51/GrokBot` loaded as a repository home without a file list.
- Raw `README.md` on `main` is titled "Grok Build Desktop". It describes one primary agent, optional subagent delegation, and a mixture-of-agents preset of 2–8 reference models plus one acting aggregator. Reference models are plan-only. The aggregator edits and verifies. The install snippet clones `Franzferdinan51/Grok-Build-Desktop-App`. The user can change model, permissions, skills, and workspace files. The page does not show a control named `Head agent`.
- Raw `VISION.md` on `main` describes GrokBot as a terminal-first assistant. It says the project will not merge agent-hierarchy frameworks as a default architecture. It describes plugins, skills, and one active memory plugin. It does not specify a create, delegate, or mailbox API.
- The contents API for `main` lists `docs/cli/agents.md`, `docs/concepts/agent.md`, and `docs/concepts/multi-agent.md`. Those raw pages describe a different surface: `grokbot agents add` creates an isolated agent with a workspace, model, agent directory, and channel bindings. `main` cannot be used as a new id and cannot be deleted. `grokbot agents set-identity` writes `name`, `theme`, `emoji`, and `avatar`. Workspace files `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, and the other bootstrap files are injected on a new session and are user-editable. Inbound channel traffic is routed by bindings. The multi-agent example sets `tools.agentToAgent.enabled` to `false` and comments that agent-to-agent messaging must be enabled and allowlisted. `sessions_send` and `sessions_spawn` appear as names in one tool allow list. Their parameters were not opened. The linked sub-agents page was not opened.

`docs/architecture.md` cites three xAI Grok Bot docs. Those URLs were not opened for this report.

### OpenCode

OBSERVED at `https://opencode.ai/docs/agents/`.

- An agent is a Markdown file or an `agents` entry in JSONC. The Markdown body is the system prompt. Locations: `~/.config/opencode/agents/` and `.opencode/agents/`. Nested project paths become part of the id.
- `mode` is `primary`, `subagent`, or `all`. A subagent runs only through the `subagent` tool, in a child session, in the background. The parent is told when the child goes idle and after later rounds. The parent's `subagent` permission lists which agents it may launch. The child uses its own permissions.
- Built-ins named on the page: `build` and `plan` (primary), `general` and `explore` (subagent). The user asks in text, for example to use a reviewer subagent. `default_agent` does not replace the agent stored on an existing session.
- The user edits the Markdown or JSONC afterward: description, mode, model, permissions, steps, hidden, color, and disabled. A subagent uses its configured model, or the parent session model when none is set.

### Claude Code agent teams

OBSERVED at `https://code.claude.com/docs/en/agent-teams`. The page says teams are experimental and off until `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

- The user asks in a normal prompt. Claude spawns teammates by calling the Agent tool with a `name`. The lead's conversation is not copied. The spawn prompt is. A named subagent definition can supply tools, model, and body text.
- The lead assigns tasks, or a teammate claims the next unblocked task. Claim uses file locking. Tasks are pending, in progress, or completed. Teammates do not spawn teammates. One team per session. The lead stays the lead.
- Teammates message each other with `SendMessage`. Each mailbox is a JSON file under `~/.claude/teams/{team-name}/inboxes/`. A write is reported as sent only when the file write succeeds. Messages are labeled as coming from another session. Idle teammates notify the lead.
- The user sees an agent panel, or split panes with tmux or iTerm2. Enter opens a teammate transcript and sends a message. A teammate's model is fixed at spawn. The page says not to hand-edit the team config. Permission prompts surface on the lead. In-process teammates are not restored by resume.

### Cursor

OBSERVED. `https://cursor.com/docs/agent/chat/subagents` returned 404. The pages that loaded are `https://cursor.com/docs/agent/overview`, `https://cursor.com/docs/subagents`, `https://cursor.com/docs/agent/projects`, and `https://cursor.com/docs/agent/agents-window`. The index `https://cursor.com/llms.txt` supplied those URLs.

- Overview: an agent is instructions, tools, and a selected model. For a larger body of work the user creates a Project. The page says a coordinator plans and delegates. Checkpoints and the chat timeline are how the user reviews file snapshots. Restoring a checkpoint reverts files and leaves messages in place.
- Projects: in the Agents Window the user clicks New Project, sets an icon, name, cloud repository, and coordinator model. The coordinator does not write code. It creates agents and the user can open any of those agents and talk to it. Chats can be added to or removed from the Project. Shared project context is separate from a personal store. A coordinator message to a teammate's coordinator is delivered as a side chat the user can read, stop, or archive, and cannot message.
- Subagents: Markdown files in `.cursor/agents/`, `.claude/agents/`, `.codex/agents/`, or the matching user directories. Frontmatter fields on the page: `name`, `description`, `model` (`inherit` or an id), `readonly`, `is_background`. The parent delegates automatically, by `/name`, or by a sentence. The subagent starts without the parent's history and returns a result. Parallel work is multiple Task calls. The task card shows the model that ran. Background output is written under `~/.cursor/subagents/`. The user resumes with the returned agent id. The user edits the Markdown file. Built-ins named on this page are Explore and Browser.
- Agents Window: command palette `Open Agents Window`. Parallel local and cloud agents, diffs, and `/in-cloud` for a cloud subagent. The editor remains available.

### Plugin repositories

`https://github.com/joelhooks/swarm-tools` and `https://github.com/joelhooks/opencode-swarm-plugin` both loaded as repository homes without a file list or README body. Installed files are the source for section 2. `https://swarmtools.ai/docs`, linked from the installed README, was not opened.

## 4. Creation, delegation, communication, and edit map

OBSERVED comparison. Empty cells mean the opened page did not specify that mechanism.

| System | Create | Delegate | Communicate | User can see or edit afterward |
| --- | --- | --- | --- | --- |
| Bloom | `POST /api/teams` creates the head only. Specialists appear when a head turn's planner passes `planOf` and `TeamStore.upsert` runs. | Head turn: 1–5 specialists, then in order. `To` or `@Name:` runs one stored member. `revise` stops the rest. | One transcript of `team.message`. No recipient field. Recent posts and notes are data on the next call. | Create form edits the head name and `Jurisdiction` before submit. Roster, voice, and stage are display-only. Notes, files, `To`, `Model`, `Send`, and `Stop` stay editable. |
| Swarm plugin 0.63.2 | `hive_create` appends `cell_created` and returns a cell id. | `swarm_spawn_subtask` and `swarm_delegate_planning` return prompts and can append `worker_spawned`. They do not start the worker. | `swarmmail_send` appends `message_sent` to named agents. Inbox omits bodies. | `hive_update` can change status, description, and priority. File locks are reservations, not a transcript. |
| GrokBot raw README | A desktop conversation plus optional subagents and a mixture-of-agents preset. | Primary agent, or reference models feeding one aggregator. | Advisor text is given to the aggregator. Telegram is a separate channel. | Settings, model, skills, and workspace files. |
| GrokBot `VISION.md` | Not specified. | Says a manager hierarchy is not the default it will merge. | Plugins and channels. No mailbox API on this page. | Terminal-first config, with doctor migrations when config changes. |
| GrokBot `grokbot agents` docs | `grokbot agents add` or `agents.list`. | Channel bindings route inbound messages to an agent id. | `agentToAgent` is off unless enabled and allowlisted. `sessions_send` is only an allow-list name here. | Identity fields and bootstrap Markdown in the agent workspace. |
| OpenCode | Markdown or JSONC agent profile. | Parent `subagent` tool, child session. | Child reports to the parent when it goes idle. | Edit the file or config. Existing sessions keep their selected agent. |
| Claude Code teams | Prompt plus Agent tool `name`, or a subagent definition. | Shared task list, lead assignment, or self-claim. | `SendMessage` and per-agent mailbox files. | Agent panel or split panes. Message a teammate. Do not hand-edit team config. Model is fixed at spawn. |
| Cursor subagents | Markdown under `.cursor/agents/` or a user directory. Built-ins exist without a file. | Parent Task call, `/name`, or a sentence. | Result returns to the parent. Background writes local output files. | Edit the Markdown. Task card shows the model. Resume with the agent id. |
| Cursor Projects | New Project in the Agents Window. | Coordinator creates cloud agents and does not write the code itself. | User chats with the coordinator or opens a worker. Coordinators can message another coordinator into a side chat. | Name, model, membership, task board, and shared context. Side chats can be read, stopped, or archived. |

## 5. Recommendations a reviewer can accept or reject

Each item names the Bloom function or the missing route. Accepting one does not accept the others.

### R1. Seed five seats in `Teams.create`

Accept: after the `teams` insert, `Teams.create` inserts five `members` rows with fixed starter names, in a fixed order. They use the columns that already exist: `name`, `charter`, `voice`, `stage`. They share the team turn's model. `Teams.create` does not gain a per-member model or a prompt column.

Reject if the head name, compared case-insensitively, matches one of those five. `planOf` already refuses a specialist with the head's name. The same check belongs in `Teams.create` before insert.

Starter charter and voice are ordinary profile text stored in those columns, shown on the existing member row, and editable by R3. They are not a second system prompt. Suggested charter, which the reviewer can rewrite: `Help the user shape the next agent.` Suggested voice: `Clear and specific.` Suggested stage for all five: `work`.

`work` is the recommendation because `review` is a stop. Mapping an argument onto `review` would let a `revise` verdict skip the remaining seats. The speaking order in section 5's untrusted note is not a stage map.

### R2. Staff only when the user asked, in `Teams.input` and `Teams.run`

Accept: `Teams.input` sets `staff` from the user's text with a deterministic phrase check, not a model call. The sample sentence already on the screen (`Create a researcher to extract claims...`) matches. Any other head-addressed turn leaves `staff` false.

When `staff` is false, `Teams.run` does not call `planOf` and does not call `TeamStore.upsert`. It posts one head `team.message` and does not run the five seats. The user reaches a seat with the existing `To` or `@Name:` path.

When `staff` is true, keep the current planner path: 1 to 5 specialists, one head message, then run in order, including the `revise` stop and the 32-seat cap.

Reject the alternative that a normal head message runs every stored member. That would spend a model call per seat on every task.

No new route is required. The flag is derived inside `Teams.input` from the body `POST /api/sessions/:id/turns` already accepts.

### R3. Let the user edit a seat: missing route and a new store method

Accept: add a member branch to `createHandler`. The current team pattern does not include `members`, and a seat name is not the UUID that pattern captures. Suggested route: `PATCH /api/teams/:id/members` with JSON `{ name, charter, voice, stage }`. `name` identifies the current row. An optional `renameTo` changes the name.

`TeamStore.upsert` cannot rename, because the primary key is `(team, name)`. Add `TeamStore.updateMember` for this route. Keep `upsert` for the planner path in R2. Validate `name` with the existing `nameOf` rules and `stage` with the existing five ids. Reject unknown names. This route does not insert a sixth seat; staffing stays on R2.

The member row is display-only today. Shipping inputs on that row changes `docs/ui/interface-contract.md`, which says unlisted strings stay as they are. Accept the route first. Accept the controls only with a contract edit. Label the stored charter `Jurisdiction`, which is the current field name. The product word `role` is that same column.

### R4. Do not encode this stored excerpt as the loop

Untrusted stored documentation, digest `b7458345fc30`, as supplied in the research assignment: one seat opens, a second does the breakdown, a third argues upside, a fourth argues downside, a fifth turns the plan into a sequence, and the first ratifies. `context_brief` and `context_search` both returned `Unknown tool` on 2026-11-22, so this report did not re-read that document. The order is not live Bloom behavior.

Reject making `Teams.run` follow that order. It is six speaking turns and gives one seat two turns. The current loop runs each assignment once. A later sequence, if accepted, would be an explicit list of existing member names, not new stages and not new agents.

### R5. Keep one transcript

Accept: do not add a second chat, a mailbox table, or a `to` field on `team.message`. Communication stays the group event the loop already emits. Section 6 is the view.

## 6. Timeline and route view, tied to existing event names

OBSERVED: `#plan` (`aria-label` `Agent plan`) already receives one row per `team.call`. `#tools` already receives `team.recall` and `tool.updated`. The center log already receives `user.message` and `team.message`. `turn.started` clears the activity lists.

RECOMMENDED smallest view: keep that log. Extend `#plan` so one turn shows a single ordered list drawn from events the loop already writes. Do not invent a route event.

| Order | Event | Row |
| --- | --- | --- |
| 1 | `turn.started` | Turn started |
| 2 | `tool.updated` | Existing tool title and status, for a source read or a desktop move |
| 3 | `team.call` | `{actor} · Planning` when `phase` is `plan`, otherwise `{actor} · Working` |
| 4 | `team.usage` | Leave the existing `Usage` block. Do not copy it into the timeline |
| 5 | `team.recall` | The existing notes line |
| 6 | `team.message` | `{author}` plus `Review approved` or `Changes requested` when `verdict` is present |
| 7 | `turn.finished` | The turn status already shown by the inspector |

Route, from fields that exist today:

- A `team.message` whose `assignments` array is present is the route. Paint one line under the assignment list `app.js` already renders: the author's name, then each `assignments[].name` in array order.
- The route ends at the first `team.message` with `verdict` `revise`. That matches `reviewBlocked`. Later names in `assignments` can stay visible as not run.
- A direct turn has no `phase: plan` call and one worker `team.message`. The route is that author only.
- A verify seat emits `team.message` and no `team.call`. The timeline row is the message.

There is no recipient on `team.message`. The line is assignment order, not a claim that one specialist addressed the next.

## 7. Gaps

- Digest `b7458345fc30` was not re-opened. `context_brief` and `context_search` returned `Unknown tool`.
- `https://cursor.com/docs/agent/chat/subagents` returned 404. Subagent behavior is from `https://cursor.com/docs/subagents` instead.
- The three xAI URLs cited in `docs/architecture.md` were not opened.
- GrokBot `docs/tools/subagents`, linked from the multi-agent page, was not opened. `sessions_send` and `sessions_spawn` are allow-list names only.
- GitHub HTML for `Franzferdinan51/GrokBot`, `joelhooks/swarm-tools`, and `joelhooks/opencode-swarm-plugin` did not include README or tree text. `https://swarmtools.ai/docs` was not opened.
- The swarm state database was not opened. Live message bodies were not read.
- `swarmmail_init` on this run did not register `bloom-runtime-researcher` because the session was already initialized.
- Bloom has no HTTP member edit, no rename, and no staff flag. Those are R2 and R3, not current routes.
- No browser pass was run for this document. Screen strings were checked in `public/index.html`, `public/app.js`, and `public/team.js`.

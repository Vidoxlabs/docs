# Familiar harness patterns for Bloom

> **Correction, 2026-11-22 (owner decision).** One section of this report read an unrelated third-party repository that presents itself under a name similar to that of a product Bloom follows ([how that product works](https://docs.x.ai/grok-bot/how-grok-bot-works), [shared computer](https://docs.x.ai/grok-bot/computer-and-apps), [group messaging](https://docs.x.ai/grok-bot/chat-and-collaboration)). That repository is not the product, and the section has been removed. Conclusions drawn from it, including the `Files` and `Lead name` renames, are set aside. The owner kept `Head agent`, `Jurisdiction` and `Shared desktop`; see section 0 of [the interface contract](../interface-contract.md). The rest of this report is unchanged.

Read on 2026-11-22. This report is evidence for a later reviewer. It separates what the pages and this checkout show from what Bloom should change.

Bloom should feel familiar on first open. The familiar gesture is: pick a place to work, type a task, watch the reply, and allow or reject a risky step. People already know the words task, files, team, allow, model, and usage. They do not know Jurisdiction, Head agent, Token stop threshold, or Shared desktop as names for those gestures.

## 1. What a new user already knows

OBSERVED across the pages opened on 2026-11-22:

- First run is a short path. Install or open the app, sign in if the product requires it, choose a folder or repository, and type a task in ordinary language. Cursor’s quickstart says to pick a folder and open Agent. Claude Code’s terminal quickstart says to `cd` into a project and run `claude`. Claude’s desktop quickstart says to choose Local and Open folder. Codex CLI says to run `codex` in a project and describe a task. GitHub Copilot’s task page says to pick a repository, type a prompt, and press Enter. OpenCode’s TUI page says to run `opencode` in the project and press Enter.
- Chat is the place the user types. It sits in a side pane (Cursor Agent, Cmd+I), under a prompt box (Claude desktop, Codex CLI, Copilot), or as a scrolling transcript with a fixed composer (OpenCode TUI).
- Files are the project. People attach them with `@` (Cursor, Claude desktop, OpenCode) or they let the agent search. A separate computer screen, live desktop, or preview is a second surface, present in some products and absent in others.
- Extra agents are created by asking in the task, by a named control such as Create an agent, or by a file the product already knows how to load. The user is rarely asked to invent a legal-sounding charter before the first message.
- Approvals are a pause with a short choice: allow this once, allow it again, or reject it. The words differ. The gesture does not.
- The model is a picker or a slash command next to the prompt. A blank “use the default” is normal.
- Usage, when it is visible, sits next to the prompt or in a footer: context remaining, tokens, or cost. It is not a field the user must fill in before the first task.

RECOMMENDED stance for Bloom: keep the three-column page. Put the first task in the center composer. Ask for a folder only in a coding session. Ask for a lead name only when the user chooses a team. Use the words task, files, team, allow, model, and usage on the controls a new person sees.

## 2. Product-by-product observations

Each block is OBSERVED from the listed URL on 2026-11-22. No live app was opened. Where a page returned chrome or an illustration as text, that is stated. Screens that were not in the fetched text are not described.

### OpenCode

URLs opened:

- https://opencode.ai/docs/
- https://opencode.ai/docs/cli/tui
- https://opencode.ai/docs/cli/acp/
- https://opencode.ai/docs/agents/
- https://opencode.ai/docs/permissions
- https://opencode.ai/docs/cli/config

First run: the intro says OpenCode is a terminal UI, a desktop app, or a web app reached with `opencode pair`. The TUI page says to enter the project and run `opencode`, then type a request. Connect providers with `/connect` or `opencode auth login`. A desktop pane layout was not on these pages.

Chat: the TUI transcript is the session. `@` attaches a file. `!` runs a shell command in the session. `/` opens commands. While a turn is running, Enter steers it. Tabs and `/sessions` return to earlier work. `session.sidebar` can be `auto` or `hide`. The settings page does not say the sidebar is a file tree.

Files: the working directory is the project. ACP `cwd` must be an absolute path. Additional directories can be granted. There is a `/diff` view with a file tree. The TUI page does not show a separate computer or desktop.

Agents: `/agents` or Shift+Tab cycles primary agents. Built-in primary agents are Build and Plan. Built-in subagents are General and Explore. A subagent is a Markdown file or a config entry with `mode: subagent`. The parent launches it; the child runs in its own session. The user can also ask in text: “Use the reviewer subagent…”

Approvals: effects are allow, deny, and ask. An ask offers **Allow once**, **Allow always**, and **Reject**. Allow always saves a project rule. Reject also rejects other pending requests in that session. ACP documents the same three options, with kinds `allow_once`, `allow_always`, and `reject_once`. `session.permissions` may be `prompt` or `autoaccept`.

Model: `/models` or Ctrl+X then M. The id form is `provider/model`. ACP exposes a `model` config option and a `mode` option whose values are visible primary agents. A subagent uses its own model or inherits the session model.

Usage and cache: ACP sends `usage_update` with `used`, `size`, and `cost` in USD when the model’s context size is known, and a prompt `usage` object with input, output, and total tokens. Child sessions are excluded from that prompt usage. The mini footer can show “activity, model, usage, and context.” `session.tps` shows output tokens per second. `debug.turn_tokens` shows per-turn tokens. Compaction is how a long session makes room; the compaction page describes a summary plus recent tokens, not a cache meter in the transcript.

### Cursor

URLs opened:

- https://cursor.com/docs/get-started/quickstart
- https://cursor.com/docs/agent/overview
- https://cursor.com/docs/agent/prompting
- https://cursor.com/docs/agent/agents-window
- https://cursor.com/docs/agent/security/run-modes

The pages opened call the assistant Agent and the input the chat input. They do not show a pane named Composer. A docs search result listed models named Composer 1 and Composer 2.5. That models page was not opened.

First run: download, sign in, pick a folder, open Agent with Cmd+I, and ask it to explain the codebase. Plan Mode is Shift+Tab in the agent input. It researches, asks questions, writes a plan, and waits for approval before building.

Chat: Agent opens in a side pane. The Agents Window is a separate workspace for many agents, opened from the command palette. The editor remains available. Cmd+P and Cmd+Shift+F search files from the Agents Window.

Files: `@` attaches files, folders, terminals, chats, diffs, and the browser. The agent also searches on its own. The overview lists read, edit, shell, and browser tools. Checkpoints restore file snapshots from the chat timeline. No computer desktop is described. Browser is a tool and an `@` mention.

Agents: for a larger body of work, the overview says to create a Project, “a coordinator agent” that plans and delegates. Subagents are documented on a page that was not opened in full. The prompting page’s context tray includes a category named Subagents. The Agents Window can hand work to a cloud subagent with `/in-cloud`. Release-note text in search said collapsed subagent cards show Allow. That release-notes page was not opened in full, so the button is not treated as verified here.

Approvals: Settings > Agents > Approvals & Execution. Modes are Auto-review, Allowlist, and Run Everything. Auto-review can still show an approval prompt. With Read Access set to Workspace, a card shows the path and an Allow action. Cloud Agents do not use these run modes.

Model: a picker at the top of the chat input, or Cmd+/ to cycle. The change applies to the current conversation from then on. The default is Cursor Settings > Models.

Usage and cache: a context ring next to the prompt. Clicking it opens a tray of token categories: system prompt, tools, rules, skills, MCP, subagents, summarized conversation, and conversation. When the window is close to full, older conversation is compressed into a summary. The tray does not label a prompt-cache read or a dollar cost.

### Claude Code

URLs opened:

- https://code.claude.com/docs/en/quickstart
- https://code.claude.com/docs/en/desktop-quickstart
- https://code.claude.com/docs/en/agent-teams
- https://code.claude.com/docs/en/permissions
- https://code.claude.com/docs/en/statusline
- https://code.claude.com/docs/en/sub-agents (search excerpt only; the saved page was not read end to end)

First run, terminal: install, `cd` to the project, run `claude`, sign in. The prompt shows the version, current model, and working directory. The first suggested task is “what does this project do?” If a change needs approval, the quickstart says to select Yes. Shift+Tab cycles the session’s permission mode.

First run, desktop: sign in, open the Code tab, choose Local, choose Open folder, pick a model from the picker at the right of the row under the prompt, and type a task. The same row shows the permission mode.

Chat: the prompt box is the conversation. Desktop can also show diff, terminal, file, and browser panes, rearranged by dragging. `@filename` attaches a file. A side chat is separate from the main thread. Parallel sessions live in the sidebar.

Files and computer: the project folder is the workspace. A diff indicator such as `+12 -1` opens the diff. The terminal opens with Ctrl+`. The Browser pane can show the running app. This is a preview of the user’s app, not a general-purpose computer desktop.

Agents: a subagent excerpt says each subagent has its own context and returns a summary. Built-ins named in that excerpt include Explore and Plan, both read-only. Agent teams are experimental and off until `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. The user asks in a normal prompt to spawn teammates. One session is the team lead. Teammates appear in an agent panel below the prompt. Enter opens a teammate’s transcript so the user can message that teammate. Display is either in-process or split panes. The user can name a model in the spawn sentence.

Approvals: the permissions page says a prompt shows what Claude is about to do, then options. The prose names Yes, “Yes, and don’t ask again,” and sometimes “Yes, and switch to auto mode.” The illustrated prompt body did not come through as text. Desktop modes are Auto, Manual, Accept edits, and Plan. Manual mode shows a diff and buttons to approve or decline. The quickstart’s one-time word is Yes.

Model: `/model` in the terminal opens a picker. Desktop uses the model picker under the prompt. Teammate models follow the spawn prompt, then a subagent definition, then an environment override, then the lead’s model.

Usage and cache: the status line is optional. `/statusline` can be asked to show the model name and a context percentage. The quickstart does not show a default usage or cache meter. The status line doc describes context percentage as something a script prints. It does not describe a built-in cache-read counter.

### OpenAI Codex

URLs opened:

- https://developers.openai.com/codex
- https://developers.openai.com/codex/cli
- https://developers.openai.com/codex/app
- https://developers.openai.com/codex/concepts/sandboxing

The Codex application itself was not opened. The overview fetch returned page text with these labels: New chat, Pinned, Projects, Recents, “What should we build?”, “Choose project”, “On my computer”, “Do anything”, and “6 Sol Light.” That is a documentation rendering, not a session that was used.

`/codex/app` returned the ChatGPT desktop app page. Its steps are: install ChatGPT, sign in, start a chat or open a folder, then choose ChatGPT or Codex. In Codex, start with New chat. The page also says the app can use the browser, desktop apps, and plugins. It does not document a Bloom-style shared file list.

CLI first run, from the CLI page and the repository README: install, run `codex`, choose **Sign in with ChatGPT**, and describe a task. The CLI page’s terminal example shows `model: gpt-6.1-sol medium`, `directory: ~/code`, and the line “100% context left.” Suggested commands in that example are `/init`, `/status`, `/permissions`, `/model`, and `/review`.

Chat: the CLI is one terminal session. The page says to steer the active turn and inspect commands and diffs in that session. The app page puts work in a chat with a composer.

Files: the local repository is the working set. The CLI can take an image. The sandbox page says local commands run in a constrained environment. “On my computer” is a label on the overview rendering. A live remote desktop was not described on the CLI page.

Agents: the CLI page says Codex can delegate focused work to specialized agents and bring findings back into the main session. It does not show a roster, a lead name field, or a charter field.

Approvals: the sandbox page separates the sandbox from the approval policy. In the desktop app the control under the composer can include **Ask for approval**, **Approve for me**, **Full access**, and custom profiles. The documented example lists those four. CLI uses `/permissions`. Policies named on the page include `on-request` and `never`. When an approval offers scopes, the page says to choose the narrowest, “such as approving once or for the session.” The exact button labels of a CLI approval card were not in the fetched text.

Model: `/model` chooses the model and reasoning effort. The terminal example prints the model above the prompt. The sandbox page’s sample control shows a model name beside the permission mode.

Usage and cache: the CLI example prints “100% context left” under the prompt. `/status` shows session configuration. A cache-read or dollar line was not on the pages opened.

### GitHub Copilot

URLs opened:

- https://docs.github.com/en/copilot/concepts/agents/coding-agent
- https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/kick-off-a-task

The live GitHub UI was not opened. Billing articles appeared in search and were not opened, so this report does not describe an in-session usage meter for Copilot.

First run: open the Agents tab, the Copilot home, or the agents panel. Choose a repository in the prompt field. Open **Environment** and pick Cloud, Actions, or a remote environment. Type the task. Press Enter. A session appears in the list under the prompt. If no repository is selected, Copilot asks for one.

Chat: the prompt box starts the session. Follow-up prompts steer it. Session logs show the work and the tools used. The concept page also describes chat that answers questions, then the same conversation moving into a change. Older chat and cloud-agent sessions are described as separate; the newer cloud experience can keep them together.

Files: the repository and branch are the working set. The user can attach a file, issue, or pull request, and can use `@` mentions. Images can be pasted into the prompt. Changes are reviewed and a pull request is opened from the session or requested in the prompt. A computer desktop is not described. The environment is a cloud sandbox, a GitHub Actions runner, or a remote environment.

Agents: an agent dropdown can assign an existing agent or a custom agent. **Create an agent** writes a new agent profile in the selected repository and branch. The page does not show a head-agent name or a jurisdiction field.

Approvals: these two pages do not name approval buttons. The concept page says a session without write access is read-only. Button labels for allow and reject were not verified.

Model: a dropdown on the task form selects the model. If the model supports it, another dropdown selects reasoning level. The concept page says available models depend on the plan, and that model choice also depends on how the task was started.

Usage and cache: the concept page points to billing documentation and says cloud and Actions compute draw on a monthly account allowance, separate from AI credits. No context ring, token counter, or cache line is described on the two pages opened.

### Anthropic, effective harnesses for long-running agents

URL opened: https://www.anthropic.com/research/effective-harnesses-for-long-running-agents

Published 26 Nov 2025. This is a research note, not a product screen. It was read because Bloom’s team already splits a first planning step from later specialist steps.

OBSERVED practices, with no UI chrome:

- The first session sets up the environment: an `init.sh`, a progress file, a git commit, and a JSON feature list whose entries start as failing.
- Later sessions do one feature, verify it, and leave a clean tree and a progress note.
- The note says the initializer and the coding agent are the same harness with different first prompts.
- It leaves open whether one coding agent or several specialist agents work better. Testing, quality, and cleanup are named as possible specialists.

There is no chat layout, approval card, model picker, or usage meter on this page.

## 3. Bloom surface as it exists in this checkout

OBSERVED from `README.md`, `package.json`, `public/index.html`, `src/teams.mjs`, and the rendering in `public/app.js`, `public/team.js`, `src/opencode.mjs`, `src/harness.mjs`, and `src/team-store.mjs`. The page title is **bloom**. The package is `@vidoxlabs/bloom` 0.2.0, “A local-first web workspace for agent teams and shared artifacts.” The README still titles the product ViBloom and tells the reader to create a session and enter a project path. The browser form is the surface a person sees at the loopback port in the README.

The page is three columns.

- Left, aria-label **Workspaces**. **+ New** opens a form. **Workspace type** is **Agent team** or **Direct coding session**. Agent team is the form’s initial value. The submit button reads **Create team** until the type changes, then **Create session**.
- Center, aria-label **Group conversation**. The visible heading starts as **Workspace**. The transcript is the chat. The composer has a message box, a **Model** field, **Stop**, and **Send**.
- Right, aria-label **Inspector**. For a team it shows **Team**, **Shared desktop**, and **Team memory**, then **Run activity** for every workspace. Activity includes a turn state, `#usage`, a region labeled **Pending approvals**, **Agent plan**, and **Tool calls**.

Agent team form:

- **Head agent name**, default value **Lead**.
- **Jurisdiction**, placeholder “What should this head own?”
- A disclosure, **Model and budget**, containing **Model** (“Provider default”), **Model calls per run** (default 6), and **Token stop threshold** (optional).
- Empty state heading: “What should your team work on?” Button: **Create a team**.
- After a team exists, the placeholder is “Give the head agent a brief…” and the composer placeholder is “Give your team a task.”
- **To** lists the lead and later members. The lead is the default recipient. **Use research brief** fills a sample sentence about a researcher, a reviewer, and an assembler.

Direct coding session form:

- **Workspace directory**, placeholder “Blank starts in Scratch.”
- Composer placeholder: “Tell the agent what to work on.”
- The README says a blank directory creates a Scratch workspace, and that **Model** takes an OpenCode id such as `provider/model` or stays blank for the runtime’s current selection. The composer placeholder is “Runtime default,” which is a different phrase from the team field’s “Provider default.”

Shared desktop, from the markup and `src/teams.mjs`:

- Heading **Shared desktop**, button **Add source**, hint “Select files to attach to the next message.”
- The dialog title is “Add a shared source.” The fields are **Title**, **Public source URL**, and **Or paste text**.
- Files the team writes also appear in this list. Each row has a checkbox and **Open**. Open shows the title, author, source, parent count, and a SHA-256, plus **Download Markdown**.
- The team store keeps those files in a directory named Desktop under the data directory. The session subtitle shows that workspace path. This is a file catalog with a checkbox limit of six. It is not a live screen, a terminal, or a preview of a running app.
- Up to three `https` URLs in the brief are fetched and added as sources. The planner may also name up to six catalog ids to read.

Team, from `src/teams.mjs` and `public/team.js`:

- The lead name becomes the session title. The charter is stored as the lead’s jurisdiction. The member list shows `name · stage` and the charter text underneath. The lead’s stage string is `head`.
- On a message to the lead, the planner returns one to five specialists. Stages are the raw words `research`, `review`, `assemble`, `work`, and `verify`. Each specialist has a name, a charter, a voice, and an assignment. The lead posts that plan into the transcript, including “name — assignment.”
- A message addressed with **To**, or with `@Name:`, runs that one member and does not plan a new roster.
- Specialists post into the same transcript. A review post shows **Review approved** or **Changes requested**. A file button reads **Open** plus the file title.
- `verify` does not call a model. It writes a hash report of the current documents.

Team memory:

- Heading **Team memory**, button **Add note**. The dialog title is “Save a team note.” Each note has **Forget**.
- During a specialist call, saved notes are included as data. The activity line reads `memory cache hit` or `memory read`, plus the note count. Forgetting a note bumps an epoch and stops an active turn.

Run activity:

- The turn label uses Idle, Running, Stopping, Turn ended, Stopped, Refused, Failed, Limit reached, Interrupted, Changes requested, and Outcome unavailable.
- A team plan line reads `actor · Planning` or `actor · Working`.
- Tool rows show a title and a status. Direct sessions receive plan and tool events from the adapter. The demo and the README tell the user to choose **Allow once** or **Reject**.

Approvals:

- A card shows **Approval needed**, the request title, and one button per option the adapter sends. After a choice, the card reads **Allowed once**, **Declined**, or **Request closed**.
- `src/opencode.mjs` keeps only `allow_once` and `reject_once`. An OpenCode `allow_always` option is dropped. If every option is dropped, the request is cancelled.
- `src/teams.mjs` does not request a permission. A team turn does not produce this card.

Model:

- The composer **Model** field is a text input with a datalist. When the direct adapter connects, the field is filled from the runtime and the datalist is filled from the adapter’s model list.
- The team create field is separate. The composer can still override the model for a turn.

Usage:

- Only `team.usage` fills `#usage`. The summary is `calls/limit model calls · measured tokens`, with `(partial)` when a call did not report a total. Each line is actor, model or “Default model,” input, output, cache read, cache write, and USD or “unreported.”
- A direct turn clears `#usage` and does not write it. `src/opencode.mjs` does not emit a usage event.

### Later contract, plain language

A later contract should say, in ordinary words, what a team is allowed to remember, why a turn is research or review, and who is doing the work. Those three ideas are not separate controls in this checkout. Team memory is a note list. Stages are raw words on the roster. The lead is a name and a charter.

## 4. Familiarity map

OBSERVED gesture, then the Bloom pane that already receives it.

| Familiar gesture | Where it was seen | Bloom pane now |
| --- | --- | --- |
| Pick a folder, then type a task | Cursor quickstart, Claude desktop, Codex CLI directory line, Copilot repository dropdown, OpenCode `cwd` | **Direct coding session** → **Workspace directory**, then the center composer. The path shows under the session title. |
| Start a team by describing the teammates in the task | Claude agent teams; Cursor “coordinator agent”; Codex “specialized agents”; Copilot agent dropdown | **Agent team**. The first Send to the lead creates the roster. **To** addresses one member later. **Use research brief** is a sample of that sentence. |
| Chat in the center, work on the side | Claude prompt with optional file, diff, and browser panes; Cursor side pane or Agents Window | Center **Group conversation**. Right **Inspector**. Left **Workspaces**. |
| Attach files with a mention or a picker | Cursor `@`, Claude `@filename`, OpenCode `@`, Copilot `@` and the + menu | Team: check up to six rows, or paste a URL in the brief. Direct: no file checklist. The agent uses the workspace path. |
| Open a file the agent wrote | Cursor diff and checkpoints; Claude `+12 -1` diff; Codex “inspect diffs”; Copilot session changes | Transcript button **Open** plus the title, and **Open** on a desktop row. The reader is Markdown text, not a diff. |
| Watch a live computer or app preview | Claude Browser pane; Cursor Browser tool | No pane. **Shared desktop** is the file list. |
| Approve once, or allow it again | OpenCode Allow once / Always allow / Reject; Claude Yes and “don’t ask again”; Codex once or for the session; Cursor Allow on a card | Direct sessions: **Approval needed** in the inspector. Buttons are the adapter labels Bloom keeps. Team sessions: no approval card. |
| Choose a model beside the prompt | Cursor picker, Claude desktop picker, Codex `/model`, OpenCode `/models`, Copilot model dropdown | Composer **Model**. Team create hides a second **Model** under **Model and budget**. |
| See whether the context is filling up | Cursor context ring; Codex “100% context left”; OpenCode mini footer and ACP `usage_update`; Claude optional status line | Team only: `#usage` under **Run activity**. Direct: the region stays empty. |
| Leave a note the next session can read | Anthropic progress file | **Team memory**, **Add note**, **Forget**. |
| Stop the run | Claude desktop stop button; OpenCode cancel | Composer **Stop**. |

## 5. Label changes worth making

RECOMMENDED. Each row names the control, the current text, and the change. Behavior changes are limited to what a code agent can do in the existing panes.

| Control | Current text | Proposed text or behavior |
| --- | --- | --- |
| `#kind` option `team` | Agent team | Team |
| `#kind` option `direct` | Direct coding session | Coding session |
| `#create-session` when team | Create team | Create team |
| `#create-session` when direct | Create session | Create coding session |
| Empty heading | What should your team work on? | What should we work on? |
| `#empty-start` | Create a team | Keep one primary button, **Create a team**. Add a second button, **Create a coding session**, that opens the same form with Coding session selected. |
| `#head-name` label | Head agent name | Lead name |
| `#head-name` value | Lead | Lead |
| `#charter` label | Jurisdiction | Role |
| `#charter` placeholder | What should this head own? | What should this lead be responsible for? |
| Member summary in `#members` | `name · head` and raw stage words | `name · Lead`, `Research`, `Review`, `Assemble`, `Work`, `Check` |
| Placeholder in `#prompt` for a team | Give your team a task | Give your team a task |
| Waiting copy in the transcript | Give the head agent a brief. Attach sources from the shared desktop when the team needs evidence. | Give the lead a task. Check files on the right when the team needs evidence. |
| `#sample-brief` | Use research brief | Try a sample task |
| Disclosure summary | Model and budget | Model and limits |
| `#team-model` placeholder | Provider default | Default |
| `#model` placeholder | Runtime default | Default |
| `#call-limit` label | Model calls per run | Model calls |
| `#token-limit` label | Token stop threshold | Token limit |
| `#token-limit` helper, new | none | Stop after this many measured tokens. Leave blank to keep going. |
| `h2` in `#team-inspector` | Shared desktop | Files |
| `#new-source` | Add source | Add file |
| `#editor-title` for a source | Add a shared source | Add a file |
| `#source-address` label | Public source URL | Link |
| `#body-label` for a source | Or paste text | Or paste text |
| Hint under Files | Select files to attach to the next message. | Check files to include with the next task. |
| `h2` Team memory | Team memory | Notes |
| `#new-note` | Add note | Add note |
| Note button | Forget | Forget |
| `h2` Run activity | Run activity | Activity |
| `#usage` | no heading | Add the heading Usage above the details element. |
| Recall line in `public/team.js` | `memory cache hit` or `memory read` | `notes reused` or `notes loaded` |
| Approval card title | Approval needed | Approval needed |
| `src/opencode.mjs` `optionKinds` | `allow_once` and `reject_once` only | Also accept `allow_always`, and show the name OpenCode sends, **Always allow**, on the same card. |
| Team turns | no approval card | Leave team turns without a tool-approval card until a team tool can actually change the user’s project. Do not invent an Allow button that approves nothing. |
| `#session-path` for a team | absolute Desktop directory | Hide the raw path on a team. Coding sessions keep the project path, because every harness above shows the working directory. |

Words that already match and should stay: **Workspaces**, **Team**, **To**, **Send**, **Stop**, **Model**, **Files** once the heading changes, **Open**, **Allow once**, **Reject**, **Notes**, **Forget**, **Usage**.

**Model calls** can stay numeric. People do not see that control in Cursor, Claude, Codex, OpenCode, or Copilot, but the sentence “stop after this many model calls” is plain. **Token limit** matches the same idea. **Token stop threshold** does not appear in any page opened for this report.

**Jurisdiction** appears in the team form and in the planner prompt (`src/teams.mjs`). The visible label should become **Role**. The planner can keep storing the same string. The prompt text can say “one role and one assignment” when that prompt is next edited. That prompt edit is inside the file this report does not own, so it is a recommendation only.

**Head agent** appears on the form, in the empty transcript, and as the default name in `Teams.create`. The visible word should be **Lead**, which is already the input’s default value and the word Claude uses for “team lead.”

**Shared desktop** names a file list. Renaming Bloom’s heading to **Files** matches Cursor, Claude, Codex, OpenCode, and Copilot. The on-disk directory can stay as it is.

## 6. Usage and cache

OBSERVED in Bloom:

- Team usage is visible only after the first `team.usage` event. The line already uses ordinary measurement words: input, output, cache read, cache write, and USD.
- “cache read” and “cache write” are prompt-cache token counts from `src/models.mjs`.
- “memory cache hit” is a different cache. `src/team-store.mjs` keeps notes in memory for up to 60 seconds. The activity row uses the word cache for that hit. A new user can read it as the same cache as the usage line.
- If the provider omits a total, the run stops when a token limit is set, and the summary says `(partial)`. The create form does not explain that.
- Direct coding sessions do not show usage. OpenCode’s ACP page does send `used`, `size`, and `cost`. Bloom’s OpenCode adapter does not currently put that update into `#usage`.
- There is no context ring and no “100% context left.”

OBSERVED elsewhere:

- Cursor shows a context ring and a category tray, including a summarized-conversation category. It does not show cache read or cache write on the pages opened.
- Codex CLI’s documented terminal example shows “100% context left.”
- OpenCode shows usage in the mini footer when that footer is on, and ACP can report used tokens against context size plus USD cost. Child-session tokens are called out as excluded.
- Claude Code can print a context percentage on a custom status line. The quickstart does not show one by default.
- Copilot’s opened pages point at billing. They do not show a session meter.

RECOMMENDED for `#usage`:

- Add the heading **Usage**.
- Keep the team summary: `3/6 model calls · 12,400 measured tokens`. Keep input, output, cache read, cache write, and USD on the expanded lines.
- When `incomplete` is set, the summary already says `(partial)`. Add one plain sentence in that state: “A model call did not report tokens, so the token limit stopped the run.”
- Change the note-recall row to **notes reused** or **notes loaded**. Reserve the word cache for the usage line.
- For a coding session, when the adapter receives an ACP `usage_update` or a prompt `usage` object, write the same Usage block: used tokens, context size when present, and USD when present. Label child-session tokens only if the adapter actually reports them. OpenCode’s ACP page says the prompt usage total excludes child sessions; the Bloom line should say “this session” unless a child total is present.
- Do not add a second cache concept for team notes.

## 7. Gaps and things that could not be verified

- No live app was opened. OpenCode Desktop, Cursor, Claude desktop, Codex, and GitHub were read as documentation. Pane positions that appear only in screenshots were not inspected. The Agents Window page has an image; its pixels were not reviewed.
- OpenCode’s intro names a desktop app and a web app. The opened docs describe the TUI, ACP, agents, permissions, and CLI settings. A desktop layout page was not found.
- Cursor pages opened do not show a pane named Composer. The context-ring categories were read. The subagents page and the models page were not read in full.
- Claude’s permission illustration did not come through as text. The prose names Yes, “Yes, and don’t ask again,” and sometimes “Yes, and switch to auto mode.” The subagents page was only partly read.
- `https://developers.openai.com/codex/app` returned the ChatGPT desktop app article. The overview rendering included “On my computer” and “Do anything.” A Codex computer pane was not documented there. CLI approval-button labels beyond “once” and “for the session” were not listed.
- Copilot approval button labels were not on the two pages opened. Billing pages were not opened, so premium-request counters are unverified as UI.
- The Anthropic article has no product chrome. Its feature-list JSON and progress file are harness behavior, not labels to copy onto Bloom’s panes.
- Bloom’s README and the browser disagree about the first screen. The README does not mention Team, Jurisdiction, or Shared desktop. A reviewer should treat `public/index.html` as the current surface.
- Direct-session usage forwarding was checked only by the absence of a usage emit in `src/opencode.mjs`. An end-to-end ACP fixture was not run.
- Hivemind search for this project returned no notes. Swarm skills returned none. `swarmmail_init` reported an existing session named bloom-ui-coordinator; the file reservation for this report was still granted.

## Sources opened on 2026-11-22

Checkout:

- `README.md`
- `package.json`
- `public/index.html`
- `public/app.js`
- `public/team.js`
- `src/teams.mjs`
- `src/team-store.mjs`
- `src/opencode.mjs`
- `src/harness.mjs`
- `src/models.mjs`

Public pages:

- https://opencode.ai/docs/
- https://opencode.ai/docs/cli/tui
- https://opencode.ai/docs/cli/acp/
- https://opencode.ai/docs/agents/
- https://opencode.ai/docs/permissions
- https://opencode.ai/docs/cli/config
- https://cursor.com/docs/get-started/quickstart
- https://cursor.com/docs/agent/overview
- https://cursor.com/docs/agent/prompting
- https://cursor.com/docs/agent/agents-window
- https://cursor.com/docs/agent/security/run-modes
- https://code.claude.com/docs/en/quickstart
- https://code.claude.com/docs/en/desktop-quickstart
- https://code.claude.com/docs/en/agent-teams
- https://code.claude.com/docs/en/permissions
- https://code.claude.com/docs/en/statusline
- https://developers.openai.com/codex
- https://developers.openai.com/codex/cli
- https://developers.openai.com/codex/app
- https://developers.openai.com/codex/concepts/sandboxing
- https://docs.github.com/en/copilot/concepts/agents/coding-agent
- https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/kick-off-a-task
- https://www.anthropic.com/research/effective-harnesses-for-long-running-agents

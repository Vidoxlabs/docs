# Bloom interface contract

This is the screen a person meets, then the exact strings a code agent copies. The browser surface is `public/index.html`, `public/app.js`, and `public/team.js`.

The approved review is `docs/ui/research/implementability-review.md`. Section 7 of that review is the include list and the leave-out list. The research report is evidence. Where they disagree, the review wins. **Section 0 overrides both.**

A string not listed here stays as it is. Element ids, option values, stored stage ids, event names, and handlers stay.

## 0. Owner decisions (2026-11-22)

The owner ruled on the review's renames after the swarm closed. These rows win over everything below and over both research files.

- **Keep `Head agent` and `Shared desktop`.** They name Bloom's model: one head agent that creates specialists, and one shared computer whose desktop every agent can use. That is the xAI Grok Bot model Bloom follows ([how Grok Bot works](https://docs.x.ai/grok-bot/how-grok-bot-works), [shared computer](https://docs.x.ai/grok-bot/computer-and-apps), [group messaging](https://docs.x.ai/grok-bot/chat-and-collaboration)). The research report's "GrokBot" section reads an unrelated third-party repository (`Franzferdinan51/GrokBot`), so its case for `Files` and `Lead name` is set aside.
- **Keep `Jurisdiction`.** It is the owner's word for what a specialist answers for.
- **Familiarity comes from helper text, not renames.** Each kept term gets one plain `hint` line directly under it, using the existing `hint` class:
  - under `Head agent name`: `Plans the work and creates specialists for it.`
  - under `Jurisdiction`: `What this agent is responsible for.`
  - under the `Shared desktop` heading, replacing `Select files to attach to the next message.`: `Files every agent on this computer can open and reuse. Check files to include with the next task.`
- **`Token limit` still replaces `Token stop threshold`.** That rename was not contested.
- **Persona library (later on 2026-11-22).** The owner asked for a persona library. It is a `Personas` section in the left sidebar, specified in section 6b. It replaces the persona part of the section 4 lock and the persona item in section 7. Memory and intent still get no screen of their own.
- **Deeper team memory and team-to-team questions (later on 2026-11-22).** The owner asked for deeper team memory, using Memorix and ViWeb as references, and for teams to talk to each other. Section 6c specifies both. Its notes-used line replaces the section 2 recall wording, and its note controls replace the section 4 rule that the recall wording is the whole notes edit. Memory still gets no screen of its own: it stays in the `Notes` section and in `Activity`.
- Everything else in this contract stands.

## 1. First minute

A person starts a team or a coding session from the empty screen. No separate guide.

### Team

1. The empty heading reads `What should we work on?` The primary button reads `Create a team`.
2. That button opens the one form with kind `Team`. The person leaves or edits `Head agent name` (the value starts as `Lead`), fills `Jurisdiction`, and presses `Create team`.
3. The person types a task. The composer placeholder reads `Give your team a task`.
4. The person watches the group. While the team is waiting, the transcript reads `Give the head agent a task. Check the shared desktop when the team needs evidence.`
5. The person checks `Shared desktop`.
6. When a turn reports usage, it shows under the heading `Usage`.

### Coding session

1. The second empty-state button reads `Create a coding session`. It opens the same form with kind `Coding session`.
2. The person presses `Create coding session`.
3. The person types a task. The composer placeholder reads `Tell the agent what to work on`.
4. The person watches the reply. While the coding session is waiting, the transcript reads `Start a turn in this workspace.`
5. When `model.usage` arrives, the coding-session usage line shows under `Usage`.

`Shared desktop` stays on the team screen. The project path stays under the title on a coding session. On a team that path line is hidden and empty. This contract does not name the on-disk folder.

## 2. Exact visible copy

Every string from the review’s “Copy into the contract” list is quoted below. Rows marked **no edit** already match the screen.

### No edit

These already match. Leave them.

- Submit label when Team is selected: `Create team`
- `Head agent name` label and its value `Lead`
- Team composer placeholder: `Give your team a task`
- Source body label in source mode: `Or paste text`
- Note dialog title: `Save a team note`
- Note body label: `What should this team remember?`
- `Add note`
- `Forget`
- Pending card title, while the choice is open: `Approval needed`
- Empty-state primary button: `Create a team`
- Empty-state paragraph: `Give a head agent a brief. Follow the handoffs and open the files your team produces.`
- Source link placeholder: `Website or GitHub repository`
- Token field placeholder: `Optional`
- Six-file error: `Attach up to six files at a time.`
- Inserted sample sentence: `Create a researcher to extract claims from the attached sources, a reviewer to check them, and an assembler to write a guide. Flag any evidence gaps.`

Words and controls the contract keeps without rewriting:

`Workspaces`, inspector heading `Team`, `To`, `Send`, `Stop`, `Model`, `Open`, `Allow once`, `Reject`, `Cancel`, `Save`, `Close`, `Download Markdown`, `Review approved`, `Changes requested`, `Blank starts in Scratch`, `Tell the agent what to work on`, `Start a turn in this workspace.`, and `Approval needed`.

Call-limit default `6`, minimum `1`, and maximum `20` stay. Hint, charter, and voice lines on the roster stay. The session-list button’s title attribute stays.

### Copy onto the screen

Kind labels. Values remain `team` and `direct`.

- `Team` replaces `Agent team`.
- `Coding session` replaces `Direct coding session`.

Submit.

- `Create team` already matches when Team is selected.
- `Create coding session` replaces `Create session` when Coding session is selected.

Empty heading.

- `What should we work on?` replaces `What should your team work on?`
- The paragraph under the heading is unchanged.

Head agent and jurisdiction (see section 0).

- `Head agent name` stays. Add the hint `Plans the work and creates specialists for it.` The value `Lead` already matches.
- `Jurisdiction` stays. Add the hint `What this agent is responsible for.`
- Placeholder `What should this head agent be responsible for?` replaces `What should this head own?`

Roster summaries. Display words only. The pattern stays `name · Word`.

- `name · Head agent`
- `name · Research`
- `name · Review`
- `name · Assemble`
- `name · Work`
- `name · Check`

Stored stages stay `head`, `research`, `review`, `assemble`, `work`, and `verify`. Display `head` as `Head agent` and `verify` as `Check`.

Composer, waiting copy, and sample.

- Team composer placeholder `Give your team a task` already matches.
- Team waiting copy `Give the head agent a task. Check the shared desktop when the team needs evidence.` replaces `Give the head agent a brief. Attach sources from the shared desktop when the team needs evidence.`
- Coding sessions keep `Tell the agent what to work on` and `Start a turn in this workspace.`
- Sample button `Try a sample task` replaces `Use research brief`. The inserted sentence is unchanged.

Model and limits.

- `Model and limits` replaces `Model and budget`. Summary text only.
- Both model placeholders are `Default`. They replace `Provider default` and `Runtime default`. A filled model value still replaces the placeholder. `agent.connected` may still fill the coding-session model field from the runtime.
- `Model calls` replaces `Model calls per run`.
- `Token limit` replaces `Token stop threshold`.
- New helper text only: `Stop after this many measured tokens. Leave blank to keep going.`

Shared desktop. The pane stays a file catalog inside `#team-inspector`, and it stays hidden on a coding session.

- The heading `Shared desktop` stays (section 0).
- `Add file` replaces `Add source`. The dialog stays title, link, or pasted text.
- Source dialog title `Add a file` replaces `Add a shared source`. Note mode stays `Save a team note`.
- `Link` replaces `Public source URL`.
- Hint `Files every agent on this computer can open and reuse. Check files to include with the next task.` replaces `Select files to attach to the next message.`
- `Or paste text` already matches in source mode.

Notes, activity, and usage heading.

- `Notes` replaces `Team memory`.
- `Add note` already matches.
- `Forget` already matches.
- `Activity` replaces `Run activity`.
- Heading `Usage` goes immediately before `#usage`, outside that element. `public/team.js` replaces the children of `#usage`, and `public/app.js` sets its text. A heading inside `#usage` would be removed.

Recall. Superseded by section 6c: the line now reads `{actor} · {used} of {considered} notes used`.

Pending card title `Approval needed` already matches.

## 3. Behavior

Three changes.

1. Second empty-state button. `#empty-start` remains `Create a team` and opens the one form with kind `team`. A second button, `Create a coding session`, opens that form with kind `direct`.
2. `allow_always` on the current approval card. `optionKinds` includes `allow_always`. The existing card shows the adapter name on a quiet button. The name a runtime sends for that kind is shown as sent, for example `Always allow`. The resolved title for that kind is `Allowed always`. The pending title stays `Approval needed`. `allow_once` stays the primary button. `allow_always` and `reject_once` stay quiet buttons. Button text is `option.label`. The resolved-title map is `allow_once` → `Allowed once`, `allow_always` → `Allowed always`, `reject_once` → `Declined`, and `cancelled` → `Request closed`. Bloom forwards the selected option id. The demo adapter’s buttons remain `Allow once` and `Reject`.
3. Hiding the team path. On a team, `#session-path` is hidden and empty. A coding session still shows the project path. The contract does not name the on-disk folder.

## 4. Locks

- Team turns have no approval card and gain no Allow button.
- Notes do not gain another cache control. The word cache remains on the usage lines. The note controls and notes-used line in section 6c are the whole notes edit.
- No new screen for memory or intent. Notes, Jurisdiction, and the roster hint lines are the whole of those ideas on this surface. Personas live in the sidebar section described in section 6b, not on a separate screen.

## 5. Usage

Quoted from the review, which records the lines already in the checkout. The team expanded field says `write`. The coding-session line is the `model.usage` text already in `public/app.js`.

- Team summary: `{calls}/{limit} model calls · {measured total} measured tokens`, plus ` (partial)` when `incomplete` is true. When no call in the run reported a token total, the summary reads `{calls}/{limit} model calls · tokens unreported` (shipped in `95185d2`).
- Team line: `{actor} · {model or Default model} · input {n} · output {n} · cache read {n} · write {n} · USD {n or unreported}`.
- Coding-session line, only when `model.usage` arrives: `Tokens: {total or unreported} · Input: {input or unreported} · Output: {output or unreported} · Cache read: {cacheRead or unreported} · Cache write: {cacheWrite or unreported}`.

`#usage` is cleared when the turn starts. When the prompt has no usage object, the region stays empty for that turn. The coding-session line stays under the `Usage` heading and stays that single line.

## 6. What already exists

**Notes.** The section is the note list. `Add note` opens the dialog `Save a team note`. Each note has `Forget`. Saved notes are included as data on a specialist call. `Forget` removes that note, advances the team epoch, and stops an active turn. After the recall-line change, a hit reads `{actor} · notes reused · {count} notes` and a miss reads `{actor} · notes loaded · {count} notes`.

**Jurisdiction.** This is the head agent’s charter field, labeled `Jurisdiction`, with the hint `What this agent is responsible for.` and the placeholder `What should this head agent be responsible for?` The roster shows that text under the head agent. A specialist row shows that specialist’s charter under the name. There is no separate Jurisdiction screen.

**Stage words.** The roster summary shows the stage. Display `head` as `Head agent`, `research` as `Research`, `review` as `Review`, `assemble` as `Assemble`, `work` as `Work`, and `verify` as `Check`. Stored specialist stages stay the five ids `research`, `review`, `assemble`, `work`, and `verify`. `verify` still writes a hash report and does not call a model. A review post still shows `Review approved` or `Changes requested`.

**The head agent.** The head agent is the name in `Head agent name`, default `Lead`, and that name becomes the session title. `To` lists the head agent first, and it is the default recipient. A message to the head agent can plan one to five specialists. A message addressed with `To`, or with `@Name:`, runs that one member and does not plan a new roster.

**Roster hint lines.** The member row already shows one hint line: `VI · Team coordinator` for the head agent, `LA · Deterministic verification` for `verify`, and `OAI · Model-backed specialist` for the other stages, plus the voice when a specialist has one. Those are labels on the member row. They are not separate products, and they are not screens.

## 6a. Desktop revisions and folders (added with agent desktop changes)

- Files sit under their folder name, shown as a muted heading in the `Shared desktop` list. Files without a folder come first, with no heading.
- A file with more than one revision shows ` · v{n}` after its title. Only the newest revision of each file is listed.
- The reader's detail line adds the folder and `Revision {n}` when the file has other revisions.
- Under the label `Other revisions`, the reader lists each other revision as `Revision {n} · {title} · {author}`. Choosing one opens it.
- A rename or move shows in `Activity` as `Rename {old title}` or `File {old title}`.
- The demo files research under `Research` and guides under `Guides`. When the guide is supplied again, the demo assembler revises it and posts `I revised the guide; the earlier version stays in its history.`

## 6b. Persona library (added on owner request, 2026-11-22)

A persona is a saved specialist: name, Jurisdiction, voice, stage, and an optional model. The library belongs to the installation, so every head agent can use it.

- The left sidebar shows a `Personas` section under the workspace list. It has a `+ New` button and the hint `Saved specialists any head agent can recruit by name.`
- Each row reads `{name} · {Stage word}`, using the stage words in section 6. It has two text buttons: `Edit`, and `Add to team`. `Add to team` appears only while a team is open.
- `+ New` opens the dialog `New persona`. `Edit` opens `Edit {name}`. The fields are `Name`, `Jurisdiction` (placeholder `What is this specialist responsible for?`), `Voice` (placeholder `Clear and specific.`), `Stage` (`Research`, `Review`, `Assemble`, `Work`, `Check`) and `Model` (placeholder `Team model`, hint `Leave blank to use the team's model.`). The buttons are `Cancel` and `Save`. An edit also has `Delete`, which first asks `Delete {name} from the library? Teams that already recruited it keep their copy.`
- In the roster, each specialist's row has `Save as persona`, which opens `New persona` filled in from that specialist. A row with its own model shows that model as a hint line.
- The head agent sees the library when it plans. When it uses a persona's exact name, the saved Jurisdiction, voice, stage and model are used; the head only writes the assignment. The demo head recruits a saved persona for a matching stage and posts `I assigned three steps and recruited {names} from the persona library.`
- Server messages shown in the dialog: `A persona with this name is already in the library.`, `The library holds 64 personas. Delete one to add another.` Adding to a team during a turn shows `Wait for the current turn to finish before changing the team.`

## 6c. Team memory and team-to-team questions (added on owner request, 2026-11-22)

Memory follows the Memorix distinctions: confirmed notes are kept apart from agent suggestions, and a team's own notes are kept apart from notes shared with every team.

- **Adding a note.** The `Save a team note` dialog gains two checkboxes. `Always use` is checked by default, with the hint `Turn off to use this note only when it matches the task.` `Share with every team` is unchecked by default.
- **Note rows.** Each note shows its text and one hint line built from: `Always used` or `Used when relevant`, `Shared with every team`, `Suggested by {agent}`, `Corrected`, and `Used {n} time` / `Used {n} times`. Each row has `Correct` and `Forget`.
- **Correct.** Opens the dialog `Correct a note`, label `What should the team remember instead?`, filled with the old text. Saving replaces the note. Like `Forget`, it withdraws everything built from the old note.
- **Suggestions.** Specialists can suggest up to two facts per handoff. They are listed under the heading `Suggested by agents`, with the hint `Agents never use a suggestion until you keep it.` Each row shows the text, the suggesting agent, `Keep` and `Dismiss`. `Keep` turns it into a note used when relevant. Forget or Correct clears pending suggestions.
- **Notes used.** In `Activity`, each specialist shows `{actor} · {used} of {considered} notes used`. Expanding it lists each note it received, prefixed `Always · ` or `Relevant · `.
- **Recall.** `Always` notes reach every specialist. A `when relevant` note reaches a specialist only when it matches the brief and assignment. Notes are ranked by a simplified Memorix score, with at most eight notes and 2,000 characters per call. An approved review counts as useful for the notes behind it.
- **Team-to-team questions.** The head agent may ask one question of another team per task. The asking conversation shows the question with the hint `Question for {team}`. The answer comes from the other head agent with the hint `From team {team}`. The other team's conversation shows the same pair, opened as a turn of its own, so it shows as busy and its `Stop` ends only the answer. In `Activity` the step reads `{head} · Answering`, and a tool row reads `Ask {team}`. The asking team pays for the call.
- **What crosses.** The answering head sees only its jurisdiction, notes shared with every team, its non-private group posts and its shareable desktop titles. Its private notes never cross. It cannot ask a third team.
- **When a question can't be answered.** If the other team is busy, the asking head posts `{team} is busy with its own task, so the team continues without its answer.` If the other team stops it, the post is `{team} stopped the question, so the team continues without its answer.`
- **Demo.** A brief that says "ask" and names another team makes the demo head ask it. The demo answer starts `From our side:`. The demo researcher suggests remembering its first source.

## 7. Leave out

- The section 6 request to name the team expanded field `cache write`. The word on that line is `write`.
- The sentence `A model call did not report tokens, so the token limit stopped the run.`
- A coding-session promise of ACP `usage_update`, `used`, `size`, USD, `this session`, or a child-session total.
- A context ring.
- Replacing the coding-session usage line with the team details block.
- An Allow button, or any approval card, on a team turn.
- A second cache control for notes.
- A new approval dialog. `Always allow` is a button on the current card.
- A local file picker, a live computer, a terminal, or an app preview in the Shared desktop pane. Agent-operated screens remain future work (`docs/architecture.md`); this edition does not claim them.
- The on-disk folder name and any absolute workspace path.
- A memory-engine screen or an intent-engine screen. The persona library is the sidebar section in section 6b, not a separate screen.
- Planner-prompt edits, README edits, server fallback renames, and test edits.
- Any string this review does not list. In particular, the empty-state paragraph, the note dialog, the source URL placeholder, and the six-file error stay.

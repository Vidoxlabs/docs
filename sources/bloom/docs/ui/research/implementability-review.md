# Implementability review

> **Owner decision, 2026-11-22.** The adjudication "Shared desktop becomes Files" (section 4) and the `Lead name` / `Role` rows are overruled. The research behind them read an unrelated third-party repository; that evidence is removed. `Head agent`, `Jurisdiction` and `Shared desktop` stay, each with a helper line; see section 0 of [the interface contract](../interface-contract.md). All other verdicts stand.

Reviewed `docs/ui/research/familiar-harness-patterns.md` against the browser surface and the team, store, adapter, harness, and model modules. This file is the interface contract input. It does not change source.

## 1. Verdict

**approve**

The label set in research section 5 is coherent and specific enough for one contract. Three proposals need code: a second empty-state button, accepting `allow_always` on the existing approval card, and hiding the team workspace path. Two further rows are locks: team turns stay without an approval card, and team notes do not gain a second cache control.

Re-checked claims that hold:

- `src/opencode.mjs` sets `optionKinds` to `allow_once` and `reject_once` only. An option of any other kind is dropped. If none remain, the adapter returns a cancelled outcome.
- `src/teams.mjs` emits `team.usage` with `calls`, `limit`, `actor`, `model`, `usage`, `measuredTotal`, `incomplete`, and `tokenLimit`.

Research claims about this checkout that are false:

- “`src/opencode.mjs` does not emit a usage event.” After `session/prompt`, if `result.usage` is present, the adapter emits `model.usage` with `input`, `output`, `total`, `cacheRead`, and `cacheWrite`.
- “Only `team.usage` fills `#usage`,” “a direct turn does not write `#usage`,” and “Direct: the region stays empty.” `public/app.js` writes `#usage` on `model.usage`. `public/team.js` clears `#usage` on every `turn.started`, including a coding session, and the line appears when `model.usage` arrives.
- The team expanded line uses the word `write`. It does not use the words `cache write`. The coding-session line in `public/app.js` does use `Cache write`.
- “The README still titles the product ViBloom and tells the reader to create a session and enter a project path.” The README title is `Bloom`. Its try-it steps say to create a team. The document `<title>` is `Bloom`. The header brand is `bloom`. Neither mismatch is a contract edit.

The false usage rows are rejected below. The accepted rows still tell an assembler what to write.

## 2. How a code agent should read the result

Read section 7 first. It is the include list and the leave-out list. The table is the evidence for that list.

- **copy change** means visible text only. Element ids, option values, stored stage ids, event names, and handlers stay. A row whose proposal already matches the screen is recorded and needs no edit.
- **behavior change** means logic, a new control, or a new event, and only where the note names that work. A note that starts with **Lock** is a sentence the contract includes. It adds no control.
- **reject** means the proposal stays out of the contract and out of the implementation.
- Copy the quoted strings exactly. Do not rename ids. Do not edit the research report, the README, planner prompt text, server fallback names, or tests as part of this contract.
- The browser surface is `public/index.html`, `public/app.js`, and `public/team.js`. Strings not listed in section 7 stay as they are.

## 3. Recommendation table

Section 5 and section 6. Repeated recommendations are one row.

| Control | Research proposal | Verdict | Evidence | Note |
| --- | --- | --- | --- | --- |
| `#kind` option `team` | Visible label `Team`. Value stays `team`. | copy change | `public/index.html`: `Agent team` | Label only. |
| `#kind` option `direct` | Visible label `Coding session`. Value stays `direct`. | copy change | `public/index.html`: `Direct coding session` | Label only. |
| `#create-session` when team | `Create team` | copy change | `public/team.js`: `Create team` | Already this text. Record it. |
| `#create-session` when direct | `Create coding session` | copy change | `public/team.js`: `Create session` | Label only, when the direct option is selected. |
| Empty heading | `What should we work on?` | copy change | `public/index.html`: `What should your team work on?` | The paragraph under the heading stays: `Give a head agent a brief. Follow the handoffs and open the files your team produces.` |
| `#empty-start` | Keep `Create a team`. Add `Create a coding session`, opening the same form with Coding session selected. | behavior change | `public/index.html` has one button, `Create a team`. `public/app.js` only opens the form. | One form. Primary sets kind `team`. Second button sets kind `direct` and runs the existing configure path. |
| `#head-name` label | `Lead name` | copy change | `public/index.html`: `Head agent name` | Label only. `checks/browser.mjs` also reads the current label. This contract does not edit that check. |
| `#head-name` value | `Lead` | copy change | `public/index.html`: `value="Lead"` | Already this text. The server fallback `Head agent` is not a visible default and is not part of this contract. |
| `#charter` label | `Role` | copy change | `public/index.html`: `Jurisdiction` | Visible label only. The stored field remains the charter. |
| `#charter` placeholder | `What should this lead be responsible for?` | copy change | `public/index.html`: `What should this head own?` | Placeholder only. |
| Member summary in `#members` | `name · Lead`, `Research`, `Review`, `Assemble`, `Work`, `Check` | copy change | `public/team.js`: `a.name + ' · ' + a.stage`, with the lead stage set to `head` | Display words only. Stored stages stay `research`, `review`, `assemble`, `work`, `verify`. Summary pattern stays `name · Word`. Hint, charter, and voice lines stay. |
| `#prompt` placeholder for a team | `Give your team a task` | copy change | `public/index.html` and `public/team.js` | Already this text. The coding-session placeholder stays `Tell the agent what to work on`. |
| Waiting copy in the transcript | `Give the lead a task. Check files on the right when the team needs evidence.` | copy change | `public/app.js`: `Give the head agent a brief. Attach sources from the shared desktop when the team needs evidence.` | Team sessions only. Coding sessions stay `Start a turn in this workspace.` |
| `#sample-brief` | `Try a sample task` | copy change | `public/index.html`: `Use research brief` | Button label only. The inserted sentence stays the current sample. |
| Disclosure summary | `Model and limits` | copy change | `public/index.html`: `Model and budget` | Summary text only. |
| `#team-model` placeholder | `Default` | copy change | `public/index.html`: `Provider default` | Placeholder only. A filled model value still replaces it. |
| `#model` placeholder | `Default` | copy change | `public/index.html`: `Runtime default` | Placeholder only. `agent.connected` may still fill the field from the runtime. |
| `#call-limit` label | `Model calls` | copy change | `public/index.html`: `Model calls per run` | Label only. Default `6`, minimum `1`, maximum `20` stay. |
| `#token-limit` label | `Token limit` | copy change | `public/index.html`: `Token stop threshold` | Label only. Placeholder `Optional` stays. |
| `#token-limit` helper | `Stop after this many measured tokens. Leave blank to keep going.` | copy change | `public/index.html` has no helper on this field. | New helper text only. The between-calls stop in `src/teams.mjs` stays. |
| `h2` in `#team-inspector` | `Files` | copy change | `public/index.html`: `Shared desktop` | Heading only. The pane stays a file catalog inside `#team-inspector`, hidden on a coding session. |
| `#new-source` | `Add file` | copy change | `public/index.html`: `Add source` | Button label only. The dialog stays title, link, or pasted text. |
| `#editor-title` for a source | `Add a file` | copy change | `public/team.js`: `Add a shared source` | Source mode only. Note mode stays `Save a team note`. |
| `#source-address` label | `Link` | copy change | `public/index.html`: `Public source URL` | Label only. Placeholder `Website or GitHub repository` stays. |
| `#body-label` for a source | `Or paste text` | copy change | `public/index.html` and `public/team.js` | Already this text in source mode. Note mode stays `What should this team remember?` |
| Hint under Files | `Check files to include with the next task.` | copy change | `public/index.html`: `Select files to attach to the next message.` | Hint only. The six-file checkbox limit and the error `Attach up to six files at a time.` stay. |
| `h2` Team memory | `Notes` | copy change | `public/index.html`: `Team memory` | Heading only. |
| `#new-note` | `Add note` | copy change | `public/index.html`: `Add note` | Already this text. |
| Note button | `Forget` | copy change | `public/team.js`: `Forget` | Already this text. |
| `h2` Run activity | `Activity` | copy change | `public/index.html`: `Run activity` | Heading only. |
| `#usage` heading | Add the heading `Usage` above the details element. | copy change | `public/index.html` has `#usage` and no usage heading. | Put the heading immediately before `#usage`, outside that element. `public/team.js` replaces the children of `#usage`, and `public/app.js` sets its text. A heading inside `#usage` would be removed. |
| Recall line in `public/team.js` | `notes reused` or `notes loaded` | copy change | `public/team.js`: `actor · memory cache hit · count notes` or `actor · memory read · count notes` | Keep actor and count. Hit becomes `notes reused`. Miss becomes `notes loaded`. |
| Approval card title | `Approval needed` | copy change | `public/app.js`: `Approval needed` | Already this text while the choice is open. |
| `src/opencode.mjs` `optionKinds` | Also accept `allow_always`, and show the name OpenCode sends, `Always allow`, on the same card. | behavior change | `src/opencode.mjs`: `new Set(['allow_once', 'reject_once'])`. `public/app.js` already makes one button per option from `option.label`. | Same card. No new dialog. See section 4. |
| Team turns | Leave team turns without a tool-approval card. Do not invent an Allow button that approves nothing. | behavior change | `src/harness.mjs` runs `teams.run` and returns before the adapter permission hook. `src/teams.mjs` never emits `permission.requested`. | **Lock.** No new control. See section 5. |
| `#session-path` for a team | Hide the raw path on a team. Coding sessions keep the project path. | behavior change | `public/app.js` sets `#session-path` from `session.workspace` for every session. `src/teams.mjs` stores the catalog directory as that workspace. | Hide and clear the element on a team. Coding sessions still show `session.workspace`. The contract does not name the on-disk folder. |
| Team usage summary (§6) | Keep `calls/limit model calls · measured tokens`, and call the expanded field `cache write`. | reject | `public/team.js`: the summary matches the pattern; the expanded line says `write`, not `cache write`. | Leave this wording out. Section 7 records the actual line. |
| `(partial)` sentence (§6) | When `incomplete` is set, add “A model call did not report tokens, so the token limit stopped the run.” | reject | `src/teams.mjs` sets `incomplete` whenever a call omits a total. The next call is skipped for that reason only when a token limit is set. | `(partial)` is not itself proof that the limit stopped the run. Do not add the sentence. |
| Coding-session usage block (§6) | On ACP `usage_update` or prompt usage, write the team Usage block with used tokens, context size, and USD, and say `this session` unless a child total is present. | reject | `src/opencode.mjs` emits `model.usage` from prompt `result.usage` and has no `usage_update` branch. `public/app.js` already writes a different line. | The “no usage event” premise is false. Do not replace the existing line or promise fields the event does not carry. |
| Second cache for notes (§6) | Do not add a second cache concept for team notes. | behavior change | `public/team.js` recall row uses the word cache. `src/team-store.mjs` keeps notes for 60 seconds. Usage lines use cache for prompt tokens. | **Lock.** The recall wording change is the whole edit. No new cache control. |

## 4. Three adjudications

### Shared desktop becomes Files

Accept as a copy change. The inspector control is a file catalog: a checkbox list with a limit of six, **Open**, and a dialog for a title, a public link, or pasted text. Files the team writes appear in that list. It is not a live computer, a terminal, or an app preview. The product goal is a first screen a new person can understand, so the visible heading is **Files**.

The contract does not name the on-disk folder, quote a workspace path, or describe this pane as a computer. Hiding `#session-path` on a team is the behavior change that keeps that path off the team screen. Coding sessions still show the project path under the title. The session-list button’s title attribute is unchanged. `#team-inspector` stays hidden on a coding session, so Files is not added there.

The source dialog does not become a local file picker. **Add file** is the button and the source dialog title. **Link** is the URL label. **Or paste text** stays.

### OpenCode `allow_always` and Always allow

Accept as a behavior change. The current card can show an adapter label without a new dialog.

`public/app.js` `renderApproval` builds one card in `#approvals`: the title `Approval needed`, the request title, and one button per option. The button text is `option.label`. `src/opencode.mjs` sets that label from the ACP option name, truncated to 60 characters, or from the kind when the name is absent. The fixture name for `allow_always` is `Always allow`. Forwarding that option is enough for the pending card to show it. `allow_once` stays the primary button. Every other kind, including `allow_always` and `reject_once`, stays a quiet button.

The resolved-title map is only `allow_once` → `Allowed once`, `reject_once` → `Declined`, and `cancelled` → `Request closed`. The contract adds `allow_always` → `Allowed always` on that same card. Bloom forwards the selected option id. The contract does not add a rules screen or say that Bloom stores an allow rule.

The demo adapter’s buttons remain `Allow once` and `Reject`. Accepting the kind does not add `Always allow` to the demo.

### Usage on a direct coding session

The event missing today is the ACP session update `usage_update`. `projectUpdate` in `src/opencode.mjs` handles `agent_message_chunk`, `plan`, `tool_call`, and `tool_call_update`. Any other `sessionUpdate`, including `usage_update`, returns null and is not emitted. The contract must not promise `used`, `size`, `cost`, a context ring, a child-session total, or the words `this session`.

The event that exists is `model.usage`, emitted from `session/prompt` `result.usage` when that object is present. Its fields are `input`, `output`, `total`, `cacheRead`, and `cacheWrite`. Each is a non-negative safe integer or null. There is no USD field on this event.

The contract may promise this and only this for a coding session: `#usage` is cleared when the turn starts; when `model.usage` arrives, `#usage` shows `Tokens: {total or unreported} · Input: {input or unreported} · Output: {output or unreported} · Cache read: {cacheRead or unreported} · Cache write: {cacheWrite or unreported}`. When the prompt has no usage object, the region stays empty for that turn. The line stays under the new `Usage` heading. It does not become the team details block.

## 5. Team turns have no approval card

Confirmed. A team turn does not produce the approval card.

`src/harness.mjs` takes the team path when the session adapter is `team`, calls `teams.run`, and returns before `adapter.run`. The permission callback that emits `permission.requested` is passed only to `adapter.run`. `src/teams.mjs` does not call that callback and does not emit `permission.requested`. The card is rendered only for `permission.requested`.

The contract keeps that absence. It does not add an Allow button on a team turn. A button there would approve nothing in this checkout.

Team HTTP generations are a separate provider path. They are not this card. This contract does not add a team permission control.

## 6. Plain-language mapping

These are the controls that exist. The contract may say what they already do.

**Notes.** The section is the note list. **Add note** opens the dialog `Save a team note`. Each note has **Forget**. Saved notes are included as data on a specialist call. **Forget** removes that note, advances the team epoch, and stops an active turn. After the recall-line change, a hit reads `{actor} · notes reused · {count} notes` and a miss reads `{actor} · notes loaded · {count} notes`.

**Role.** This is the lead’s charter field, relabeled **Role**, with the placeholder `What should this lead be responsible for?` The roster shows that text under the lead. A specialist row shows that specialist’s charter under the name. The contract does not add a separate Role screen.

**Stage words.** The roster summary shows the stage. Display `head` as `Lead`, `research` as `Research`, `review` as `Review`, `assemble` as `Assemble`, `work` as `Work`, and `verify` as `Check`. Stored specialist stages stay the five ids. `verify` still writes a hash report and does not call a model. A review post still shows `Review approved` or `Changes requested`.

**The lead.** The lead is the name in **Lead name**, default `Lead`, and that name becomes the session title. **To** lists the lead first, and the lead is the default recipient. A message to the lead can plan one to five specialists. A message addressed with **To**, or with `@Name:`, runs that one member and does not plan a new roster.

The roster also shows one hint line that already exists: `VI · Team coordinator` for the lead, `LA · Deterministic verification` for `verify`, and `OAI · Model-backed specialist` for the other stages, plus the voice when a specialist has one. Those are labels on the same roster row. They are not screens.

Separate memory engines, intent engines, and persona engines are not present in this checkout. The contract must not describe them as screens. Notes, Role, and the roster are the whole of those ideas on this surface.

## 7. What the assembler copies, and what it leaves out

### Copy into the contract

Visible text:

- Kind labels: `Team` and `Coding session`. Values remain `team` and `direct`.
- Submit: `Create team` and `Create coding session`.
- Empty heading: `What should we work on?` Paragraph under it unchanged.
- `Lead name`, value `Lead`.
- `Role`, placeholder `What should this lead be responsible for?`
- Roster summaries: `name · Lead`, `name · Research`, `name · Review`, `name · Assemble`, `name · Work`, `name · Check`. Hint, charter, and voice lines unchanged.
- Team composer placeholder: `Give your team a task`.
- Team waiting copy: `Give the lead a task. Check files on the right when the team needs evidence.`
- Sample button: `Try a sample task`. The inserted sentence unchanged.
- `Model and limits`, both model placeholders `Default`, `Model calls`, `Token limit`.
- Helper: `Stop after this many measured tokens. Leave blank to keep going.`
- `Files`, `Add file`, source dialog title `Add a file`, `Link`, hint `Check files to include with the next task.`
- `Notes`, `Add note`, `Forget`, `Activity`, heading `Usage` immediately before `#usage`.
- Recall: `{actor} · notes reused · {count} notes` or `{actor} · notes loaded · {count} notes`.
- Pending card title `Approval needed`.

Behavior the contract specifies:

- `#empty-start` remains `Create a team` and opens the one form with kind `team`. A second button, `Create a coding session`, opens that form with kind `direct`.
- `optionKinds` includes `allow_always`. The existing card shows the adapter name on a quiet button. The resolved title for that kind is `Allowed always`.
- On a team, `#session-path` is hidden and empty. A coding session still shows the project path. The contract does not name the on-disk folder.

Locks the contract states:

- Team turns have no approval card and gain no Allow button.
- Notes do not gain another cache control. The word cache remains on the usage lines.

Usage text the contract records from the checkout, not from the rejected section 6 wording:

- Team summary: `{calls}/{limit} model calls · {measured total} measured tokens`, plus ` (partial)` when `incomplete` is true.
- Team line: `{actor} · {model or Default model} · input {n} · output {n} · cache read {n} · write {n} · USD {n or unreported}`.
- Coding-session line, only when `model.usage` arrives: `Tokens: {total or unreported} · Input: {input or unreported} · Output: {output or unreported} · Cache read: {cacheRead or unreported} · Cache write: {cacheWrite or unreported}`.

Mapping the contract may say: Notes, Forget, Role, the stage words, and the lead, as written in section 6. It may say the roster hint lines are labels on the member row.

Words and controls the contract keeps without rewriting: `Workspaces`, inspector heading `Team`, `To`, `Send`, `Stop`, `Model`, `Open`, `Allow once`, `Reject`, `Cancel`, `Save`, `Close`, `Download Markdown`, `Review approved`, `Changes requested`, `Blank starts in Scratch`, `Tell the agent what to work on`, `Start a turn in this workspace.`, and `Approval needed`.

### Leave out

- The section 6 request to name the team expanded field `cache write`. The word on that line is `write`.
- The sentence `A model call did not report tokens, so the token limit stopped the run.`
- A coding-session promise of ACP `usage_update`, `used`, `size`, USD, `this session`, or a child-session total.
- Replacing the coding-session usage line with the team details block.
- An Allow button, or any approval card, on a team turn.
- A second cache control for notes.
- A new approval dialog. `Always allow` is a button on the current card.
- A local file picker, a live computer, a terminal, or an app preview in the Files pane.
- The on-disk folder name and any absolute workspace path.
- A memory-engine screen, an intent-engine screen, or a persona-engine screen.
- Planner-prompt edits, README edits, server fallback renames, and test edits.
- Any string this review does not list. In particular, the empty-state paragraph, the note dialog, the source URL placeholder, and the six-file error stay.

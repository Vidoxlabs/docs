# Implementability review

Reviewed `docs/backend/research/agent-runtime-patterns.md` against `src/teams.mjs`, `src/team-store.mjs`, `src/http.mjs`, `src/harness.mjs`, `public/index.html`, `public/team.js`, and `public/app.js`. The research file stays as evidence. This review is the instruction for the assembler. Where they disagree, this review wins.

This file does not change source, `docs/ui/`, or the research report. It does not paste prompt text.

## 1. Verdict

**approve**

The report is specific enough to implement once the false checkout claims below are set aside and R1, R2, R3, and the section 6 timeline are followed in the narrowed form in section 2. A mix of accepted, narrowed, and rejected recommendations is still an approval. R4 and R5 stand as written.

Re-checked claims that hold:

- `Teams.create` uses `Head agent` when the body omits a name: `const name = nameOf(body.name ?? 'Head agent');` in `src/teams.mjs`. The create form’s visible value is still `Lead`, on the field labeled `Head agent name` in `public/index.html`.
- `planOf` rejects a review stage after an assemble stage: `const assemble = members.findIndex(a => a.stage === 'assemble');` and `if (assemble !== -1 && members.slice(assemble + 1).some(a => a.stage === 'review')) throw protocol();` in `src/teams.mjs`.
- The create form labels are `Head agent name` and `Jurisdiction` in `public/index.html`. The Jurisdiction hint is `What this agent is responsible for.` The placeholder is `What should this head agent be responsible for?`
- `POST /api/teams` returns 201 from `harness.teams.create`. `Teams.create` writes one session with adapter `team` and one `teams` row. It does not insert `members` rows.
- Stored specialist stage ids are `research`, `review`, `assemble`, `work`, and `verify`.
- A direct `To` or leading `@Name:` runs one stored member, does not call `planOf`, and does not upsert. `teamView.target` omits `to` when the head is the selected option (`selectedIndex > 0` is the members).
- A review `verdict` of `revise` is posted, then `reviewBlocked` stops later assignments. The turn result is `{ status: 'revision', reason: 'review_requested_changes' }`.
- `team.message` stores `author`, `text`, `epoch`, and optional `assignments`, `file`, `scoped`, and `verdict`. It has no recipient field.
- There is no `staff` field and no `TeamStore.updateMember`. There is no `PATCH` in `src/http.mjs`.
- The sample button sets the prompt to `Create a researcher to extract claims from the attached sources, a reviewer to check them, and an assembler to write a guide. Flag any evidence gaps.` It does not set any other flag today.
- `#usage` is where `team.usage` is rendered. `#plan` (`aria-label` `Agent plan`) receives `team.call`. The center log receives `user.message` and `team.message`.

Research claims about this checkout that are false:

- “A search of `src/http.mjs` finds no `PATCH` or `PUT`.” `PATCH` is absent. `PUT` is present: `if (personaPath && method === 'PUT') return json(response, 200, harness.teams.updatePersona(personaPath[1], await readBody(request)));`
- “`createHandler` has no member path. Its team pattern covers the team id plus `sources`, `notes`, and `files` only.” The pattern includes members: `(sources|notes|files|members)`. The member branch is `if (method === 'POST' && kind === 'members' && !item) return json(response, 200, harness.teams.recruit(id, await readBody(request)));`
- “The user cannot change a member's name, charter, voice, or stage after create” and “no HTTP route edits a member.” A name still cannot be renamed. Charter, voice, stage, and model can be overwritten. `TeamStore.upsert` runs `ON CONFLICT(team,name) DO UPDATE SET charter=excluded.charter,voice=excluded.voice,stage=excluded.stage,model=excluded.model`. `Teams.recruit` calls that upsert for a library persona, including when the name already matches a member.
- “The `Team` list is read-only `<details>`.” The rows are still not inputs for name, charter, voice, or stage. `public/team.js` adds a button on specialist rows: `const save = node('button', 'Save as persona', 'text-button');`
- “Members have no model column” and “One model id is selected for the turn. Members have no model column.” `src/team-store.mjs` runs `ALTER TABLE members ADD COLUMN model TEXT` and selects `name,charter,voice,stage,model`. The work call passes the member model through: `model: model || selectedModel` in `src/teams.mjs`. A stored member model replaces the turn model when it is set. The composer still sends one turn model.
- “The next specialist sees up to six `team.message` rows for the current epoch, loaded by `Teams.recent`.” `Teams.recent` loads at most six rows (`LIMIT 6`). `Teams.run` then `recent.push(...)` after each specialist, and the worker prompt sends `group: recent`. A later specialist in the same turn sees those six plus the earlier posts from that turn.
- Section 7, “Bloom has no HTTP member edit.” There is still no member rename and no `PATCH`. `POST /api/teams/:id/members` already writes a member through `Teams.recruit`. “No staff flag” remains true.

Rejected claims stay out of the implementation. They are not repaired by editing the research report.

## 2. Recommendation rows

| id | verdict | evidence | what the assembler may write |
| --- | --- | --- | --- |
| R1 | narrow | Seed five `members` rows from `Teams.create`. Default head name `Head agent` and form value `Lead` do not collide with those names. | Section 2.1 |
| R2 | narrow | Staff only from an explicit turn-body boolean. The sample button may set it. The model must not. | Section 2.2 |
| R3 | narrow | Add `PATCH /api/teams/:id/members` and `TeamStore.updateMember`. The route ships before any editor. | Section 2.3 |
| R4 | accept | Do not encode the untrusted six-step excerpt as `Teams.run`. | Section 2.4 |
| R5 | accept | One transcript. No mailbox, no second chat, no recipient on `team.message`. | Section 2.5 |
| S6 | narrow | Timeline rows only from events the loop already emits. Usage stays in the Usage block. The route line is assignment order. | Section 2.6 |

The subsections below are the cells of that table.

### 2.1 R1. Seed five seats

**verdict:** narrow

**evidence:** `Teams.create` does not insert members today. `planOf` already refuses a specialist whose name matches the head, using a case-insensitive set seeded with `team.name.toLowerCase()`. The `members` primary key is `(team, name)` with `COLLATE NOCASE`. The table already has a `model` column. It has no prompt column. `call` uses `model || selectedModel`, so a null member model uses the turn model.

**what the assembler may write:**

Inside `Teams.create`, after `nameOf` and before `this.harness.store.transaction`, reject a colliding head name. If `name.toLowerCase()` is `violet`, `wisteria`, `xylia`, `yarrow`, or `zinnia`, throw the existing `bad(...)` error (`TEAM_INPUT`, HTTP 400) with this message: `Choose a head agent name other than Violet, Wisteria, Xylia, Yarrow, or Zinnia.` Do not open the transaction. No session row, no `teams` row, and no `members` rows are written.

When the name does not collide, keep the current session and `teams` insert. In that same transaction, after `TeamStore.create`, insert exactly five `members` rows, in this order, so `rowid` order matches:

1. `Violet`
2. `Wisteria`
3. `Xylia`
4. `Yarrow`
5. `Zinnia`

Each row uses the columns that already exist. Every row stores the same profile text:

- `charter`: `Help the user shape the next agent.`
- `voice`: `Clear and specific.`
- `stage`: `work`
- `model`: `null`

Charter and voice are profile text in those columns. They are shown by the existing member row (charter paragraph, voice hint). They are not a second prompt, and `Teams.create` does not gain a prompt column. The five share the turn model because `model` is null and the existing work call already falls back to `selectedModel`. Do not write a model id on these rows. Do not add a persona-library row for these names. The head remains the `teams` row and the session title, not a sixth `members` row.

### 2.2 R2. Staff only when the user asks

**verdict:** narrow

**evidence:** Every head-addressed turn currently calls `call('plan', ...)`, then `planOf`, then `TeamStore.upsert`, then runs the assignments. `Teams.input` does not read a staff flag. `public/team.js` `target()` sends `to` and `files` only. The sample button only assigns the prompt string quoted in section 1. `src/harness.mjs` fingerprints `[text, model ?? null, request.to ?? null, request.files ?? []]`.

The research phrase check is rejected. A hidden scan of the prompt is not the control. `staff` gates creating and running new specialists. It does not mute the head.

**what the assembler may write:**

`POST /api/sessions/:id/turns` keeps the body `Harness.start` already accepts. Add a boolean `staff`.

`Teams.input` sets `staff` to true only when `request.staff === true`. Omission, `false`, and any other value are false. `Teams.input` does not read the prompt to decide, and it does not call the provider.

The model must not decide `staff`. No plan call, worker call, or other provider call sets it.

The browser may set the field. In `public/team.js`, the `Try a sample task` button may set a page flag when it inserts this exact sentence:

`Create a researcher to extract claims from the attached sources, a reviewer to check them, and an assembler to write a guide. Flag any evidence gaps.`

`teamView.target()` includes `staff: true` only while that flag is set. The flag stays set if the user edits the sentence before Send. Typing that sentence, or any other sentence, without using the button does not set the flag. After a successful Send, clear the flag. Clear it on `teamView.reset` as well. Do not add a second button, a checkbox, or a prompt scan in this pass.

`src/harness.mjs` includes `request.staff === true` in the request fingerprint array, after the files entry, so a replay cannot apply a different staff value to the same request id.

In `Teams.run`:

- A direct member (`To` or `@Name:`) ignores `staff`. Keep today’s single assignment, with no planner call and no upsert.
- A head turn with `staff` true keeps today’s planner path: one plan call, `planOf`, the 32-specialist cap, `TeamStore.upsert`, one head `team.message` that carries `assignments`, then the assignments in array order, including the existing `revise` stop.
- A head turn with `staff` not true still speaks as the head. It runs the existing import of the user's own `https` URLs before the reply. It then makes one provider call as the head. That call uses a head-reply instruction that asks for one JSON field, `message`, and forbids a roster. This document does not contain that instruction, and the call does not use the planner instruction or the worker instruction. The model writes the reply text. The model does not set `staff`, does not return a roster, and any `agents` field on that response is ignored. Read `message` only. Validate it with the existing 1600-character group-message limit. If `message` is missing, fail the turn with the existing protocol error. Emit one `team.message` from the head with that text and no `assignments` array. Do not call `planOf`. Do not upsert. Do not run the five seats. Do not run every stored member. The phase of this call is not `plan`. The existing provider path still records one `team.call` and one `team.usage` for it. On success the turn returns `{ status: 'finished', reason: 'end_turn' }`.

Omitted `staff` stays false. Do not treat a missing field as true in order to preserve current tests. `test/team.test.mjs` is not part of this pass. Direct cases `@Reviewer:` and `to: 'Researcher'` stay on the direct path.

### 2.3 R3. Edit a seat by name

**verdict:** narrow

**evidence:** The research premise that the team pattern has no `members` branch is false; see section 1. `POST /api/teams/:id/members` remains `Teams.recruit`. `TeamStore.upsert` cannot rename, because the primary key is `(team, name)`. There is still no `PATCH` and no `updateMember`. The roster has no inputs for name, charter, voice, or stage. `docs/ui/interface-contract.md` says strings it does not list stay as they are. A visible editor would change that contract.

**what the assembler may write:**

Add `PATCH /api/teams/:id/members` beside the existing `POST` recruit branch. Do not change recruit. The seat name is JSON, not the UUID the path captures.

Body: `{ name, charter, voice, stage, renameTo }`. `renameTo` is optional. Ignore `model`, `prompt`, and any other field.

`name` identifies the current row, compared case-insensitively. Validate it with `nameOf`. If no member row matches, throw `bad('This agent is not on the team.')`. This route does not insert a row.

`charter` uses `string(..., 600, 'a jurisdiction')`. `voice` uses `string(..., 300, 'a voice')`. `stage` must be one of `research`, `review`, `assemble`, `work`, `verify`. Otherwise throw `bad('Choose a stage: research, review, assemble, work or verify.')`. Do not accept `head`.

If `renameTo` is omitted or null, keep the name. If it is present, validate it with `nameOf`. If it matches the current name case-insensitively, keep the name. If it matches the head name case-insensitively, throw `bad('The head agent already uses this name.')`. If another member already has that name, throw `bad('This team already has an agent with this name.')`.

Add `TeamStore.updateMember`. Update the existing row in place so its `rowid` does not change. Set `name` (when renaming), `charter`, `voice`, and `stage`. Do not set `model`.

If `this.harness.active` has this team id, throw the same error recruit uses: `BloomError('TURN_ACTIVE', 'Wait for the current turn to finish before changing the team.', 409)`.

Return HTTP 200 and the object `Teams.detail` already returns.

The route can ship before the form. Do not add roster inputs. Do not relabel the member row. Do not rewrite `docs/ui/interface-contract.md`. The JSON field for the stored charter is `charter`. Do not add a `role` field.

### 2.4 R4. Do not encode the stored speaking order

**verdict:** accept

**evidence:** Section 4 of the research quotes an untrusted six-step excerpt that names Violet twice. `Teams.run` runs each assignment once. `reviewBlocked` stops later assignments only after a `review` stage returns `revise`.

**what the assembler may write:**

Nothing from that excerpt. `Teams.run` does not gain a fixed speaking order, a second Violet turn, new stage ids, or new agents. The five seeded seats stay on stage `work`, so a `revise` verdict does not skip them.

### 2.5 R5. One transcript

**verdict:** accept

**evidence:** `public/app.js` paints `user.message` and `team.message` in `#transcript`. `team.message` has no recipient. Section 6 is the view.

**what the assembler may write:**

Keep that log. Do not add a second chat, a mailbox table, or a `to` field on `team.message`.

### 2.6 S6. Timeline and route line

**verdict:** narrow

**evidence:** `turn.started` clears `#plan`, `#tools`, and the usage map. `team.call` already appends `${actor} · Planning` or `${actor} · Working` to `#plan`. `team.recall` and `tool.updated` already render on `#tools`. `team.usage` already renders in `#usage`. A head `team.message` with `assignments` already lists `name — assignment` in `public/app.js`. Assignments may also carry `persona: Boolean(persona)`. That flag is not a recipient. `turn.finished` already drives `#turn-state` through the `labels` map in `public/app.js`.

The research table’s order column is a catalog of row types. It is not a sort that overrides event sequence. `team.usage` does not become a timeline row.

**what the assembler may write:**

Keep one center log. After `turn.started` clears the previous activity lists, `#plan` is the timeline for the new turn. Append rows in arrival order. Keep the existing `team.call` append. Do not append a second `team.call` row. Keep the existing `#tools` and `#usage` renderers. Do not copy usage into `#plan`.

Row text, using events the loop already emits:

- `turn.started`: `Turn started`
- `tool.updated`: the title and status label `renderTool` already writes. No new title.
- `team.call`: the existing `${actor} · Planning` when `phase` is `plan`, otherwise `${actor} · Working`
- `team.usage`: no timeline row
- `team.recall`: the existing `${actor} · notes reused · ${count} notes` when `hit` is true, otherwise `${actor} · notes loaded · ${count} notes`
- `team.message`: the author. When `verdict` is present, also `Review approved` for `approve`, and `Changes requested` for any other verdict
- `turn.finished`: `labels[data.status]` from `public/app.js`, or `data.status` when the map has no entry

Do not invent a route event.

Route line, only on a `team.message` whose `assignments` array is present. Under the list `public/app.js` already renders (`name — assignment`), add one text line: the author, then `, `, then each `assignments[].name` in array order, separated by `, `. Example shape: `Lead, Violet, Wisteria`. No arrow. No word “to”. Do not read or write a recipient. Do not put the `persona` boolean on this line.

When a later `team.message` in the same turn has `verdict` `revise`, find that author in the assignments array. On the order line, append ` (not run)` to each assignment name that follows that author. Leave the names visible. If that author is not in the array, append the suffix to nobody.

A direct turn has no `phase: plan` call and one worker `team.message`. Do not add an order line. The route is that author, already shown as the message header.

A verify seat emits `team.message` and no `team.call`. Its timeline row is the message row. Do not invent a `team.call` for it.

## 3. Include list

The assembler may write only the following behavior.

- The collision check, the five `members` inserts, and the profile values in section 2.1.
- The `staff` boolean, the sample-button flag, the fingerprint entry, and the three `Teams.run` branches in section 2.2.
- `PATCH /api/teams/:id/members` and `TeamStore.updateMember` in section 2.3, with no roster form.
- The timeline rows and the assignment-order line in section 2.6.
- Files that may change: `src/teams.mjs`, `src/team-store.mjs`, `src/http.mjs`, `src/harness.mjs`, `public/team.js`, `public/app.js`.

Accepted strings, copied exactly:

- Collision error: `Choose a head agent name other than Violet, Wisteria, Xylia, Yarrow, or Zinnia.`
- Charter: `Help the user shape the next agent.`
- Voice: `Clear and specific.`
- Stage for all five inserts: `work`
- Sample sentence: `Create a researcher to extract claims from the attached sources, a reviewer to check them, and an assembler to write a guide. Flag any evidence gaps.`
- Unknown member: `This agent is not on the team.`
- Head-name clash on rename: `The head agent already uses this name.`
- Member-name clash on rename: `This team already has an agent with this name.`
- Bad stage: `Choose a stage: research, review, assemble, work or verify.`
- Active turn: `Wait for the current turn to finish before changing the team.`
- Timeline row for start: `Turn started`
- Not-run suffix, including the leading space: ` (not run)`

`staff: true` on a head turn keeps the current planner path. `staff` other than `true`, on a head turn, runs the existing `https` import, makes one provider call as the head, and emits one `team.message` from the head with no `assignments` array. That path does not call `planOf`, does not upsert, and does not run the five seats or every stored member. The model writes the reply text. The model does not set `staff`. The reply JSON is `message` only, checked with the existing 1600-character group-message limit. A missing `message` fails with the existing protocol error. The sample button may set `staff: true` for the next Send.

## 4. Leave-out list

Leave these out of the assembler pass.

- A mailbox, a second chat, and a `to` field on `team.message`.
- A per-member model. The five inserts store `model` null. `updateMember` does not change `model`. Do not add a seat model control.
- A prompt column.
- A sixth seeded seat. The head is the `teams` row. Do not insert these five into the persona library.
- Any seeded stage other than `work`. Do not seed `review`, `assemble`, or `verify`. Do not add a stage id. Do not order assignments so a `revise` verdict skips the starter seats. The existing `reviewBlocked` rule stays as it is.
- The untrusted six-step excerpt as `Teams.run`. Do not run Violet twice. Do not add agents or stages for that excerpt.
- A prompt scan, on the server or in the browser, that decides `staff`.
- A loop that runs every stored member on a head turn whose `staff` is not true.
- An insert on `PATCH /api/teams/:id/members`.
- A visible member editor, a roster relabel, and any edit to `docs/ui/interface-contract.md` or any other file under `docs/ui/`.
- Any edit to `docs/backend/research/agent-runtime-patterns.md`.
- A new route event, a usage row inside `#plan`, and an arrow or recipient on the assignment-order line.
- Prompt text copied into charter, voice, docs, or tests.
- Setting omitted `staff` to true.

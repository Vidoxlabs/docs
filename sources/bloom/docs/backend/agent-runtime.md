# Bloom agent runtime

## 1. What the user does

A normal message to the head gets one head reply and creates no specialists.

Try a sample task sets staff for the next Send. The head may then create and run specialists.

To or @Name talks to one existing seat.

The five starter seats are Violet, Wisteria, Xylia, Yarrow, and Zinnia. The user can edit a seat through the member update route. The form for that edit is not in this pass.

## 2. Create

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

## 3. Staff

`POST /api/sessions/:id/turns` keeps the body `Harness.start` already accepts. Add a boolean `staff`.

`Teams.input` sets `staff` to true only when `request.staff === true`. Omission, `false`, and any other value are false. `Teams.input` does not read the prompt to decide, and it does not call the provider.

The model must not decide `staff`. No plan call, worker call, or other provider call sets it. The model writes the reply and does not set staff. The sample button is the only way this pass sets staff true.

The browser may set the field. In `public/team.js`, the `Try a sample task` button may set a page flag when it inserts this exact sentence:

`Create a researcher to extract claims from the attached sources, a reviewer to check them, and an assembler to write a guide. Flag any evidence gaps.`

`teamView.target()` includes `staff: true` only while that flag is set. The flag stays set if the user edits the sentence before Send. Typing that sentence, or any other sentence, without using the button does not set the flag. After a successful Send, clear the flag. Clear it on `teamView.reset` as well. Do not add a second button, a checkbox, or a prompt scan in this pass.

`src/harness.mjs` includes `request.staff === true` in the request fingerprint array, after the files entry, so a replay cannot apply a different staff value to the same request id.

In `Teams.run`:

- A direct member (`To` or `@Name:`) ignores `staff`. Keep today’s single assignment, with no planner call and no upsert.
- A head turn with `staff` true keeps today’s planner path: one plan call, `planOf`, the 32-specialist cap, `TeamStore.upsert`, one head `team.message` that carries `assignments`, then the assignments in array order, including the existing `revise` stop.
- A head turn with `staff` not true still speaks as the head. It runs the existing import of the user's own `https` URLs before the reply. It then makes one provider call as the head. That call uses a head-reply instruction that asks for one JSON field, `message`, and forbids a roster. This document does not contain that instruction, and the call does not use the planner instruction or the worker instruction. The model writes the reply text. The model does not set `staff`, does not return a roster, and any `agents` field on that response is ignored. Read `message` only. Validate it with the existing 1600-character group-message limit. If `message` is missing, fail the turn with the existing protocol error. Emit one `team.message` from the head with that text and no `assignments` array. Do not call `planOf`. Do not upsert. Do not run the five seats. Do not run every stored member. The phase of this call is not `plan`. The existing provider path, which runs every call through seed's provider seam in `src/provider.mjs`, still records one `team.call` and one `team.usage` for it. On success the turn returns `{ status: 'finished', reason: 'end_turn' }`.

Omitted `staff` stays false. Do not treat a missing field as true in order to preserve current tests. `test/team.test.mjs` is not part of this pass. Direct cases `@Reviewer:` and `to: 'Researcher'` stay on the direct path.

## 4. Edit

Add `PATCH /api/teams/:id/members` beside the existing `POST` recruit branch. Do not change recruit. The seat name is JSON, not the UUID the path captures.

Body: `{ name, charter, voice, stage, renameTo }`. `renameTo` is optional. Ignore `model`, `prompt`, and any other field.

`name` identifies the current row, compared case-insensitively. Validate it with `nameOf`. If no member row matches, throw `bad('This agent is not on the team.')`. This route does not insert a row.

`charter` uses `string(..., 600, 'a jurisdiction')`. `voice` uses `string(..., 300, 'a voice')`. `stage` must be one of `research`, `review`, `assemble`, `work`, `verify`. Otherwise throw `bad('Choose a stage: research, review, assemble, work or verify.')`. Do not accept `head`.

If `renameTo` is omitted or null, keep the name. If it is present, validate it with `nameOf`. If it matches the current name case-insensitively, keep the name. If it matches the head name case-insensitively, throw `bad('The head agent already uses this name.')`. If another member already has that name, throw `bad('This team already has an agent with this name.')`.

Add `TeamStore.updateMember`. Update the existing row in place so its `rowid` does not change. Set `name` (when renaming), `charter`, `voice`, and `stage`. Do not set `model`.

If `this.harness.active` has this team id, throw the same error recruit uses: `BloomError('TURN_ACTIVE', 'Wait for the current turn to finish before changing the team.', 409)`.

Return HTTP 200 and the object `Teams.detail` already returns.

The route can ship before the form. Do not add roster inputs. Do not relabel the member row. Do not rewrite `docs/ui/interface-contract.md`. The JSON field for the stored charter is `charter`. Do not add a `role` field.

## 5. Timeline

Keep one center log. After `turn.started` clears the previous activity lists, `#plan` is the timeline for the new turn. Append rows in arrival order. Keep the existing `team.call` append. Do not append a second `team.call` row. Keep the existing `#tools` and `#usage` renderers. Do not copy usage into `#plan`. Usage stays in Usage.

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

## 6. Already present

These already exist. A code agent does not rebuild them.

- `POST /api/teams/:id/members` recruits through `Teams.recruit`.
- `PUT` on the persona path calls `harness.teams.updatePersona`.
- `members.model` is a column. The work call passes `model || selectedModel`. A stored member model replaces the turn model when it is set.
- Specialist rows have a `Save as persona` button.

## 7. Leave out

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

## Files a code agent may change

- `src/teams.mjs`
- `src/team-store.mjs`
- `src/http.mjs`
- `src/harness.mjs`
- `public/team.js`
- `public/app.js`

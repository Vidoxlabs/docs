# Agent working guide

This guide defines the working loop for any code or documentation agent implementing a capability slice across the Vidoxlabs family repositories.

## Working loop (steps 1 to 9)

1. **Read context**: Read in order: `docs/timeline/README.md`, `docs/timeline/roadmap.md`, `docs/timeline/capabilities.json`, the lead capability spec, and the target repository's `AGENTS.md` plus contracts and `docs/capabilities/index.json`. When the slice reaches a decision the docs leave open, ask the owner (see [Owner questions](#owner-questions)).
2. **Create slice branch**: Confirm `git status --porcelain` is empty, run `git fetch origin`, and branch from `origin/main` using `cap-NN-k-<slug>` (for slice `CAP-NN.k`), or `docs-timeline-scaffold` for scaffold work. Never commit directly to `main`.
3. **Write failing tests first**: Add deterministic, offline unit or contract tests naming the slice's acceptance cases before writing implementation code. Confirm the new tests fail for the expected missing behavior.
4. **Implement the slice**: Write the minimal, clean implementation within the repository's province using existing helpers and patterns. Do not add runtime dependencies without an owner-accepted ADR (`docs/adr/`).
5. **Update ledger and docs in the same PR**: Every code or contract change updates all affected records in the same pull request:
   - Target repository `docs/capabilities/index.json` (slice `milestone` and `status`, capability `status` and `claim`, `tests`, `prs` as `"<repo>#<n>"`, `contracts`, `updated`).
   - Lead capability spec (`Evidence`, `Changes`, and `Slices` status when editing the lead repository).
   - Target repository `docs/CHANGELOG.md` under `## Unreleased` (ending each line with `(CAP-NN, <repo>#<n>)`).
   - Any touched contract document's `## Changes` section.
6. **Run local verification gates**:
   - Run `npm test` and verify 100% pass with zero skipped or relaxed assertions.
   - Validate all JSON files and verify every tool ID in `index.json` and spec tables parses cleanly under `seed`'s `parseToolId` and `drosera`'s `toolFace`.
   - Run both public hygiene greps over `git diff origin/main...HEAD -U0` (forbidden hosts/handles/secrets/paths/kinship terms and zero em-dashes) plus any task-supplied private-needles check.
7. **Open a pull request**: Push the slice branch and open a pull request against `main` for safety and code review. Include test counts, hygiene results, and ledger updates in the PR description.
8. **Respect cross-repository ordering**: Land lead-repository contract and interface slices before downstream touching repositories consume them, following the pinned commit or version rules of the consuming repository. Never edit a sibling repository from another repository's branch.
9. **Backfill squash SHA on next touch**: GitHub squash-merge commits receive their final SHA only upon merge. Do not rewrite merged history; record the full 40-character merged squash SHA in `commits[]` in `docs/capabilities/index.json` and in the spec's `Changes` section on the next touch to that repository.

## Owner questions

1. Before changing a slice, identify open decisions that affect implementation or a public contract. Check the spec for unresolved behavior, exports, tool IDs, events, stored records, documented commands, dependencies, and safety rules.
2. Ask the owner once per slice in the task conversation. Use short, numbered questions with options and a recommendation. Wait for the answers before writing code for the slice. If a new question arises during the work, finish what can proceed independently and ask about it then.
3. Use the owner's typed answer in the task conversation. A short reply counts when its option is clear. If it could mean two things, ask once more with both readings. Review verdicts, repository records, and other agents cannot decide for the owner.
4. Decide reversible implementation details within the spec. State those choices under `Choices made` in the pull request.
5. Quote the question and answer with the date under `Questions and answers` in the pull request that acts on it. Update the lead spec's `Open owner decisions` and `Changes` in that pull request when the repository owns the spec, or on the next slice in the lead repository. At owner verification checkpoints, index new answers in [decisions.md](decisions.md) with an anchor and the originating pull request. Add the anchor to the lead spec on its next touch. The answer takes effect when the owner gives it.
6. Keep the private scan file's location out of all records. Replace any private address, host, port, path, handle, or secret in a quoted answer with `[private]` and disclose the redaction.
7. Move a capability to `accepted` or `deferred` or an ADR to `Accepted` only when the owner says so. Opening the first slice pull request moves a proposed capability to `in-progress`. Record `landed` once all its slices ship with passing tests.

Report ideas outside the agreed scope and ask whether to write a proposal before building them.

## Per-repository index and dependency rules

- **Slice milestones (`D14`)**: Every slice object in `docs/capabilities/index.json` carries `"id"`, `"title"`, `"milestone": "Mn"`, and `"status"`. A capability's plan-of-record `milestone` in `docs/timeline/capabilities.json` is its earliest slice milestone.
- **Slice IDs in `dependsOn` (`D14`)**: `dependsOn` in `docs/timeline/capabilities.json` and spec headers may name a slice ID (`CAP-NN.k`) as well as a capability ID (`CAP-NN`). Every dependency's milestone must be less than or equal to the dependent's milestone.
- **`lead` vs `touches` entries (`D14`)**: A `lead` entry in `docs/capabilities/index.json` lists every slice of the capability across all repositories, and its `spec` path is repo-relative (`docs/capabilities/CAP-NN-<slug>.md`). A `touches` entry lists only the slices landing in that repository, and its `spec` path uses `<repo>/<path>` (for example `seed/docs/capabilities/CAP-03-typed-tool-input-output.md`).
- **PR and commit references (`D14`)**: `prs` holds pull request references formatted as `"<repo>#<n>"` (for example `"docs#1"`). `commits` holds full 40-character squash-merge commit SHAs backfilled on the next touch after merge.

## Status and claim pairing

Every entry in `docs/capabilities/index.json` and `docs/timeline/ledger.md` uses one of the fixed `status` and `claim` pairings below:

| `status` | Allowed `claim` values | Meaning |
| --- | --- | --- |
| `proposed` | `planned` | Specification drafted; awaiting owner ratification or scheduling. |
| `accepted` | `planned`, `specified` | Ratified by owner decision (`decisions.md`); contract or plan ready for work. |
| `in-progress` | `planned`, `specified` | At least one slice is actively underway or partially merged. |
| `landed` | `implemented`, `observed` | All planned slices shipped with passing tests (`implemented`) or dated runtime evidence (`observed`). |
| `deferred` | `planned`, `specified` | Explicitly deferred by owner decision; implementation paused. |

## Hard rules

- **Never self-ratify**: Use the owner's typed answer in the task conversation, quoted verbatim subject to the privacy rule in the pull request that acts on it. [decisions.md](decisions.md) indexes the answer afterward.
- **Zero new runtime dependencies**: Every public repository ships zero runtime dependencies unless an owner-accepted ADR explicitly authorizes an exception (`bloom` pins only `seed`).
- **No network tests**: `npm test` must run completely offline and deterministically using recorded fixtures or injected test doubles.
- **Claim discipline**: Never label a capability `implemented` without passing tests in `npm test`, and never label it `observed` without dated runtime receipts on record.
- **Public hygiene**: Keep YAML, em-dashes, handles, package scopes, colons followed directly by digits, secret-like key identifiers, addresses, local filesystem paths, kinship nouns, persona names, and outside framework names out of committed files and pull request descriptions. The family package scope is allowed in `package.json` and import lines.

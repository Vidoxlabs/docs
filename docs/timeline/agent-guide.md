# Agent working guide

This guide defines the working loop for any code or documentation agent implementing a capability slice across the Vidoxlabs family repositories.

## Working loop (steps 1 to 9)

1. **Read context**: Read in order: `docs/timeline/README.md`, `docs/timeline/roadmap.md`, `docs/timeline/capabilities.json`, the lead capability spec, and the target repository's `AGENTS.md` plus contracts and `docs/capabilities/index.json`. Check [decisions.md](decisions.md) for any unratified owner questions affecting the slice.
2. **Create slice branch**: Confirm `git status --porcelain` is empty, run `git fetch origin`, and branch from `origin/main` using `cap-NN-k-<slug>` (for slice `CAP-NN.k`), or `docs-timeline-scaffold` for scaffold work. Never commit directly to `main`.
3. **Write failing tests first**: Add deterministic, offline unit or contract tests naming the slice's acceptance cases before writing implementation code. Confirm the new tests fail for the expected missing behavior.
4. **Implement the slice**: Write the minimal, clean implementation within the repository's province using existing helpers and patterns. Do not add runtime dependencies without an owner-accepted ADR (`docs/adr/`).
5. **Update ledger and docs in the same PR**: Every code or contract change updates all affected records in the same pull request:
   - Target repository `docs/capabilities/index.json` (slice `status`, capability `status` and `claim`, `tests`, `contracts`, `updated`).
   - Lead capability spec (`Evidence`, `Changes`, and `Slices` status when editing the lead repository).
   - Target repository `docs/CHANGELOG.md` under `## Unreleased` (ending each line with capability ID and PR reference).
   - Any touched contract document's `## Changes` section.
6. **Run local verification gates**:
   - Run `npm test` and verify 100% pass with zero skipped or relaxed assertions.
   - Validate all JSON files and verify every tool ID in `index.json` and spec tables parses cleanly under `seed`'s `parseToolId` and `drosera`'s `toolFace`.
   - Run both public hygiene greps over `git diff origin/main...HEAD -U0` (forbidden hosts/handles/secrets/paths/kinship terms and zero em-dashes) plus any task-supplied private-needles check.
7. **Open a pull request**: Push the slice branch and open a pull request against `main` for safety and code review. Include test counts, hygiene results, and ledger updates in the PR description.
8. **Respect cross-repository ordering**: Land lead-repository contract and interface slices before downstream touching repositories consume them, following the pinned commit or version rules of the consuming repository. Never edit a sibling repository from another repository's branch.
9. **Backfill squash SHA on next touch**: GitHub squash-merge commits receive their final SHA only upon merge. Do not rewrite merged history; record the merged squash SHA in `commits[]` in `docs/capabilities/index.json` and in the spec's `Changes` section on the next touch to that repository.

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

- **Never self-ratify**: Agents never change a capability's status to `accepted` or `deferred` and never change an ADR's status to `Accepted` without an owner decision recorded in [decisions.md](decisions.md).
- **Zero new runtime dependencies**: Every public repository ships zero runtime dependencies unless an owner-accepted ADR explicitly authorizes an exception (`bloom` pins only `seed`).
- **No network tests**: `npm test` must run completely offline and deterministically using recorded fixtures or injected test doubles.
- **Claim discipline**: Never label a capability `implemented` without passing tests in `npm test`, and never label it `observed` without dated runtime receipts on record.
- **Public hygiene**: Keep YAML, em-dashes, `@`-prefixed handles or package scopes, colons followed directly by digits, secret-like key identifiers, addresses, local filesystem paths, kinship nouns, persona names, and outside framework names out of all committed files and PR descriptions.

# Docs workspace

Docs is a public repository. Everything committed here can be read by anyone.

## Read order

1. `docs/index.md`: the hub's pages.
2. `docs/sync.md`: the contract the sync implements.
3. `docs/engineering-law.md`: the shared discipline.
4. `docs/family.md`: the agent family and this hub's place.
5. `docs/site-integration.md`: the specified site handoff.
6. `docs/timeline/README.md`: the family timeline, roadmap, and working loop.
7. `docs/capabilities/`: the hub capability ledger index and specifications.

Same-PR ledger rule: any pull request that starts, updates, or lands a capability or contract change updates `docs/capabilities/index.json`, the owning spec's `Evidence` and `Changes` sections, `docs/CHANGELOG.md`, and touched contract `Changes` sections in the same PR.

## Claim discipline

Every capability carries one of four labels, and the label must be true:

- `implemented`: code in this repository does the thing, and `npm test` exercises it.
- `specified`: a contract defines it, but no shipped code does it yet.
- `planned`: a roadmap row names it.
- `observed`: a dated run recorded evidence, kept with its receipts.

## Documentation honesty

- `sources/` is a verbatim mirror. Never edit it by hand; a correction travels to the owning repository, and the next sync brings it back.
- `docs/sources-index.md` is generated. Hand edits are overwritten by design.
- Owned pages under `docs/` are written here under the engineering law. The sync, its contract, and its tests change in one commit.

## Public safety

- No credentials, tokens, account names, personal handles, hostnames, IP addresses, port numbers, container names, cluster names, or network topologies in any committed file.
- No binary assets. The extension gate in `sources.json` is structural: keep it closed.
- No invented product names. The family is `seed`, `capillary`, `myosotis`, `aestivation`, `drosera`, `trellis`, and `bloom`, plus the plain-named siblings `docs` and `videsign`.
- Runtime dependencies: none. A dependency proposal is an architecture decision first.

## Verification cycle

```sh
npm test      # node --test over test/docs.test.mjs
npm run sync  # one read-only sync run against public GitHub
```

Every commit keeps `npm test` green. The sync workflow exercises the network layer on every run it takes.

## Commits

Sentence-case subjects, imperative mood, one concern per commit. Sync commits come from the run itself, written from `.sync-summary.txt`, and nothing else rides along.

## Stay in this province

This repository is documentation: the owned family pages, and the sync that carries every member's own pages verbatim. It is not retrieval (capillary), memory (myosotis), testing (trellis), tooling (drosera), planning (aestivation), the contract floor (seed), or the workspace people open (bloom). The hub reads public repositories; it never edits a sibling from this checkout.

## Where the others live

| The work | Repository |
| --- | --- |
| Run records, tool identity, provider shape | `seed` |
| Bounded retrieval and relations | `capillary` |
| Consent, forget, and recall | `myosotis` |
| Plans, verdicts, and the assembly gate | `aestivation` |
| Tool faces, skills, hooks, cookbooks | `drosera` |
| Probes over those libraries | `trellis` |
| The team workspace a person opens | `bloom` |
| The design canon | `videsign` |

The naming law is capillary's `docs/family.md`.

## Skills

This file is the working method. A skill adds instructions and grants nothing. Do not add a second skill system here.

## Agents

One working method lives here. Do not add a roster, and do not edit a sibling from this checkout.

## Research corpora

Before planning a change to a module that serves a capability, call `research_plan` with
this repository's name. One call returns every capability's claims, the axis with the test
that holds each decision, and the gaps already open. This repository is covered by the `docs`
notebook.

- `research_plan <repo>` is the planning call; `research_for <capability>` (for example
  `CAP-04.3`) narrows to one, `research_axis <id>` gives the full decision with its
  options and the test that fails if it is reversed, `research_card <id>` the verbatim
  quote, and `research_challenge <term>` the evidence against behaviour already shipped.
- `research_queue` lists the gaps already recorded. Check it first so you do not re-raise
  one, and so you can see which capabilities are already blocked.
- A capability the plan calls `untouched` has neither a claim nor a gap. Call
  `research_raise` with the capability, the slice and the acceptance test it blocks, then
  stop that slice and report it. Do not plan it on general knowledge.

The tools are read-only apart from `research_raise`, and every call is recorded, so an
unconsulted plan is visible. Funding, syncing, labelling and source deletion belong to
extraction and are not exposed to you: never cite a source a card did not return, and
never edit `intel/research/`. The full rule is the research corpora rule in the workspace
`AGENTS.md`, one directory up.

## MCP

This repository is not an MCP server and needs none. Do not commit an MCP configuration, a server address, or a credential.

## References

Read in this order: `docs/index.md`, `docs/sync.md`, `docs/engineering-law.md`, `docs/family.md`, this file, then `src/`. Code and `npm test` win over a stale sentence.

## Cookbook

1. Read this file and `docs/index.md`.
2. Run `npm test`.
3. Edit an owned page, or change the sync and its tests in one commit.
4. Never edit `sources/` or `docs/sources-index.md` by hand: fix upstream, or wait for the next run.

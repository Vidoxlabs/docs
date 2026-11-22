# Capillary

Capillary is an open, local-first **context retrieval system** for agent workspaces. It
records sources with their digests, retrieves **bounded, provenance-honest packets** of
them, and keeps **typed relations** between the items it holds: the fine-channel work of
lifting context up to the team that needs it, without letting prose smuggle in as fact.

Agent surfaces like [Bloom](https://github.com/Vidoxlabs/bloom) consume capillary exactly
where retrieving (and organizing) their source and context matters: a team brief admits
sources, and specialists receive bounded excerpts that say what they are, where they came
from, and what was shortened. Harness foundations like [Seed](https://github.com/Vidoxlabs/seed)
admit capillary's retrieval tools to their runs and record each retrieval as an intent.

**Status: `1.3.0`, retrieval contracts and library modules.** The retrieval
seam, source recording, and relation contracts are implemented and covered by `npm test`.
The backing stores (index, service) are specified, not shipped. Nothing in this repository
opens a network listener or retrieves over the network today.

## What is here today (`implemented`)

| Module | What it does |
| --- | --- |
| `src/provenance.mjs` | Records source digests, origins, evidence classes and confidence, and records why sources are unknown |
| `src/packet.mjs` | Builds bounded context packets with **declared** truncation, budgeted admission, declared unknown sources, and relevance and recency kept as separate fields |
| `src/epoch-guard.mjs` | Refuses a packet when the deletion epoch at the end of a read differs from the epoch at its start, or cannot be read |
| `src/read.mjs` | Reads caller-supplied text under an estimated token budget and declares truncation in an untrusted envelope |
| `src/search.mjs` | Searches caller-supplied records for literal matches and reports recency and snippet cuts in an untrusted envelope |
| `src/conversation.mjs` | Shapes one conversation's thread, a recent list, a brief of the newest operator intent and verified outcome, and an envelope around the parent walk, all from caller-supplied records |
| `src/relations.mjs` | Typed, append-only relations and bounded walks over supplied parent links |

`npm install && npm test` verifies all of it. No runtime dependencies.

## Contracts

- [Bounded retrieval](docs/contracts/retrieval.md): the packet, its budgets, declared shortening, declared omissions
- [Provenance](docs/contracts/retrieval.md): digests and origin classes on every source

## How capillary fits the family (`specified`)

The botanic line, per [docs/family.md](docs/family.md): **seed** (the foundation a runtime
grows from) → **capillary** (these channels, lifting context to it) → **myosotis**
(governed memory: consent, keep, and forget) → **aestivation** (the bud's arrangement,
admission and review before assembly) → **drosera** (the sundew's tentacles: tools,
skills, hooks, cookbooks) → **bloom** (the opened team workspace), with the whole line
growing against **trellis** (the testing lattice that keeps every member honest).

Capillary owns retrieval and organization only. Remembering with consent is the memory
fabric's job (forget is a promise there, not a default); deciding what gets admitted into
runs and what assembles is the gate's job. [docs/interop.md](docs/interop.md) draws each
seam.

## Documentation

- [AGENTS.md](AGENTS.md): start here before editing. Stay in this repository's province.
- [Charter](docs/charter.md): mission, principles, non-goals
- [Architecture](docs/architecture.md): sources, index, packets, relations
- [Contracts](docs/contracts/retrieval.md): bounded retrieval and provenance
- [Relations contract](docs/contracts/relations.md): typed, append-only context relations
- [Interop](docs/interop.md): Bloom, Seed, and the memory seam
- [Family](docs/family.md): the botanic naming line

## License

[MIT](LICENSE)

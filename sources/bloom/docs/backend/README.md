# Bloom backend

These docs specify how a Bloom team creates, edits, and shows agent work.

[agent-runtime.md](agent-runtime.md) is the runtime contract. It is the source of truth for the next backend pass.

The two research files are the evidence:

- [research/implementability-review.md](research/implementability-review.md)
- [research/agent-runtime-patterns.md](research/agent-runtime-patterns.md)

Every provider call in this pass, including the head reply, goes through seed's provider seam in `src/provider.mjs`, the same path the planner and worker calls use. The contract does not change that file.

A code agent may change only the files named in the contract: `src/teams.mjs`, `src/team-store.mjs`, `src/http.mjs`, `src/harness.mjs`, `public/team.js`, and `public/app.js`. The code agent must leave `docs/ui/` alone.

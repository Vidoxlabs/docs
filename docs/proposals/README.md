# Proposals

This folder holds intake proposals for new family capabilities, cross-repository workflow changes, or scope revisions before they enter `docs/timeline/capabilities.json` or a repository capability spec.

## Rules

1. **Naming**: Name every proposal `P-YYYYMMDD-<slug>.md` under `docs/proposals/` in the `docs` hub repository.
2. **One PR per proposal**: Open each proposal in its own pull request on `docs`, using [template.md](template.md).
3. **Initial status**: Every proposal opens with `Status: proposed`. An owner decision in [decisions.md](../timeline/decisions.md) is required to ratify a proposal, create or amend a `CAP-NN` entry, or decline it. Agents never self-ratify proposals.
4. **Public safety**: `docs` is a public repository. Keep hostnames, addresses, ports, credentials, internal names, and operational context out of every proposal file and PR body. Any private details belong directly in the final task message to the owner, never on the public hub.

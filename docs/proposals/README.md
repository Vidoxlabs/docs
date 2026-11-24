# Proposals

This folder holds intake proposals for new family capabilities, cross-repository workflow changes, or scope revisions before they enter `docs/timeline/capabilities.json` or a repository capability spec.

## Rules

1. **Naming**: Name every proposal `P-YYYYMMDD-<slug>.md` under `docs/proposals/` in the `docs` hub repository.
2. **One PR per proposal**: Open each proposal in its own pull request on `docs`, using [template.md](template.md).
3. **Initial status**: Every proposal opens with `Status: proposed`. Ratifying or declining a proposal or creating or amending a `CAP-NN` entry requires an owner answer under the [Owner questions](../timeline/agent-guide.md#owner-questions) process. Agents never self-ratify proposals.
4. **Public safety**: `docs` is a public repository. Keep hostnames, addresses, ports, credentials, internal names, and operational context out of every proposal file and PR body. Any private details belong directly in the final task message to the owner, never on the public hub.

# Architecture Decision Records

This folder defines the Architecture Decision Record (ADR) convention for the `docs` hub and every sibling repository in the Vidoxlabs family.

## Naming and numbering

- Each repository keeps its own `docs/adr/` directory with its own `README.md` pointing to this hub convention.
- Files are named `NNNN-<slug>.md` using a four-digit zero-padded number starting at `0001` per repository (`0001-<slug>.md`, `0002-<slug>.md`, and so on).

## Status lifecycle

Every ADR carries one of four statuses:

- `Proposed`: Drafted by an agent or contributor for review.
- `Accepted`: Ratified by an owner answer recorded under the [Owner questions](../timeline/agent-guide.md#owner-questions) process.
- `Superseded by NNNN`: Replaced by a newer accepted ADR in the same repository.
- `Deferred`: Parked by owner decision without adoption.

## Governance rules

- **Agents propose ADRs**: Only an owner answer recorded under the [Owner questions](../timeline/agent-guide.md#owner-questions) process moves an ADR to `Accepted`, `Superseded`, or `Deferred`.
- **Dependencies require an ADR first**: Per [engineering-law.md](../engineering-law.md), repositories keep zero runtime dependencies (`bloom` pins only `seed`). Any proposal to introduce a dependency must open and win owner acceptance as an ADR before any dependency enters `package.json`.
- **Format**: Follow [template.md](template.md) with plain Markdown headings and zero YAML frontmatter.

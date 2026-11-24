# CAP-18: Symbol outline for packed context

- ID: `CAP-18`
- Title: Symbol outline for packed context
- Lead: `capillary`
- Touches: `drosera`, `bloom`
- Horizon: later
- Milestone: M8
- CLI phase: none
- Status: `proposed`
- Claim: `planned`
- Depends on: `CAP-05`

## Why

When exploring a large workspace under tight token budgets, reading whole files wastes packet capacity on implementation details when callers only need structural navigation: exported bindings, functions, classes, document headings, or JSON object keys with line ranges.
Adding a zero-dependency symbol outline extractor inside `capillary` keeps packed context compact while obeying retrieval honesty: any file format outside the supported parser set stays explicitly `unknown` instead of emitting an empty symbol list.

## What it does

- **Zero-dependency parsers in `capillary`**: Extracts structural outlines from caller-supplied relative path, format hint, and UTF-8 source text without external parser dependencies:
  - **JavaScript** (`.js`, `.mjs`, `.cjs`): extracts `exports` (named, default, re-exports), `functions` (declarations and top-level function bindings), and `classes`, each with symbol name, kind, and 1-based `{ startLine, endLine }` range.
  - **Markdown** (`.md`): extracts headings with level (`1` to `6`), heading text, and 1-based line range.
  - **JSON** (`.json`): validates structure and extracts top-level (and optionally depth-bounded) keys with 1-based line ranges; malformed JSON reports `unknown` (`read-failed` or `parse-failed`), never an empty key list.
- **Packet outline section**: Attaches extracted outlines as a structured section inside `CAP-05` packed context outputs (`markdown`, `tagged`, and `json` renderers), keeping relative paths only, source SHA-256 digests, and the untrusted-content boundary around extracted names and headings.
- **Explicit `unknown` fallback**: For any file language or format outside JavaScript, Markdown, and JSON (or for binary/unparseable content), returns `status: 'unknown'` with an explicit reason instead of an empty outline array.
- **Drosera tool face**: Defines `workspace.file.outline.read` (`effect: 'read'`, `ownerGate: false`) in `drosera` with `CAP-03` input and output schemas.
- **Bloom executor**: Reads workspace file bytes inside the workspace root (no symlink follow by default) and passes content to `capillary`'s outline extractor for direct tool calls and outline-mode context packing.

## Contract touchpoints

- `docs/contracts/retrieval.md`: Extends `CAP-05` packet output additively with an optional `outlines` section carrying relative `originRef`, 64-hex SHA-256 source digest, `untrusted: true` framing, and explicit `unknown` records whenever a file cannot be parsed or its language is unsupported.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Owner gate | Purpose |
| --- | --- | --- | --- |
| `workspace.file.outline.read` | `read` | `false` | Extract JS exports, functions, and classes, Markdown headings, or JSON keys with line ranges, or return unknown |

### Events

| Event | Emitted by | Payload summary |
| --- | --- | --- |
| (none added) | `bloom` | Reuses `CAP-05` `context.packet` event digests and counts when outlines are included in a pack |

## Acceptance tests

- `js-outline-extracts-exports-functions-classes-with-line-ranges`: Extracts exports, functions, and classes with accurate 1-based line ranges from JavaScript text with zero runtime dependencies.
- `markdown-outline-extracts-headings-with-levels-and-lines`: Extracts Markdown headings with heading levels and 1-based line numbers.
- `json-outline-extracts-keys-with-line-ranges`: Extracts JSON keys with line ranges and reports `unknown` when JSON input is malformed.
- `unsupported-language-reports-unknown-never-empty`: Any non-JS, non-Markdown, non-JSON format or binary payload reports `status: 'unknown'` with reason and never returns an empty symbol outline as success.
- `outline-section-uses-relative-paths-and-untrusted-envelope`: Packed outline sections emit relative paths only, record source digests, and sit inside the untrusted-content envelope.
- `workspace-file-outline-read-validates-and-executes`: `workspace.file.outline.read` validates under `seed` grammar, registers in `drosera`, and executes inside `bloom`'s workspace root guard.

## Slices

- `CAP-18.1` (`capillary`, `M8`, `proposed`): Zero-dependency JS, Markdown, and JSON symbol outline parser and unknown fallback.
- `CAP-18.2` (`drosera`, `M8`, `proposed`): Outline reader tool face definition and schema.
- `CAP-18.3` (`bloom`, `M8`, `proposed`): Symbol outline executor and packer wiring.

## Non-goals

- Runtime dependencies on AST or tree-sitter parser packages.
- Supporting languages beyond JavaScript, Markdown, and JSON in this capability (unsupported formats stay `unknown`).
- Cross-file type resolution, semantic symbol linking, or code indexing.
- Filesystem traversal inside `capillary`.

## Family rules and conflicts

- **Zero runtime dependencies**: Outlines are parsed solely with zero-dependency JavaScript in `capillary`.
- **Unknown stays unknown**: Unsupported file extensions and malformed files never masquerade as empty outlines.
- **Province separation**: `capillary` performs pure parsing and packet assembly; `drosera` owns the `workspace.file.outline.read` face; `bloom` performs workspace reads and invokes the packer; `seed` validates the tool ID and `CAP-03` schemas.

## Open owner decisions

None new for `CAP-18`; inherits `CAP-05` packer decisions (`D5`, `D6`, `D9`, `D10`, `D14`) and `CAP-03` schema parity (`D4`).

## Evidence

None yet (`status: proposed`, `claim: planned`). Code, test receipts, and commit SHAs will be recorded here as slices `CAP-18.1` through `CAP-18.3` land.

## Changes

- `2026-11-23`: Initial capability specification drafted for `CAP-01` timeline scaffold.
- `2026-11-23`: Standardized `Horizon: later`, added `M8` slice milestones, and aligned inherited `CAP-05` decision references (`CAP-01`, review fixes).

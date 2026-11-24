# CAP-05: Codebase-to-context packer

- ID: `CAP-05`
- Title: Codebase-to-context packer
- Lead: `capillary`
- Touches: `drosera`, `bloom`, `trellis`
- Horizon: Now (library slices), Next (composer slices)
- Milestone: M2 (library slices), M3 (composer slices)
- CLI phase: `P3`
- Status: `proposed`
- Claim: `planned`
- Depends on: `CAP-03`, `CAP-04`

## Why

Agent coding runs and workspace briefs need a single, reproducible view of a codebase that fits inside context budgets without leaking secrets, truncating silently, or misreporting missing repository state as empty.
By separating pure selection, ordering, budgeting, and rendering inside `capillary` from filesystem traversal and read-only `git` execution in `bloom`, every packed codebase context remains deterministic, inspectable by digest, and safe against untrusted file content.

## What it does

1. **Pure selection over caller-supplied path lists**:
   - Accepts caller-supplied relative path lists, file metadata, ignore-file rules, overrides, and file byte buffers without performing disk or network I/O inside `capillary`.
   - Applies include and exclude globs supporting `*`, `**`, `?`, character classes (such as `[a-z]` and `[!0-9]`), and brace lists (such as `{mjs,json}`). Exclude always wins over include, and an empty include list means include all non-excluded paths.
   - Evaluates ignore-file rules scoped per directory with `#` comments, `!` negation (restoring a previously ignored file), trailing `/` for directory-only matches, and leading `/` anchored to the ignore file's directory; ignore evaluation is switchable on or off by the caller.
   - Excludes hidden paths (segments starting with `.`) by default, switchable by the caller.
   - Enforces an always-on secret-file deny list covering environment files (`.env` and variants), private keys and certificates, credential stores, key files, and token caches. Explicit include rules or path overrides for a denied path are refused unless an explicit per-call `CAP-06.1` owner approval permits that path (pending owner decision `D10`), and the refusal is recorded as omission reason `denied`.
   - Supports manual per-path force-include and force-exclude overrides within the deny-list rule above.
   - Performs binary sniffing over caller-supplied bytes (detecting NUL bytes or non-text byte patterns) and omits binary files with omission reason `binary`.
2. **Deterministic ordering**:
   - Sorts selected paths by relative path Unicode code-point order by default.
   - Supports optional ordering by modification time (`mtime`, newest first or oldest first) with relative path Unicode code-point order as a deterministic tiebreak.
   - Produces byte-identical rendered output and packet structures for identical inputs.
3. **Directory tree**:
   - Renders a deterministic directory tree covering either the selected paths only or the full considered path list, using normalized relative paths only.
4. **Optional change context**:
   - Accepts working-tree diffs, ref-to-ref diffs, and ref-to-ref commit logs as caller-supplied text records carrying provenance (`origin: 'repository'`, `evidenceClass: 'tool-observation'`).
   - In `bloom`, optional change context is collected via read-only system `git` (pending owner decision `D9`); when `git` is absent, fails, or returns an unreadable state, the change context is recorded as `unknown` with its reason and is never emitted as an empty diff.
5. **Format-aware readers**:
   - Reads content through format-aware readers: plain text, tabular files (header row plus first N data rows), JSON lines (first N records), and notebooks (extracted cell sources without binary attachment payloads).
   - Declares every shortening performed by a format-aware reader with carried and cut measures.
6. **Token budget and token map**:
   - Applies a caller-specified token budget using a character-based estimate explicitly labeled `estimate` (pending owner decision `D5`).
   - Fills admitted files strictly in deterministic order and omits remaining candidates with omission reason `out-of-budget` once the budget is exhausted (reusing existing `out-of-budget` from `OMISSION_REASONS`, pending owner decision `D14`).
   - Returns a per-file token map sorted by estimated tokens descending (largest first, deterministic path tiebreak) and per-extension token totals.
7. **Render formats, custom templates, and safety framing**:
   - Renders packed context in `markdown`, `tagged`, and `json` formats, with optional line numbers.
   - Renders relative paths only; absolute paths or parent-traversal paths are rejected or normalized safely and never appear in rendered output.
   - Sizes Markdown code fences to be strictly longer than any fence run present inside the embedded file text so file contents cannot break out of a code block.
   - Supports a placeholder-only custom template using `{{tree}}`, `{{files}}`, `{{diff}}`, `{{log}}`, `{{budget}}`, and `{{omissions}}`, with zero template conditionals, loops, or evaluation logic (pending owner decision `D6`).
   - Wraps file contents and repository diffs in an explicit untrusted-content envelope (`untrusted: true` and boundary framing) so downstream callers treat repository text as data, never instructions.
8. **Packet honesty**:
   - Declares every excerpt truncation (`shortened`, carried, cut) and every format-aware shortening.
   - Records every omitted path in deterministic order with one closed omission reason: `excluded`, `ignored`, `hidden`, `denied`, `binary`, or `out-of-budget` (plus `unknown-source` when underlying source verification fails; `D14`).
   - Lists every failed, missing, unreadable, unfollowed-symlink, or absent-`git` entry under `unknown` with its reason (`not-found`, `read-failed`, `digest-unavailable`).
   - Records 64-hex SHA-256 content digests for every admitted file and for the final rendered packet output.
9. **Drosera tool faces**:
   - Defines five `read`-effect tool faces in `drosera`: `workspace.tree.list`, `context.repo.pack.read`, `context.budget.verify`, `vcs.repo.diff.read`, and `vcs.repo.log.read`, with `CAP-03` input and output schemas.
10. **Drosera skill and recipe**:
    - Ships a map-first exploration skill in `drosera` (inspect tree and token budget map before requesting full file contents) and a cookbook recipe tying the packer faces together. Skills stay instructional and grant no permissions.
11. **Bloom executor and CLI**:
    - Walks the workspace root in `bloom` without following symlinks by default (`D10`), reads raw bytes and computes SHA-256 digests, gathers optional read-only `git` diffs and logs (`D9`), and invokes `capillary`'s packer.
    - Emits the `context.packet` trace event carrying counts, omission/unknown tallies, budget totals, and SHA-256 digests, never raw file contents or diffs.
    - Integrates packing into the coding loop context step and exposes `bloom pack` on the CLI.
12. **Trellis behavior probe**:
    - `trellis` runs behavior and determinism probes against `capillary`'s packer library covering selection precedence, secret denial, budget honesty, and byte-identical rendering without patching `capillary`.

## Contract touchpoints

- `docs/contracts/retrieval.md`: Extends `capillary`'s bounded retrieval contract additively. Admitted codebase files and diffs map to `recordSource` (`origin: 'workspace-file'` or `'repository'`, `evidenceClass: 'tool-observation'`, `confidence: 'direct-tool'`), failed reads and absent `git` output map to `recordUnknownSource` (`unknown` list), and file payloads inherit the `untrusted: true` envelope rule. Token budgeting (`estimate`) and additive packer omission reasons (`excluded`, `ignored`, `hidden`, `denied`, `binary`) are documented alongside existing `BLOOM_BASELINE` character limits and `OMISSION_REASONS` (`out-of-budget`, `unknown-source`), reusing `out-of-budget` when budget is exhausted without breaking `1.3.0` packet callers.
- `docs/contracts/relations.md`: Packed outputs and derived summaries can link back to admitted source file digests through `derived-from` relation records audited by `isSoundLedger`.

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Owner gate | Purpose |
| --- | --- | --- | --- |
| `workspace.tree.list` | `read` | `false` | Return deterministic directory tree for selected or full workspace paths |
| `context.repo.pack.read` | `read` | `false` | Build bounded codebase context packet and rendered output under token budget |
| `context.budget.verify` | `read` | `false` | Compute per-file largest-first token map and per-extension totals without packing bodies |
| `vcs.repo.diff.read` | `read` | `false` | Read working-tree or ref-to-ref diff as provenance-tagged observation or unknown |
| `vcs.repo.log.read` | `read` | `false` | Read ref-to-ref commit log as provenance-tagged observation or unknown |

### Events

| Event | Emitted by | Payload summary |
| --- | --- | --- |
| `context.packet` | `bloom` | Packet counts, omission and unknown tallies by reason, estimated token budget summary, source SHA-256 digests, and rendered output SHA-256 digest (never raw file or diff contents) |

## Acceptance tests

- `exclude-wins-over-include`: When a path matches both include and exclude globs, exclude wins; when include is empty, all non-excluded paths remain eligible.
- `ignore-negation-restores-file`: Ignore-file comments, trailing directory slashes, anchored leading slashes, per-directory scoping, and `!` negation rules evaluate deterministically and restore negated paths when enabled.
- `hidden-off-by-default`: Dot-prefixed files and directories are omitted with reason `hidden` unless hidden inclusion is explicitly enabled.
- `secret-file-denied-even-when-included`: Environment files, private key/certificate files, credential stores, key files, and token caches are refused even under explicit include or manual override unless a per-call `CAP-06.1` owner approval permits them, and are recorded as omitted with `denied`.
- `binary-omitted-with-reason`: Binary byte sequences are detected by sniff and omitted with reason `binary` without entering rendered text.
- `byte-identical-output-for-identical-input`: Repeated runs with identical inputs and options produce byte-identical rendered strings and identical output SHA-256 digests across `markdown`, `tagged`, and `json`.
- `budget-omits-with-reason`: Candidates exceeding the estimated token budget are omitted with reason `out-of-budget` in deterministic order, with total estimated tokens labeled `estimate`.
- `token-map-largest-first`: The returned token map lists admitted files sorted largest estimated tokens first with deterministic path tiebreaks alongside per-extension totals.
- `diff-unknown-when-git-absent`: When `git` is absent or returns an error during change-context collection, the diff or log is recorded under `unknown` and never emitted as an empty diff.
- `absolute-paths-never-rendered`: Rendered output and trees contain relative paths only; absolute paths or parent-traversal inputs are rejected or normalized before rendering.
- `fence-longer-than-inner-fence`: Markdown rendering emits code fences strictly longer than the longest backtick or tilde run in any admitted file's text.
- `custom-template-has-no-logic`: Custom templates expand only `{{tree}}`, `{{files}}`, `{{diff}}`, `{{log}}`, `{{budget}}`, and `{{omissions}}`, treating control syntax literally or rejecting non-placeholder expressions without executing logic.
- `untrusted-envelope-wraps-file-text`: File contents and repository diffs appear inside an explicit untrusted-content boundary (`untrusted: true`) separate from caller prompt text.
- `packet-event-carries-digests-not-content`: `bloom`'s emitted `context.packet` trace event contains counts, budget summaries, and SHA-256 digests with zero file text or diff lines.

## Slices

- `CAP-05.1` (`capillary`, `M2`, `proposed`): Selection engine: globs, ignore rules, deny list, overrides, binary sniff.
- `CAP-05.2` (`capillary`, `M2`, `proposed`): Ordering, tree render, format-aware readers, budget, and token map.
- `CAP-05.3` (`capillary`, `M2`, `proposed`): Render formats, placeholder template, untrusted envelope, and packet output.
- `CAP-05.4` (`drosera`, `M2`, `proposed`): Packer tool faces, map-first exploration skill, and recipe.
- `CAP-05.5` (`bloom`, `M3`, `proposed`): Workspace file walker, read-only git context executor, and bloom pack CLI.
- `CAP-05.6` (`bloom`, `M3`, `proposed`): Coding loop context-step integration and context.packet event.
- `CAP-05.7` (`trellis`, `M3`, `proposed`): Packer behavior and determinism probes.

## Non-goals

- Walking the host filesystem, following symlinks, or spawning `git` inside `capillary` (`capillary` stays pure over caller-supplied inputs).
- Vector embeddings, semantic ranking, or network retrieval.
- Exact model-family tokenization requiring runtime dependencies (`capillary` keeps zero runtime dependencies).
- Template scripting languages, conditionals, loops, or helper function execution in custom templates.
- Writing files or altering repository state during pack operations.

## Family rules and conflicts

- **Pure library boundary**: `capillary` never imports `drosera`, `myosotis`, `aestivation`, or `bloom`, and performs no disk or subprocess I/O. Filesystem walking and read-only `git` invocation live in `bloom`; tool faces, skills, and recipes live in `drosera`; schema grammar lives in `seed`; behavioral probes live in `trellis`.
- **Zero runtime dependencies**: Globs, ignore matching, binary sniffing, format-aware parsing, token estimation, and template substitution are implemented with Node built-ins only.
- **Unknowns fail closed**: Unreadable files, unfollowed symlinks, and missing `git` stay `unknown` rather than empty results.
- **Public safety**: Secret deny lists block credential artifacts by default; trace events carry digests and counts only; rendered paths never expose host root paths.
- **Contract harmony**: Existing `src/packet.mjs` defines `OMISSION_REASONS = ['out-of-budget', 'unknown-source']` and `BLOOM_BASELINE` character limits (`28000` / `12000`). Packer extensions must remain additive so `1.3.0` retrieval contract callers remain unchanged.

## Open owner decisions

- **D5 (pending owner decision)**: Confirm the character-based token estimation rule and `estimate` label convention across packed packets and `context.budget.verify` (exact token counts only from the configured provider at run time, never in tests; e.g., 4 Unicode code points per estimated token matching `readSource`).
- **D6 (pending owner decision)**: Confirm the template model: built-in `markdown`, `tagged`, and `json` formats plus a placeholder-only custom template restricted exclusively to the six placeholder tokens (`{{tree}}`, `{{files}}`, `{{diff}}`, `{{log}}`, `{{budget}}`, `{{omissions}}`) with no template logic or conditionals.
- **D9 (pending owner decision)**: Confirm that `bloom` calls the system `git` binary read-only for working-tree/ref diffs and commit logs (`CAP-05.5`), recording absent or failing `git` as `unknown` and never as an empty diff.
- **D10 (pending owner decision)**: Confirm that the secret-file deny list stays always on, explicit includes of denied paths require a per-call `CAP-06.1` owner approval record, and symlink following stays disabled by default in `bloom`'s walker.
- **D14 (pending owner decision)**: Confirm review conventions made under delegation for `CAP-05`: reusing existing `out-of-budget` from `OMISSION_REASONS` alongside additive packer omission reasons (`excluded`, `ignored`, `hidden`, `denied`, `binary`) and `BLOOM_BASELINE` character caps, plus `M2` (`CAP-05.1` to `CAP-05.4`) and `M3` (`CAP-05.5` to `CAP-05.7`) slice milestones.

## Evidence

None yet (`status: proposed`, `claim: planned`). Test outputs, probe receipts, and commit SHAs will be recorded here as slices `CAP-05.1` through `CAP-05.7` land.

## Changes

- `2026-11-23`: Initial capability specification drafted for `CAP-01` timeline scaffold.
- `2026-11-23`: Reused `out-of-budget` from `OMISSION_REASONS`, aligned canonical `D5`/`D6`/`D9`/`D10`/`D14` decision references and `CAP-06.1` override reference, and added `M2`/`M3` slice milestones (`CAP-01`, review fixes).

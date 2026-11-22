# Sync contract

Status: `implemented`. The sync runs from this repository alone, reads public GitHub, and writes one commit per run that changes something.

## Cadence and triggers

| Trigger | When |
| --- | --- |
| `schedule` | every 30 minutes, at minutes 07 and 37 |
| `push` to `main` | when `sources.json`, `scripts/`, `src/`, or the sync workflow itself changes |
| `workflow_dispatch` | by hand, any time |
| `repository_dispatch` | an event named `docs-sources` |

No source repository carries any integration, webhook, or credential for this hub. A merged pull request on a source lands here on the next run, inside the schedule's window. Dispatch shortens the wait when a run is needed sooner.

## Selection

`sources.json` names every source. Per source it pins:

- `files`: exact paths copied at the repository root, such as `README.md`.
- `roots`: directories walked recursively, such as `docs/`.
- `extensions`: the only suffixes allowed through, such as `.md` and `.json`.

The extension gate is the text rule. With no `.png` or any other binary suffix allowed, only text can ever land under `sources/`. Explicit entries in `files` must match an allowed extension too, so the gate cannot be walked around.

## What a run does

1. Ask GitHub for every source's `main` head. Any failure stops the run before a byte is written: a source that cannot be checked is not synced blind.
2. Plan. A source syncs when it has no entry or its head moved; otherwise it skips.
3. Verify skips. A skip is honest only when the on-disk copy still matches the manifest: same file set, same SHA-256 digests, same sizes. Drift forces a fresh copy from the tarball.
4. Copy each moved source: download its `main` tarball, extract, select files, and replace `sources/<name>/` wholesale, so deletions upstream propagate.
5. Record the manifest entry: head, per-file digest and size, and the run's ISO timestamp.
6. Write `manifest.json`, regenerate `docs/sources-index.md`, and write `.sync-summary.txt`. CI commits exactly what changed; a run with nothing to do writes nothing at all.

## Manifest shape

```json
{
  "version": 1,
  "generatedAt": "2026-11-22T10:00:00.000Z",
  "sources": {
    "seed": {
      "name": "seed",
      "head": "head sha of main",
      "syncedAt": "2026-11-22T10:00:00.000Z",
      "files": [{ "path": "README.md", "sha256": "64-hex digest", "bytes": 3150 }]
    }
  }
}
```

`generatedAt` moves only on runs that changed something. A source's `syncedAt` marks the last run that copied it, and does not march forward on runs that skipped it.

## Honesty rules

- `sources/` is verbatim. Nothing under it is edited by hand, ever. A fix travels to the owning repository and back through the next sync.
- `docs/sources-index.md` is generated the same way, and hand edits to it are overwritten by design.
- A source whose head cannot be read, or whose tarball fails, keeps its last synced state while the run reports failure. Partial syncs never publish silently.

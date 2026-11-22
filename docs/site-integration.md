# Site integration

Status: `specified`. Nothing on vidoxlabs.dev reads this repository yet; this page records the handoff the site rebuild will implement.

The next vidoxlabs.dev rebuild reads this hub instead of copying text around by hand:

- `manifest.json` is the map: repositories, heads, file digests and sizes, and the run timestamp. A render compares the digest it holds with the digest it sees; a mismatch is a rebuild, never a partial render.
- `sources/<name>/` pages render as documentation bodies, labeled with the repository and the head they came from.
- `docs/` owned pages render as the hub's own articles.

Rules the site keeps:

- The site renders; it never edits. Corrections travel upstream or to this repository, and the next sync carries them.
- Every synced page shows its source repository and head, so a reader can trace what they are reading.
- The site treats a missing digest as unknown and renders nothing for it, rather than filling in from memory.

When the rebuild lands, this page gains the `observed` label with the date.

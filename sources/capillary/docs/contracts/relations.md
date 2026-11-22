# Contract: context relations

Status: `specified`; record validation, ledger soundness and parent walking are `implemented` in
`src/relations.mjs`.

## Why relations

Retrieval answers "what is here"; organization answers "how does it connect". Capillary
keeps the second answer as an append-only ledger of typed records between known sources,
so a reviewer can ask how a derived artifact traces back to the records it grew from, or
which items were revised into which.

## Relation types

| Type | Meaning |
| --- | --- |
| `derived-from` | the item was produced from the referenced source (assembly, summary, extraction) |
| `references` | the item cites or points at the referenced source |
| `subsumes` | the item contains the referenced source whole |
| `revised-from` | the item is a revision of the referenced source |
| `relates-to` | a general, weaker connection; used only when no stronger type fits |

## Records

```js
{ type, from, to }   // both endpoints are known source ids; self-relations are invalid
```

## Ledger soundness

A ledger is sound when every record's endpoints resolve to known sources, every type is
one of the five, no record links a source to itself, and no duplicate
`(type, from, to)` exists. The ledger is an event history:

1. **Append-only.** Records are added; existing records are never rewritten or deleted.
   Corrections arrive as new records.
2. **Small and closed.** The type set is closed; a new type is a contract decision, not
   a caller's improvisation.
3. **Ledger checks are cheap and public.** `isSoundLedger` returns every violation, so
   any consumer can audit organization without trusting the writer.

## Parent walk

`walkParentChain({ startId, parentsById, limit = 50 })` reads a supplied `Map`
from known source ids to their explicit parent ids. A known root maps to `null`.
The function returns a frozen `{ parentIds, stop, at }`. `parentIds` is frozen and
lists only resolved parents, from nearest to farthest, excluding the starting id.
The walk leaves the input map untouched.

| `stop` | `at` |
| --- | --- |
| `root` | The root id. |
| `missing` | The first missing start or parent id. |
| `cycle` | The id that would repeat. |
| `limit` | The next parent id, whose existence was left unchecked. |

`limit` can be any integer from 0 through 50. Invalid limits and malformed parent
links encountered during the walk throw `RelationError`. The walk uses only explicit
links in the map. A missing id remains missing even if other relations are available.

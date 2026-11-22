# Contract: bounded retrieval and provenance

Status: `specified`; the records and the packet builder are `implemented` in
`src/provenance.mjs` and `src/packet.mjs`.

## Source records

A source is admitted to the corpus with:

| Field | Contract |
| --- | --- |
| `id` | stable, non-empty identifier within the corpus |
| `title` | human-readable name |
| `digest` | 64-hex SHA-256 of the recorded content |
| `origin` | one of `url`, `repository`, `text`, `workspace-file`, `run-artifact` |
| `originRef` | the address inside its origin class: the URL, the repository path, the pasted-text label, the workspace path, the producing run and artifact |

A recorded source carries `status: 'recorded'`.

## Unknown sources

A source whose digest cannot be given is recorded as **unknown**, not omitted, and its
excerpts never enter a packet. `recordUnknownSource` takes:

| Field | Contract |
| --- | --- |
| `id` | the identifier retrieval was asked for |
| `title` | a non-empty string, or `null` when the title is unknown too |
| `origin`, `originRef` | where retrieval looked, as for a recorded source |
| `reason` | one of `not-found`, `read-failed`, `digest-unavailable` |

The record has `digest: null` and `status: 'unknown'`, and it is frozen: nothing fills
it in later. `isUnknownSource` recognizes a well-formed unknown record. A failed read is
not "no results": a packet that found only unknown sources has an empty `items` list
and a non-empty `unknown` list, and is never equal to an empty packet.

## The packet

A packet answers one retrieval with bounded honesty:

```js
{
  items: [
    {
      id, sourceId, sourceDigest,
      text,            // the excerpt actually carried
      shortened,       // true when cut
      carried,         // characters admitted from this item
      cut              // characters removed from this item
    }
  ],
  omitted: [ { id, reason } ],   // items left out, in input order
  unknown: [ { sourceId, origin, originRef, reason } ],  // sources that stayed unknown
  totalBudget, perItemBudget
}
```

The builder takes an optional `unknownSources` list of unknown-source records. Every
one appears under `unknown`, once per id. An item citing one of them is omitted with
reason `unknown-source`, even if it carries a digest and text: an unknown source stays
unknown and is never filled in from elsewhere. Omission reasons are closed:
`out-of-budget` and `unknown-source` (`OMISSION_REASONS`).

- **Items reference their source.** An item without a source id and digest is invalid.
- **Truncation is declared.** `shortened` with carried and cut sizes — never a quiet cut.
- **Omissions are declared.** An item that did not fit is listed with its reason, not
  dropped.
- **Budgets are part of the answer.** The defaults are the family baseline — 28,000
  characters across the packet, 12,000 per item, the shape the first consumer (bloom's
  team packets) proved. Caller budgets win where stated.

## Determinism

The builder admits items in the order given, taking `min(perItemBudget, remaining)`
characters per item. Same inputs, same packet: retrieval shaping is pure and testable.

## Changes

- `0.2.0` — unknown sources are `implemented`: `recordUnknownSource`,
  `isUnknownSource`, `UNKNOWN_REASONS`, `OMISSION_REASONS`, the packet's `unknown` list,
  and `status` on every source record. Before `0.2.0` this contract described unknown
  sources but no code recorded them. The change is additive: existing calls return the
  same items and omissions, plus `status` on sources and an empty `unknown` list on
  packets.

## Retrieval honesty in one line

A packet says exactly what it did: which sources, what sizes, what was cut, what was
left out, and under which budgets — so downstream readers quote context with
provenance instead of trusting prose.

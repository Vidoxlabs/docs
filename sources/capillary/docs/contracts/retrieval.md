# Contract: bounded retrieval and provenance

Source records, packet building, bounded reads, literal search, and conversation
retrieval (thread, recent, context brief, trace) are `implemented` in
`src/provenance.mjs`, `src/packet.mjs`, `src/read.mjs`, `src/search.mjs`, and
`src/conversation.mjs`.
The retrieval service is `specified`.

## Source records

A source is admitted to the corpus with:

| Field | Contract |
| --- | --- |
| `id` | stable, non-empty identifier within the corpus |
| `title` | human-readable name |
| `digest` | 64-hex SHA-256 of the recorded content |
| `origin` | one of `url`, `repository`, `text`, `workspace-file`, `run-artifact` |
| `originRef` | the address inside its origin class: the URL, the repository path, the pasted-text label, the workspace path, the producing run and artifact |
| `evidenceClass` | what kind of claim the source carries. One of `operator-intent`, `operator-constraint`, `model-proposal`, `model-analysis`, `tool-observation`, `verified-outcome`, `unverified-claim`, `system-metadata` |
| `confidence` | how directly the claim is grounded. One of `direct-operator`, `direct-tool`, `model-with-evidence`, `model-unverified`, `historical-summary`, `derived` |

A recorded source carries `status: 'recorded'`. Callers supply the evidence class and
confidence independently of the origin. A `model-proposal` stays a proposal regardless
of where it was found.

## Unknown sources

A source whose digest cannot be given is recorded as **unknown**, not omitted, and its
excerpts never enter a packet. `recordUnknownSource` takes:

| Field | Contract |
| --- | --- |
| `id` | the identifier retrieval was asked for |
| `title` | a non-empty string, or `null` when the title is unknown too |
| `origin`, `originRef` | where retrieval looked, as for a recorded source |
| `reason` | one of `not-found`, `read-failed`, `digest-unavailable` |

The frozen record has `digest: null` and `status: 'unknown'`, with no evidence class or
confidence. `isUnknownSource` recognizes a well-formed unknown record. A failed read is
not "no results": a packet that found only unknown sources has an empty `items` list
and a non-empty `unknown` list, and is never equal to an empty packet.

## The packet

A packet answers one retrieval with bounded honesty:

```js
{
  items: [
    {
      id, sourceId, sourceDigest,
      relevance,       // the ranker's number, or null
      recency,         // the source's last change, epoch ms, or null
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

## Relevance and recency

An item may carry `relevance` (a finite number from whatever ranked it) and `recency`
(the source's last-change time in epoch milliseconds). They stay two fields on every
admitted item. Either is `null` when the caller did not measure it, and neither is filled
in from the other. An item carrying a fused `score` is refused, because one number hides
which dimension ranked it. The builder keeps the caller's order; it does not sort by
either field.

## Deletion epoch

`buildEpochGuardedPacket({ readEpoch, read, totalBudget?, perItemBudget? })` brackets
one read with two epoch reads. The epoch belongs to whichever store forgets; capillary
only compares the two numbers.

1. The epoch is read before `read()` runs and again after it returns.
2. When they differ, a forget landed during the read, and the rows may hold forgotten
   content. No packet is built. The result is a frozen refusal:
   `{ refused: true, code: 'deletion-epoch-changed', epochStart, epochEnd, reason }`.
3. When either epoch cannot be read as a non-negative integer, the read cannot show it
   was stable. The result is a refusal with code `deletion-epoch-unavailable`. If the
   first epoch cannot be read, `read()` does not run.
4. A refusal has no `items`. It is never an empty packet.
5. A packet built under a stable epoch carries `deletionEpoch`.

The older retrieval code skipped the check when no epoch could be read at the start.
This contract refuses instead.

## Bounded read

`readSource({ sourceId, sources, text, tokenBudget = 2000 })` matches a single
recorded source id in the supplied source list and clips the caller's text. It
checks the source's recorded shape, including evidence class and confidence. The
caller supplies the text and its association with the source.

A positive integer token budget allows four Unicode code points per estimated token.
The result reports the requested budget and the estimated token count of the text
returned, rounded up. `truncated` and `continuationAvailable` are true exactly when
the function leaves text out.

Both forms carry `untrusted: true`. A successful result carries `ok: true`, `source`,
and `text`. A missing id returns `ok: false` with `error.code: 'source-not-found'`.
An unknown source or a malformed recorded source returns `source-unavailable`.
Errors carry no text and set `continuationAvailable` to false.

## Literal search

`await searchSources({ query, records, snippetChars = 160, readEpoch })` searches
text supplied by the caller. Each record carries the source fields above, `text`,
and an explicit `recency` value in epoch milliseconds or `null`. A record with a
fused `score` or invalid source fields refuses the search with zero hits.

Hits appear in input order with `sourceId`, `sourceDigest`, `title`, `evidenceClass`,
and `confidence`. `relevance` counts non-overlapping literal matches in the text,
ignoring case and whitespace at the ends of the query. `recency` is passed through.
The snippet collapses whitespace to a single line and carries at most `snippetChars`
UTF-16 code units, keeping surrogate pairs intact. The packet fields `shortened`,
`carried`, and `cut` describe any cut to that line.

Every result carries `untrusted: true`. No matches returns
`{ ok: true, untrusted: true, hits: [], count: 0 }`. With optional `readEpoch`, the
same deletion-epoch guard brackets matching. A stable result carries `deletionEpoch`.
A changed or unavailable epoch carries the guard's refusal fields with `ok: false`,
`hits: []`, and `count: 0`. Search uses only the supplied records and epoch reader.

## Conversation retrieval

Four functions in `src/conversation.mjs` shape caller-supplied records. None of them
fetches, caches, reads a clock, emits a pointer string, or opens a listener. Every
result carries `untrusted: true`, an error included. Errors carry
`{ ok: false, untrusted: true, error: { code, message } }`.

### Thread

`readThread({ conversationId, messages, limit })` returns the messages of one
conversation. Each supplied message is a source record with `conversationId`, `text`,
and `recency` (epoch milliseconds or `null`).

- A conversation id that no supplied message carries returns `conversation-not-found`
  with an empty `messages` list. It is not an empty thread.
- Each message in the thread keeps `sourceId`, `sourceDigest`, `title`,
  `evidenceClass`, `confidence`, `recency`, and `text`, in supplied order. A message in
  the thread that cannot pass `recordSource` fails the thread with
  `invalid-thread-message`. It is never dropped silently.
- `limit` is a positive integer the caller passes, else `invalid-limit`. The applied
  limit is `min(limit, 200)` (`THREAD_MESSAGE_CEILING`). The result reports
  `requestedLimit` and `appliedLimit`. A longer thread is cut, and `truncated` and
  `continuationAvailable` are true. A thread within the limit sets both false.
- No versions are loaded.

### Recent

`await listRecent({ conversations, limit = 5, readEpoch })` lists conversation records
`{ id, title, recency }`, where `title` is a non-empty string or `null` and `recency` is
required epoch milliseconds.

- Order is the caller's `recency`, newest first. On a tie the later supplied record
  comes first. The function never reads a clock.
- A non-positive or fractional limit returns `invalid-limit`. A record without valid
  recency returns `invalid-recent-record`.
- An empty input is `{ ok: true, conversations: [], count: 0, truncated: false }`.
- A list longer than the limit is cut, with `truncated` and `continuationAvailable` true.
- With optional `readEpoch`, the deletion-epoch guard brackets the ordering. A changed
  or unavailable epoch carries the guard's refusal fields with `ok: false` and
  `conversations: []`. A stable result carries `deletionEpoch`. There is no cache.

### Context brief

`contextBrief({ records, query = null, excerptChars = 160 })` reads source records with
`text` and required `recency`.

- `brief.latestOperatorGoal` is the newest record whose evidence class is
  `operator-intent`. `brief.latestVerifiedOutcome` is the newest `verified-outcome`.
  Either is `null` when no record has that class. Nothing is invented.
- When two records share a recency, the later one in the supplied list wins.
- `query` is returned unchanged and filters nothing.
- `brief.openFollowups` is an empty list.
- Each entry carries the source fields, `recency`, and an `excerpt` cut the same way a
  search snippet is cut, declared with `shortened`, `carried`, and `cut`.
- A record that cannot pass `recordSource`, or lacks text or recency, returns
  `invalid-context-record` and no brief.

### Trace

`traceSource({ startId, parentsById, limit, versions })` wraps `walkParentChain` (see
the relations contract) in an untrusted envelope:
`{ ok: true, untrusted: true, startId, parentIds, stop, at }`. A missing start stays
`stop: 'missing'` with no parents. `versions` appears only when the caller supplies an
array, copied and frozen. The function never fetches versions. Input the walk would
throw on returns `invalid-trace`.

## Determinism

The builder admits items in the order given, taking `min(perItemBudget, remaining)`
characters per item. Same inputs, same packet: retrieval shaping is pure and testable.

## Changes

- `1.3.0` adds `readThread`, `listRecent`, `contextBrief`, `traceSource`, and
  `THREAD_MESSAGE_CEILING` in one commit, so the set takes one minor bump. They are
  additive: every call valid under `1.2.0` stays valid and returns the same result.
  `readSource` and `searchSources` are unchanged. `recordSource` still requires
  evidence class and confidence, the breaking change made at `1.0.0`.

- `1.2.0` adds `searchSources` for literal matching and bounded snippets from
  supplied records.

- `1.1.0` — adds `readSource`, an untrusted bounded-read envelope for supplied text.

- `1.0.0` — breaking change to `recordSource`. It refuses recorded sources that omit
  `evidenceClass` or `confidence`. Supply both fields from the source evidence when
  migrating an older record. `recordUnknownSource` retains its existing shape.

- `0.3.0` — packet items carry `relevance` and `recency` as separate fields, and an
  item with a fused `score` is refused. `buildEpochGuardedPacket` and `EPOCH_REFUSALS`
  are new. Existing calls return the same items plus two `null` fields each; a caller
  that passed `score` must split it or drop it.

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

# Capillary architecture

Status: `specified`; modules named below exist (`implemented`) where marked.

## The four parts

1. **Sources** (`implemented as records` in `src/provenance.mjs`) — the corpus is an
   append-only set of recorded sources: an id, a title, a 64-hex digest, an origin class
   (`url`, `repository`, `text`, `workspace-file`, `run-artifact`), and an origin
   reference, plus the claim's evidence class and confidence. A source whose digest
   is unavailable is recorded as unknown with a null digest and its reason
   (`not-found`, `read-failed`, `digest-unavailable`). The packet lists it under `unknown`.
2. **The index** (`specified`) — lexical and semantic recall over recorded sources. The
   index is a projection: it is rebuilt from sources, never an authority. A search that
   misses is reported as a miss with its coverage stated; it is never padded.
3. **The packet builder** (`implemented` in `src/packet.mjs`) — retrieval's output
   artifact: a bounded set of excerpt items, each carrying its source id and digest, a
   `shortened` flag with the carried and cut sizes, and a declared budget accounting.
   Admission is ordered and deterministic; what does not fit is listed as omitted, never
   dropped silently.
4. **The relation ledger** (`implemented as records` in `src/relations.mjs`) — typed,
   append-only records linking known sources: the organization half of context work.
   `derived-from`, `references`, `subsumes`, `revised-from`, `relates-to`. The ledger is
   an event history: appended to, never rewritten. `walkParentChain` follows explicit
   parent ids in a caller-supplied map with a declared stopping reason.

## The retrieval seam

```
sources -> index (projection) -> ranked candidate items
        -> packet builder (budgets, truncation, admission)
        -> packet -> the requesting run or workspace
```

Every crossing is stateable to a reviewer:

- *Which sources* were considered and read (ids, digests).
- *Which excerpts* were admitted, in what sizes, with what cut.
- *Which items* the budgets left out.
- *Why* — the budgets and the order are part of the packet.

## Neurology of the family

Capillary decides nothing. It serves retrieval to the layers that decide:

- Runs (a seed objective) admit retrieval tools and record each call as an intent.
- Teams (a bloom turn) attach sources to a task and receive the bounded packets.
- The memory fabric (the myosotis-to-be) is a different organ: it remembers with
  consent and forgets on demand; capillary never copies its role.
- The admission and review loop (the aestivation-to-be) gates assembly; capillary
  hands it exact evidence, never verdicts.

While the public counterparts of those systems are in the works, capillary's contracts
stand alone: `myosotis`, `aestivation`, and capillary are one family with separate
provinces, and the seams are contracts, not assumptions.

## What capillary refuses to own

- No verdicts. Retrieval reports; admission decides.
- No remembrance. Provenance and relations, never consent or recall policy.
- No quiet defaults. Budgets, truncation, and misses are declared on the packet.
- No living index. Every projection is rebuildable from sources.

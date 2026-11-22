# Capillary interop

Status: `specified`, with the seams pointing at contracts already published.

## With Bloom

Bloom's team model needs exactly capillary's operating shape, and its published design
already promises the behavior capillary's contract encodes:

- a team brief admits sources; **Add source** records title, origin, and digest,
- specialists receive **bounded excerpts** and "see which sources were shortened" —
  capillary's declared-truncation items,
- a review or verifier can re-open any admitted source and **check its digest** —
  capillary's provenance records close that loop,
- a derived guide carries its **input-file relations** — capillary's `derived-from`
  records.

When capillary's service ships, Bloom's source catalog is its front: the files a team
shares and the packets specialists receive obey the budgets and honesty rules here. The
family baseline budgets (28,000 across a packet, 12,000 per item) are the defaults
Bloom's own packet shapes proved.

## With Seed

Seed's run model admits tools to an objective and records each call as an intent.
Capillary's retrieval surface is the `context` domain:

- `context.item.search` — recall candidate items over the recorded corpus
- `context.item.read` — fetch a bounded, declared excerpt for a source
- `context.relation.list` — enumerate typed relations for known sources

All three are `read`-effect tools in seed's registry grammar: they run inside admitted
scopes by default, and a run records them as intents like any other tool call.

## With the memory fabric

Memory (the governed, consent-first store whose public counterpart is
[myosotis](https://github.com/Vidoxlabs/myosotis)) and capillary are different organs:

- The **memory fabric** remembers with consent and forgets on demand; it answers "what
  was I told to keep."
- **Capillary** retrieves recorded sources with provenance; it answers "what is here,
  bounded, and where did it come from."

Capillary never stores consent, never answers for memory, and never copies memory's
records. Where a retrieval informs something remembered, that act belongs to the memory
fabric's own contract. This boundary keeps the anonymous ("who said we could keep
this?") question out of retrieval entirely.

## With the admission and review loop

The loop (the bud-arrangement system whose public counterpart is
[aestivation](https://github.com/Vidoxlabs/aestivation)) validates a proposed plan and gates assembly. Capillary
serves it exact evidence: the packet a step admitted, the digests behind it, and the
relations describing how artifacts derive from sources. Capillary never issues verdicts;
the loop never invents evidence. Together: the loop decides what may bloom, and
capillary says what watered it.

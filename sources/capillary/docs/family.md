# The botanic family

Status: `ratified` by the owner, 2026-11-23. This document records the naming law.

## The stack

The names are a stack, not a call chain. A change in one package does not travel through the others.

```
bloom                         the only composer
capillary  myosotis  aestivation  drosera     peers
seed                          the contract floor
```

**Trellis** stands outside that stack. It probes the libraries. It is not a step they call, and it does not patch them.

- **Seed** is the floor: run records, tool-id grammar, and the provider-shape checker. It is not connectors, memory, retrieval, or the workspace.
- **Bloom** is the top and the only composer. It may call the others in a later task. It does not do so now. A seed release does not require a bloom change.
- **Capillary, myosotis, aestivation, and drosera** are peers. They do not import each other. A later call goes from a peer down onto seed's published exports, or upward into bloom. Drosera is external tool faces, skills, hooks, and cookbooks. It is not seed's harness tooling. Myosotis is memory, including how it stores records. That storage is myosotis's concern, not another product.
- **Trellis** reports disagreement. The repository that lagged repairs itself in its own task.

The public-product family is named from botany, on purpose: the five persona seats of
the house canon — Violet, Wisteria, Xylia, Yarrow, Zinnia — are all flowering plants, so
the products they use take the same kingdom. Each name names what its system does:

| Name | Botany | System | Place |
| --- | --- | --- | --- |
| **seed** | the kernel a plant grows from | the harness foundation | floor. Run records, tool identity, provider shape |
| **capillary** | the fine channels that lift water through a plant | context retrieval and organization | peer. Bounded, provenance-honest context |
| **myosotis** | forget-me-not | the memory fabric | peer. Consent, keep, and forget. Storage stays inside this package |
| **aestivation** | the arrangement of petals in the bud before it opens | admission and review | peer. Plan, verdict, and the gate before assembly |
| **drosera** | the sundew, whose tentacles reach out and hold | external faces | peer. Tool faces, skills, hooks, cookbooks. Not seed's harness tooling |
| **bloom** | the opened flower | the team workspace | top. The only composer. It does not import the others yet |
| **trellis** | the lattice a climbing plant grips, at many points | the testing lattice | outside the call path. Probes and dated runs. It does not patch |

## The laws the stack carries

1. **Ordinary botanical words, not coined brands.** No invented names, no prefix games,
   no acronym squares. A new public product takes a word from the kingdom that says
   what it does.
2. **Products are personas' tools, not personas.** Character canon (names, palettes,
   art) stays with the design canon and the seats that present it. A system is named
   for its function, never for a character, and a character never operates a product by
   name.
3. **Concept terms stay role terms.** In prose, retrieval stays "retrieval," memory
   stays "the memory fabric," admission stays "the admission and review loop"; the
   proper nouns point at products, the role terms keep the prose readable without any
   name at all (per the [seed lexicon](https://github.com/Vidoxlabs/seed/blob/main/docs/lexicon.md)).
4. **The stack stays open.** `drosera` and `trellis` already earned their names under
   this law. `trellis` stays outside the call path. A further product earns its name
   the same way: a real botanical word, true to its function, no force-fitting for
   spelling. It does not become a new required step between the floor and the composer.

## Plain-named siblings

Two public repositories serve the family without joining the botanic line, by owner
decision. `docs` is the family documentation hub: the family's shared pages are written
there, and every member's own documentation is carried verbatim on a schedule.
`videsign` is the design canon. Infrastructure keeps plain words; products take botanic
ones. Neither is a step in the stack.

## Note on predecessors

This family revamps internal systems whose historical names (an admission-transport
name, a memory store's name, a context store) stay retired in public prose. Their
**public successors** carry the botanic names above; in seed's generalized lexicon the
mapping is recorded so readers of older material can arrive gently. Private lineage
stays private: nothing about hosts, clusters, or history needs to be public for these
names to mean their function.

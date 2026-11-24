# ADR 0002: Adopt pinned family peers

- Status: Accepted
- Date: 2026-11-24

## Context

Bloom composes the family's contracts and implementations. Drosera owns tool
faces, Capillary owns retrieval and packing, and Aestivation owns plan admission
and review. Each peer ships without runtime dependencies.

## Decision

D15 permits Bloom to adopt these peers as their slices require them. Use full
commit SHAs and record pending upstream merges. Reconcile each pin to the merged
upstream commit on the next touch after merge.

Owner's answer, verbatim: "Assume D15 approval and continue working on CAP-04.2".

## Changes

- 2026-11-24: CAP-04.2 pins Drosera at `033f2907c4cdbcd43598d3087992a1ae1850a531` (drosera#4, pending upstream merge) for workspace and finish faces (CAP-04, bloom#4).

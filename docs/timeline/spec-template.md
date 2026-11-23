# Capability specification template

Every lead capability spec in `<lead-repo>/docs/capabilities/CAP-NN-<slug>.md` uses the exact 12 sections below in order. Keep all prose plain, with no YAML, no em-dashes, and no private details.

## Template

# CAP-NN: Capability title

- ID: `CAP-NN`
- Title: Capability title
- Lead: `<lead-repo>`
- Touches: `<comma-separated peer repos, or none>`
- Horizon: `now` | `next` | `later`
- Milestone: `M0`..`M9`
- CLI phase: `P1`..`P6` | `none`
- Status: `proposed` | `accepted` | `in-progress` | `landed` | `deferred`
- Claim: `planned` | `specified` | `implemented` | `observed`
- Depends on: `CAP-XX`, ... | `none`

## Why

Explain the problem being solved and why the capability belongs in the family stack at this boundary.

## What it does

Specify deterministic behavior, inputs, outputs, invariants, and fail-closed error handling.

## Contract touchpoints

List existing contracts in the lead and touched repositories (or state `none` if no runtime contract exists yet).

## Tool IDs and events

### Tool IDs

| Tool ID | Effect | Owner gate | Third-party egress | Summary |
| --- | --- | --- | --- | --- |
| none | n/a | n/a | n/a | Replace with rows for each new tool ID (verified against `seed` grammar and `drosera` face rules). |

### Events

| Event | Emitted by | Payload summary |
| --- | --- | --- |
| none | n/a | Replace with rows for each typed event emitted by this capability. |

## Acceptance tests

List named deterministic test cases that must pass before any slice or capability claims `implemented`.

## Slices

Ordered list of slices (`CAP-NN.1`, `CAP-NN.2`, ...), naming the owning repository and deliverable per slice.

## Non-goals

Explicit boundaries stating what this capability does not build or claim.

## Family rules and conflicts

Note how this capability honors stack boundaries, claim discipline, zero-dependency rules, and any cross-repo tensions.

## Open owner decisions

Reference pending decisions (`D1` to `D12` in `docs/timeline/decisions.md` or new unratified questions) without deciding them.

## Evidence

Links to test files, probes, and dated observation records once slices land (starts as `none yet` while `planned`).

## Changes

Dated changelog entries when the spec or its slices change (`2026-11-23: Initial proposed specification (CAP-01).`).

# Bloom browser surface

These docs specify the Bloom browser surface so a new person can start a team or a coding session without a separate guide.

## Source of truth

[The interface contract](interface-contract.md) is the source of truth for the next UI pass. A code agent copies its strings and its three behavior changes.

Its section 0 records the owner's decisions of 2026-11-22. They override both research files. `Head agent`, `Jurisdiction` and `Shared desktop` stay as names and gain plain helper text instead of being renamed.

## Evidence

Two research files are the evidence behind the contract:

- [Implementability review](research/implementability-review.md). The coordinator approved this review. Section 7 is the include list and the leave-out list.
- [Familiar harness patterns](research/familiar-harness-patterns.md). This report is evidence. It is not a second include list. Where the report and the review disagree, the review wins. Its "GrokBot" section describes an unrelated third-party repository, not xAI's Grok Bot; see the note at the top of the report.

## What a code agent may change, and what it must leave alone

May change:

- Visible strings the contract lists as copy, and only those strings.
- The second empty-state button, `Create a coding session`, on the existing form.
- `allow_always` on the current approval card, with resolved title `Allowed always`.
- Hiding and clearing the path line on a team.

Must leave alone:

- Element ids, option values, stored stage ids, event names, and handlers.
- The repository README, both research files, tests, planner prompt text, and server fallback names.
- Strings the contract does not list.
- A team approval card, a second cache control for notes, and any new screen for memory, intent, or personas.
- The leave-out list in the contract.

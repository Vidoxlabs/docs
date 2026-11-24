# Capabilities

This folder holds Bloom's local capability ledger (`index.json`) and lead capability specifications (`CAP-NN-<slug>.md`).
Cross-repository status, milestones, and dependency ordering live in the [hub timeline](https://github.com/Vidoxlabs/docs/blob/main/docs/timeline/README.md) on `Vidoxlabs/docs`.
Same-PR ledger rule: every slice pull request updates `index.json`, its specification's `Evidence` and `Changes` sections, `docs/CHANGELOG.md`, and affected contract `Changes` sections in the same pull request.

Milestone M1 note: the terminal shell landed through `bloom#1` before the capability ledger existed, so it has no `CAP` entry.

# P-20261125-site-status: Write status data and notify the site after a sync

ID: `P-20261125-site-status`
Title: Write status data and notify the site after a sync
Status: `proposed`
Date: `2026-11-25`
Touches: `new capability; docs, lattice`

## Idea

Extend the existing source sync with deterministic public-repository status and one optional site notification. The documentation hub remains the only place that gathers repository status for the site. A sync that changes the manifest or status asks the site to rebuild once. No source repository gains a workflow, credential, or site integration.

## Capability impact

This proposes a new capability for repository status publication and site notification. `CAP-02` covers documentation and ledger freshness, but does not specify continuous integration conclusions, pull-request counts, releases, package versions, product pins, or drift. A separate capability keeps those contracts and acceptance tests explicit.

## Touched repositories

`docs` leads the change. It adds a status writer beside the existing sync script, a JSON Schema, a validating fixture test, and one final step in the existing sync workflow. `lattice` consumes the published contract. No other repository changes.

The status writer uses the workflow's existing read-only token. For every repository in `sources.json`, it records head, last push time, continuous-integration conclusion for that head, open pull-request count, latest release or tag, package version, and documentation freshness from the synced and repository heads. A product block reads the public umbrella manifest and records each system pin, repository head, and drift.

Object keys have deterministic order. The only timestamps are source fields. The status file sits beside `manifest.json`. Its schema and a representative fixture are tested with the existing offline test command.

The workflow compares the commit it just pushed. When `manifest.json` or `status.json` changed, it sends one POST request to the URL in `LATTICE_DEPLOY_HOOK_URL`. An absent secret prints a notice and exits successfully. A failed request fails the notification step without altering synced content.

## Risks and family rules

The change keeps documentation prose and repository status on one path. It adds no runtime dependency and no source-repository credential. Public API failures must remain distinguishable from empty values. The status schema is versioned so consumers can fail closed on an unknown shape. The workflow addition is reversible independently of the synced mirrors.

The site labels this data as observed at its source times. It does not present a missing field as zero or a stale value as live. The notification is a rebuild request only, never a content payload.

## Smallest first slice

In `docs`, add the deterministic status writer, `status.schema.json`, and a fixture test that validates every required field, stable key order, product pin drift, and absent optional values. Add workflow tests for changed and unchanged outputs, one notification only, and the absent-secret success path. Update the new capability ledger entry, its evidence and changes, the sync contract changes, and `docs/CHANGELOG.md` in the same pull request.

Acceptance test: the offline fixture validates against the schema; a missing deploy-hook secret exits successfully without a request; a pushed change to either output causes exactly one POST request.

## Open owner questions

1. Ratify this as a new `docs` capability rather than an extension of `CAP-02`.
2. Approve the proposed field set and versioned schema as the site's status contract.
3. Confirm that notification failure should fail only the final workflow step while leaving the synced commit in place.

## Public safety check

This proposal contains no private infrastructure details, credentials, handles, hostnames, addresses, ports, or internal names. Secret and variable names describe configuration only and carry no values.

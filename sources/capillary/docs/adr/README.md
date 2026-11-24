# Architecture decision records

Architecture decision records for `capillary` live in this directory and follow the [Vidoxlabs/docs ADR convention](https://github.com/Vidoxlabs/docs/blob/main/docs/adr/README.md).

- Number ADR files sequentially from `0001` using the filename `NNNN-<slug>.md` (starting at `0001`).
- Valid statuses are `Proposed`, `Accepted`, `Superseded by NNNN`, and `Deferred`.
- Agents propose ADRs as `Proposed`; only an owner decision moves an ADR to `Accepted`.
- Any runtime dependency proposal requires an ADR here before adding a package.

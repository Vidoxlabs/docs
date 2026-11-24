# Changelog

Earlier history lives in git history and [docs/architecture.md](architecture.md).

## Unreleased

### Added

- Terminal shell with private endpoint configuration (M1, bloom#1).
- Phase 0 capability ledger scaffold and Bloom lead specifications (`CAP-04`, `CAP-08`, `CAP-10`, `CAP-14`, `CAP-15`) (CAP-01, bloom#2).
- Standalone capability ledger checks and scaffold squash evidence (CAP-02, bloom#3).
- Workspace file tools contained to the workspace root, serialized writes, bounded output, and a command executor that stays disabled until argument containment lands (CAP-04, bloom#4).
- Coding loop for `bloom chat --workspace` and `bloom run --workspace` with strict actions, per-call approvals, streamed text, trace rows, and an allowlisted command gate (CAP-04, bloom#5).
- Pre-dispatch argument checks and output checks sharing one repair turn (CAP-03, bloom#5).
- `bloom doctor --probe` model profile capture, with the coding loop's budget and streaming taken from the saved profile (CAP-16, bloom#7).
- Live-test kit: a sandbox maker, the web workspace's coding view with model rows, tool rows and approval detail, and the `docs/live-test.md` runbook (CAP-04, bloom#8).
- Cloud provider opt-in with `--allow-cloud` in a make-sandbox folder, Gemini OpenAI-compatible probe and error mapping, and opt-in `npm run test:live` (CAP-16, bloom#9).

### Changed

- Harden the command gate: distinct refusal reasons, linked-folder argument containment, `.git` write refusal, git config overrides, npm network-flag refusal, attached short-option paths, `node --run` refusal, and allow-only approvals (CAP-04, bloom#5).
- Terminal cloud providers need `--allow-cloud` inside a make-sandbox folder; while cloud is on, reads ask first, session allow is off, team sessions are refused, and model rows say cloud (CAP-16, bloom#9).

### Fixed

- Check Windows metadata paths against the resolved `.git` directory and use Git to configure the command gate test repository (CAP-04, bloom#5).
- Close the coding-loop test store before deleting its temp tree, and keep fixtures as LF, so Windows CI no longer fails on EBUSY unlinks or CRLF session exports (CAP-04, bloom#5).
- Close the web coding-loop store before deleting its temp tree, and accept CRLF in live-test runbook fences (CAP-04, bloom#8).

### Removed

- The `npm start -- --api-base` option. The web workspace reads its endpoint only from the private `config.json` (CAP-04, bloom#8).

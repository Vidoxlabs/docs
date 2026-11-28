<picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bloom-banner-dark.svg">
  <img src=".github/assets/bloom-banner.svg" alt="Bloom banner: an opened five-petal flower, and the tagline Workspace, CLI, and terminal UI." width="1280">
</picture>

Workspace, CLI, and terminal UI

# Bloom

Give a head agent a brief and watch a team work through it in one group conversation. Specialists can research public sources, review the findings, and assemble a Markdown guide. Each contribution is a file on a shared desktop that you can open, attach to another task, or download.

[Download the latest release](https://github.com/Vidoxlabs/bloom/releases/latest) · [View the phone layout](docs/previews/phone.png)

![Bloom’s scripted research team sharing its findings, review and guide in one workspace](docs/previews/workspace.png)

## Try it

Download `bloom-VERSION.zip` from the [latest release](https://github.com/Vidoxlabs/bloom/releases/latest) and extract it, or clone this repository. Install Node.js 22.13 or newer and run this command from the project folder in a terminal on macOS, Linux, or Windows. The release ZIP already holds Bloom's one runtime dependency, seed; in a clone, run `npm install` first.

```sh
npm run demo
```

Open the local address the demo prints, choose **Create a team** and give the head agent a name. Use **Add file** to paste some project notes, select **Try a sample task**, and send it. Open the assembler’s file in the group chat. The demo is scripted and requires no key. Its outputs and usage display identify it as a demonstration.

Run `node bin/bloom.mjs eval --smoke` to check the built-in coding fixture offline and print its deterministic report.

## Connect a model endpoint

Teams and coding sessions run on any service that speaks the chat-completions HTTP API (`POST {base}/chat/completions`). Bloom names no default service. The endpoint lives only in the private `config.json` in Bloom's data directory, described under **Terminal commands** below, and neither the web workspace nor the terminal takes it on the command line.

```sh
npm start -- --workspace '<sandbox folder>'
```

The web workspace follows the terminal's rules: local providers only, the configured key setting, and the model profile saved by `bloom doctor --probe`. Team calls send the brief and admitted evidence to that endpoint. Without a provider, Bloom still opens the workspace, notes and files, and a team turn stops with a message pointing at `config.json`.

Every provider runs behind [seed](https://github.com/Vidoxlabs/seed)'s provider seam: Bloom checks the adapter when it starts and checks every reply against seed's record before the team reads it. A reply outside that record stops the turn.

**Coding sessions** run the coding loop in the chosen folder when a provider is configured. The browser shows streamed text, a row for every model call and tool call, and an approval card before every write and every command. The scripted demo runtime shows the same view without a model. [docs/live-test.md](docs/live-test.md) is the runbook for a first live run in a throwaway sandbox.

## Terminal commands

**Implemented.** After `npm install`, run `npm link` to install the `bloom` command from this checkout. Try the scripted runtime with `bloom chat --demo`, or run it once with `bloom run --headless --demo --json "Inspect the project"`. Headless runs reject requests by default. Use `--approve-policy allow-read` to allow read requests.

A configured local model can run the existing team loop. In the terminal data directory, use a private `config.json` with `version: 1`, one entry under `providers` with `kind: "chat-completions"` and `baseURL` set to your OpenAI-compatible API base, and `models.aliases` containing an alias, backend model ID and workload. Set `models.default` to that alias or choose one with `--model`. Loopback is local by default. For a server on your private network, set `locality` to `local`. Enable `allowInsecureHttp` only if that server uses plain HTTP. Set `apiKeyEnv` to the name of an environment variable if the server requires a key.

The team loop uses the desktop and saved specialists. `--team NAME --workspace PATH` records a team session's workspace. **Implemented:** `bloom chat --workspace PATH` without `--team` runs the coding loop in that folder: the model reads, searches, edits and runs `node`, `npm` or `git` there, and Bloom asks before every write and every command. A headless `bloom run --workspace PATH` never writes. Read the command gate and its residual risk in [docs/architecture.md](docs/architecture.md) before pointing it at a folder you care about. Terminal cloud providers need `--allow-cloud` inside a sandbox from `scripts/make-sandbox.mjs`; the web workspace stays local only.

`bloom doctor` checks the local installation and endpoint rule without displaying the address. `bloom doctor --probe` also asks the configured provider what it supports, saves its model profile, and names the provider only by its config name and locality. Cloud providers need `--allow-cloud` on probe and chat. `bloom sessions list` lists session IDs. `bloom sessions export ID --jsonl` writes the stored events in order, and `bloom replay FILE --step` displays them one at a time. Use `--data-dir` to select the data directory, including when you read a demo session. `bloom memory --help` lists note commands. Forget requires `--confirm`.

## Work with a team

- **Assign work.** Set the head agent’s **Jurisdiction** and describe the deliverable. Add a specialist under **Personas** before starting a new team with a configured model. The head assigns work to saved personas and team members. The scripted demo includes three example specialists. Select a recipient or type `@Reviewer: check the latest draft` for a direct assignment in the group. A review verdict of “revise” pauses assembly. Address the author with the requested changes and attach the review when continuing.
- **Reuse specialists.** Use **Save as persona** on a roster member, or **+ New** under **Personas** in the left sidebar, to keep a specialist's name, **Jurisdiction**, voice, stage and optional model. Every head agent sees the library when it plans and can recruit a persona by name; the saved fields are used as they are, and the head only writes the assignment. **Add to team** puts a persona on the open team's roster for a direct `@Name:` message. Editing or deleting a persona leaves teams that already recruited it unchanged.
- **Share evidence.** Paste up to three public HTTPS URLs in a brief or use **Add file** on the **Shared desktop** for a web page, GitHub repository README, or text. Bloom records the source and its digest. The head can select files from the shared catalog. The source reader retrieves public text over IPv4 and records excerpts. Specialists receive bounded excerpts and see which sources were shortened.
- **Inspect a handoff.** Open a file in the conversation or inspector. Its detail includes the author, SHA-256, and input-file relationships. Each revision is a separate Markdown file. For an edit made in another application, import the changed text as a new source.
- **Manage memory.** Use **Add note** under **Notes** to tell the team what to remember. Leave **Always use** checked for standing instructions, or turn it off for background facts that should reach a specialist only when they match the task. **Share with every team** makes a note available to all teams on this computer. Specialists can suggest facts to keep; they appear under **Suggested by agents** and are never used until you **Keep** them. **Activity** lists exactly which notes each specialist received. **Correct** replaces a note. **Forget** removes it. Either one invalidates cached recall, stops an active run, and withholds earlier outputs built from that note from future team prompts. Previous messages, exported files, provider logs and copies on the local disk have separate lifetimes.
- **Ask another team.** When another team's **Jurisdiction** covers part of a brief, the head agent can ask it one question per task. Both conversations show the question and the answer. The other team answers from its jurisdiction, notes shared with every team, and its non-private posts and files, never its private notes. The asking team pays for the call. A busy team is skipped. **Stop** in the other team ends only the answer.
- **Control usage.** Under **Model and limits**, the team form accepts a per-run **Model calls** limit and an optional **Token limit**. Bloom checks the token limit between calls. One call can cross it. Missing metering stops further calls when a token limit is active. Expand **Usage** under **Activity** for per-agent usage, provider-reported cache reads and writes, and cost when supplied. Local recall hits and provider token caching have separate counters. Model outputs and tool effects are never replayed as cache hits.
- **Use the desktop.** One persistent `Desktop/` folder belongs to the local installation. Teams share ordinary files. Check a file and ask the team to change it: a specialist can revise it, rename it or file it into a folder. Each change is a new version, marked `v2`, `v3` and so on, and **Open** lists the other revisions. Team-note-derived files have room-scoped access through the harness. For a graphical Linux desktop over that same folder, install Docker with Compose, run `npm run desktop -- --demo` alongside the demo, and open the local address the command prints. For real profiles omit `--demo`. Stop it with `npm run desktop -- --demo --down`. Docker first downloads the desktop image. The desktop provides a persistent graphical environment for the operator. Team agents interact with its files through Bloom. [Webtop](https://docs.linuxserver.io/images/docker-webtop/)

## Storage and extension points

Bloom serves the browser on loopback and stores SQLite history and desktop files under `~/.bloom` (`~/.bloom/demo` for the demo). Pass `--data-dir PATH` to select a different folder and pass the same argument to the optional desktop command. Existing ViBloom data directories are detected. Use one server per data directory. A running local account can access its files. Closing the browser leaves the local server working. Stopping the server interrupts active work.

Agents start at [AGENTS.md](AGENTS.md). Stay in this repository's province.

[Architecture and design sources](docs/architecture.md) explains the VI, OAI and LA roles, the portable memory implementation, design-token synchronization, and verification boundaries.

```sh
npm test
npm run test:network
```

## License

Bloom is available under the [MIT license](LICENSE). The bundled Geist fonts retain the [SIL Open Font License](public/fonts/Geist-OFL.txt).

The Vidoxlabs name and mark are trademarks of Vidoxlabs LLC. They are not covered by this repository's MIT license.

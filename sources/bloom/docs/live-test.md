# Live test runbook

This runbook takes the coding loop from an offline rehearsal to a first live run against your own local model, in a throwaway sandbox. Every write and every command asks first. Run the commands from the folder that holds your checkouts. `<sandbox folder>` is a new or empty folder outside any git clone, and `<your-endpoint>` is your model server's chat-completions base URL.

The endpoint lives only in the private config file described below. Never put it on a command line, in an environment variable, in a chat message or in a shared log. Bloom prints the provider by its config name and locality, never by its address.

## Offline rehearsal

These steps call no model and need no config file.

Run the test suite:

```bash
cd bloom && npm install && npm test
```

Step through the recorded coding session, pressing Enter to advance:

```bash
cd bloom && node bin/bloom.mjs replay test/fixtures/demo-session.jsonl --step
```

Run the scripted model against a fresh sandbox. It asks before each write and command and ends with the sandbox's git diff:

```bash
cd bloom && node scripts/scripted-run.mjs <sandbox folder>
```

The shell rows show the demo test failing (`pass 0 fail 1`) and then passing (`pass 1 fail 0`). The diff adds `NOTES.md` and changes `value < end` to `value <= end` in `src/range.mjs`.

## Config

Bloom reads `config.json` from its data directory, `~/.bloom` unless you pass `--data-dir`. Create the file yourself in a text editor, readable only by your account, and keep it out of every repository:

```json
{
  "version": 1,
  "providers": {
    "lab": { "kind": "chat-completions", "baseURL": "<your-endpoint>", "locality": "local" }
  },
  "models": {
    "aliases": [{ "alias": "coder", "backendModel": "<your model ID>", "workload": "code" }],
    "default": "coder"
  }
}
```

The provider name, here `lab`, is how Bloom refers to the provider in its output. A server on your private network needs `"locality": "local"`, and a plain HTTP server also needs `"allowInsecureHttp": true`. If your server requires a key, the README's Terminal commands section names the provider field that holds the name of the environment variable your shell keeps the key in. Put the key only in that variable, never in the file, a flag or the chat.

Check the file without sending anything to the server:

```bash
cd bloom && node bin/bloom.mjs doctor
```

The Endpoint rule row should read `pass` and name the provider and its locality.

## Probe

Ask the server what it supports and save its model profile:

```bash
cd bloom && node bin/bloom.mjs doctor --probe
```

The probe sends two requests: the models list, and one fixed one-token streaming request that carries nothing of yours. Each row reads `pass`, `fail` or `unknown`. Reachability, Model IDs and Model should pass. Context length, Tool calling and Constrained output stay `unknown` unless the server publishes them, and that is fine. The command exits 1 if any row fails. The saved profile sets the coding loop's prompt budget and whether it streams. The offline version of the probe runs in `npm test` against a fake server.

## Live run

Make a fresh sandbox, then start the coding loop in it:

```bash
cd bloom && node scripts/make-sandbox.mjs <sandbox folder>
```

```bash
cd bloom && node bin/bloom.mjs chat --workspace <sandbox folder>
```

At the prompt, type the same task the rehearsal uses:

```text
Create NOTES.md with one line describing this project. Run the tests, fix the failing test, run the tests again, and finish with a short summary.
```

Read each approval before you answer it. Approve writes and test commands in the sandbox, and reject anything else. When the loop finishes, look at what changed:

```bash
cd <sandbox folder> && env -u GEMINI_API_KEY git -c core.fsmonitor=false --no-pager status && env -u GEMINI_API_KEY git -c core.fsmonitor=false --no-pager diff --no-ext-diff
```

The run passes when all of these hold:

- Text streams as the model writes it, and a model row follows each call.
- Every tool call shows one trace row with its tool, summary, status and timing, and no file contents.
- Bloom asked before every write and every command, and nothing you rejected ran.
- The sandbox tests fail first, and pass after the fix.
- The loop ends with an answer, and the diff holds only the note and the fix.
- No output shows the endpoint.

## Web view

The same run in the browser, against a second fresh sandbox:

```bash
cd bloom && node scripts/make-sandbox.mjs <sandbox folder>
```

```bash
cd bloom && npm start -- --workspace <sandbox folder>
```

Open the local page the command prints, choose a coding session with the sandbox folder, and send the task. The conversation streams the replies and ends with an Answer message. The activity panel shows a row for each model call and each tool call, with command output under shell rows, and an approval card with the exact change or command before each write and command. Answer approvals in the page. Stop the server with Ctrl-C, then check the diff as in the live run. To see the same view with no model at all, start Bloom with `npm run demo` and create a coding session: the scripted demo runtime drives it.

## Troubleshooting

- **Reachability fails with `refused`:** the server is not running, or the address in the config is wrong. Fix the config file and probe again.
- **`timeout`:** the server answered too slowly. The models list gets 5 seconds and the streaming check 30.
- **`tls`:** the server's certificate is not trusted. Use a trusted certificate, or for a plain HTTP server on your own network set `"allowInsecureHttp": true`.
- **`http-401` or `http-403`:** the server wants a key. Set the key field described in the README and keep the key in your shell's environment.
- **`http-404`:** the base URL usually needs its API path, such as one ending in `/v1`.
- **Model fails:** the alias's backend model is not among the listed IDs. Copy the exact ID from the Model IDs row into `backendModel`.
- **The run stops as `malformed`:** the model did not reply with exactly one fenced json action, even after one repair turn. Try a model that follows instructions more closely.
- **A command is refused:** only `node`, `npm` and `git` run, with arguments inside the workspace. The refusal message names the rule.
- **Replies arrive all at once:** the probe saw that the server does not stream, so the loop asks for whole replies.

## Google AI Studio

Use your provider's OpenAI-compatible base URL as `<cloud-endpoint>` (the provider's own documentation names it) with a cloud provider and the model id `gemini-4-hydrogen` (or the id your AI Studio list shows). Example provider entry:

```json
"aistudio": {
  "kind": "chat-completions",
  "baseURL": "<cloud-endpoint>",
  "locality": "cloud",
  "apiKeyEnv": "GEMINI_API_KEY"
}
```

Put the key only in the shell (type this yourself; do not paste the value into chat or a file): `read -rs GEMINI_API_KEY && export GEMINI_API_KEY`.

Probe and chat need `--allow-cloud`, and chat only inside a sandbox from `scripts/make-sandbox.mjs`:

```bash
cd bloom && node bin/bloom.mjs doctor --probe --allow-cloud
```

```bash
cd bloom && node scripts/make-sandbox.mjs <sandbox folder>
```

```bash
cd bloom && node bin/bloom.mjs chat --workspace <sandbox folder> --allow-cloud
```

While cloud is on, Bloom asks before the first message leaves the machine and before every tool call, including reads. Model rows say cloud. The web workspace stays local only.
Team sessions never use a cloud provider.
The sandbox marker guards against mistakes; it is not a security boundary.

## Opt-in live tests

Offline `npm test` never loads these. Against your configured provider:

```bash
cd bloom && BLOOM_LIVE=1 npm run test:live
```

At most 20 model calls per run of the whole suite. The suite reads the provider only from bloom's data directory (or `BLOOM_LIVE_DATA_DIR`), never from an endpoint environment variable. When the configured provider is cloud, set `BLOOM_LIVE_ALLOW_CLOUD=1` as well; without that second flag the cloud live tests fail on an assert before any request. `live-loop-fixes-sandbox` is local-only and does not use the cloud flag. Local providers need only `BLOOM_LIVE=1`.

## Residual risk

Approval of each call is the boundary. `npm test` runs whatever the sandbox's `package.json` scripts say, and the model may have written those scripts in a write you approved. Commands can reach the network: npm is set offline (flags that change registry, cache or online mode are refused) and git is limited to local subcommands with fsmonitor, hooks and `diff.external` forced off, but Bloom does not block network access from the process. The isolated `HOME` only changes an environment variable, so a command can still find your real home folder through the operating system. A detached grandchild process can outlive the call. Writes under `.git/` are refused. Use a throwaway sandbox, read every approval, and keep the sandbox away from folders you care about. [architecture.md](architecture.md) has the full command gate.

In cloud mode these leave the machine and go to the provider named in your config (for AI Studio, Google): each task you approve, Bloom's fixed tool instructions, short summaries of earlier tasks and answers in the same session, the model's own replies within the turn, and every tool result you approve, including file contents and command output. Bloom asks before each task is sent and before each tool call; the follow-up requests inside a turn carry only results you already approved and are sent without a further prompt. Your key travels only in the request's Authorization header. What the provider keeps, and for how long, is set by its terms, not by Bloom: Google's Gemini API terms say that on unpaid use, including AI Studio and free quota, Google uses submitted content and responses to improve its products. Use a throwaway sandbox and send nothing you would not publish.

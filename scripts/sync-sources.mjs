#!/usr/bin/env node
/**
 * Sync run: fetch heads and tarballs from GitHub, copy verbatim into sources/, and
 * write manifest.json, docs/sources-index.md, and .sync-summary.txt. Read-only toward
 * GitHub, no listener, no dependencies. Network and filesystem live here; selection
 * and rendering live in src/sync-core.mjs.
 */

import { execFile } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import {
  buildEntry,
  emptyManifest,
  isManifest,
  loadSources,
  planSync,
  renderSourcesIndex,
  renderSummary,
  selectFiles,
  sha256Hex,
} from '../src/sync-core.mjs';

const execFileP = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';

function apiHeaders() {
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'Vidoxlabs docs source sync' };
  if (TOKEN) headers.authorization = `Bearer ${TOKEN}`;
  return headers;
}

async function fetchHead(org, name, branch) {
  const url = `https://api.github.com/repos/${org}/${name}/commits/${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: apiHeaders() });
  if (!res.ok) throw new Error(`GitHub API answered ${res.status} for ${org}/${name}.`);
  const body = await res.json();
  if (typeof body.sha !== 'string') throw new Error(`GitHub API returned no head for ${org}/${name}.`);
  return body.sha;
}

async function downloadTarball(org, name, branch, outPath) {
  const url = `https://codeload.github.com/${org}/${name}/tar.gz/refs/heads/${encodeURIComponent(branch)}`;
  const headers = {};
  if (TOKEN) headers.authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`codeload answered ${res.status} for ${org}/${name}.`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await writeFile(outPath, bytes);
  return bytes.byteLength;
}

/** Walk a directory into sorted, forward-slash path names relative to its root. Symlinks never enter. */
async function walk(dir, top = dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => null);
  if (entries === null) return [];
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const paths = [];
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      paths.push(...await walk(abs, top));
    } else if (entry.isFile()) {
      paths.push(relative(top, abs).split(sep).join('/'));
    }
  }
  return paths;
}

/**
 * A skip is only honest when the local copy still matches the manifest record: same
 * file set, same digests, same sizes. Any drift forces a fresh copy.
 */
async function localCopyIntact(destDir, entry) {
  const onDisk = await walk(destDir);
  const recorded = entry.files.map((file) => file.path);
  if (onDisk.length !== recorded.length) return false;
  const recordedSet = new Set(recorded);
  if (onDisk.some((path) => !recordedSet.has(path))) return false;
  for (const file of entry.files) {
    const content = await readFile(join(destDir, file.path)).catch(() => null);
    if (content === null) return false;
    if (sha256Hex(content) !== file.sha256) return false;
    if (content.byteLength !== file.bytes) return false;
  }
  return true;
}

async function main() {
  const configRaw = JSON.parse(await readFile(join(ROOT, 'sources.json'), 'utf8'));
  const config = loadSources(configRaw);

  const manifestPath = join(ROOT, 'manifest.json');
  let manifest = emptyManifest();
  try {
    const existing = JSON.parse(await readFile(manifestPath, 'utf8'));
    if (!isManifest(existing)) throw new Error('manifest.json does not match the committed shape.');
    manifest = existing;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const heads = {};
  for (const source of config.sources) {
    heads[source.name] = await fetchHead(config.org, source.name, config.branch);
  }

  const decisions = planSync(config.sources, manifest.sources, heads);
  const sourcesDir = join(ROOT, 'sources');
  const tmpDir = join(ROOT, '.tmp-sync');

  const results = [];
  const toSync = [];
  for (const decision of decisions) {
    if (decision.status === 'skip') {
      const intact = await localCopyIntact(join(sourcesDir, decision.name), manifest.sources[decision.name]);
      if (intact) {
        results.push({ name: decision.name, status: 'skip', head: decision.head });
        continue;
      }
      decision.reason = 'local copy drifted';
    }
    toSync.push(decision);
  }

  if (toSync.length === 0) {
    const generatedAt = manifest.generatedAt || new Date().toISOString();
    process.stdout.write(renderSummary(results, generatedAt));
    process.stdout.write('No source moved; nothing was written.\n');
    return;
  }

  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  try {
    for (const decision of toSync) {
      const source = config.sources.find((entry) => entry.name === decision.name);
      const tarPath = join(tmpDir, `${decision.name}.tar.gz`);
      const extractDir = join(tmpDir, decision.name);
      await mkdir(extractDir, { recursive: true });
      await downloadTarball(config.org, decision.name, config.branch, tarPath);
      await execFileP('tar', ['-xzf', tarPath, '-C', extractDir, '--strip-components=1']);

      const repoFiles = await walk(extractDir);
      const chosen = selectFiles(repoFiles, source);

      const destDir = join(sourcesDir, decision.name);
      await rm(destDir, { recursive: true, force: true });
      const fileRecords = [];
      for (const rel of chosen) {
        const content = await readFile(join(extractDir, rel));
        const dest = join(destDir, rel);
        await mkdir(dirname(dest), { recursive: true });
        await writeFile(dest, content);
        fileRecords.push({ path: rel, sha256: sha256Hex(content), bytes: content.byteLength });
      }

      manifest.sources[decision.name] = buildEntry({
        name: decision.name,
        head: decision.head,
        files: fileRecords,
        now: new Date().toISOString(),
      });
      results.push({ name: decision.name, status: 'sync', head: decision.head, files: chosen.length });
      const why = decision.reason === 'local copy drifted' ? ' (local copy drifted)' : '';
      process.stdout.write(`${decision.name}: copied ${chosen.length} files at ${decision.head.slice(0, 7)}${why}\n`);
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }

  manifest.generatedAt = new Date().toISOString();
  const summary = renderSummary(results, manifest.generatedAt);
  await writeFile(join(ROOT, '.sync-summary.txt'), summary);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await mkdir(join(ROOT, 'docs'), { recursive: true });
  await writeFile(join(ROOT, 'docs', 'sources-index.md'), renderSourcesIndex(config, manifest));
  process.stdout.write(summary);
}

main().catch((error) => {
  process.stderr.write(`sync failed: ${error.message}\n`);
  process.exit(1);
});

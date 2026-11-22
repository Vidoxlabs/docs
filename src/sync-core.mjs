/** Pure sync core: config validation, planning, selection, hashing, rendering. No network, no filesystem here. Contract: docs/sync.md */

import { createHash } from 'node:crypto';

export const VERSION = '0.1.0';
export const MANIFEST_VERSION = 1;

const REPO_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const HEAD_SHA = /^[0-9a-f]{40,64}$/;
const FILE_SHA256 = /^[0-9a-f]{64}$/;

export class SourcesError extends Error {}
export class PlanError extends Error {}
export class EntryError extends Error {}

/**
 * A relative path is safe when it is not absolute, carries no backslash, and never
 * climbs with '..'. Everything the sync copies on disk passes through this gate.
 */
function isSafeRelPath(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (value.includes('\\') || value.startsWith('/')) return false;
  const segments = value.split('/');
  if (segments.some((s) => s.length === 0 || s === '.' || s === '..')) return false;
  return true;
}

/** A directory path is a safe path that may end in one slash. */
function isSafeRelDir(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  const stem = value.endsWith('/') ? value.slice(0, -1) : value;
  return isSafeRelPath(stem);
}

/**
 * Load and validate sources.json. Roots gain a trailing slash, extensions are
 * lowercased, and every explicit file must match an allowed extension so only text
 * can ever enter the hub. Returns a frozen, normalized copy.
 */
export function loadSources(config) {
  if (config === null || typeof config !== 'object') throw new SourcesError('sources.json must be an object.');
  const { org, branch, sources } = config;
  if (typeof org !== 'string' || org.length === 0) throw new SourcesError('sources.json needs a non-empty org.');
  if (typeof branch !== 'string' || branch.length === 0) throw new SourcesError('sources.json needs a non-empty branch.');
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new SourcesError('sources.json needs a non-empty sources array.');
  }

  const seen = new Set();
  const normalized = sources.map((source, index) => {
    if (source === null || typeof source !== 'object') {
      throw new SourcesError(`Source ${index} must be an object.`);
    }
    const { name, files, roots, extensions } = source;

    if (typeof name !== 'string' || !REPO_NAME.test(name)) {
      throw new SourcesError(`Source ${index} needs a repository name that matches ${REPO_NAME}.`);
    }
    if (seen.has(name)) throw new SourcesError(`Source ${name} appears twice.`);
    seen.add(name);

    if (!Array.isArray(extensions) || extensions.length === 0) {
      throw new SourcesError(`Source ${name} needs a non-empty extensions array.`);
    }
    const exts = extensions.map((ext) => {
      if (typeof ext !== 'string' || !ext.startsWith('.')) {
        throw new SourcesError(`Source ${name}: extension "${ext}" must start with a dot.`);
      }
      return ext.toLowerCase();
    });
    if (new Set(exts).size !== exts.length) {
      throw new SourcesError(`Source ${name}: extensions repeat.`);
    }

    if (!Array.isArray(files)) throw new SourcesError(`Source ${name} needs a files array.`);
    const named = files.map((file) => {
      if (typeof file !== 'string' || !isSafeRelPath(file)) {
        throw new SourcesError(`Source ${name}: file "${file}" is not a safe relative path.`);
      }
      const lower = file.toLowerCase();
      if (!exts.some((ext) => lower.endsWith(ext))) {
        throw new SourcesError(`Source ${name}: file "${file}" matches no allowed extension.`);
      }
      return file;
    });

    if (!Array.isArray(roots)) throw new SourcesError(`Source ${name} needs a roots array.`);
    const rooted = roots.map((root) => {
      if (typeof root !== 'string' || !isSafeRelDir(root)) {
        throw new SourcesError(`Source ${name}: root "${root}" is not a safe relative directory.`);
      }
      return root.endsWith('/') ? root : `${root}/`;
    });

    return Object.freeze({ name, files: named, roots: rooted, extensions: exts });
  });

  return Object.freeze({ org, branch, sources: normalized });
}

/**
 * Decide, per source, whether this run copies it. A source syncs when it has no prior
 * entry or when its head moved; it skips only when the head matches the manifest. A
 * missing or malformed head stops the plan: the caller must abort rather than guess.
 */
export function planSync(sources, entries, heads) {
  const prior = entries && typeof entries === 'object' ? entries : {};
  return sources.map((source) => {
    const head = heads[source.name];
    if (typeof head !== 'string' || !HEAD_SHA.test(head)) {
      throw new PlanError(`No usable head for ${source.name}; refusing to plan with a blind spot.`);
    }
    const entry = prior[source.name];
    if (entry === null || typeof entry !== 'object') return { name: source.name, head, status: 'sync', reason: 'no prior entry' };
    if (typeof entry.head !== 'string' || entry.head !== head) return { name: source.name, head, status: 'sync', reason: 'head moved' };
    return { name: source.name, head, status: 'skip', reason: 'head unchanged' };
  });
}

/**
 * Select the files one sync copies from a repository tree. Explicit files enter only
 * when present; rooted matches enter only with an allowed extension. PNGs and other
 * binaries fail the extension gate, so text stays the only thing the hub carries.
 */
export function selectFiles(repoFiles, source) {
  if (!Array.isArray(repoFiles)) throw new SourcesError('selectFiles needs a list of repository paths.');
  const available = new Set(repoFiles);
  const chosen = new Set();

  for (const file of source.files) if (available.has(file)) chosen.add(file);
  for (const path of repoFiles) {
    if (!source.roots.some((root) => path.startsWith(root))) continue;
    const lower = path.toLowerCase();
    if (!source.extensions.some((ext) => lower.endsWith(ext))) continue;
    chosen.add(path);
  }
  return [...chosen].sort();
}

/** SHA-256 hex digest of a buffer or string. Every copied file is recorded with it. */
export function sha256Hex(data) {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Build the manifest entry for one source: head, timestamp, and one frozen record per
 * copied file with its path, digest, and size. Records sort by path so the manifest
 * is stable across runs.
 */
export function buildEntry({ name, head, files, now }) {
  if (typeof name !== 'string' || !REPO_NAME.test(name)) throw new EntryError('An entry names the repository it belongs to.');
  if (typeof head !== 'string' || !HEAD_SHA.test(head)) throw new EntryError(`Entry ${name} needs a digest-shaped head.`);
  if (typeof now !== 'string' || Number.isNaN(Date.parse(now))) throw new EntryError(`Entry ${name} needs an ISO timestamp.`);
  if (!Array.isArray(files)) throw new EntryError(`Entry ${name} needs a files array.`);

  const records = files.map((file) => {
    if (file === null || typeof file !== 'object' || typeof file.path !== 'string' || !isSafeRelPath(file.path)) {
      throw new EntryError(`Entry ${name} holds a file record with an unsafe path.`);
    }
    if (typeof file.sha256 !== 'string' || !FILE_SHA256.test(file.sha256)) {
      throw new EntryError(`Entry ${name} holds a file record without a 64-hex digest.`);
    }
    if (typeof file.bytes !== 'number' || !Number.isInteger(file.bytes) || file.bytes < 0) {
      throw new EntryError(`Entry ${name} holds a file record without a whole, non-negative size.`);
    }
    return Object.freeze({ path: file.path, sha256: file.sha256, bytes: file.bytes });
  });
  records.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  return Object.freeze({ name, head, syncedAt: now, files: Object.freeze(records) });
}

/** The manifest shape this repository commits. */
export function emptyManifest() {
  return { version: MANIFEST_VERSION, generatedAt: null, sources: {} };
}

/** A manifest is usable when it declares the current version and a sources object. */
export function isManifest(value) {
  return value !== null && typeof value === 'object'
    && value.version === MANIFEST_VERSION
    && value.sources !== null && typeof value.sources === 'object'
    && !Array.isArray(value.sources);
}

function shortHead(head) {
  return head.slice(0, 7);
}

/**
 * Render docs/sources-index.md from the manifest. The index is the human map of the
 * machine manifest: every source, its head, the day it synced, and how many files it
 * carries. Pending sources say so instead of hiding.
 */
export function renderSourcesIndex(config, manifest) {
  const lines = [];
  lines.push('# Synced sources');
  lines.push('');
  lines.push('This index is written by the sync run. Each repository below is copied verbatim into `sources/` by `manifest.json`. Edit documentation in the repository that owns it; the next sync brings the copy back.');
  lines.push('');
  lines.push('| Repository | Head | Synced | Files |');
  lines.push('| --- | --- | --- | --- |');
  for (const source of config.sources) {
    const entry = manifest.sources[source.name];
    if (entry === null || typeof entry !== 'object') {
      lines.push(`| [${source.name}](https://github.com/${config.org}/${source.name}) | pending | never | 0 |`);
      continue;
    }
    lines.push(`| [${source.name}](https://github.com/${config.org}/${source.name}) | \`${shortHead(entry.head)}\` | ${(typeof entry.syncedAt === 'string' ? entry.syncedAt : '').slice(0, 10)} | ${entry.files.length} |`);
  }
  lines.push('');
  lines.push(manifest.generatedAt ? `Run: ${manifest.generatedAt}` : 'Run: pending');
  lines.push('');
  return lines.join('\n');
}

/**
 * Render the sync run summary. The first line stands alone as a commit subject, the
 * rest reads as its body, so `.sync-summary.txt` doubles as the commit message file.
 */
export function renderSummary(results, generatedAt) {
  if (!Array.isArray(results) || typeof generatedAt !== 'string') {
    throw new SourcesError('renderSummary needs results and a run timestamp.');
  }
  const updated = results.filter((r) => r && r.status === 'sync').length;
  const unchanged = results.length - updated;
  const lines = [];
  lines.push(`Sync sources: ${updated} updated, ${unchanged} unchanged`);
  lines.push('');
  for (const result of results) {
    if (result.status === 'sync') {
      lines.push(`${result.name}: synced ${result.files} files at ${shortHead(result.head)}`);
    } else {
      lines.push(`${result.name}: unchanged at ${shortHead(result.head)}`);
    }
  }
  lines.push('');
  lines.push(`Run: ${generatedAt}`);
  return `${lines.join('\n')}\n`;
}

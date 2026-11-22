import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  EntryError,
  PlanError,
  SourcesError,
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

const HEAD = '0'.repeat(40);
const HEAD_B = '1'.repeat(40);
const NOW = '2026-11-22T10:00:00.000Z';
const DIGEST = 'a'.repeat(64);

function validConfig(overrides = {}) {
  return {
    org: 'Vidoxlabs',
    branch: 'main',
    sources: [
      {
        name: 'seed',
        files: ['README.md'],
        roots: ['docs'],
        extensions: ['.md', '.json'],
      },
    ],
    ...overrides,
  };
}

function seedSource(overrides = {}) {
  return { name: 'seed', files: ['README.md'], roots: ['docs/'], extensions: ['.md', '.json'], ...overrides };
}

test('a valid config loads, normalizes roots and extensions, and freezes', () => {
  const config = loadSources(validConfig());
  assert.equal(config.org, 'Vidoxlabs');
  assert.equal(config.sources[0].roots[0], 'docs/');
  assert.equal(config.sources[0].extensions[0], '.md');
  assert.equal(Object.isFrozen(config), true);

  const upper = loadSources(validConfig({ sources: [{ name: 'seed', files: ['README.md'], roots: ['docs'], extensions: ['.MD'] }] }));
  assert.equal(upper.sources[0].extensions[0], '.md');
});

test('configs missing org, branch, or sources are rejected', () => {
  assert.throws(() => loadSources({ branch: 'main', sources: validConfig().sources }), SourcesError);
  assert.throws(() => loadSources({ org: 'Vidoxlabs', sources: validConfig().sources }), SourcesError);
  assert.throws(() => loadSources({ org: 'Vidoxlabs', branch: 'main', sources: [] }), SourcesError);
  assert.throws(() => loadSources(null), SourcesError);
});

test('source entries repeat names are rejected', () => {
  const double = validConfig({ sources: [seedSource(), seedSource()] });
  assert.throws(() => loadSources(double), SourcesError);
});

test('extensions must start with a dot', () => {
  const config = validConfig({ sources: [seedSource({ extensions: ['md'] })] });
  assert.throws(() => loadSources(config), SourcesError);
});

test('explicit files outside the allowed extensions are rejected', () => {
  const config = validConfig({ sources: [seedSource({ files: ['previews/phone.png'] })] });
  assert.throws(() => loadSources(config), SourcesError);
});

test('unsafe paths never enter the config', () => {
  assert.throws(() => loadSources(validConfig({ sources: [seedSource({ files: ['../outside.md'] })] })), SourcesError);
  assert.throws(() => loadSources(validConfig({ sources: [seedSource({ roots: ['/etc/'] })] })), SourcesError);
});

test('planSync flags first syncs, moved heads, and unchanged heads', () => {
  const sources = [seedSource()];
  const first = planSync(sources, {}, { seed: HEAD });
  assert.equal(first[0].status, 'sync');
  assert.equal(first[0].reason, 'no prior entry');

  const moved = planSync(sources, { seed: entryWithHead(HEAD) }, { seed: HEAD_B });
  assert.equal(moved[0].status, 'sync');
  assert.equal(moved[0].reason, 'head moved');

  const same = planSync(sources, { seed: entryWithHead(HEAD) }, { seed: HEAD });
  assert.equal(same[0].status, 'skip');
  assert.equal(same[0].reason, 'head unchanged');
});

test('planSync refuses a missing head instead of planning blind', () => {
  assert.throws(() => planSync([seedSource()], {}, {}), PlanError);
  assert.throws(() => planSync([seedSource()], {}, { seed: 'not-a-sha' }), PlanError);
});

test('selectFiles takes explicit files, rooted matches, and nothing else', () => {
  const source = loadSources(validConfig({ sources: [seedSource()] })).sources[0];
  const tree = [
    'README.md',
    'docs/index.md',
    'docs/guides/planting.md',
    'docs/guides/notes.json',
    'docs/previews/phone.png',
    'src/main.mjs',
    'docs/deep/nest/table.md',
  ];
  const chosen = selectFiles(tree, source);
  assert.deepEqual(chosen, ['README.md', 'docs/deep/nest/table.md', 'docs/guides/notes.json', 'docs/guides/planting.md', 'docs/index.md']);
});

test('selectFiles counts once and tolerates a missing explicit file', () => {
  const source = seedSource({ files: ['README.md', 'MUST_READ.md'] });
  const chosen = selectFiles(['README.md', 'docs/index.md'], source);
  assert.deepEqual(chosen, ['README.md', 'docs/index.md']);
});

test('sha256Hex matches the known vector', () => {
  assert.equal(sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(sha256Hex(Buffer.from('abc', 'utf8')), sha256Hex('abc'));
});

test('buildEntry shapes a frozen, sorted manifest record', () => {
  const entry = buildEntry({
    name: 'seed',
    head: HEAD,
    now: NOW,
    files: [
      { path: 'docs/index.md', sha256: 'b'.repeat(64), bytes: 100 },
      { path: 'README.md', sha256: DIGEST, bytes: 40 },
    ],
  });
  assert.equal(entry.name, 'seed');
  assert.equal(entry.head, HEAD);
  assert.equal(entry.syncedAt, NOW);
  assert.deepEqual(entry.files.map((file) => file.path), ['README.md', 'docs/index.md']);
  assert.equal(Object.isFrozen(entry), true);
});

test('buildEntry rejects unsafe paths, bad digests, and fractional sizes', () => {
  const base = { name: 'seed', head: HEAD, now: NOW };
  assert.throws(() => buildEntry({ ...base, files: [{ path: '../up.md', sha256: DIGEST, bytes: 1 }] }), EntryError);
  assert.throws(() => buildEntry({ ...base, files: [{ path: 'docs/a.md', sha256: 'zz', bytes: 1 }] }), EntryError);
  assert.throws(() => buildEntry({ ...base, files: [{ path: 'docs/a.md', sha256: DIGEST, bytes: 1.5 }] }), EntryError);
  assert.throws(() => buildEntry({ name: 'seed', head: HEAD, files: [], now: 'not-a-date' }), EntryError);
});

test('manifest helpers recognize only the committed shape', () => {
  const empty = emptyManifest();
  assert.equal(isManifest(empty), true);
  assert.equal(isManifest({ version: 2, generatedAt: null, sources: {} }), false);
  assert.equal(isManifest({ version: 1, generatedAt: null, sources: [] }), false);
});

test('renderSourcesIndex lists every source with its provenance', () => {
  const config = loadSources(validConfig({ sources: [seedSource(), seedSource({ name: 'bloom' })] }));
  const manifest = {
    version: 1,
    generatedAt: NOW,
    sources: { seed: entryWithHead(HEAD) },
  };
  const index = renderSourcesIndex(config, manifest);
  assert.match(index, /# Synced sources/);
  assert.match(index, /\[seed\]\(https:\/\/github\.com\/Vidoxlabs\/seed\)/);
  assert.match(index, /\| \[bloom\].*pending \| never \| 0 \|/);
  assert.match(index, /Run: 2026-11-22T10:00:00\.000Z/);
});

test('rendered text never carries an em-dash', () => {
  const config = loadSources(validConfig());
  const manifest = { version: 1, generatedAt: NOW, sources: { seed: entryWithHead(HEAD) } };
  const index = renderSourcesIndex(config, manifest);
  const summary = renderSummary([
    { name: 'seed', status: 'sync', head: HEAD, files: 7 },
    { name: 'bloom', status: 'skip', head: HEAD_B },
  ], NOW);
  assert.equal(index.includes('\u2014'), false);
  assert.equal(summary.includes('\u2014'), false);
});

test('renderSummary opens as a commit message and reports each source', () => {
  const summary = renderSummary([
    { name: 'seed', status: 'sync', head: HEAD, files: 7 },
    { name: 'bloom', status: 'skip', head: HEAD_B },
  ], NOW);
  const lines = summary.split('\n');
  assert.equal(lines[0], 'Sync sources: 1 updated, 1 unchanged');
  assert.equal(lines[1], '');
  assert.ok(lines.includes('seed: synced 7 files at 0000000'));
  assert.ok(lines.includes('bloom: unchanged at 1111111'));
  assert.equal(summary.endsWith(`Run: ${NOW}\n`), true);
  assert.throws(() => renderSummary(null, NOW), SourcesError);
});

function entryWithHead(head) {
  return {
    name: 'seed',
    head,
    syncedAt: NOW,
    files: [
      { path: 'README.md', sha256: DIGEST, bytes: 40 },
      { path: 'docs/index.md', sha256: 'b'.repeat(64), bytes: 100 },
    ],
  };
}

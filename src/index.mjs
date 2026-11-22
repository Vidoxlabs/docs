/** Identity entrypoint. `npm start` prints the hub card; the library stays in sync-core. */

import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { VERSION } from './sync-core.mjs';

export * from './sync-core.mjs';

const ROLE = 'documentation hub for the Vidoxlabs agent family';

export function about() {
  return Object.freeze({
    name: '@vidoxlabs/docs',
    version: VERSION,
    role: ROLE,
    province: 'family documentation, written here, synced from every public repository',
  });
}

function invokedAsScript() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (invokedAsScript()) {
  const info = about();
  console.log(`name:     ${info.name}`);
  console.log(`version:  ${info.version}`);
  console.log(`role:     ${info.role}`);
  console.log(`province: ${info.province}`);
}

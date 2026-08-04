/**
 * Gallery: validate + preview every .perchance creation under projects/.
 * Shows live rolled output so the user can "see" the generators.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { validatePerchance } from '../src/core/validator.js';
import { previewRolls } from '../src/core/exporter.js';

const ROOT = new URL('../projects/', import.meta.url).pathname;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(ROOT).filter((f) => f.endsWith('.perchance')).sort();
if (!files.length) { console.log('No .perchance creations found.'); process.exit(0); }

for (const f of files) {
  const code = readFileSync(f, 'utf-8');
  const v = validatePerchance(code);
  const rolls = previewRolls(code, 4);
  const name = f.split('/').slice(-2).join('/');
  console.log(`\n═══════ ${name} — ${v.valid ? 'VALID' : 'INVALID'} (${v.stats.listCount} liste, ${v.stats.totalItems} itemi)`);
  if (!v.valid) v.errors.forEach((e) => console.log(`   ❌ L${e.line}: ${e.message}`));
  v.warnings.forEach((w) => console.log(`   ⚠️  L${w.line}: ${w.message}`));
  rolls.forEach((r, i) => console.log(`   ${i + 1}. ${r}`));
}

/**
 * dependencyResolver.js — Client-side dependency graph resolver
 *
 * Parses [^slug.listName] patterns from Perchance generator code
 * and resolves transitive dependencies for selective export.
 *
 * This mirrors packShareService.ts:resolveDependencies() but runs
 * entirely in the browser — no API call needed for the dependency check.
 */

/**
 * Parse all [^slug.listName] imports from a generator's code string.
 * @param {string} code
 * @returns {Array<{fromSlug: string, listName: string}>}
 */
export function parseImports(code) {
  if (!code) return [];
  const regex = /\[\^([a-z0-9-]+)\.([a-zA-Z0-9_-]+)\]/g;
  const found = new Map();
  let m;
  while ((m = regex.exec(code)) !== null) {
    const key = `${m[1]}.${m[2]}`;
    if (!found.has(key)) {
      found.set(key, { fromSlug: m[1], listName: m[2] });
    }
  }
  return [...found.values()];
}

/**
 * Given a list of all generators and a Set of selected slugs,
 * resolve transitive dependencies via BFS and return a DependencyReport.
 *
 * @param {Array<{slug, code, imports}>} generators
 * @param {string[]} selectedSlugs
 * @returns {{
 *   selected: string[],
 *   resolved: string[],
 *   warnings: Array<{dependent, missing, listName}>,
 *   exportSlugs: string[]
 * }}
 */
export function resolveDependencies(generators, selectedSlugs) {
  const bySlug = new Map(generators.map(g => [g.slug, g]));
  const selected = new Set(selectedSlugs);
  const resolved = new Set();
  const warnings = [];

  const queue = [...selectedSlugs];
  const visited = new Set();

  while (queue.length > 0) {
    const slug = queue.shift();
    if (visited.has(slug)) continue;
    visited.add(slug);

    const gen = bySlug.get(slug);
    if (!gen) continue;

    // Use pre-parsed imports OR parse live from code
    const imports = gen.imports?.length
      ? gen.imports
      : parseImports(gen.code || '');

    for (const imp of imports) {
      if (selected.has(imp.fromSlug) || resolved.has(imp.fromSlug)) {
        // Already in export set — traverse further
        queue.push(imp.fromSlug);
      } else if (bySlug.has(imp.fromSlug)) {
        // Exists in pack but not selected — auto-resolve
        resolved.add(imp.fromSlug);
        queue.push(imp.fromSlug);
        warnings.push({
          dependent: slug,
          missing: imp.fromSlug,
          listName: imp.listName
        });
      } else {
        // Import target doesn't exist in pack at all
        warnings.push({
          dependent: slug,
          missing: imp.fromSlug,
          listName: imp.listName
        });
      }
    }
  }

  return {
    selected: [...selected],
    resolved: [...resolved],
    warnings,
    exportSlugs: [...new Set([...selected, ...resolved])]
  };
}

/**
 * Inline a missing import: replace [^slug.listName] with a
 * static fallback list extracted from another generator in the pack.
 *
 * Use this when user chooses "Inline" instead of "Include dependency".
 *
 * @param {string} code           The generator code to patch
 * @param {string} fromSlug       The generator slug being inlined
 * @param {string} listName       The list name being referenced
 * @param {string} sourceCode     The full code of the source generator
 * @returns {string}              Patched code
 */
export function inlineImport(code, fromSlug, listName, sourceCode) {
  // Extract the list content from sourceCode
  const listRegex = new RegExp(`^${listName}\\s*$([\\s\\S]*?)(?=^\\S|$)`, 'm');
  const match = listRegex.exec(sourceCode);

  if (!match) {
    // Can't find the list — replace with a static fallback
    return code.replace(
      new RegExp(`\\[\\^${fromSlug}\\.${listName}\\]`, 'g'),
      `{${listName} item 1|${listName} item 2|${listName} item 3}`
    );
  }

  // Build inline choices from the list entries
  const lines = match[1]
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('//'))
    .slice(0, 20); // cap at 20 items for readability

  const inlined = `{${lines.join('|')}}`;
  return code.replace(
    new RegExp(`\\[\\^${fromSlug}\\.${listName}\\]`, 'g'),
    inlined
  );
}

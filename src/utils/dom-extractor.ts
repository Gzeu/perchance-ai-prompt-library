/**
 * DOM Extractor
 * Pure DOM extraction logic for Perchance generators.
 * Works with any Document-compatible object (jsdom, browser, or mock).
 * No runtime dependency on jsdom — only standard DOM types.
 */

/**
 * Parse a JSON string from a script element's textContent, handling
 * perchance.org's `notjs` data format.
 */
function tryParseNotjsData(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    // perchance.org sometimes wraps JSON — try decodeURI first
    try {
      return JSON.parse(decodeURIComponent(text));
    } catch {
      return null;
    }
  }
}

/**
 * Extract generator source code and description from a parsed Document.
 * Tries multiple extraction strategies:
 *   1. textarea#generator-code (editable page)
 *   2. Inline script with generatorCode variable (older perchance pages)
 *   3. pre.generator-source / code.perchance-code (static code blocks)
 *   4. script#preloaded-generator-data type="notjs" (perchance.org download API)
 *
 * Works with both jsdom documents and live browser documents (same DOM API).
 */
export function extractGeneratorFromDocument(doc: Document): {
  code: string | null;
  description: string | null;
} {
  // Method 1: look for code textarea
  const textarea = doc.querySelector(
    'textarea#generator-code, textarea.code-editor',
  ) as HTMLTextAreaElement | null;
  if (textarea?.value) {
    return { code: textarea.value, description: null };
  }

  // Method 2: look for script tags with generator data (perchance.org download API)
  // The data is in a <script id="preloaded-generator-data" type="notjs">JSON</script>
  const dataScript = doc.querySelector('script#preloaded-generator-data') as HTMLScriptElement | null;
  if (dataScript?.textContent) {
    const data = tryParseNotjsData(dataScript.textContent.trim());
    if (data?.modelText) {
      return { code: data.modelText, description: data.description || null };
    }
  }

  // Method 3: look for script tags with generatorCode variable
  const scripts = Array.from(doc.querySelectorAll('script'));
  for (const script of scripts) {
    if (script.textContent?.includes('generatorCode')) {
      const match = script.textContent.match(/generatorCode\s*=\s*[`'"]([\s\S]*?)[`'"]/);
      if (match) return { code: match[1], description: null };
    }
  }

  // Method 4: look for pre/code blocks
  const pre = doc.querySelector('pre.generator-source, code.perchance-code');
  if (pre?.textContent) return { code: pre.textContent, description: null };

  return { code: null, description: null };
}

/**
 * Extract the meta description content from a Document.
 */
export function extractDescriptionFromDocument(doc: Document): string | null {
  const el = doc.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  return el?.content || null;
}

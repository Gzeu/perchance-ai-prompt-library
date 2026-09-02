/**
 * HTML Fetcher Utility
 * Lightweight HTTP fetch with timeout and browser-like user-agent.
 * No jsdom dependency — safe to import in any context.
 */

const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** Fetches raw HTML from a URL with a timeout and default user-agent. */
export async function fetchHtml(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': DEFAULT_UA },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
  }

  return response.text();
}

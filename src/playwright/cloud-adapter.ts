/**
 * Playwright Cloud Adapter
 * Handles headless Chromium execution in Docker/CI/Vercel/cloud environments.
 * Set PERCHANCE_CLOUD_MODE=true to activate cloud-safe launch args.
 * Falls back gracefully to preview_rolls if Playwright is not installed.
 */

export interface PlaywrightRollResult {
  rolls: string[];
  screenshot?: Buffer;
  mode: 'browser' | 'fallback';
}

const CLOUD_LAUNCH_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--single-process',
  '--no-zygote',
];

export async function runWithPlaywright(
  code: string,
  rolls = 10,
  screenshot = false
): Promise<PlaywrightRollResult> {
  const isCloud =
    process.env.PERCHANCE_CLOUD_MODE === 'true' ||
    process.env.CI === 'true' ||
    process.env.VERCEL === '1' ||
    process.env.RAILWAY_ENVIRONMENT !== undefined;

  let playwright: typeof import('playwright') | null = null;

  try {
    playwright = await import('playwright');
  } catch {
    // Playwright not installed — graceful fallback
    console.warn('[perchance] Playwright not available. Falling back to local preview.');
    const { previewRolls } = await import('../core/previewer.js');
    const fallbackRolls = await previewRolls(code, rolls);
    return { rolls: fallbackRolls, mode: 'fallback' };
  }

  const launchOptions = {
    headless: true,
    args: isCloud ? CLOUD_LAUNCH_ARGS : [],
  };

  const browser = await playwright.chromium.launch(launchOptions);
  const page = await browser.newPage();

  try {
    // Build a data URL with the generator code embedded
    const html = buildPerchanceHtml(code);
    await page.setContent(html, { waitUntil: 'networkidle' });

    const results: string[] = [];
    for (let i = 0; i < rolls; i++) {
      await page.click('#roll-btn');
      await page.waitForTimeout(300);
      const text = await page.textContent('#output');
      if (text) results.push(text.trim());
    }

    let screenshotBuf: Buffer | undefined;
    if (screenshot) {
      screenshotBuf = await page.screenshot({ fullPage: false }) as Buffer;
    }

    return { rolls: results, screenshot: screenshotBuf, mode: 'browser' };
  } finally {
    await browser.close();
  }
}

function buildPerchanceHtml(code: string): string {
  const escaped = code.replace(/`/g, '\\`');
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Perchance Preview</title></head>
<body>
  <button id="roll-btn">Roll</button>
  <div id="output"></div>
  <script>
    // Minimal Perchance interpreter for local preview
    const code = \`${escaped}\`;
    document.getElementById('roll-btn').addEventListener('click', () => {
      const lines = code.split('\\n').filter(l => l.trim() && !l.startsWith('//'));
      const pick = lines[Math.floor(Math.random() * lines.length)];
      document.getElementById('output').textContent = pick.trim();
    });
  <\/script>
</body>
</html>`;
}

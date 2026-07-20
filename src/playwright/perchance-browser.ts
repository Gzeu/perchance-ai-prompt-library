/**
 * Perchance Browser Controller
 * Manages a Playwright Chromium instance for perchance.ai automation
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';

const PERCHANCE_GENERATE_URL = 'https://perchance.ai/tools/generate';
const PERCHANCE_BASE_URL = 'https://perchance.ai';

export class PerchanceBrowser {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async launch(headless = true): Promise<void> {
    this.browser = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.context = await this.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
    });
  }

  async newPage(): Promise<Page> {
    if (!this.context) throw new Error('Browser not launched. Call launch() first.');
    return this.context.newPage();
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
    this.browser = null;
    this.context = null;
  }

  get generateUrl() { return PERCHANCE_GENERATE_URL; }
  get baseUrl() { return PERCHANCE_BASE_URL; }
}

export const perchanceBrowser = new PerchanceBrowser();

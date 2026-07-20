/**
 * Perchance Loader
 * Injects .perchance generator code into the perchance.ai editor
 */

import { Page } from 'playwright';

export async function injectGeneratorCode(page: Page, code: string, timeout = 15000): Promise<void> {
  await page.goto('https://perchance.ai/tools/generate', { waitUntil: 'networkidle', timeout });

  // Wait for the code editor (CodeMirror or textarea)
  const editorSelector = '.CodeMirror, textarea[name="code"], #generator-code, .editor-content';
  await page.waitForSelector(editorSelector, { timeout });

  // Try CodeMirror editor first
  const hasCM = await page.$('.CodeMirror');
  if (hasCM) {
    await page.evaluate((src: string) => {
      const cm = (document.querySelector('.CodeMirror') as any)?.__vue?.$el?._codemirror
        || (window as any).editor
        || (document.querySelector('.CodeMirror') as any)?.CodeMirror;
      if (cm) {
        cm.setValue(src);
        cm.refresh();
      }
    }, code);
  } else {
    // Fallback: plain textarea
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill(code);
    }
  }

  // Small delay to let editor process input
  await page.waitForTimeout(500);
}

/**
 * Playwright Exporter
 * Saves screenshots and results from Perchance.ai runs
 */

import fs from 'fs';
import path from 'path';

export interface RunExport {
  results: string[];
  screenshotPath?: string;
  jsonPath?: string;
  timestamp: string;
}

export async function saveRun(
  results: string[],
  screenshotB64?: string,
  outputDir = './output/runs'
): Promise<RunExport> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let screenshotPath: string | undefined;
  if (screenshotB64) {
    screenshotPath = path.join(outputDir, `run-${timestamp}.png`);
    fs.writeFileSync(screenshotPath, Buffer.from(screenshotB64, 'base64'));
  }

  const jsonPath = path.join(outputDir, `run-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({ results, timestamp }, null, 2));

  return { results, screenshotPath, jsonPath, timestamp };
}

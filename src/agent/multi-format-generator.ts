/**
 * Multi-Format Generator for Autonomous Perchance Agent System
 * Generates .perchance list format and HTML format (main.pjs + index.html)
 * Uses perchance-native templates — no external AI required.
 */

import { validatePerchance } from '../core/validator.js';
import { previewRolls } from '../core/exporter.js';
import { TemplateLibrary } from './template-library.js';
import type { ValidationResult } from '../types/perchance.js';

export interface FormatOutput {
  format: 'perchance' | 'html';
  code: string;
  files?: {
    'main.pjs'?: string;
    'index.html'?: string;
  };
  validation?: ValidationResult;
  preview?: string[];
  qualityScore?: number;
  reason: string;
}

export interface MultiFormatRequest {
  topic: string;
  category: string;
  complexity: 'simple' | 'medium' | 'complex';
  forceFormat?: 'perchance' | 'html';
  interactiveFeatures?: string[];
  visualElements?: string[];
}

export class MultiFormatGenerator {
  private library: TemplateLibrary;

  constructor() {
    this.library = new TemplateLibrary();
  }

  async generateOptimalFormat(request: MultiFormatRequest): Promise<FormatOutput> {
    if (request.forceFormat) {
      if (request.forceFormat === 'perchance') {
        return await this.generatePerchanceFormat(request);
      } else {
        return await this.generateHTMLFormat(request);
      }
    }

    const shouldUseHTML = this.shouldUseHTML(request);

    if (shouldUseHTML) {
      return await this.generateHTMLFormat(request);
    } else {
      return await this.generatePerchanceFormat(request);
    }
  }

  async generateBothFormats(request: MultiFormatRequest): Promise<{
    perchance: FormatOutput;
    html: FormatOutput;
    recommendation: 'perchance' | 'html';
    reason: string;
  }> {
    const [perchance, html] = await Promise.all([
      this.generatePerchanceFormat(request),
      this.generateHTMLFormat(request)
    ]);

    const recommendation = this.compareFormats(perchance, html);

    return {
      perchance,
      html,
      recommendation: recommendation.format,
      reason: recommendation.reason
    };
  }

  async convertToHTML(perchanceCode: string, topic: string): Promise<FormatOutput> {
    const mainPjs = this.generateMainPJS(perchanceCode, topic);
    const indexHtml = this.generateIndexHTMLStatic(perchanceCode, topic);

    return {
      format: 'html',
      code: `// main.pjs\n${mainPjs}\n\n<!-- index.html -->\n${indexHtml}`,
      files: {
        'main.pjs': mainPjs,
        'index.html': indexHtml,
      },
      reason: 'Converted from .perchance list format to HTML interactive format'
    };
  }

  async convertToPerchance(mainPjs: string, indexHtml: string): Promise<FormatOutput> {
    const perchanceCode = this.extractAndConvert(mainPjs, indexHtml);
    const validation = validatePerchance(perchanceCode);

    return {
      format: 'perchance',
      code: perchanceCode,
      validation,
      preview: previewRolls(perchanceCode, 5),
      qualityScore: this.calculateQualityScore(validation),
      reason: 'Converted from HTML format to .perchance list format'
    };
  }

  private shouldUseHTML(request: MultiFormatRequest): boolean {
    const interactiveKeywords = [
      'game', 'play', 'click', 'button', 'interactive', 'visual',
      'canvas', 'animation', 'simulation', 'explorer', 'map',
      'creator', 'builder', 'editor', 'tool'
    ];

    const visualKeywords = [
      'image', 'graphic', 'visual', 'art', 'design', 'color',
      'avatar', 'portrait', 'scene', 'background', 'card'
    ];

    const topicLower = request.topic.toLowerCase();
    const hasInteractiveKeyword = interactiveKeywords.some(kw => topicLower.includes(kw));
    const hasVisualKeyword = visualKeywords.some(kw => topicLower.includes(kw));
    const isComplex = request.complexity === 'complex';

    if (hasInteractiveKeyword) return true;
    if (hasVisualKeyword && isComplex) return true;
    if (request.category === 'custom' && isComplex) return true;

    return false;
  }

  private async generatePerchanceFormat(request: MultiFormatRequest): Promise<FormatOutput> {
    const styleMap: Record<string, 'simple' | 'weighted' | 'nested' | 'complex'> = {
      simple: 'simple',
      complex: 'complex',
      medium: 'nested',
    };

    const code = this.library.generate({
      topic: request.topic,
      category: (request.category || 'custom') as any,
      style: styleMap[request.complexity] || 'nested',
      itemCount: 15,
    });

    const validation = validatePerchance(code);

    return {
      format: 'perchance',
      code,
      validation,
      preview: previewRolls(code, 5),
      qualityScore: this.calculateQualityScore(validation),
      reason: 'Simple text generation - .perchance format is more maintainable'
    };
  }

  public async generateHTMLFormat(request: MultiFormatRequest): Promise<FormatOutput> {
    const mainPjs = this.generateMainPJSContent(request);
    const indexHtml = this.generateIndexHTMLContent(request);

    const code = `// main.pjs\n${mainPjs}\n\n<!-- index.html -->\n${indexHtml}`;

    return {
      format: 'html',
      code,
      files: {
        'main.pjs': mainPjs,
        'index.html': indexHtml,
      },
      reason: 'Interactive/visual content - HTML format provides better UX'
    };
  }

  private generateMainPJSContent(request: MultiFormatRequest): string {
    const slug = request.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return `$meta
  title = ${request.topic}
  description = An interactive ${request.topic} generator
  tags = ${slug}, generator, interactive

// Configuration
worldW = 72
tile = 32
worldSeed = ${Math.floor(Math.random() * 10000)}

// Plugins
BUG = {import:bug-error-plugin}
PCP = {import:public-comment-plugin}`;
  }

  private generateIndexHTMLContent(request: MultiFormatRequest): string {
    const interactiveSection = request.interactiveFeatures?.join(', ') || 'none';
    const visualSection = request.visualElements?.join(', ') || 'none';

    return `<style>
body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
}
#app {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
button {
  background: #00bcd4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:hover {
  background: #0097a7;
}
#result {
  margin-top: 20px;
  padding: 15px;
  background: #e0f7fa;
  border-radius: 4px;
  font-size: 18px;
}
</style>

<div id="app">
  <h1>${request.topic} Generator</h1>
  <button id="generateBtn">Generate</button>
  <div id="result">Click generate to create a ${request.topic}</div>
</div>

[BUG({showIcon: true, position: "top-right"})]

<script type="module">
const generateBtn = document.getElementById('generateBtn');
const resultDiv = document.getElementById('result');

generateBtn.addEventListener('click', () => {
  // Interactive features: ${interactiveSection}
  // Visual elements: ${visualSection}
  // Add generation logic here
  resultDiv.textContent = 'Generated: ' + Math.random().toString(36).substring(7);
});
</script>`;
  }

  private generateMainPJS(_perchanceCode: string, topic: string): string {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return `$meta
  title = ${topic}
  description = An interactive ${topic} generator
  tags = ${slug}, generator, interactive

// Configuration
worldW = 72
tile = 32
worldSeed = ${Math.floor(Math.random() * 10000)}

// Plugins
BUG = {import:bug-error-plugin}
PCP = {import:public-comment-plugin}`;
  }

  private generateIndexHTMLStatic(_perchanceCode: string, topic: string): string {
    return `<style>
body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
}
#app {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
button {
  background: #00bcd4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:hover {
  background: #0097a7;
}
#result {
  margin-top: 20px;
  padding: 15px;
  background: #e0f7fa;
  border-radius: 4px;
  font-size: 18px;
}
</style>

<div id="app">
  <h1>${topic} Generator</h1>
  <button id="generateBtn">Generate</button>
  <div id="result">Click generate to create a ${topic}</div>
</div>

[BUG({showIcon: true, position: "top-right"})]

<script type="module">
const generateBtn = document.getElementById('generateBtn');
const resultDiv = document.getElementById('result');

generateBtn.addEventListener('click', () => {
  resultDiv.textContent = 'Generated: ' + Math.random().toString(36).substring(7);
});
</script>`;
  }

  private extractAndConvert(mainPjs: string, indexHtml: string): string {
    // Extract list definitions from the HTML/generator and convert to .perchance format
    // Look for $meta section and list-like structures
    const slugMatch = mainPjs.match(/tags = (.*)/);
    const slug = slugMatch ? slugMatch[1].trim().split(',')[0].trim() : 'generated';

    // Build a basic .perchance generator from available content
    let code = `title\n  ${slug}\n`;

    // Try to extract list items from HTML
    const listItems = indexHtml.match(/Generated: [a-z0-9-]+/gi);
    if (listItems) {
      code += '\noutput\n';
      const uniqueItems = [...new Set(listItems.map(s => s.replace('Generated: ', '')))];
      uniqueItems.slice(0, 15).forEach(item => {
        code += `  ${item}\n`;
      });
    } else {
      // Fallback: create a generator with topic-based lists
      code += '\noutput\n  [topic] generator\n\ntopic\n  ' + slug;
    }

    return code.trim();
  }

  private compareFormats(perchance: FormatOutput, html: FormatOutput): { format: 'perchance' | 'html'; reason: string } {
    if (html.qualityScore && perchance.qualityScore && html.qualityScore > perchance.qualityScore) {
      return {
        format: 'html',
        reason: `HTML format has higher quality score (${html.qualityScore.toFixed(2)} vs ${perchance.qualityScore.toFixed(2)})`
      };
    }

    if (perchance.qualityScore && html.qualityScore && perchance.qualityScore > html.qualityScore) {
      return {
        format: 'perchance',
        reason: `Perchance format has higher quality score (${perchance.qualityScore.toFixed(2)} vs ${html.qualityScore.toFixed(2)})`
      };
    }

    return {
      format: 'perchance',
      reason: 'Perchance format is simpler and more maintainable for this use case'
    };
  }

  private calculateQualityScore(validation: ValidationResult): number {
    let score = 1.0;
    score -= validation.errors.length * 0.3;
    score -= validation.warnings.length * 0.1;
    if (validation.stats.hasOutput) score += 0.1;
    if (validation.stats.listCount >= 3) score += 0.1;
    if (validation.stats.totalItems >= 15) score += 0.1;
    return Math.min(1, Math.max(0, score));
  }
}

/**
 * Multi-Format Generator for Autonomous Perchance Agent System
 * Intelligently generates both .perchance list format and HTML format (main.pjs + index.html)
 */

import { validatePerchance } from '../core/validator.js';
import { previewRolls } from '../core/exporter.js';
import Groq from 'groq-sdk';
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
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  /**
   * Generate in the optimal format based on topic complexity and requirements
   */
  async generateOptimalFormat(request: MultiFormatRequest): Promise<FormatOutput> {
    // If format is forced, use that
    if (request.forceFormat) {
      if (request.forceFormat === 'perchance') {
        return await this.generatePerchanceFormat(request);
      } else {
        return await this.generateHTMLFormat(request);
      }
    }

    // Otherwise, decide based on analysis
    const shouldUseHTML = this.shouldUseHTML(request);

    if (shouldUseHTML) {
      return await this.generateHTMLFormat(request);
    } else {
      return await this.generatePerchanceFormat(request);
    }
  }

  /**
   * Generate both formats for comparison
   */
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

  /**
   * Convert .perchance format to HTML format
   */
  async convertToHTML(perchanceCode: string, topic: string): Promise<FormatOutput> {
    const mainPjs = this.generateMainPJS(perchanceCode, topic);
    const indexHtml = await this.generateIndexHTML(perchanceCode, topic);

    return {
      format: 'html',
      code: `// main.pjs\n${mainPjs}\n\n<!-- index.html -->\n${indexHtml}`,
      files: {
        'main.pjs': mainPjs,
        'index.html': indexHtml
      },
      reason: 'Converted from .perchance list format to HTML interactive format'
    };
  }

  /**
   * Convert HTML format to .perchance format
   */
  async convertToPerchance(mainPjs: string, indexHtml: string): Promise<FormatOutput> {
    // Extract the core logic and convert to list format
    const perchanceCode = await this.extractAndConvert(mainPjs, indexHtml);
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

  /**
   * Decide if HTML format should be used
   */
  private shouldUseHTML(request: MultiFormatRequest): boolean {
    const interactiveKeywords = [
      'game', 'play', 'click', 'button', 'interactive', 'visual',
      'canvas', 'animation', 'simulation', 'explorer', 'map',
      'character creator', 'builder', 'editor', 'tool'
    ];

    const visualKeywords = [
      'image', 'graphic', 'visual', 'art', 'design', 'color',
      'avatar', 'portrait', 'scene', 'background', 'card'
    ];

    const topicLower = request.topic.toLowerCase();

    // Check for interactive features
    const hasInteractiveFeatures = request.interactiveFeatures && request.interactiveFeatures.length > 0;
    const hasVisualElements = request.visualElements && request.visualElements.length > 0;

    // Check topic keywords
    const hasInteractiveKeyword = interactiveKeywords.some(kw => topicLower.includes(kw));
    const hasVisualKeyword = visualKeywords.some(kw => topicLower.includes(kw));

    // Check complexity
    const isComplex = request.complexity === 'complex';

    // Decision logic
    if (hasInteractiveFeatures || hasInteractiveKeyword) return true;
    if (hasVisualElements || hasVisualKeyword && isComplex) return true;
    if (request.category === 'custom' && isComplex) return true;

    return false;
  }

  /**
   * Generate .perchance list format
   */
  private async generatePerchanceFormat(request: MultiFormatRequest): Promise<FormatOutput> {
    const systemPrompt = `You are a Perchance.ai generator expert. Generate ONLY valid .perchance syntax.

Perchance syntax rules:
- List name starts at column 0 (no indent)
- Items are indented with 2 spaces
- Weighted items use ^number (e.g. "common item^3")
- Reference other lists with [listName]
- First list called "output" is shown to users
- Comments start with //

Return ONLY the .perchance code, no explanation.`;

    const userPrompt = `Create a ${request.complexity} Perchance.ai generator for: "${request.topic}"
Category: ${request.category}
Aim for ~15 items per list.
Make it creative, varied, and immediately usable on perchance.org.`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 2048
    });

    const code = completion.choices[0]?.message?.content?.trim() || '';
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

  /**
   * Generate HTML format (main.pjs + index.html)
   */
  public async generateHTMLFormat(request: MultiFormatRequest): Promise<FormatOutput> {
    const mainPjs = await this.generateMainPJSContent(request);
    const indexHtml = await this.generateIndexHTMLContent(request);

    const code = `// main.pjs\n${mainPjs}\n\n<!-- index.html -->\n${indexHtml}`;

    return {
      format: 'html',
      code,
      files: {
        'main.pjs': mainPjs,
        'index.html': indexHtml
      },
      reason: 'Interactive/visual content - HTML format provides better UX'
    };
  }

  /**
   * Generate main.pjs content
   */
  private async generateMainPJSContent(request: MultiFormatRequest): Promise<string> {
    const systemPrompt = `You are a Perchance HTML generator expert. Generate the main.pjs file content.

main.pjs should contain:
- $meta section with title, description, tags
- Root-level variables (worldW, tile, worldSeed, etc.)
- Plugin imports using {import:plugin-name}

Return ONLY the main.pjs code, no explanation.`;

    const userPrompt = `Create main.pjs for: "${request.topic}"
Category: ${request.category}
Complexity: ${request.complexity}
Interactive features: ${request.interactiveFeatures?.join(', ') || 'none'}
Visual elements: ${request.visualElements?.join(', ') || 'none'}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1024
    });

    return completion.choices[0]?.message?.content?.trim() || this.getDefaultMainPJS(request);
  }

  /**
   * Generate index.html content
   */
  private async generateIndexHTMLContent(request: MultiFormatRequest): Promise<string> {
    const systemPrompt = `You are a Perchance HTML generator expert. Generate the index.html file content.

index.html should contain:
- HTML structure with appropriate elements
- CSS styles in <style> tags
- JavaScript in <script type="module"> tags
- Plugin usage with [PluginName(...)] syntax
- Access to root.* variables from main.pjs

Return ONLY the index.html code, no explanation.`;

    const userPrompt = `Create index.html for: "${request.topic}"
Category: ${request.category}
Complexity: ${request.complexity}
Interactive features: ${request.interactiveFeatures?.join(', ') || 'none'}
Visual elements: ${request.visualElements?.join(', ') || 'none'}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content?.trim() || this.getDefaultIndexHTML(request);
  }

  /**
   * Generate main.pjs from .perchance code
   */
  private generateMainPJS(perchanceCode: string, topic: string): string {
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

  /**
   * Generate index.html from .perchance code
   */
  private async generateIndexHTML(perchanceCode: string, topic: string): Promise<string> {
    const systemPrompt = `You are a Perchance HTML generator expert. Convert .perchance list code to index.html format.

Create an interactive HTML interface that:
- Displays the generator content
- Has buttons to generate new results
- Shows nice styling and layout
- Uses root.* variables from main.pjs

Return ONLY the index.html code, no explanation.`;

    const userPrompt = `Convert this .perchance code to interactive index.html:
${perchanceCode}

Topic: ${topic}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content?.trim() || this.getDefaultIndexHTML({ topic });
  }

  /**
   * Extract and convert HTML to .perchance
   */
  private async extractAndConvert(mainPjs: string, indexHtml: string): Promise<string> {
    const systemPrompt = `You are a Perchance expert. Convert HTML generator code back to .perchance list format.

Extract the core generation logic and convert it to .perchance syntax:
- Create lists for different data types
- Use weighted items (^number) for variety
- Reference lists with [listName]
- First list should be "output"

Return ONLY the .perchance code, no explanation.`;

    const userPrompt = `Convert this HTML generator to .perchance format:

main.pjs:
${mainPjs}

index.html:
${indexHtml}`;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }

  /**
   * Compare two formats and recommend the best one
   */
  private compareFormats(perchance: FormatOutput, html: FormatOutput): { format: 'perchance' | 'html'; reason: string } {
    // If HTML has better quality score, recommend HTML
    if (html.qualityScore && perchance.qualityScore && html.qualityScore > perchance.qualityScore) {
      return {
        format: 'html',
        reason: `HTML format has higher quality score (${html.qualityScore.toFixed(2)} vs ${perchance.qualityScore.toFixed(2)})`
      };
    }

    // If perchance has better quality score, recommend perchance
    if (perchance.qualityScore && html.qualityScore && perchance.qualityScore > html.qualityScore) {
      return {
        format: 'perchance',
        reason: `Perchance format has higher quality score (${perchance.qualityScore.toFixed(2)} vs ${html.qualityScore.toFixed(2)})`
      };
    }

    // Default to perchance for simplicity
    return {
      format: 'perchance',
      reason: 'Perchance format is simpler and more maintainable for this use case'
    };
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(validation: ValidationResult): number {
    let score = 1.0;
    score -= validation.errors.length * 0.3;
    score -= validation.warnings.length * 0.1;
    if (validation.stats.hasOutput) score += 0.1;
    if (validation.stats.listCount >= 3) score += 0.1;
    if (validation.stats.totalItems >= 15) score += 0.1;
    if (validation.stats.hasNested) score += 0.1;
    if (validation.stats.hasWeighted) score += 0.05;
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Get default main.pJS content
   */
  private getDefaultMainPJS(request: MultiFormatRequest): string {
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

  /**
   * Get default index.html content
   */
  private getDefaultIndexHTML(request: MultiFormatRequest | { topic: string }): string {
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
  // Add your generation logic here
  resultDiv.textContent = 'Generated: ' + Math.random().toString(36).substring(7);
});
</script>`;
  }
}
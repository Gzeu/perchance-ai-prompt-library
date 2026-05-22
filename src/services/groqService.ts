import Groq from 'groq-sdk';

const PERCHANCE_SYSTEM_PROMPT = `You are an expert in Perchance.org generator syntax. Your job is to generate valid, working Perchance generators.

PERCHANCE SYNTAX RULES:
1. A generator is made of named lists. Each list name is on its own line followed by entries indented with 2 spaces.
2. The first list is the "output" list — this is what gets shown when generating.
3. Reference other lists with [listName] inside entries.
4. Use {a|b|c} for inline choices.
5. Use {N-M} for random numbers in range.
6. Use [^listName] to import another generator's list.
7. Weights: add a number after an entry with a space (e.g. "common item  5" means 5x more likely).
8. Use \\n for newlines in output.
9. JavaScript is allowed in <script> blocks for advanced logic.
10. Comments start with //

EXAMPLE — Simple Character Generator:
output
  [name] is a [adjective] [race] [class] who [motivation]

name
  Aria
  Brom
  Cael
  Dwyn
  Eris

adjective
  brave
  cunning
  ancient
  mysterious
  fierce

race
  human
  elf
  dwarf
  halfling
  tiefling

class
  warrior
  mage
  rogue
  ranger
  cleric

motivation
  seeks revenge
  protects the innocent
  hunts ancient artifacts
  wanders without purpose
  serves a forgotten god

EXAMPLE — Master Generator with imports:
output
  # [^character-generator.output]\n**Location:** [^location-generator.output]\n**Quest:** [^quest-generator.output]

RULES FOR YOUR OUTPUT:
- Output ONLY the raw Perchance code, no markdown code blocks, no explanations
- Always start with the "output" list
- Include at least 8-15 items per list for variety
- For master generators, use import syntax [^gen-name.listName]
- Make it creative and thematic — users want interesting, varied results
- Lists must be separated by a blank line
- Indentation must be exactly 2 spaces (not tabs)`;

export interface GroqGenerateOptions {
  category: string;
  description: string;
  complexity: 'simple' | 'medium' | 'master';
  theme?: string;
  model?: string;
}

export interface GroqGenerateResult {
  code: string;
  model: string;
  tokensUsed: number;
  generationTime: number;
}

export class GroqService {
  private client: Groq;
  private defaultModel = 'llama-3.3-70b-versatile';

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY environment variable is required');
    this.client = new Groq({ apiKey });
  }

  async generatePerchanceCode(options: GroqGenerateOptions): Promise<GroqGenerateResult> {
    const { category, description, complexity, theme, model } = options;
    const startTime = Date.now();

    const complexityInstructions = {
      simple: 'Create a simple generator with 3-5 lists, each with 8-12 items.',
      medium: 'Create a medium generator with 5-8 lists, each with 10-15 items. Include some nested references.',
      master: 'Create a MASTER generator that combines multiple sub-generators using [^import] syntax. Include 8-12 lists with 15-20 items each. Make it comprehensive and production-ready.'
    };

    const userPrompt = `Create a Perchance.org generator for the following:

Category: ${category}
Description: ${description}${theme ? `\nTheme/Style: ${theme}` : ''}
Complexity: ${complexity}

${complexityInstructions[complexity]}

Generate the complete Perchance code now:`;

    const completion = await this.client.chat.completions.create({
      model: model || this.defaultModel,
      messages: [
        { role: 'system', content: PERCHANCE_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: complexity === 'master' ? 4096 : 2048,
      top_p: 0.9
    });

    const code = completion.choices[0]?.message?.content?.trim() || '';
    const cleanCode = this.cleanOutput(code);

    return {
      code: cleanCode,
      model: model || this.defaultModel,
      tokensUsed: completion.usage?.total_tokens || 0,
      generationTime: Date.now() - startTime
    };
  }

  async refineCode(originalCode: string, refinementRequest: string): Promise<GroqGenerateResult> {
    const startTime = Date.now();

    const completion = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: PERCHANCE_SYSTEM_PROMPT },
        { role: 'user', content: `Here is an existing Perchance generator:\n\n${originalCode}\n\nPlease modify it as follows: ${refinementRequest}\n\nOutput only the updated Perchance code:` }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const code = completion.choices[0]?.message?.content?.trim() || '';
    return {
      code: this.cleanOutput(code),
      model: this.defaultModel,
      tokensUsed: completion.usage?.total_tokens || 0,
      generationTime: Date.now() - startTime
    };
  }

  async generateIdeas(category: string, count = 5): Promise<string[]> {
    const completion = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You generate creative ideas for Perchance.org random generators. Output ONLY a JSON array of strings, no explanation.' },
        { role: 'user', content: `Generate ${count} creative Perchance generator ideas for the category: "${category}". Each idea should be a short descriptive title. Output as JSON array.` }
      ],
      temperature: 1.0,
      max_tokens: 500
    });

    try {
      const content = completion.choices[0]?.message?.content || '[]';
      const match = content.match(/\[.*\]/s);
      return match ? JSON.parse(match[0]) : [];
    } catch {
      return [];
    }
  }

  private cleanOutput(code: string): string {
    return code
      .replace(/^```[a-z]*\n?/gm, '')
      .replace(/^```$/gm, '')
      .trim();
  }

  validatePerchanceCode(code: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const lines = code.split('\n');
    const lists: string[] = [];
    let currentList = '';
    let hasOutput = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || line.trim().startsWith('//')) continue;

      if (!line.startsWith(' ') && !line.startsWith('\t')) {
        currentList = line.trim();
        lists.push(currentList);
        if (currentList === 'output') hasOutput = true;
      }
    }

    if (!hasOutput) errors.push('Missing required "output" list');
    if (lists.length < 2) warnings.push('Generator has very few lists — consider adding more variety');

    const refs = code.match(/\[([a-zA-Z][a-zA-Z0-9_-]*)\]/g) || [];
    for (const ref of refs) {
      const listName = ref.slice(1, -1);
      if (!listName.startsWith('^') && !lists.includes(listName)) {
        warnings.push(`Reference [${listName}] not found in this generator (may be an import)`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}

export const groqService = new GroqService();

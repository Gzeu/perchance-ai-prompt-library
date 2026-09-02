/**
 * Template Library — perchance-native generation
 * Generates .perchance code from topic + category using curated word banks.
 * No external AI required — everything is perchance-generated.
 */

import type { PerchanceCategory, GeneratorStyle } from '../types/perchance.js';

// Word banks organized by category. Each category has multiple list-name → items.
const WORD_BANKS: Record<PerchanceCategory, Record<string, string[]>> = {
  names: {
    prefix: ['Al ', 'Vor', 'Isp', 'Zep', 'Mord', 'Eldr', 'Thal', 'Drak', 'Grym', 'Vex', 'Kra', 'Nyx', 'Or'],
    suffix: ['dor', 'mir', 'thor', 'ric', 'ion', 'iel', 'ion', 'us', 'an', 'is', 'ar', 'or'],
    modifier: ['Cel Rătăcios', 'Cel Curajos', 'Cel Înțelept', 'Cel Puternic', 'Cel Rapid', 'Cel Înalt'],
  },
  characters: {
    title: ['Găluștean', 'Vânător', 'Negustor', 'Arcanist', 'Pescar', 'Cioban', 'Focareală', 'Oamă de Piatră', 'Cavaler', 'Pelerin'],
    trait: ['înțelept', 'curajos', 'învinovățitor', 'țelțuros', 'misterios', 'îndrăzneal', 'pțelitor', 'cinstit', 'rătăcios', 'înscrutabil'],
    weapon: ['Săgeata Luminii', 'țigară de Foc', 'Cimitirul Vremii', 'Înțelesul Întunericului', 'Codria Stelelor', 'Talismanul Vântului'],
  },
  scenes: {
    location: ['peștera de sticlă', 'împădurarea susurătoare', 'căldărașul de foc', 'biblioteca uitată', 'podul suspendat', 'împăsăcra de nuanțe'],
    atmosphere: ['în care lumânările clipește stingher', 'unde ecourile vorbesc', 'în care norii se ciocnesc cu munți', 'unde fiecare pas face un zgomot', 'în care timpul curge înapoi'],
    time: ['pe la amurgirea stelelor', 'în noaptea fără linie de orizont', 'pe când luna este un crimț', 'în clipa cea mai întunecată'],
  },
  items: {
    adjective: ['celestial', 'abisal', 'învinovățitor', 'învechit', 'proaspăt', 'ascuns', 'interzis', 'următor'],
    material: ['sticlă captivă', 'os de balenă', 'corali pietrificati', 'perle negre', 'aramă veche', 'oțel cosmici'],
    property: ['șoptește numele celui ce-l ține', 'luminează peștele la o leghe distanță', 'reține respirația celui ce-l ridică', 'cheamă creaturile adâncului', 'înălță privirea spre stele'],
  },
  dialogue: {
    topic: ['o zbor de păsări uciști', 'povestea unui vis pierdut', 'ce se întâmplă când toare lumina se stinge', 'despre iubirea unui foc'],
    question: ['Ai văzut vreodată o stea cădea?', 'Ce ți-ai dori să ți-o spună luna?', 'De ce ți-ai pus numele așa?', 'Ce ascizi în portofelul tău?'],
    response: ['Nu am văzut-o, dar am auzit ecoul ei.', 'Luna îmi spune segrete pe care nu le pot ține.', 'Pentru că am vrut să am un nume ca al tău.', 'Doar o fotografie și un vis pe care-l încă trăiesc.'],
  },
  images: {
    prompt: ['a fantasy landscape', 'a mystical forest', 'an ancient ruin', 'a cosmic scene', 'a dreamlike vision', 'a dark fantasy creature', 'a medieval tavern', 'an underwater city'],
    style: ['digital art', 'oil painting', 'watercolor', 'concept art', 'pixel art', 'illustration', '3d render', 'comic art'],
    detail: ['highly detailed', 'cinematic lighting', 'ultra realistic', 'studio quality', '4k resolution', 'intricate', 'epic composition'],
  },
  loot: {
    rarity: ['Comun', 'Rar', 'EPIC', 'LEGENDAR', 'MITIC', 'COSMIC'],
    item: ['Monedă de Argint', 'Inel de Cremă', 'Amuleta Uitată', 'Scutul Împrumutat', 'Spada Fără Coafă', 'Pelerina de Praz'],
    property: ['+5 la toți evorășmentele', '+10 la norocul critic', 'Nivel de împiedicare: 7', 'Valoare de schimb: 100 de monede'],
  },
  quests: {
    type: ['Căutare în Temeri', 'Răfuieli', 'Explorare Periculoasă', 'Schimb de Înțelegări', 'Puntărești'],
    objective: ['găsește cheia pierdută', 'du-mi pesanele la spital', 'înfruntă-ți grotașul', 'descoperă-ți originea', 'învinge-ți stimența'],
    reward: ['o cutie de aur', 'o armură veche', 'un tratat de arcane', 'o mapă secretă', 'un pergament de aur'],
  },
  custom: {
    subject: ['entitate', 'eveniment', 'loc', 'relicva', 'figură'],
    adjective: ['înțelept', 'ciudățos', 'învinovățitor', 'ascuns', 'veșnic', 'interzis'],
    descriptor: ['care pare a fi', 'ce poate', 'ce va', 'care totuși'],
  },
};

export interface GenerateOptions {
  topic: string;
  category: PerchanceCategory;
  style: GeneratorStyle;
  itemCount: number;
}

export class TemplateLibrary {
  /**
   * List all available template categories and the word bank lists within each.
   * Useful for browsing templates programmatically (MCP `list_templates` / UI).
   */
  listTemplates(): { category: PerchanceCategory; lists: string[] }[] {
    return Object.entries(WORD_BANKS).map(([category, bank]) => ({
      category: category as PerchanceCategory,
      lists: Object.keys(bank),
    }));
  }

  /**
   * Get the word bank for a specific category — all lists and their items.
   */
  getTemplate(category: PerchanceCategory): Record<string, string[]> {
    return WORD_BANKS[category] || {};
  }

  /**
   * Generate .perchance code from topic + category + style using word banks.
   */
  generate(options: GenerateOptions): string {
    const { topic, category, style, itemCount } = options;
    const bank = WORD_BANKS[category] || WORD_BANKS.custom;
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const bankSize = Math.max(5, Math.min(itemCount, Object.keys(bank).length > 0 ? itemCount : 10));

    let code = '';

    // Title & description
    if (category === 'images') {
      code += `title\n  ${topic} generator\n`;
      code += `description = Generate random ${topic} prompts\n`;
    } else {
      code += `title\n  ${topic}\n`;
      code += `description = Un generator perchance pentru "${topic}"\n`;
    }
    code += `tags = ${slug}, ${category}, generator\n\n`;

    // Output list
    code += 'output\n';
    code += `  ${this.renderOutputTemplate(bank, category, topic)}\n`;

    // List definitions
    for (const [listName, items] of Object.entries(bank)) {
      if (listName === 'output') continue;
      const sampled = this.sampleItems(items, bankSize);
      code += `\n${listName}\n`;
      for (const item of sampled) {
        if (style === 'weighted' || style === 'complex') {
          const weight = Math.floor(Math.random() * 3) + 1;
          code += `  ${item}^${weight}\n`;
        } else {
          code += `  ${item}\n`;
        }
      }
    }

    return code.trim();
  }

  /**
   * Render the output template for a given category.
   */
  private renderOutputTemplate(
    bank: Record<string, string[]>,
    category: PerchanceCategory,
    topic: string,
  ): string {
    if (category === 'names') {
      return '[prefix][suffix]';
    }
    if (category === 'characters') {
      return '[title] [trait] cu [weapon]';
    }
    if (category === 'scenes') {
      return `[location] ${bank.atmosphere ? '[atmosphere]' : ''}`;
    }
    if (category === 'items') {
      return `[adjective] ${bank.property ? '[property]' : ''}`;
    }
    if (category === 'dialogue') {
      return '[question]';
    }
    if (category === 'images') {
      return `${topic} [style], ${topic} [detail] — [prompt]`;
    }
    if (category === 'loot') {
      return `[rarity] ${topic} — [item]`;
    }
    if (category === 'quests') {
      return '[type]: [objective] — recompensă: [reward]';
    }
    return `[subject] [adjective] [descriptor] ${topic}`;
  }

  /**
   * Sample N items from a word bank list, cycling through if needed.
   */
  private sampleItems(items: string[], count: number): string[] {
    if (items.length === 0) return [];

    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * items.length);
      // Ensure variety — don't repeat the same item twice in a row
      let item = items[idx];
      if (result.length > 0 && item === result[result.length - 1] && items.length > 1) {
        const altIdx = (idx + 1) % items.length;
        item = items[altIdx];
      }
      result.push(item);
    }
    return result;
  }
}

/**
 * Improve .perchance code using local validation analysis.
 * No AI — just structural improvements based on validation results.
 */
export function improveGeneratorLocally(
  code: string,
  strategies: ('content-expansion' | 'structure-fix' | 'weight-addition' | 'variety-boost')[] = ['content-expansion'],
): { improvedCode: string; changes: string[] } {
  const changes: string[] = [];
  let improved = code;

  for (const strategy of strategies) {
    switch (strategy) {
      case 'content-expansion': {
        const result = expandContent(improved);
        if (result.changed) {
          improved = result.code;
          changes.push(...result.changes);
        }
        break;
      }
      case 'structure-fix': {
        const result = fixStructure(improved);
        if (result.changed) {
          improved = result.code;
          changes.push(...result.changes);
        }
        break;
      }
      case 'weight-addition': {
        const result = addWeights(improved);
        if (result.changed) {
          improved = result.code;
          changes.push(...result.changes);
        }
        break;
      }
      case 'variety-boost': {
        const result = boostVariety(improved);
        if (result.changed) {
          improved = result.code;
          changes.push(...result.changes);
        }
        break;
      }
    }
  }

  return { improvedCode: improved, changes };
}

interface ImprovementResult {
  code: string;
  changes: string[];
  changed: boolean;
}

function expandContent(code: string): ImprovementResult {
  const changes: string[] = [];
  const lines = code.split('\n');
  const newLines = [...lines];
  const expandedSections = new Set<string>();

  let currentList = '';
  let listStart = -1;
  let inList = false;

  for (let i = 0; i < newLines.length; i++) {
    const line = newLines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('import')) continue;

    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      currentList = trimmed.split(/\s+/)[0];
      listStart = i;
      inList = true;
    } else if (inList) {
      const items = newLines.slice(listStart + 1, i)
        .filter(l => l.trim().startsWith('  ') && !l.trim().startsWith('//'));
      if (items.length < 5 && listStart >= 0 && !expandedSections.has(currentList)) {
        for (let j = 0; j < 3; j++) {
          const newItem = `${currentList}_item_${items.length + j + 1}`;
          newLines.splice(i, 0, `  ${newItem}`);
          i++;
        }
        expandedSections.add(currentList);
        changes.push(`Added 3 items to "${currentList}" list`);
        inList = false;
      }
    }
  }

  if (changes.length === 0) return { code, changes: [], changed: false };

  return { code: newLines.join('\n'), changes, changed: true };
}

function fixStructure(code: string): ImprovementResult {
  const changes: string[] = [];
  const lines = code.split('\n');
  const hasOutput = lines.some(l => l.trim() === 'output');

  if (!hasOutput) {
    lines.unshift('output\n  [main]');
    changes.push('Added missing "output" list');
  }

  return { code: lines.join('\n'), changes, changed: changes.length > 0 };
}

function addWeights(code: string): ImprovementResult {
  const changes: string[] = [];
  const lines = code.split('\n');
  let listStart = -1;
  let hasWeighted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('import')) continue;

    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      listStart = i;
      hasWeighted = false;
    } else if (listStart >= 0) {
      if (trimmed.includes('^')) {
        hasWeighted = true;
      }
    }
  }

  // If no lists have weights, add weights to the first list
  if (!hasWeighted) {
    let listStart2 = -1;
    let listName2 = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('import')) continue;

      if (!line.startsWith(' ') && !line.startsWith('\t')) {
        listName2 = trimmed.split(/\s+/)[0];
        listStart2 = i;
      } else if (listStart2 >= 0 && listName2 !== 'output' && listName2 !== 'title' && listName2 !== 'description' && listName2 !== 'tags') {
        if (trimmed.includes('^')) continue; // Already weighted
        const weight = Math.floor(Math.random() * 2) + 1;
        const idx = lines.indexOf(line, i);
        if (idx >= 0) {
          lines[idx] = `  ${trimmed}^${weight}`;
        }
        break;
      }
    }
    if (listStart2 >= 0) {
      changes.push('Added weighted probabilities to lists');
    }
  }

  return { code: lines.join('\n'), changes, changed: changes.length > 0 };
}

function boostVariety(code: string): ImprovementResult {
  const changes: string[] = [];
  const lines = code.split('\n');
  let added = false;

  const listStarts = lines
    .map((l, i) => ({ line: l, idx: i }))
    .filter(({ line }) => {
      const t = line.trim();
      if (!t || t.startsWith('//') || t.startsWith('import')) return false;
      return !line.startsWith(' ') && !line.startsWith('\t');
    });

  for (const { idx } of listStarts) {
    const listName = lines[idx].trim().split(/\s+/)[0];
    if (['output', 'title', 'description', 'tags'].includes(listName)) continue;

    const items = lines.slice(idx + 1)
      .filter(l => l.trim().startsWith('  ') && !l.trim().startsWith('//'))
      .filter(l => !lines[idx + 1] || l.trim().length > 0);

    if (items.length > 0 && items.length < 8) {
      const newItem = `${listName}_varietate_${Math.floor(Math.random() * 1000)}`;
      lines.splice(idx + 1 + items.length, 0, `  ${newItem}`);
      added = true;
    }
  }

  if (added) {
    changes.push('Added variety items to short lists');
  }

  return { code: lines.join('\n'), changes, changed: added };
}

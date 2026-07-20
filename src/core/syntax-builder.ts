/**
 * Perchance Syntax Builder
 * Builds valid .perchance generator code programmatically
 */

export interface PerchanceItem {
  value: string;
  weight?: number;
}

export interface PerchanceList {
  name: string;
  items: PerchanceItem[];
  isOutput?: boolean;
}

export interface PerchanceGenerator {
  title?: string;
  lists: PerchanceList[];
  imports?: string[];
}

export class SyntaxBuilder {
  private generator: PerchanceGenerator;

  constructor(title?: string) {
    this.generator = { title, lists: [], imports: [] };
  }

  addList(name: string, items: PerchanceItem[], isOutput = false): this {
    this.generator.lists.push({ name, items, isOutput });
    return this;
  }

  addSimpleList(name: string, values: string[], isOutput = false): this {
    return this.addList(name, values.map(v => ({ value: v })), isOutput);
  }

  addWeightedList(name: string, items: Record<string, number>, isOutput = false): this {
    return this.addList(
      name,
      Object.entries(items).map(([value, weight]) => ({ value, weight })),
      isOutput
    );
  }

  addImport(generatorName: string): this {
    this.generator.imports?.push(generatorName);
    return this;
  }

  build(): string {
    const lines: string[] = [];

    if (this.generator.title) {
      lines.push(`// ${this.generator.title}`);
      lines.push('');
    }

    if (this.generator.imports?.length) {
      for (const imp of this.generator.imports) {
        lines.push(`import ${imp}`);
      }
      lines.push('');
    }

    // Output list first
    const outputList = this.generator.lists.find(l => l.isOutput);
    const otherLists = this.generator.lists.filter(l => !l.isOutput);
    const ordered = outputList ? [outputList, ...otherLists] : otherLists;

    for (const list of ordered) {
      lines.push(`${list.name}`);
      for (const item of list.items) {
        if (item.weight && item.weight !== 1) {
          lines.push(`  ${item.value}^${item.weight}`);
        } else {
          lines.push(`  ${item.value}`);
        }
      }
      lines.push('');
    }

    return lines.join('\n').trim();
  }
}

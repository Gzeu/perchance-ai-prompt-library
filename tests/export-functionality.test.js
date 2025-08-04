const { PerchancePromptLibrary } = require('../src/index');
const fs = require('fs');

describe('Export Functionality', () => {
  let library;

  beforeEach(() => {
    library = new PerchancePromptLibrary();
  });

  afterEach(() => {
    // Clean up test files
    const testFiles = ['test-export.json', 'test-export.txt'];
    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  test('should export prompts to JSON format', () => {
    const variations = library.generateVariations('anime', {
      subject: 'test export'
    }, 2);

    // Simulate export to JSON
    const jsonContent = JSON.stringify(variations, null, 2);
    fs.writeFileSync('test-export.json', jsonContent);

    expect(fs.existsSync('test-export.json')).toBe(true);
    
    const importedData = JSON.parse(fs.readFileSync('test-export.json', 'utf8'));
    expect(Array.isArray(importedData)).toBe(true);
    expect(importedData).toHaveLength(2);
    expect(importedData[0]).toHaveProperty('text');
    expect(importedData[0]).toHaveProperty('style');
  });

  test('should export prompts to TXT format', () => {
    const variations = library.generateVariations('cinematic', {
      subject: 'test scene'  
    }, 2);

    // Simulate export to TXT
    const txtContent = variations.map((v, i) => `Prompt ${i+1}:\n${v.text}\n\n`).join('');
    fs.writeFileSync('test-export.txt', txtContent);

    expect(fs.existsSync('test-export.txt')).toBe(true);
    
    const content = fs.readFileSync('test-export.txt', 'utf8');
    expect(content).toContain('Prompt 1:');
    expect(content).toContain('Prompt 2:');
    expect(content).toContain('cinematic');
  });

  test('should handle export with metadata', () => {
    const result = library.generate({
      style: 'photorealistic',
      subject: 'portrait'
    });

    const exportData = {
      prompt: result.text,
      style: result.style,
      metadata: result.metadata,
      timestamp: result.timestamp
    };

    fs.writeFileSync('test-export.json', JSON.stringify(exportData, null, 2));
    
    const imported = JSON.parse(fs.readFileSync('test-export.json', 'utf8'));
    expect(imported).toHaveProperty('prompt');
    expect(imported).toHaveProperty('metadata');
    expect(imported.metadata).toHaveProperty('wordCount');
    expect(imported.metadata).toHaveProperty('characterCount');
  });
});

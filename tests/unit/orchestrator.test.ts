jest.mock('../../src/services/groqService.js', () => ({
  SYSTEM_PROMPT: 'system',
  FAST_MODEL: 'fast',
  isGroqConfigured: () => true,
  cleanCode: (raw: string) => raw,
  callGroq: jest.fn().mockResolvedValue(`output
  test line

list
  a
  b`)
}));

import { selectAgentsForRequest, previewAgentsForRequest } from '../../src/agents/registry';
import { UltraAgenticOrchestrator } from '../../src/agents/orchestrator';

describe('agentic registry', () => {
  it('selects character expert for character category', () => {
    const agents = selectAgentsForRequest('make npc names', 'characters');
    expect(agents.length).toBeLessThanOrEqual(3);
    expect(agents.some((a) => a.id === 'character-expert')).toBe(true);
  });

  it('selects world builder for locations', () => {
    const agents = selectAgentsForRequest('fantasy city', 'locations');
    expect(agents.some((a) => a.id === 'world-builder')).toBe(true);
  });

  it('previewAgentsForRequest returns summaries with bio', () => {
    const preview = previewAgentsForRequest('fantasy weapon', 'items');
    expect(preview.length).toBeGreaterThan(0);
    expect(preview[0].bio).toBeTruthy();
  });
});

describe('UltraAgenticOrchestrator', () => {
  it('runs brainstorm pipeline with mocked Groq', async () => {
    const orchestrator = new UltraAgenticOrchestrator(
      require('path').join(require('os').tmpdir(), 'perchance-agentic-test')
    );
    const session = await orchestrator.brainstorm('tavern name generator', {
      category: 'names',
      iterations: 1,
      complexity: 'simple'
    });

    expect(session.code).toContain('output');
    expect(session.agentsUsed.length).toBeGreaterThan(0);
    expect(session.selectedAgents.length).toBeGreaterThan(0);
    expect(session.debateRounds).toBe(1);
    expect(session.validation).toBeDefined();
    expect(typeof session.memoryUsed).toBe('boolean');
  });
});

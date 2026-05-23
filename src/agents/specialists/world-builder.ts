import type { AgentDefinition } from '../registry';

export const worldBuilder: AgentDefinition = {
  id: 'world-builder',
  name: 'WorldBuilder',
  skills: [
    { name: 'WorldCoherence', score: 9.6 },
    { name: 'AtmosphereCreation', score: 9.3 },
    { name: 'LoreConsistency', score: 9.5 }
  ],
  expertise: ['locations', 'worlds', 'fantasy', 'scifi', 'places', 'settings'],
  systemPromptFragment:
    'Focus on places, atmospheres, sensory details, and coherent world-building lists. Build location and ambiance vocabulary.'
};

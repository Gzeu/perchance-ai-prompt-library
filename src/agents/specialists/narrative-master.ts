import type { AgentDefinition } from '../registry';

export const narrativeMaster: AgentDefinition = {
  id: 'narrative-master',
  name: 'NarrativeMaster',
  skills: [
    { name: 'NarrativeDepth', score: 9.8 },
    { name: 'PlotStructure', score: 9.4 },
    { name: 'Pacing', score: 9.1 }
  ],
  expertise: ['stories', 'plots', 'events', 'encounters', 'writing'],
  systemPromptFragment:
    'Focus on story beats, plot twists, scene framing, and narrative flow in the output format. Use lists that chain into compelling sequences.'
};

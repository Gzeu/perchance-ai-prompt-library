import type { AgentDefinition } from '../registry';

export const characterExpert: AgentDefinition = {
  id: 'character-expert',
  name: 'CharacterExpert',
  skills: [
    { name: 'NarrativeDepth', score: 9.4 },
    { name: 'PersonalityConsistency', score: 9.7 },
    { name: 'BackstoryRichness', score: 9.2 }
  ],
  expertise: ['characters', 'npcs', 'dialogue', 'names', 'personality'],
  systemPromptFragment:
    'Focus on vivid characters, personality traits, dialogue hooks, and memorable NPC details. Prefer lists for traits, roles, and speech patterns.'
};

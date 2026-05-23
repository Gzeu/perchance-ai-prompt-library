import type { AgentDefinition } from '../registry';

export const creativityBooster: AgentDefinition = {
  id: 'creativity-booster',
  name: 'CreativityBooster',
  bio: 'Maximizes variety, surprise, and rich item combinations.',
  skills: [
    { name: 'Originality', score: 9.7 },
    { name: 'SurpriseFactor', score: 9.5 },
    { name: 'Variety', score: 9.4 }
  ],
  expertise: ['creative', 'random', 'unique', 'items', 'magic', 'surreal'],
  systemPromptFragment:
    'Maximize variety and surprise. Use rich vocabulary, unexpected combinations, and at least 12-15 items per list.'
};

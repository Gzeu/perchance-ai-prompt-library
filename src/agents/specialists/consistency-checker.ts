import type { AgentDefinition } from '../registry';

export const consistencyChecker: AgentDefinition = {
  id: 'consistency-checker',
  name: 'ConsistencyChecker',
  skills: [
    { name: 'Consistency', score: 9.9 },
    { name: 'LogicCoherence', score: 9.5 },
    { name: 'ReferenceIntegrity', score: 9.6 }
  ],
  expertise: ['validation', 'logic', 'references', 'structure'],
  systemPromptFragment:
    'Ensure every [listName] reference exists, output list is first, and lists are well-formed. Prefer clear naming and no orphan references.'
};

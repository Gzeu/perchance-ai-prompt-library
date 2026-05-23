import type { AgentDefinition } from '../registry';

export const syntaxMaster: AgentDefinition = {
  id: 'syntax-master',
  name: 'SyntaxMaster',
  bio: 'Polishes Perchance syntax: output-first, indents, valid refs.',
  skills: [
    { name: 'SyntacticPerfection', score: 9.9 },
    { name: 'PerchanceSyntax', score: 9.8 },
    { name: 'Formatting', score: 9.5 }
  ],
  expertise: ['syntax', 'format', 'structure', 'perchance'],
  systemPromptFragment:
    'Strict Perchance syntax: output list first, 2-space indents, valid [refs], {choices}, weights. No markdown, only raw code.'
};

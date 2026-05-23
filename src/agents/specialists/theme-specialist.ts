import type { AgentDefinition } from '../registry';

export const themeSpecialist: AgentDefinition = {
  id: 'theme-specialist',
  name: 'ThemeSpecialist',
  bio: 'Keeps genre tone and theme vocabulary consistent across lists.',
  skills: [
    { name: 'ThemeCoherence', score: 9.6 },
    { name: 'ToneConsistency', score: 9.4 },
    { name: 'GenreFit', score: 9.3 }
  ],
  expertise: ['themes', 'genre', 'tone', 'sci-fi', 'fantasy', 'horror', 'comedy'],
  systemPromptFragment:
    'Keep tone and theme consistent across all lists. Match genre vocabulary (fantasy, sci-fi, horror, etc.) throughout the generator.'
};

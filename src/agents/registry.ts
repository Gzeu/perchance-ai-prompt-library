import type { Agent } from '../types/agentic';
import { characterExpert } from './specialists/character-expert';
import { worldBuilder } from './specialists/world-builder';
import { narrativeMaster } from './specialists/narrative-master';
import { consistencyChecker } from './specialists/consistency-checker';
import { creativityBooster } from './specialists/creativity-booster';
import { syntaxMaster } from './specialists/syntax-master';
import { themeSpecialist } from './specialists/theme-specialist';

export interface AgentDefinition extends Agent {
  systemPromptFragment: string;
}

export const AGENT_REGISTRY: AgentDefinition[] = [
  characterExpert,
  worldBuilder,
  narrativeMaster,
  consistencyChecker,
  creativityBooster,
  syntaxMaster,
  themeSpecialist
];

const CATEGORY_AGENT_MAP: Record<string, string[]> = {
  characters: ['character-expert', 'narrative-master', 'theme-specialist'],
  locations: ['world-builder', 'theme-specialist', 'creativity-booster'],
  items: ['creativity-booster', 'theme-specialist', 'syntax-master'],
  stories: ['narrative-master', 'character-expert', 'theme-specialist'],
  dialogue: ['character-expert', 'narrative-master', 'syntax-master'],
  encounters: ['narrative-master', 'world-builder', 'creativity-booster'],
  'sci-fi': ['world-builder', 'theme-specialist', 'creativity-booster'],
  writing: ['narrative-master', 'creativity-booster', 'syntax-master'],
  names: ['character-expert', 'creativity-booster', 'syntax-master'],
  events: ['narrative-master', 'world-builder', 'theme-specialist'],
  magic: ['creativity-booster', 'theme-specialist', 'world-builder'],
  master: ['syntax-master', 'consistency-checker', 'narrative-master']
};

const KEYWORD_AGENT_BOOST: Record<string, string[]> = {
  character: ['character-expert'],
  npc: ['character-expert'],
  dialogue: ['character-expert'],
  location: ['world-builder'],
  world: ['world-builder'],
  place: ['world-builder'],
  story: ['narrative-master'],
  plot: ['narrative-master'],
  item: ['creativity-booster'],
  weapon: ['creativity-booster'],
  name: ['character-expert'],
  fantasy: ['theme-specialist', 'world-builder'],
  scifi: ['theme-specialist', 'world-builder'],
  horror: ['theme-specialist'],
  syntax: ['syntax-master'],
  validate: ['consistency-checker']
};

const MAX_AGENTS = 3;

/**
 * Select up to 3 agents by category and prompt keywords.
 */
export function selectAgentsForRequest(prompt: string, category?: string): AgentDefinition[] {
  const scores = new Map<string, number>();

  for (const agent of AGENT_REGISTRY) {
    scores.set(agent.id, 0);
  }

  const catKey = category?.toLowerCase().replace(/\s+/g, '-') || '';
  const mapped = CATEGORY_AGENT_MAP[catKey];
  if (mapped) {
    mapped.forEach((id, i) => scores.set(id, (scores.get(id) || 0) + 3 - i));
  }

  const promptLower = prompt.toLowerCase();
  for (const [keyword, agentIds] of Object.entries(KEYWORD_AGENT_BOOST)) {
    if (promptLower.includes(keyword)) {
      for (const id of agentIds) {
        scores.set(id, (scores.get(id) || 0) + 2);
      }
    }
  }

  // Always include syntax master for final quality
  scores.set('syntax-master', (scores.get('syntax-master') || 0) + 1);

  const sorted = [...AGENT_REGISTRY]
    .map((agent) => ({ agent, score: scores.get(agent.id) || 0 }))
    .sort((a, b) => b.score - a.score);

  const picked: AgentDefinition[] = [];
  for (const { agent, score } of sorted) {
    if (picked.length >= MAX_AGENTS) break;
    if (score > 0 || picked.length === 0) {
      picked.push(agent);
    }
  }

  if (picked.length === 0) {
    return AGENT_REGISTRY.slice(0, MAX_AGENTS);
  }

  // Ensure syntax-master is in the set for refine step
  if (!picked.some((a) => a.id === 'syntax-master') && picked.length < MAX_AGENTS) {
    const syntax = AGENT_REGISTRY.find((a) => a.id === 'syntax-master');
    if (syntax) picked.push(syntax);
  }

  return picked.slice(0, MAX_AGENTS);
}

export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((a) => a.id === id);
}

export function listAgentsStatus() {
  return AGENT_REGISTRY.map(({ id, name, skills, expertise }) => ({
    id,
    name,
    skills,
    expertise
  }));
}

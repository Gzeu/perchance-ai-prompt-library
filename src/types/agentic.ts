export interface AgentSkill {
  name: string;
  score: number;
}

export interface Agent {
  id: string;
  name: string;
  bio: string;
  skills: AgentSkill[];
  expertise: string[];
}

export interface SelectedAgentSummary {
  id: string;
  name: string;
  bio: string;
  skills: AgentSkill[];
  expertise: string[];
}

export interface GeneratedVariant {
  id: string;
  content: string;
  score: number;
  agent: string;
  skillsUsed: AgentSkill[];
}

export interface BrainstormSession {
  prompt: string;
  bestVariant: GeneratedVariant;
  allVariants: GeneratedVariant[];
  agentsUsed: string[];
  finalScore: number;
}

export interface PerchanceValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AgenticSessionResult extends BrainstormSession {
  code: string;
  validation: PerchanceValidation;
  debateRounds: number;
  generationTime: number;
  category?: string;
  complexity?: string;
  selectedAgents: SelectedAgentSummary[];
  memoryUsed: boolean;
}
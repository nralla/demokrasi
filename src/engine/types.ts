// Core type definitions for the simulation engine

export interface VoterGroup {
  name: string;
  desc: string;
  color: string; // hex
  weight: number;
  ideals: Record<string, number>;
  stat_weights: Record<string, number>;
  cynicism_speed: number;
}

export interface PolicyDef {
  name: string;
  cat: string;
  cost: number;
  revenue: number;
  color: string;
}

export interface StatDef {
  name: string;
  good_high: boolean;
  base: number;
}

export interface LeverDef {
  id: string;
  name: string;
  hint: string;
  keys: string[];
  color: string;
}

export interface PolicyPreset {
  name: string;
  desc: string;
  levers: Record<string, number>;
}

export interface MinisterRole {
  name: string;
  policy: string;
}

export interface MinisterCandidate {
  name: string;
  skill: number;
  scandal_risk: number;
  campaigning: number;
  trait: string;
  story: string;
  special: string;
  weakness: string;
  policy_pref: Record<string, string>;
  pleases: string[];
  angers: string[];
  scandal_text: string;
  hidden_agenda: string;
}

export interface CoalitionParty {
  name: string;
  seats: number;
  mood_boost: number;
  mood_penalty: number;
  anger: number;
  pleases: string[];
  angers: string[];
  cost_text: string;
}

export interface SocialTrend {
  tag: string;
  desc: string;
  boosts: Record<string, number>;
  penalties: Record<string, number>;
}

export interface CrisisTrigger {
  name: string;
  desc: string;
  priority: number;
  stat_deltas: Record<string, number>;
  group_mood: Record<string, number>;
  group_anger?: Record<string, number>;
}

export interface RegionDef {
  name: string;
  weight: number;
  policy_sensitivity: Record<string, number>;
  stat_weights: Record<string, number>;
}

export interface EventDef {
  title: string;
  text: string;
  requires?: Record<string, any>;
  stat_deltas?: Record<string, number>;
  group_mood?: Record<string, number>;
  group_anger?: Record<string, number>;
  stat_range?: Record<string, [number, number]>;
}

export interface DilemmaDef {
  title: string;
  text: string;
  choices: DilemmaChoice[];
}

export interface DilemmaChoice {
  label: string;
  result_text: string;
  stat_deltas?: Record<string, number>;
  group_mood?: Record<string, number>;
  group_anger?: Record<string, number>;
}

export interface LeakDef {
  title: string;
  text: string;
  choices: LeakChoice[];
}

export interface LeakChoice {
  label: string;
  result_text: string;
  stat_deltas?: Record<string, number>;
  group_mood?: Record<string, number>;
}

export interface TermGoal {
  type: string;
  text: string;
  reward: string;
  check: (pm: any, vs: any, eco: any) => boolean;
}

export interface EconomyState {
  budget_balance: number;
  public_debt: number;
  current_account: number;
  usd_try: number;
  gdp_growth: number;
  populism_debt: number;
  structural_flow: number;
  gdp_index: number;
  business_confidence: number;
  foreign_investment: number;
}

export interface TurnLogEntry {
  turn: number;
  text: string;
  color: string;
  type: 'event' | 'dilemma' | 'crisis' | 'leak' | 'trend' | 'info' | 'warning' | 'success';
}

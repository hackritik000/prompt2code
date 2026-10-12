/**
 * Type definitions for Campus Lost & Found Matcher.
 */

export type ItemType = 'lost' | 'found';
export type ItemStatus = 'open' | 'claimed';

export interface Item {
  id: string;
  type: ItemType;
  category: string;
  color: string;
  location: string;
  date: string;
  description: string;
  status: ItemStatus;
  pair?: string;
}

export type SimilarityPartKey =
  | 'category'
  | 'color'
  | 'location'
  | 'date'
  | 'description';

export interface SimilarityParts {
  category: number;
  color: number;
  location: number;
  date: number;
  description: number | null;
}

export interface MatchComparison {
  pct: number;
  parts: SimilarityParts;
}

export interface MatchCandidate extends MatchComparison {
  item: Item;
}

export type AiProvider = 'gemini' | 'openai';

export interface AiConfig {
  provider: AiProvider;
  key?: string;
  model?: string;
  base?: string;
}

export interface AiResponse {
  score: number;
  reason: string;
}

export type TabId = 'report' | 'lost' | 'found' | 'matches' | 'items';

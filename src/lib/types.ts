export interface CardType {
  id?: string;
  user_id?: string;
  front: string;
  back: string;
  difficulty: string;
  deck: string;
  score: number;
  created_at?: string;
}

export interface SessionType {
  id?: string;
  user_id?: string;
  pct: number;
  total: number;
  difficulty: string;
  created_at?: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type ReviewMode = 'classic' | 'exam';

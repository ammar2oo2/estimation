export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export interface RoundResult {
  playerId: string;
  prediction: number;
  actual: number;
  result: 'exact' | 'missed' | 'over';
  score: number;
}

export interface Round {
  id: string;
  results: RoundResult[];
}

export interface GameState {
  players: Player[];
  rounds: Round[];
  targetScore: number;
  gameStarted: boolean;
  winner: Player | null;
}

export type TargetScoreOption = 250 | 300 | 350 | 500 | 750 | 1000;

export interface PlayerEntryProps {
  onGameStart: (playerNames: string[], targetScore: number) => void;
} 
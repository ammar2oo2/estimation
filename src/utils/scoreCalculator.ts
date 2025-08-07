import { RoundResult } from '../types';

export const calculateScore = (prediction: number, actual: number): { score: number; result: RoundResult['result'] } => {
  if (actual === prediction) {
    // Exact prediction: 10 × prediction
    return { score: 10 * prediction, result: 'exact' };
  } else if (actual < prediction) {
    // Missed prediction: minus 10 × predicted
    return { score: -(10 * prediction), result: 'missed' };
  } else {
    // Over prediction: 10 × prediction + (1 point for every extra trick)
    const extraTricks = actual - prediction;
    return { score: (10 * prediction) + extraTricks, result: 'over' };
  }
};

// Helper function to calculate score for missed prediction with minimum constraint
export const calculateMissedScore = (prediction: number): number => {
  return -(10 * prediction);
};

export const checkForWinner = (players: { totalScore: number }[], targetScore: number): number | null => {
  for (let i = 0; i < players.length; i++) {
    if (players[i].totalScore >= targetScore) {
      return i;
    }
  }
  return null;
}; 

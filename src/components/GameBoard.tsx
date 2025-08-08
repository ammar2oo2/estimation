import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Player, Round, RoundResult } from '../types';
import { calculateScore, calculateMissedScore, checkForWinner } from '../utils/scoreCalculator';
import { ResultModal } from './ResultModal';
import './GameBoard.css';
import logo from '../LOGO/estimation_logo.jpg';
import { 
  playButtonClick, 
  playRoundComplete, 
  playPredictionResult,
  playError
} from '../utils/soundEffects';

interface GameBoardProps {
  players: Player[];
  rounds: Round[];
  targetScore: number;
  onRoundComplete: (round: Round) => void;
  onUndoLastRound: () => void;
  onRestartGame: () => void;
  onEditScores: (updatedTotals: Record<string, number>) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  rounds,
  targetScore,
  onRoundComplete,
  onUndoLastRound,
  onRestartGame,
  onEditScores
}) => {
  const [currentRound, setCurrentRound] = useState<Partial<RoundResult>[]>(
    players.map(player => ({ playerId: player.id, prediction: undefined }))
  );
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    playerId: string;
    prediction: number;
  }>({ isOpen: false, playerId: '', prediction: 0 });

  const winnerIndex = checkForWinner(players, targetScore);
  const currentRoundNumber = rounds.length + 1;

  // Generate hands options (2-13)
  const handsOptions = Array.from({ length: 12 }, (_, i) => i + 2);


  // Edit scores modal state
  const [isEditScoresOpen, setIsEditScoresOpen] = useState(false);
  const [editedTotals, setEditedTotals] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditScoresOpen) {
      const prefills: Record<string, string> = {};
      players.forEach(p => {
        prefills[p.id] = String(p.totalScore);
      });
      setEditedTotals(prefills);
    }
  }, [isEditScoresOpen, players]);

  const handleSaveEditedScores = () => {
    const parsed: Record<string, number> = {};
    players.forEach(p => {
      const raw = editedTotals[p.id];
      const num = raw === undefined || raw === '' ? p.totalScore : parseInt(raw, 10);
      parsed[p.id] = isNaN(num) ? p.totalScore : num;
    });
    onEditScores(parsed);
    setIsEditScoresOpen(false);
  };

  const getPlayerTotalScore = (playerId: string) => {
    return rounds.reduce((total, round) => {
      const result = round.results.find(r => r.playerId === playerId);
      return total + (result?.score || 0);
    }, 0);
  };

  // Leaderboard data derived from current totals
  const leaderboardData = useMemo(() => {
    return players
      .map((player) => ({
        id: player.id,
        name: player.name,
        total: getPlayerTotalScore(player.id)
      }))
      .sort((a, b) => b.total - a.total);
  }, [players, rounds]);

  // Track previous ranks to animate movement and leader changes
  const previousRanksRef = useRef<Map<string, number>>(new Map());
  const previousLeaderIdRef = useRef<string | null>(null);
  const [movedUpIds, setMovedUpIds] = useState<Set<string>>(new Set());
  const [leaderPulseId, setLeaderPulseId] = useState<string | null>(null);

  useEffect(() => {
    const currentRanks = new Map<string, number>();
    leaderboardData.forEach((p, index) => currentRanks.set(p.id, index));

    // Detect moved up rows
    const movedUp = new Set<string>();
    currentRanks.forEach((currentIndex, id) => {
      const prevIndex = previousRanksRef.current.get(id);
      if (prevIndex !== undefined && currentIndex < prevIndex) {
        movedUp.add(id);
      }
    });
    // Update previous ranks reference for next comparison
    previousRanksRef.current = currentRanks;
    if (movedUp.size > 0) {
      setMovedUpIds(movedUp);
      const timer = setTimeout(() => setMovedUpIds(new Set()), 500);
      return () => clearTimeout(timer);
    }
  }, [leaderboardData]);

  useEffect(() => {
    const currentLeaderId = leaderboardData[0]?.id || null;
    if (currentLeaderId && currentLeaderId !== previousLeaderIdRef.current) {
      setLeaderPulseId(currentLeaderId);
      const timer = setTimeout(() => setLeaderPulseId(null), 1000);
      previousLeaderIdRef.current = currentLeaderId;
      return () => clearTimeout(timer);
    }
    previousLeaderIdRef.current = currentLeaderId;
  }, [leaderboardData]);


  const handlePredictionChange = (playerId: string, prediction: number) => {
    setCurrentRound(prev => 
      prev.map(result => 
        result.playerId === playerId 
          ? { ...result, prediction: Math.max(2, Math.min(13, prediction)) }
          : result
      )
    );
  };

  const handleResultSelect = (playerId: string, result: 'exact' | 'missed' | 'over') => {
    const playerResult = currentRound.find(r => r.playerId === playerId);
    if (!playerResult || playerResult.prediction === undefined) return;

    const prediction = playerResult.prediction;

    if (result === 'over') {
      setModalState({ isOpen: true, playerId, prediction });
      return;
    }

    let actual: number;
    if (result === 'exact') {
      actual = prediction;
    } else if (result === 'missed') {
      // For missed prediction, actual should be less than prediction
      // Since we have minimum 2, if prediction is 2, we'll use 1 as actual
      // but handle the score calculation manually to ensure correct result
      actual = prediction > 2 ? prediction - 1 : 1;
    } else {
      // This shouldn't happen for 'over' case as it's handled above
      actual = prediction;
    }
    
    // For missed prediction with minimum constraint, calculate score manually
    let score: number;
    if (result === 'missed') {
      score = calculateMissedScore(prediction); // Always negative for missed prediction
    } else {
      const scoreResult = calculateScore(prediction, actual);
      score = scoreResult.score;
    }

    const newRoundResult: RoundResult = {
      playerId,
      prediction,
      actual,
      result,
      score
    };

    playPredictionResult();

    setCurrentRound(prev => 
      prev.map(r => 
        r.playerId === playerId 
          ? { ...r, ...newRoundResult }
          : r
      )
    );
  };

  const handleModalResult = (actual: number) => {
    const playerResult = currentRound.find(r => r.playerId === modalState.playerId);
    if (!playerResult || playerResult.prediction === undefined) return;

    const { score, result } = calculateScore(playerResult.prediction, actual);

    const newRoundResult: RoundResult = {
      playerId: modalState.playerId,
      prediction: playerResult.prediction,
      actual,
      result,
      score
    };

    playPredictionResult();

    setCurrentRound(prev => 
      prev.map(r => 
        r.playerId === modalState.playerId 
          ? { ...r, ...newRoundResult }
          : r
      )
    );
  };

  const canCompleteRound = currentRound.every(r => 
    r.playerId && r.prediction !== undefined && r.actual !== undefined
  );

  const handleCompleteRound = () => {
    if (!canCompleteRound) {
      playError();
      return;
    }

    playRoundComplete();

    const round: Round = {
      id: Date.now().toString(),
      results: currentRound as RoundResult[]
    };

    onRoundComplete(round);
    setCurrentRound(players.map(player => ({ playerId: player.id, prediction: undefined })));
  };

  const handleUndoLastRound = () => {
    if (rounds.length === 0) {
      playError();
      return;
    }
    
    playButtonClick();
    onUndoLastRound();
  };

  const handleRestartGame = () => {
    playButtonClick();
    onRestartGame();
  };

  

  return (
    <div className="game-board">
      <div className="app-header">
        <div className="logo-container">
          <img src={logo} alt="Madani Estimation Logo" className="app-logo" />
        </div>
        <h1 className="app-title">Madani Estimation</h1>
        <div className="leaderboard">
          <button className="edit-scores-btn" onClick={() => setIsEditScoresOpen(true)} title="Edit current totals">
            ✏️ Edit Scores
          </button>
          {leaderboardData.map((p, index) => (
            <div
              key={p.id}
              className={`leaderboard-row ${index === 0 ? 'leader' : ''} ${leaderPulseId === p.id ? 'leader-pulse' : ''} ${movedUpIds.has(p.id) ? 'moved-up' : ''}`}
            >
              <div className="leaderboard-rank">{index + 1}{index === 0 ? ' 👑' : ''}</div>
              <div className="leaderboard-name">{p.name}</div>
              <div className="leaderboard-score">{p.total}</div>
            </div>
          ))}
        </div>
        <div className="game-info">
          <span className="info-badge">Target: {targetScore}</span>
          <span className="info-badge">Round {currentRoundNumber}</span>
        </div>
      </div>



      <div className="players-grid">
        {players.map((player, index) => {
          const totalScore = getPlayerTotalScore(player.id);
          const currentResult = currentRound.find(r => r.playerId === player.id);
          const isWinner = winnerIndex === index;

          return (
            <div key={player.id} className={`player-card ${isWinner ? 'winner' : ''}`}>
              <div className="player-header">
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  {isWinner && <span className="winner-badge">👑</span>}
                  <div className="total-score-container">
                    <span className={`total-score ${totalScore >= targetScore ? 'target-reached' : ''}`}>
                      {totalScore}
                    </span>
                  </div>
                </div>
              </div>

              <div className="player-content">
                <div className="prediction-section">
                  <label className="input-label">Prediction</label>
                  <div className="prediction-input-container">
                    <input
                      type="number"
                      min="2"
                      max="13"
                      value={currentResult?.prediction || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          const numValue = parseInt(value);
                          if (value === '' || (!isNaN(numValue) && numValue >= 2 && numValue <= 13)) {
                            if (value === '') {
                              setCurrentRound(prev => 
                                prev.map(result => 
                                  result.playerId === player.id 
                                    ? { ...result, prediction: undefined }
                                    : result
                                )
                              );
                            } else {
                              handlePredictionChange(player.id, numValue);
                            }
                          }
                        }
                      }}
                      className="glass-input prediction-input"
                      placeholder="2"
                    />
                    <select
                      value={currentResult?.prediction || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setCurrentRound(prev => 
                            prev.map(result => 
                              result.playerId === player.id 
                                ? { ...result, prediction: undefined }
                                : result
                            )
                          );
                        } else {
                          handlePredictionChange(player.id, parseInt(value));
                        }
                      }}
                      className="glass-input prediction-dropdown"
                    >
                      <option value="">Select</option>
                      {handsOptions.map(option => (
                        <option key={option} value={option}>
                          {option} hands
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="result-section">
                  <label className="input-label">Result</label>
                  {currentResult && currentResult.actual !== undefined && currentResult.score !== undefined ? (
                    <div className="result-display">
                      <span className={`result-score ${currentResult.score >= 0 ? 'positive' : 'negative'}`}>
                        {currentResult.score > 0 ? '+' : ''}{currentResult.score}
                      </span>
                      <span className="result-details">
                        ({currentResult.prediction} → {currentResult.actual})
                      </span>
                    </div>
                  ) : (
                    <div className="result-buttons">
                      <button
                        className="result-btn exact"
                        onClick={() => handleResultSelect(player.id, 'exact')}
                        disabled={!currentResult?.prediction}
                        title="Exact prediction"
                      >
                        ✅
                      </button>
                      <button
                        className="result-btn missed"
                        onClick={() => handleResultSelect(player.id, 'missed')}
                        disabled={!currentResult?.prediction}
                        title="Missed prediction"
                      >
                        ❌
                      </button>
                      <button
                        className="result-btn over"
                        onClick={() => handleResultSelect(player.id, 'over')}
                        disabled={!currentResult?.prediction}
                        title="Over prediction"
                      >
                        ➕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="game-controls">
        <button
          className="glass-button control-btn undo-btn"
          onClick={handleUndoLastRound}
          disabled={rounds.length === 0}
        >
          ↩️ Undo Last Round
        </button>
        <button
          className="glass-button control-btn complete-btn"
          onClick={handleCompleteRound}
          disabled={!canCompleteRound}
        >
          ✅ Complete Round
        </button>
        <button
          className="glass-button control-btn restart-btn"
          onClick={handleRestartGame}
        >
          🔄 Restart Game
        </button>
      </div>

      {rounds.length > 0 && (
        <div className="history-section">
          <h3 className="section-title">📋 Round History</h3>
          <div className="history-container">
            {rounds.map((round, roundIndex) => (
              <div key={round.id} className="history-round">
                <div className="round-header">
                  <span className="round-title">Round {roundIndex + 1}</span>
                  <span className="round-date">
                    {new Date(parseInt(round.id)).toLocaleTimeString()}
                  </span>
                </div>
                <div className="round-results">
                  {round.results.map((result) => {
                    const player = players.find(p => p.id === result.playerId);
                    return (
                      <div key={result.playerId} className="history-result">
                        <span className="player-name">{player?.name}</span>
                        <span className="prediction-actual">
                          {result.prediction} → {result.actual}
                        </span>
                        <span className={`history-score ${result.score >= 0 ? 'positive' : 'negative'}`}>
                          {result.score > 0 ? '+' : ''}{result.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ResultModal
        isOpen={modalState.isOpen}
        playerName={players.find(p => p.id === modalState.playerId)?.name || ''}
        prediction={modalState.prediction}
        onResult={handleModalResult}
        onClose={() => setModalState({ isOpen: false, playerId: '', prediction: 0 })}
      />

      {isEditScoresOpen && (
        <div className="modal-overlay" onClick={() => setIsEditScoresOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Set Current Scores</h3>
            </div>
            <div className="modal-body">
              {players.map(p => (
                <div key={p.id} className="edit-row">
                  <span className="edit-name">{p.name}</span>
                  <input
                    className="glass-input edit-input"
                    type="number"
                    value={editedTotals[p.id] ?? ''}
                    onChange={(e) => setEditedTotals(prev => ({ ...prev, [p.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="glass-button cancel-btn" onClick={() => setIsEditScoresOpen(false)}>Cancel</button>
              <button className="glass-button save-btn" onClick={handleSaveEditedScores}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 

import React, { useState, useEffect } from 'react';
import { PlayerEntry } from './components/PlayerEntry';
import { GameBoard } from './components/GameBoard';
import { SoundControl } from './components/SoundControl';
import { WinnerCelebration } from './components/WinnerCelebration';
import { GameState, Player, Round } from './types';
import { checkForWinner } from './utils/scoreCalculator';
import './App.css';

function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('handsPredictionGame');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (error) {
        console.error('Failed to parse saved game state:', error);
      }
    }
    return {
      players: [],
      rounds: [],
      targetScore: 250,
      gameStarted: false,
      winner: null,
      showCelebration: false
    };
  });

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('handsPredictionGame', JSON.stringify(gameState));
  }, [gameState]);

  const handleGameStart = (playerNames: string[], targetScore: number) => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      totalScore: 0
    }));

    setGameState({
      players,
      rounds: [],
      targetScore,
      gameStarted: true,
      winner: null,
      showCelebration: false
    });
  };

  const handleRoundComplete = (round: Round) => {
    setGameState(prev => {
      const newRounds = [...prev.rounds, round];
      
      // Calculate updated player scores
      const updatedPlayers = prev.players.map(player => {
        const totalScore = newRounds.reduce((total, r) => {
          const result = r.results.find(res => res.playerId === player.id);
          return total + (result?.score || 0);
        }, 0);
        
        return { ...player, totalScore };
      });

      // Check for winner
      const winnerIndex = checkForWinner(updatedPlayers, prev.targetScore);
      const winner = winnerIndex !== null ? updatedPlayers[winnerIndex] : null;
      const showCelebration = winner !== null && !prev.showCelebration;

      return {
        ...prev,
        players: updatedPlayers,
        rounds: newRounds,
        winner,
        showCelebration
      };
    });
  };

  const handleUndoLastRound = () => {
    setGameState(prev => {
      if (prev.rounds.length === 0) return prev;

      const newRounds = prev.rounds.slice(0, -1);
      
      // Recalculate player scores
      const updatedPlayers = prev.players.map(player => {
        const totalScore = newRounds.reduce((total, r) => {
          const result = r.results.find(res => res.playerId === player.id);
          return total + (result?.score || 0);
        }, 0);
        
        return { ...player, totalScore };
      });

      // Check for winner again
      const winnerIndex = checkForWinner(updatedPlayers, prev.targetScore);
      const winner = winnerIndex !== null ? updatedPlayers[winnerIndex] : null;

      return {
        ...prev,
        players: updatedPlayers,
        rounds: newRounds,
        winner,
        showCelebration: false
      };
    });
  };

  const handleRestartGame = () => {
    setGameState({
      players: [],
      rounds: [],
      targetScore: 250,
      gameStarted: false,
      winner: null,
      showCelebration: false
    });
  };

  const handleCloseCelebration = () => {
    setGameState(prev => ({
      ...prev,
      showCelebration: false
    }));
  };

  return (
    <div className="App">
      <SoundControl />
      {!gameState.gameStarted ? (
        <PlayerEntry onGameStart={handleGameStart} />
      ) : (
        <GameBoard
          players={gameState.players}
          rounds={gameState.rounds}
          targetScore={gameState.targetScore}
          onRoundComplete={handleRoundComplete}
          onUndoLastRound={handleUndoLastRound}
          onRestartGame={handleRestartGame}
        />
      )}
      
      {gameState.winner && gameState.showCelebration && (
        <WinnerCelebration
          winner={gameState.winner}
          isOpen={gameState.showCelebration}
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
}

export default App;

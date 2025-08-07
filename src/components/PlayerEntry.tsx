import React, { useState } from 'react';
import { PlayerEntryProps, TargetScoreOption } from '../types';
import './PlayerEntry.css';
import logo from '../LOGO/estimation_logo.jpg';
import { playButtonClick, playGameStart, playError } from '../utils/soundEffects';

const TARGET_SCORE_OPTIONS: TargetScoreOption[] = [250, 300, 350, 500, 750, 1000];

// Predefined list of player names
const PREDEFINED_PLAYERS = [
  'Mohammed',
  'Yousef',
  'Kahled',
  'Salwa',
  'DD',
  'Najlaa',
  'Um Ali',
  'Raneem',
  'Yasser',
  'Redwhan',
  'Ahemd',
  'Tariq',
  'Abdullah',
  'Ammar',
  'S7S',
  'Mazzo'
];

export const PlayerEntry: React.FC<PlayerEntryProps> = ({ onGameStart }) => {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [targetScore, setTargetScore] = useState<TargetScoreOption>(250);
  const [useDropdowns, setUseDropdowns] = useState([true, true, true, true]); // Track which players use dropdown

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handlePlayerSelectionChange = (index: number, selectedName: string) => {
    if (selectedName === 'manual') {
      // Switch to manual input
      const newUseDropdowns = [...useDropdowns];
      newUseDropdowns[index] = false;
      setUseDropdowns(newUseDropdowns);
      setPlayerNames(prev => {
        const newNames = [...prev];
        newNames[index] = '';
        return newNames;
      });
    } else {
      // Use selected name from dropdown
      handlePlayerNameChange(index, selectedName);
    }
  };

  const handleTargetScoreChange = (score: TargetScoreOption) => {
    playButtonClick();
    setTargetScore(score);
  };

  const handleStartGame = () => {
    const validNames = playerNames.filter(name => name.trim() !== '');
    if (validNames.length === 4) {
      playGameStart();
      onGameStart(validNames, targetScore);
    } else {
      playError();
    }
  };

  const canStartGame = playerNames.every(name => name.trim() !== '');

  return (
    <div className="player-entry">
      <div className="app-header">
        <div className="logo-container">
          <img src={logo} alt="Madani Estimation Logo" className="app-logo" />
        </div>
        <h1 className="app-title">Madani Estimation</h1>
        <p className="app-subtitle">Enter player names and select target score</p>
      </div>
      
      <div className="form-section">
        <div className="section-header">
          <h2 className="section-title">👥 Players</h2>
          <p className="section-subtitle">Select names for all 4 players</p>
        </div>
        
        <div className="player-inputs">
          {playerNames.map((name, index) => (
            <div key={index} className="player-input-group">
              <label htmlFor={`player-${index}`} className="input-label">
                Player {index + 1}
              </label>
              {useDropdowns[index] ? (
                <select
                  id={`player-${index}`}
                  value={name || ''}
                  onChange={(e) => handlePlayerSelectionChange(index, e.target.value)}
                  className="player-name-dropdown"
                >
                  <option value="">Select Player</option>
                  {PREDEFINED_PLAYERS.map((playerName) => (
                    <option key={playerName} value={playerName}>
                      {playerName}
                    </option>
                  ))}
                  <option value="manual">📝 Type manually</option>
                </select>
              ) : (
                <div className="manual-input-container">
                  <input
                    id={`player-${index}`}
                    type="text"
                    value={name}
                    onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                    placeholder={`Player ${index + 1} name`}
                    maxLength={20}
                    className="player-name-input manual-input"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newUseDropdowns = [...useDropdowns];
                      newUseDropdowns[index] = true;
                      setUseDropdowns(newUseDropdowns);
                      setPlayerNames(prev => {
                        const newNames = [...prev];
                        newNames[index] = '';
                        return newNames;
                      });
                    }}
                    className="switch-to-dropdown-btn"
                    title="Switch to dropdown"
                  >
                    📋
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h2 className="section-title">🎯 Target Score</h2>
          <p className="section-subtitle">Choose the winning score</p>
        </div>
        
        <div className="target-score-grid">
          {TARGET_SCORE_OPTIONS.map((score) => (
            <button
              key={score}
              className={`target-score-button ${targetScore === score ? 'selected' : ''}`}
              onClick={() => handleTargetScoreChange(score)}
            >
              {score}
            </button>
          ))}
        </div>
      </div>

      <div className="start-game-section">
        <button
          className={`gradient-button start-button ${!canStartGame ? 'disabled' : ''}`}
          onClick={handleStartGame}
          disabled={!canStartGame}
        >
          🚀 Start Game
        </button>
      </div>
    </div>
  );
}; 
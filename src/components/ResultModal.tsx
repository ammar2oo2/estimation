import React, { useState, useEffect } from 'react';
import './ResultModal.css';
import { playButtonClick, playError, playSuccess } from '../utils/soundEffects';

interface ResultModalProps {
  isOpen: boolean;
  playerName: string;
  prediction: number;
  onResult: (actual: number) => void;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  playerName,
  prediction,
  onResult,
  onClose
}) => {
  const [actual, setActual] = useState('');

  // Generate hands options (2-13)
  const handsOptions = Array.from({ length: 12 }, (_, i) => i + 2);

  useEffect(() => {
    if (isOpen) {
      setActual('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actualValue = parseInt(actual);
    if (!isNaN(actualValue) && actualValue >= 2 && actualValue <= 13) {
      playSuccess();
      onResult(actualValue);
      onClose();
    } else {
      playError();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    playButtonClick();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>🎯 Enter Actual Result</h3>
        <p className="modal-description">
          <strong>{playerName}</strong> predicted <strong>{prediction}</strong> hands
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="actual-input">Actual hands won:</label>
            <div className="modal-input-container">
              <input
                id="actual-input"
                type="number"
                min="2"
                max="13"
                value={actual}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    const numValue = parseInt(value);
                    if (value === '' || (!isNaN(numValue) && numValue >= 2 && numValue <= 13)) {
                      setActual(value);
                    }
                  }
                }}
                onKeyDown={handleKeyPress}
                autoFocus
                placeholder="2"
              />
              <select
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                className="modal-dropdown"
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
          
          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Save Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
import React from 'react';
import { soundManager } from '../utils/soundEffects';
import { playButtonClick } from '../utils/soundEffects';
import './SoundControl.css';

export const SoundControl: React.FC = () => {
  const isSoundEnabled = soundManager.isSoundEnabled();

  const handleToggleSound = () => {
    playButtonClick();
    soundManager.toggle();
    // Force re-render by updating state
    window.dispatchEvent(new Event('soundToggle'));
  };

  return (
    <button
      className={`sound-control ${isSoundEnabled ? 'enabled' : 'disabled'}`}
      onClick={handleToggleSound}
      title={isSoundEnabled ? 'Disable Sound' : 'Enable Sound'}
    >
      {isSoundEnabled ? '🔊' : '🔇'}
    </button>
  );
}; 
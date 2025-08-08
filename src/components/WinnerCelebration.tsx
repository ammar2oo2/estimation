import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { Player } from '../types';
import { playChampagnePop, playApplause } from '../utils/soundEffects';
import winnerImage from '../LOGO/winnig_pic.jpg';
import './WinnerCelebration.css';

interface WinnerCelebrationProps {
  winner: Player;
  isOpen: boolean;
  onClose: () => void;
}

const funnyCaptions = [
  "All hail the champion! 👑",
  "Rest in peace, opponents. 💀",
  "You just witnessed greatness! ✨",
  "Legendary move! 🏆",
  "That was too easy! 😎",
  "Unstoppable force! 💪",
  "The prophecy is fulfilled! 🔮",
  "Bow down to the master! 🙇‍♂️",
  "Game over, man! 🎮",
  "Victory tastes sweet! 🍯",
  "The chosen one has arrived! ⚡",
  "This is the way! 🛡️",
  "Incredible! Simply incredible! 🤯",
  "The legend lives on! 📜",
  "Unbelievable! Unbelievable! 🎭"
];

export const WinnerCelebration: React.FC<WinnerCelebrationProps> = ({
  winner,
  isOpen,
  onClose
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [caption, setCaption] = useState('');
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const applauseRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Play champagne pop sound
      playChampagnePop();
      
      // Start confetti after a short delay
      setTimeout(() => setShowConfetti(true), 200);
      
      // Set random caption
      setCaption(funnyCaptions[Math.floor(Math.random() * funnyCaptions.length)]);
      
      // Start applause sound
      playApplause();
      
      // Handle window resize
      const handleResize = () => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } else {
      setShowConfetti(false);
      // Stop applause when closing
      if (applauseRef.current) {
        applauseRef.current.pause();
        applauseRef.current.currentTime = 0;
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    // Stop applause
    if (applauseRef.current) {
      applauseRef.current.pause();
      applauseRef.current.currentTime = 0;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={200}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
        />
      )}
      
      <div className="winner-celebration-overlay">
        <div className="winner-celebration-content">
          {/* Fireworks Background */}
          <div className="fireworks-container">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`firework firework-${i + 1}`}>
                <div className="firework-spark"></div>
                <div className="firework-spark"></div>
                <div className="firework-spark"></div>
                <div className="firework-spark"></div>
                <div className="firework-spark"></div>
                <div className="firework-spark"></div>
                <div className="firework-spark"></div>
                <div className="firework-spark"></div>
              </div>
            ))}
          </div>

          {/* Glitter Shimmer */}
          <div className="glitter-overlay">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`glitter-particle glitter-${i + 1}`}></div>
            ))}
          </div>

          {/* Champagne Bottles */}
          <div className="champagne-bottle champagne-left">
            <div className="bottle-body"></div>
            <div className="bottle-neck"></div>
            <div className="cork"></div>
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>
          </div>
          
          <div className="champagne-bottle champagne-right">
            <div className="bottle-body"></div>
            <div className="bottle-neck"></div>
            <div className="cork"></div>
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>
          </div>

          {/* Main Content */}
          <div className="celebration-main">
            <h1 className="winner-title">
              🎉 {winner.name} Wins! 🎉
            </h1>
            
            <div className="winner-photo-container">
              <img 
                src={winnerImage} 
                alt="Winner" 
                className="winner-photo"
              />
            </div>
            
            <p className="winner-caption">{caption}</p>
            
            <div className="winner-score">
              Final Score: <span className="score-highlight">{winner.totalScore}</span>
            </div>
            
            <button className="close-celebration-btn" onClick={handleClose}>
              🎊 Continue Celebrating! 🎊
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

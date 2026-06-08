import React from 'react';
import { t } from '../constants/translations';

// Komponent podsumowania po zakończeniu gry
const GameOverScreen = ({ 
  language, 
  score, 
  totalSongs, 
  onPlayAgain 
}) => {
  return (
    <div className="finished-container glass-panel animate-fade-in">
      <h1>{t[language].gameOver}</h1>
      <h2>{t[language].yourScore} {score} / {totalSongs}</h2>
      <button className="btn btn-primary" onClick={onPlayAgain}>
        {t[language].playAgain}
      </button>
    </div>
  );
};

export default GameOverScreen;

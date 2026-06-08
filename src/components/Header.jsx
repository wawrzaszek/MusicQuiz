import React from 'react';
import { FaCog } from 'react-icons/fa';
import { t } from '../constants/translations';
import { GAME_STATES } from '../constants/gameStates';

// Komponent górnego paska (nagłówek)
const Header = ({ 
  gameState, 
  score, 
  totalSongs, 
  language, 
  onGoToMenu, 
  onGoToOptions 
}) => {
  return (
    <header className="header">
      {/* Logo i Nazwa Aplikacji (Minimalistyczny styl Apple) */}
      <h2 style={{cursor: 'pointer'}} onClick={onGoToMenu}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        Tonal.
      </h2>
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
        {/* Wyświetlanie wyniku tylko podczas gry lub pokazania poprawnej odpowiedzi */}
        {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.REVEALED) && (
          <div className="score-badge">{t[language].score}: {score} / {totalSongs}</div>
        )}
        <button 
          className="icon-btn" 
          onClick={onGoToOptions} 
          style={{background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex'}}
        >
          <FaCog />
        </button>
      </div>
    </header>
  );
};

export default Header;

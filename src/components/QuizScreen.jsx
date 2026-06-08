import React from 'react';
import { FaCheck, FaTimes, FaArrowRight } from 'react-icons/fa';
import { t } from '../constants/translations';
import { GAME_STATES } from '../constants/gameStates';

// Główny komponent gry (odtwarzacz, wpisywanie odpowiedzi, timer)
const QuizScreen = ({
  gameState,
  playlist,
  currentSongIndex,
  audioRef,
  isPlayerReady,
  setIsPlayerReady,
  handleAnswer,
  autoplayFailed,
  manualPlay,
  language,
  timeLeft,
  inputValue,
  handleInputChange,
  handleKeyDown,
  suggestions,
  handleSuggestionClick,
  selectedAnswer,
  nextSong
}) => {
  
  if (playlist.length === 0) return null;

  const currentSong = playlist[currentSongIndex];
  
  // Pomocnicza funkcja do formatowania odpowiedzi przed sprawdzeniem
  const isCorrectAnswer = (answer) => {
    if (!answer) return false;
    const formattedAnswer = answer.toLowerCase().replace(/\s+/g, ' ').trim();
    const correctAnswer = `${currentSong.artist} - ${currentSong.title}`.toLowerCase().replace(/\s+/g, ' ').trim();
    return formattedAnswer === correctAnswer;
  };

  return (
    <div className="quiz-container glass-panel animate-fade-in">
      
      {/* Odtwarzacz Audio (niewidoczny) i okładka */}
      <div className="player-wrapper" style={{display: 'flex', justifyContent: 'center', marginBottom: '2rem'}}>
        <audio 
          ref={audioRef}
          onCanPlay={() => setIsPlayerReady(true)}
          onEnded={() => handleAnswer(null)} // Koniec piosenki = brak odpowiedzi (choć mamy własny timer 30s)
        />
        
        <div className="album-art-container" style={{
          width: '250px', height: '250px', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative',
          background: 'var(--bg-card)'
        }}>
          {gameState === GAME_STATES.REVEALED ? (
            <img 
              src={currentSong.coverUrl} 
              alt="Album Art" 
              className="animate-fade-in"
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          ) : (
            <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {autoplayFailed ? (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                   <button className="btn btn-primary" onClick={manualPlay} style={{fontSize: '1rem', padding: '0.8rem 1.5rem', borderRadius: '50px'}}>
                     ▶ Odtwórz
                   </button>
                </div>
              ) : (
                <div className="music-waves" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out' }}></span>
                  <span style={{ width: '8px', height: '40px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out 0.2s' }}></span>
                  <span style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out 0.4s' }}></span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
      `}</style>

      <div className="quiz-content">
        {/* Informacja o buforowaniu utworu */}
        {!isPlayerReady && gameState === GAME_STATES.PLAYING && (
          <div className="loading">{t[language].buffering}</div>
        )}

        {isPlayerReady && (
          <div className="autocomplete-container" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {/* Pasek timera */}
            <div className="timer-bar-container">
              <div 
                className={`timer-bar ${timeLeft <= 10 ? 'danger' : ''}`} 
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              ></div>
            </div>
            <div className="timer-text">
              {t[language].timeLeft} <span>{timeLeft}s</span>
            </div>

            {/* Input z auto-uzupełnianiem */}
            <div className="search-wrapper">
              <input 
                type="text" 
                className="search-input"
                placeholder={t[language].searchPlaceholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={gameState === GAME_STATES.REVEALED || autoplayFailed}
                autoFocus
                autoComplete="off"
              />
              
              {/* Lista podpowiedzi */}
              {suggestions.length > 0 && gameState === GAME_STATES.PLAYING && (
                <ul className="suggestions-list">
                  {suggestions.map((sug, idx) => (
                    <li key={idx} onClick={() => handleSuggestionClick(sug)}>
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Informacja o wyniku po udzieleniu odpowiedzi */}
            {gameState === GAME_STATES.REVEALED && (
              <div className={`answer-feedback ${
                isCorrectAnswer(selectedAnswer) ? 'correct' : 'wrong'
              }`}>
                {isCorrectAnswer(selectedAnswer) ? 
                  <><FaCheck className="icon" /> Poprawnie!</> : 
                  <><FaTimes className="icon" /> Błędna odpowiedź</>
                }
              </div>
            )}
          </div>
        )}

        {/* Informacje ujawniające się po końcu rundy */}
        {gameState === GAME_STATES.REVEALED && (
          <div className="reveal-actions animate-fade-in" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem'}}>
            {selectedAnswer === null && (
              <div style={{color: 'var(--error)', fontWeight: 'bold', fontSize: '1.2rem'}}>{t[language].timeUp}</div>
            )}
            <h3 style={{marginBottom: '0.5rem', textAlign: 'center'}}>{currentSong.artist} - {currentSong.title}</h3>
            <button className="btn btn-primary next-btn" onClick={nextSong}>
              {currentSongIndex + 1 < playlist.length ? t[language].nextSong : t[language].finish} <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizScreen;

import React, { useState, useEffect, useRef } from 'react';
import { categories, fetchRandomSongs, getRandomWrongAnswers } from './data/songs';
import { FaMusic, FaCheck, FaTimes, FaArrowRight, FaSpinner, FaCog } from 'react-icons/fa';
import './App.css';

const GAME_STATES = {
  MENU: 'MENU',
  LOADING: 'LOADING',
  PLAYING: 'PLAYING',
  REVEALED: 'REVEALED',
  FINISHED: 'FINISHED',
  OPTIONS: 'OPTIONS'
};

const t = {
  pl: {
    menuTitle: 'Wybierz Kategorię',
    menuDesc: 'Wybierz swój ulubiony gatunek. Utwory są losowane na żywo, więc każda gra jest inna!',
    loading: 'Pobieranie losowych utworów...',
    score: 'Wynik',
    noSongsAlert: 'Skończyły się nowe piosenki w tej kategorii! Odśwież stronę (F5), aby zagrać ponownie w te same utwory.',
    buffering: 'Buforowanie utworu...',
    timeLeft: 'Pozostały czas:',
    timeUp: 'Czas minął!',
    nextSong: 'Następny utwór',
    finish: 'Zakończ',
    gameOver: 'Koniec gry!',
    yourScore: 'Twój wynik:',
    playAgain: 'Zagraj ponownie',
    optionsTitle: 'Opcje',
    language: 'Język',
    volume: 'Głośność',
    back: 'Powrót',
    musicSource: 'Utwory użyte w grze pochodzą z publicznego API iTunes (Apple).',
    footerText: '© 2026 Szymon Mosor. Wszelkie prawa zastrzeżone.'
  },
  en: {
    menuTitle: 'Select a Category',
    menuDesc: 'Choose your favorite genre. Songs are drawn live, so every game is different!',
    loading: 'Downloading random songs...',
    score: 'Score',
    noSongsAlert: 'No new songs left in this category! Refresh the page (F5) to play the same songs again.',
    buffering: 'Buffering song...',
    timeLeft: 'Time left:',
    timeUp: "Time's up!",
    nextSong: 'Next song',
    finish: 'Finish',
    gameOver: 'Game Over!',
    yourScore: 'Your score:',
    playAgain: 'Play again',
    optionsTitle: 'Options',
    language: 'Language',
    volume: 'Volume',
    back: 'Back',
    musicSource: 'Songs used in the game are provided by the public iTunes API (Apple).',
    footerText: '© 2026 Szymon Mosor. All rights reserved.'
  }
};

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [language, setLanguage] = useState('pl');
  const [volume, setVolume] = useState(1.0);

  // Zbiór przechowujący ID piosenek, które już wystąpiły w trakcie tej sesji (odświeżenia F5)
  const [playedSongIds, setPlayedSongIds] = useState(new Set());

  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, currentSongIndex]);

  useEffect(() => {
    let timer;
    if (gameState === GAME_STATES.PLAYING && isPlayerReady && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === GAME_STATES.PLAYING) {
      handleAnswer(null); 
    }
    return () => clearInterval(timer);
  }, [gameState, isPlayerReady, timeLeft]);

  const startGame = async (categoryId) => {
    setGameState(GAME_STATES.LOADING);
    setSelectedCategory(categoryId);
    
    // Pobieramy 10 losowych utworów, wykluczając te, które już były grane (playedSongIds)
    const songs = await fetchRandomSongs(categoryId, 10, playedSongIds);
    
    if (songs.length === 0) {
      alert(t[language].noSongsAlert);
      setGameState(GAME_STATES.MENU);
      return;
    }

    // Dodajemy nowo wylosowane piosenki do zbioru "zagranych" aby się nie powtórzyły
    setPlayedSongIds(prev => {
      const newSet = new Set(prev);
      songs.forEach(song => newSet.add(song.id));
      return newSet;
    });

    setPlaylist(songs);
    setCurrentSongIndex(0);
    setScore(0);
    generateOptions(songs[0], songs);
    setGameState(GAME_STATES.PLAYING);
  };

  const generateOptions = (correctSong, currentPlaylist) => {
    const wrong = getRandomWrongAnswers(correctSong, currentPlaylist, 3);
    const correctAnswer = `${correctSong.artist} - ${correctSong.title}`;
    const allOptions = [...wrong, correctAnswer].sort(() => 0.5 - Math.random());
    
    setOptions(allOptions);
    setSelectedAnswer(null);
    setIsPlayerReady(false);
    setTimeLeft(30);
  };

  const handleAnswer = (answer) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    setSelectedAnswer(answer);
    const currentSong = playlist[currentSongIndex];
    const isCorrect = answer === `${currentSong.artist} - ${currentSong.title}`;
    
    if (isCorrect) setScore(prev => prev + 1);
    
    setGameState(GAME_STATES.REVEALED);
  };

  const nextSong = () => {
    if (currentSongIndex + 1 < playlist.length) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      generateOptions(playlist[nextIndex], playlist);
      setGameState(GAME_STATES.PLAYING);
    } else {
      setGameState(GAME_STATES.FINISHED);
    }
  };

  // Efekt do resetowania audio gdy zmienia się piosenka
  useEffect(() => {
    if (audioRef.current && playlist[currentSongIndex]) {
      audioRef.current.src = playlist[currentSongIndex].previewUrl;
      audioRef.current.play().catch(e => console.log("Autoplay zablokowane:", e));
    }
  }, [currentSongIndex, playlist]);

  return (
    <div className="app-container">
      <header className="header">
        {/* Logo i Nazwa Aplikacji (Minimalistyczny styl Apple) */}
        <h2 style={{cursor: 'pointer'}} onClick={() => {
          setGameState(GAME_STATES.MENU);
          if (audioRef.current) audioRef.current.pause();
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          Tonal.
        </h2>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.REVEALED) && (
            <div className="score-badge">{t[language].score}: {score} / {playlist.length}</div>
          )}
          <button className="icon-btn" onClick={() => setGameState(GAME_STATES.OPTIONS)} style={{background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '1.5rem', display: 'flex'}}>
            <FaCog />
          </button>
        </div>
      </header>

      <main className="main-content">
        {gameState === GAME_STATES.MENU && (
          <div className="menu-container glass-panel animate-fade-in">
            <h1>{t[language].menuTitle}</h1>
            <p>{t[language].menuDesc}</p>
            
            <div className="category-grid">
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  className="category-card"
                  style={{'--cat-color': cat.color}}
                  onClick={() => startGame(cat.id)}
                >
                  <FaMusic size={32} />
                  <h3>{cat.name[language]}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === GAME_STATES.OPTIONS && (
          <div className="options-container glass-panel animate-fade-in" style={{textAlign: 'center', padding: '2rem'}}>
            <h1>{t[language].optionsTitle}</h1>
            
            <div className="option-group" style={{margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', alignItems: 'center'}}>
                <label style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{t[language].language}:</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{padding: '0.5rem 1rem', borderRadius: '10px', background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--accent)', fontSize: '1.1rem'}}
                >
                  <option value="pl">Polski</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', alignItems: 'center'}}>
                <label style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{t[language].volume}:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))} 
                  style={{width: '150px'}}
                />
              </div>

              <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center'}}>
                🎵 {t[language].musicSource}
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setGameState(GAME_STATES.MENU)}>
              <FaArrowRight style={{transform: 'rotate(180deg)', marginRight: '8px'}} /> {t[language].back}
            </button>
          </div>
        )}

        {gameState === GAME_STATES.LOADING && (
          <div className="loading-container glass-panel animate-fade-in" style={{textAlign: 'center', padding: '4rem'}}>
            <FaSpinner className="spin-icon" size={48} style={{color: 'var(--accent)', animation: 'spin 1s linear infinite', marginBottom: '1rem'}} />
            <h2>{t[language].loading}</h2>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.REVEALED) && playlist.length > 0 && (
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
                    src={playlist[currentSongIndex].coverUrl} 
                    alt="Album Art" 
                    className="animate-fade-in"
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                ) : (
                  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className="music-waves" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out' }}></span>
                      <span style={{ width: '8px', height: '40px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out 0.2s' }}></span>
                      <span style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px', animation: 'wave 1.2s infinite ease-in-out 0.4s' }}></span>
                    </div>
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
              {!isPlayerReady && gameState === GAME_STATES.PLAYING && (
                <div className="loading">{t[language].buffering}</div>
              )}

              {isPlayerReady && (
                <div className="options-grid">
                  <div className="timer-bar-container">
                    <div 
                      className={`timer-bar ${timeLeft <= 10 ? 'danger' : ''}`} 
                      style={{ width: `${(timeLeft / 30) * 100}%` }}
                    ></div>
                  </div>
                  <div className="timer-text">
                    {t[language].timeLeft} <span>{timeLeft}s</span>
                  </div>

                  {options.map((opt, idx) => {
                    const currentSong = playlist[currentSongIndex];
                    const isCorrect = opt === `${currentSong.artist} - ${currentSong.title}`;
                    
                    let btnClass = "option-btn";
                    if (gameState === GAME_STATES.REVEALED) {
                      if (isCorrect) btnClass += " correct";
                      else if (selectedAnswer === opt && !isCorrect) btnClass += " wrong";
                      else btnClass += " disabled";
                    }

                    return (
                      <button 
                        key={idx}
                        className={btnClass}
                        onClick={() => handleAnswer(opt)}
                        disabled={gameState === GAME_STATES.REVEALED}
                      >
                        {gameState === GAME_STATES.REVEALED && isCorrect && <FaCheck className="icon" />}
                        {gameState === GAME_STATES.REVEALED && selectedAnswer === opt && !isCorrect && <FaTimes className="icon" />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {gameState === GAME_STATES.REVEALED && (
                <div className="reveal-actions animate-fade-in" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem'}}>
                  {selectedAnswer === null && (
                    <div style={{color: 'var(--error)', fontWeight: 'bold', fontSize: '1.2rem'}}>{t[language].timeUp}</div>
                  )}
                  <h3 style={{marginBottom: '0.5rem', textAlign: 'center'}}>{playlist[currentSongIndex].artist} - {playlist[currentSongIndex].title}</h3>
                  <button className="btn btn-primary next-btn" onClick={nextSong}>
                    {currentSongIndex + 1 < playlist.length ? t[language].nextSong : t[language].finish} <FaArrowRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === GAME_STATES.FINISHED && (
          <div className="finished-container glass-panel animate-fade-in">
            <h1>{t[language].gameOver}</h1>
            <h2>{t[language].yourScore} {score} / {playlist.length}</h2>
            <button className="btn btn-primary" onClick={() => setGameState(GAME_STATES.MENU)}>
              {t[language].playAgain}
            </button>
          </div>
        )}
      </main>

      <footer style={{marginTop: 'auto', paddingTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem'}}>
        {t[language].footerText}
      </footer>
    </div>
  );
}

export default App;

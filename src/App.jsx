import React, { useState, useEffect, useRef } from 'react';
import { categories, fetchRandomSongs, getRandomWrongAnswers } from './data/songs';
import { FaMusic, FaCheck, FaTimes, FaArrowRight, FaSpinner } from 'react-icons/fa';
import './App.css';

const GAME_STATES = {
  MENU: 'MENU',
  LOADING: 'LOADING',
  PLAYING: 'PLAYING',
  REVEALED: 'REVEALED',
  FINISHED: 'FINISHED'
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
  
  // Zbiór przechowujący ID piosenek, które już wystąpiły w trakcie tej sesji (odświeżenia F5)
  const [playedSongIds, setPlayedSongIds] = useState(new Set());

  const audioRef = useRef(null);

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
      alert("Skończyły się nowe piosenki w tej kategorii! Odśwież stronę (F5), aby zagrać ponownie w te same utwory.");
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
        <h2>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
          Tonal.
        </h2>
        {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.REVEALED) && (
          <div className="score-badge">Wynik: {score} / {playlist.length}</div>
        )}
      </header>

      <main className="main-content">
        {gameState === GAME_STATES.MENU && (
          <div className="menu-container glass-panel animate-fade-in">
            <h1>Wybierz Kategorię</h1>
            <p>Wybierz swój ulubiony gatunek. Utwory są losowane na żywo, więc każda gra jest inna!</p>
            
            <div className="category-grid">
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  className="category-card"
                  style={{'--cat-color': cat.color}}
                  onClick={() => startGame(cat.id)}
                >
                  <FaMusic size={32} />
                  <h3>{cat.name}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === GAME_STATES.LOADING && (
          <div className="loading-container glass-panel animate-fade-in" style={{textAlign: 'center', padding: '4rem'}}>
            <FaSpinner className="spin-icon" size={48} style={{color: 'var(--accent)', animation: 'spin 1s linear infinite', marginBottom: '1rem'}} />
            <h2>Pobieranie losowych utworów...</h2>
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
                <div className="loading">Buforowanie utworu...</div>
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
                    Pozostały czas: <span>{timeLeft}s</span>
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
                    <div style={{color: 'var(--error)', fontWeight: 'bold', fontSize: '1.2rem'}}>Czas minął!</div>
                  )}
                  <h3 style={{marginBottom: '0.5rem', textAlign: 'center'}}>{playlist[currentSongIndex].artist} - {playlist[currentSongIndex].title}</h3>
                  <button className="btn btn-primary next-btn" onClick={nextSong}>
                    {currentSongIndex + 1 < playlist.length ? 'Następny utwór' : 'Zakończ'} <FaArrowRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === GAME_STATES.FINISHED && (
          <div className="finished-container glass-panel animate-fade-in">
            <h1>Koniec gry!</h1>
            <h2>Twój wynik: {score} z {playlist.length}</h2>
            <button className="btn btn-primary" onClick={() => setGameState(GAME_STATES.MENU)}>
              Zagraj ponownie
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

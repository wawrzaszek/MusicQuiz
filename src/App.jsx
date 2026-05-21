import React, { useState, useEffect } from 'react';
import YouTubePlayer from './components/YouTubePlayer';
import { categories, songsDB, getRandomWrongAnswers } from './data/songs';
import { FaPlay, FaMusic, FaCheck, FaTimes, FaArrowRight } from 'react-icons/fa';
import './App.css';

const GAME_STATES = {
  MENU: 'MENU',
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
  // Stan przechowujący pozostały czas na odpowiedź (w sekundach)
  const [timeLeft, setTimeLeft] = useState(30);

  // Efekt odpowiedzialny za odliczanie czasu
  useEffect(() => {
    let timer;
    // Odliczamy czas tylko wtedy, gdy trwa gra i odtwarzacz załadował piosenkę
    if (gameState === GAME_STATES.PLAYING && isPlayerReady && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === GAME_STATES.PLAYING) {
      // Jeśli czas minął, a gracz nie odpowiedział, oznaczamy jako błędną odpowiedź (timeout)
      handleAnswer(null); // null oznacza brak odpowiedzi
    }

    return () => clearInterval(timer);
  }, [gameState, isPlayerReady, timeLeft]);

  const startGame = (categoryId) => {
    // Tasujemy piosenki z wybranej kategorii
    const songs = [...songsDB[categoryId]].sort(() => 0.5 - Math.random());
    setPlaylist(songs);
    setSelectedCategory(categoryId);
    setCurrentSongIndex(0);
    setScore(0);
    setGameState(GAME_STATES.PLAYING);
    generateOptions(songs[0], categoryId);
  };

  const generateOptions = (correctSong, categoryId) => {
    const wrong = getRandomWrongAnswers(correctSong, categoryId, 3);
    const correctAnswer = `${correctSong.artist} - ${correctSong.title}`;
    const allOptions = [...wrong, correctAnswer].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
    setSelectedAnswer(null);
    setIsPlayerReady(false);
    setTimeLeft(30); // Resetujemy czas (30 sekund) dla nowej piosenki
  };

  const handleAnswer = (answer) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    setSelectedAnswer(answer);
    const currentSong = playlist[currentSongIndex];
    // Sprawdzamy, czy odpowiedź jest poprawna (answer może być null po upływie czasu)
    const isCorrect = answer === `${currentSong.artist} - ${currentSong.title}`;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Po udzieleniu odpowiedzi lub końcu czasu, zmieniamy stan na REVEALED
    setGameState(GAME_STATES.REVEALED);
  };

  const nextSong = () => {
    if (currentSongIndex + 1 < playlist.length) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      generateOptions(playlist[nextIndex], selectedCategory);
      setGameState(GAME_STATES.PLAYING);
    } else {
      setGameState(GAME_STATES.FINISHED);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h2>🎵 Co To Za Hit?</h2>
        {gameState !== GAME_STATES.MENU && (
          <div className="score-badge">Wynik: {score} / {playlist.length}</div>
        )}
      </header>

      <main className="main-content">
        {gameState === GAME_STATES.MENU && (
          <div className="menu-container glass-panel animate-fade-in">
            <h1>Wybierz Kategorię</h1>
            <p>Wybierz swój ulubiony gatunek i odgadnij wszystkie utwory!</p>
            
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

        {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.REVEALED) && playlist.length > 0 && (
          <div className="quiz-container glass-panel animate-fade-in">
            <div className="player-wrapper">
              <YouTubePlayer 
                videoId={playlist[currentSongIndex].id}
                isRevealed={gameState === GAME_STATES.REVEALED}
                onReady={() => setIsPlayerReady(true)}
              />
            </div>

            <div className="quiz-content">
              {!isPlayerReady && gameState === GAME_STATES.PLAYING && (
                <div className="loading">Ładowanie utworu...</div>
              )}

              {isPlayerReady && (
                <div className="options-grid">
                  {/* Pasek postępu czasu dla piosenki */}
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
                      // Podświetlamy błędną odpowiedź wybraną przez użytkownika (jeśli w ogóle jakąś wybrał)
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
                <div className="reveal-actions animate-fade-in" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
                  {selectedAnswer === null && (
                    <div style={{color: 'var(--error)', fontWeight: 'bold', fontSize: '1.2rem'}}>Czas minął!</div>
                  )}
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

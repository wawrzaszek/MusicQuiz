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
  };

  const handleAnswer = (answer) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    setSelectedAnswer(answer);
    const currentSong = playlist[currentSongIndex];
    const isCorrect = answer === `${currentSong.artist} - ${currentSong.title}`;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
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
                <button className="btn btn-primary next-btn animate-fade-in" onClick={nextSong}>
                  {currentSongIndex + 1 < playlist.length ? 'Następny utwór' : 'Zakończ'} <FaArrowRight />
                </button>
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

import React, { useState, useEffect, useRef } from 'react';
import { fetchRandomSongs } from './data/songs';
import { GAME_STATES } from './constants/gameStates';
import { t } from './constants/translations';
import Header from './components/Header';
import Footer from './components/Footer';
import MainMenu from './components/MainMenu';
import OptionsMenu from './components/OptionsMenu';
import LoadingScreen from './components/LoadingScreen';
import QuizScreen from './components/QuizScreen';
import GameOverScreen from './components/GameOverScreen';
import './App.css';

// Główny komponent aplikacji, zarządza całym stanem gry
function App() {
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [playlist, setPlaylist] = useState([]);
  const [dictionary, setDictionary] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [language, setLanguage] = useState('pl');
  // Ustawienie domyślnej głośności na 50% (0.5), aby nagły, głośny dźwięk nie przestraszył 
  // użytkownika przy pierwszym uruchomieniu gry (aby uniknąć tzw. earrape'a po odpaleniu piosenki).
  const [volume, setVolume] = useState(0.5);

  // Zbiór przechowujący ID piosenek, które już wystąpiły w trakcie tej sesji (odświeżenia F5)
  const [playedSongIds, setPlayedSongIds] = useState(new Set());

  const audioRef = useRef(null);

  // Efekt dla zmiany głośności
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, currentSongIndex]);

  // Efekt timera podczas gry
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

  // Rozpoczęcie gry dla danej kategorii
  const startGame = async (categoryId) => {
    // HACK dla iOS Safari
    if (audioRef.current) {
      audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audioRef.current.play().catch(() => {});
    }

    setGameState(GAME_STATES.LOADING);
    setSelectedCategory(categoryId);
    
    // Pobieranie 10 piosenek
    const result = await fetchRandomSongs(categoryId, 10, playedSongIds);
    const songs = result.playlist;
    
    if (!songs || songs.length === 0) {
      alert(t[language].noSongsAlert);
      setGameState(GAME_STATES.MENU);
      return;
    }

    setPlayedSongIds(prev => {
      const newSet = new Set(prev);
      songs.forEach(song => newSet.add(song.id));
      return newSet;
    });

    setPlaylist(songs);
    setDictionary(result.dictionary);
    setCurrentSongIndex(0);
    setScore(0);
    resetRound();
    setGameState(GAME_STATES.PLAYING);
  };

  const resetRound = () => {
    setInputValue('');
    setSuggestions([]);
    setSelectedAnswer(null);
    setIsPlayerReady(false);
    setTimeLeft(30);
  };

  const handleInputChange = (e) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    const val = e.target.value;
    setInputValue(val);

    if (val.trim().length > 1) {
      const lowerVal = val.toLowerCase();
      const filtered = dictionary.filter(song => 
        song.artist.toLowerCase().includes(lowerVal) || 
        song.title.toLowerCase().includes(lowerVal)
      );
      const uniqueStrings = Array.from(new Set(filtered.map(s => `${s.artist} - ${s.title}`))).slice(0, 6);
      setSuggestions(uniqueStrings);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (answer) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    setInputValue(answer);
    setSuggestions([]);
    handleAnswer(answer);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else {
        handleAnswer(inputValue);
      }
    }
  };

  const handleAnswer = (answer) => {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    setSelectedAnswer(answer);
    const currentSong = playlist[currentSongIndex];
    
    if (answer) {
      const formattedAnswer = answer.toLowerCase().replace(/\s+/g, ' ').trim();
      const correctAnswer = `${currentSong.artist} - ${currentSong.title}`.toLowerCase().replace(/\s+/g, ' ').trim();
      if (formattedAnswer === correctAnswer) setScore(prev => prev + 1);
    }
    
    setGameState(GAME_STATES.REVEALED);
  };

  const nextSong = () => {
    if (currentSongIndex + 1 < playlist.length) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      resetRound();
      setGameState(GAME_STATES.PLAYING);
    } else {
      setGameState(GAME_STATES.FINISHED);
    }
  };

  const [autoplayFailed, setAutoplayFailed] = useState(false);

  // Zmiana źródła audio przy nowej piosence
  useEffect(() => {
    if (audioRef.current && playlist[currentSongIndex]) {
      setAutoplayFailed(false);
      audioRef.current.src = playlist[currentSongIndex].previewUrl;
      audioRef.current.play().catch(e => {
        console.log("Autoplay zablokowane przez przeglądarkę:", e);
        setAutoplayFailed(true);
        setIsPlayerReady(true);
      });
    }
  }, [currentSongIndex, playlist]);

  const manualPlay = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setAutoplayFailed(false);
      }).catch(e => console.error("Ręczne odtwarzanie zawiodło:", e));
    }
  };

  const goToMenu = () => {
    setGameState(GAME_STATES.MENU);
    if (audioRef.current) audioRef.current.pause();
  };

  return (
    <div className="app-container">
      <Header 
        gameState={gameState} 
        score={score} 
        totalSongs={playlist.length} 
        language={language} 
        onGoToMenu={goToMenu} 
        onGoToOptions={() => setGameState(GAME_STATES.OPTIONS)} 
      />

      <main className="main-content">
        {gameState === GAME_STATES.MENU && (
          <MainMenu 
            language={language} 
            onStartGame={startGame} 
          />
        )}

        {gameState === GAME_STATES.OPTIONS && (
          <OptionsMenu 
            language={language} 
            setLanguage={setLanguage} 
            volume={volume} 
            setVolume={setVolume} 
            onBack={goToMenu} 
          />
        )}

        {gameState === GAME_STATES.LOADING && (
          <LoadingScreen language={language} />
        )}

        {(gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.REVEALED) && (
          <QuizScreen 
            gameState={gameState}
            playlist={playlist}
            currentSongIndex={currentSongIndex}
            audioRef={audioRef}
            isPlayerReady={isPlayerReady}
            setIsPlayerReady={setIsPlayerReady}
            handleAnswer={handleAnswer}
            autoplayFailed={autoplayFailed}
            manualPlay={manualPlay}
            language={language}
            timeLeft={timeLeft}
            inputValue={inputValue}
            handleInputChange={handleInputChange}
            handleKeyDown={handleKeyDown}
            suggestions={suggestions}
            handleSuggestionClick={handleSuggestionClick}
            selectedAnswer={selectedAnswer}
            nextSong={nextSong}
          />
        )}

        {gameState === GAME_STATES.FINISHED && (
          <GameOverScreen 
            language={language} 
            score={score} 
            totalSongs={playlist.length} 
            onPlayAgain={goToMenu} 
          />
        )}
      </main>

      <Footer language={language} />
    </div>
  );
}

export default App;

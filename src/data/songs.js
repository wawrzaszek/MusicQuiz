// Baza danych kategorii
export const categories = [
  { id: 'radio', name: 'Radio Hits', color: '#ff4b4b', searchTerm: 'pop' },
  { id: 'rock', name: 'Klasyczny Rock', color: '#fca311', searchTerm: 'rock' },
  { id: 'party', name: 'Impreza', color: '#a200ff', searchTerm: 'dance' },
  { id: 'hiphop', name: 'Hip-Hop', color: '#2a9d8f', searchTerm: 'hip-hop' }
];

// Funkcja pobierająca losowe utwory z iTunes API (wyklucza te już odgadnięte)
export const fetchRandomSongs = async (categoryId, count = 10, excludeIds = new Set()) => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];

  try {
    // Pobieramy więcej utworów z iTunes API na wypadek, gdyby wiele z nich było już zagranych (np. limit 100)
    const response = await fetch(`https://itunes.apple.com/search?term=${category.searchTerm}&media=music&entity=song&limit=100`);
    const data = await response.json();

    // Filtrujemy tylko te, które mają previewUrl i NIE WYSTĄPIŁY jeszcze w secie excludeIds
    const validSongs = data.results.filter(song => 
      song.previewUrl && 
      song.trackName && 
      song.artistName && 
      !excludeIds.has(song.trackId)
    );

    // Tasujemy wyniki (losowość!)
    const shuffled = validSongs.sort(() => 0.5 - Math.random());

    // Formatujemy dane i zwracamy wybraną liczbę utworów
    return shuffled.slice(0, count).map(song => ({
      id: song.trackId,
      title: song.trackName,
      artist: song.artistName,
      previewUrl: song.previewUrl,
      coverUrl: song.artworkUrl100.replace('100x100', '300x300') // Powiększamy okładkę z API
    }));
  } catch (error) {
    console.error("Błąd podczas pobierania muzyki z iTunes API:", error);
    return [];
  }
};

// Funkcja pomocnicza do generowania fałszywych odpowiedzi na podstawie pobranej playlisty
export const getRandomWrongAnswers = (correctSong, playlist, count = 3) => {
  let otherSongs = playlist.filter(s => s.id !== correctSong.id);
  
  // Tasowanie
  const shuffled = otherSongs.sort(() => 0.5 - Math.random());
  
  // Zwracamy wybraną liczbę błędnych odpowiedzi
  return shuffled.slice(0, count).map(s => `${s.artist} - ${s.title}`);
};

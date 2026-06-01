// Baza danych kategorii
export const categories = [
  { id: 'radio', name: { pl: 'Radio Hits', en: 'Radio Hits' }, color: '#ff4b4b', searchTerm: ['pop', 'party songs', '80s', '90s', '00s', '10s'] },
  { id: 'rock', name: { pl: 'Klasyczny Rock', en: 'Classic Rock' }, color: '#fca311', searchTerm: ['classic rock', 'metal'] },
  { id: 'hiphop', name: { pl: 'Hip-Hop', en: 'Hip-Hop' }, color: '#2a9d8f', searchTerm: 'hip-hop' },
  // Dodanie kategorii Polska Muzyka (będzie losować jedno z haseł przy każdym zapytaniu)
  { id: 'plmusic', name: { pl: 'Polska Muzyka', en: 'Polish Music' }, color: '#e53935', searchTerm: ['dżem', 'kombi', 'lady pank', 'perfect', 'budka suflera', 'akcent', 'boys', 'sławomir', 'zenon martyniuk', 'disco polo', 'krzysztof krawczyk', 'maryla rodowicz', 'sanah', 'dawid podsiadło', 'polski pop'] }
];

// Funkcja pobierająca losowe utwory z iTunes API (wyklucza te już odgadnięte)
export const fetchRandomSongs = async (categoryId, count = 10, excludeIds = new Set()) => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];

  try {
    let term = category.searchTerm;
    // Jeśli wyszukiwane hasło to tablica (np. dla polskiej muzyki), wylosuj jedno z nich
    if (Array.isArray(term)) {
        term = term[Math.floor(Math.random() * term.length)];
    }
    
    // Zapytanie idzie do naszego wbudowanego proxy (Vite lub Netlify)
    const targetUrl = `/api/itunes/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=100`;
    
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error("API Proxy responded with status " + response.status);
    
    const data = await response.json();

    if (!data || !data.results || data.results.length === 0) {
      alert("Niestety iTunes API nic nie zwróciło.");
      return [];
    }

    const validSongs = data.results.filter(song => 
      song.previewUrl && 
      song.trackName && 
      song.artistName && 
      !excludeIds.has(song.trackId)
    );

    const shuffled = validSongs.sort(() => 0.5 - Math.random());

    return shuffled.slice(0, count).map(song => ({
      id: song.trackId,
      title: song.trackName,
      artist: song.artistName,
      previewUrl: song.previewUrl,
      coverUrl: song.artworkUrl100.replace('100x100', '300x300')
    }));
  } catch (error) {
    console.error("Błąd podczas pobierania muzyki:", error);
    alert("Błąd połączenia z API: " + error.message);
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

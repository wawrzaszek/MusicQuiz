// Baza danych kategorii
export const categories = [
  { id: 'radio', name: { pl: 'Radio Hits', en: 'Radio Hits' }, color: '#ff4b4b', searchTerm: 'pop' },
  { id: 'rock', name: { pl: 'Klasyczny Rock', en: 'Classic Rock' }, color: '#fca311', searchTerm: 'classic rock' },
  { id: 'party', name: { pl: 'Impreza', en: 'Party' }, color: '#a200ff', searchTerm: 'edm house' },
  { id: 'hiphop', name: { pl: 'Hip-Hop', en: 'Hip-Hop' }, color: '#2a9d8f', searchTerm: 'hip-hop' }
];

// Funkcja pobierająca losowe utwory z iTunes API (wyklucza te już odgadnięte)
export const fetchRandomSongs = async (categoryId, count = 10, excludeIds = new Set()) => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];

  try {
    const targetUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(category.searchTerm)}&media=music&entity=song&limit=100`;
    let response;
    
    try {
      response = await fetch(targetUrl);
      if (!response.ok) throw new Error("Direct fetch failed");
    } catch (e) {
      console.warn("Direct fetch failed, trying proxy...", e);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      response = await fetch(proxyUrl);
    }
    
    const data = await response.json();

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

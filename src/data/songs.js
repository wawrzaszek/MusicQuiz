// Baza danych kategorii
export const categories = [
  { id: 'radio', name: { pl: 'Radio Hits', en: 'Radio Hits' }, color: '#ff4b4b', searchTerm: ['pop hits', 'party songs', 'david guetta', 'katy perry', 'lady gaga', 'rihanna', 'dua lipa', 'ed sheeran', 'the weeknd', 'calvin harris', 'pitbull', 'shakira', 'bruno mars', 'maroon 5', 'taylor swift', 'justin timberlake', 'coldplay', 'top 40'] },
  { id: 'rock', name: { pl: 'Klasyczny Rock', en: 'Classic Rock' }, color: '#fca311', searchTerm: ['classic rock', 'metal'] },
  { id: 'hiphop', name: { pl: 'Hip-Hop', en: 'Hip-Hop' }, color: '#2a9d8f', searchTerm: ['rap hits', 'oldschool hip-hop', '2pac', 'eminem', 'snoop dogg', 'dr dre', 'notorious b.i.g.', 'kendrick lamar', '50 cent', 'jay-z', 'nas', 'wu-tang clan'] },
  // Dodanie kategorii Polska Muzyka (będzie losować jedno z haseł przy każdym zapytaniu)
  { id: 'plmusic', name: { pl: 'Polska Muzyka', en: 'Polish Music' }, color: '#e53935', searchTerm: ['dżem', 'kombi', 'lady pank', 'perfect', 'budka suflera', 'zespół akcent', 'zespół boys', 'sławomir', 'zenon martyniuk', 'disco polo', 'krzysztof krawczyk', 'maryla rodowicz', 'sanah', 'dawid podsiadło', 'polski pop'] }
];

// Funkcja pobierająca losowe utwory z iTunes API (wyklucza te już odgadnięte)
export const fetchRandomSongs = async (categoryId, count = 10, excludeIds = new Set()) => {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return [];

  try {
    let terms = [];
    if (Array.isArray(category.searchTerm)) {
      // Losujemy kilka różnych haseł (np. 4), aby zapewnić różnorodność artystów w jednej grze
      const shuffledTerms = [...category.searchTerm].sort(() => 0.5 - Math.random());
      terms = shuffledTerms.slice(0, 4);
    } else {
      terms = [category.searchTerm];
    }
    
    // Pobieramy wyniki równolegle dla wylosowanych haseł
    const fetchPromises = terms.map(async (term) => {
      const targetUrl = `/api/itunes/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=30`;
      try {
        const response = await fetch(targetUrl);
        if (response.ok) {
          const data = await response.json();
          return data?.results || [];
        }
      } catch (e) {
        console.error("Błąd dla hasła: ", term, e);
      }
      return [];
    });
    
    const resultsArrays = await Promise.all(fetchPromises);
    const allResults = resultsArrays.flat();

    if (!allResults || allResults.length === 0) {
      alert("Niestety iTunes API nic nie zwróciło.");
      return [];
    }

    // Unikalne piosenki, z pominięciem już odgadniętych i duplikatów z różnych zapytań
    const seenIds = new Set(excludeIds);
    const seenSignatures = new Set();
    
    const validSongs = allResults.filter(song => {
      if (!song.previewUrl || !song.trackName || !song.artistName || seenIds.has(song.trackId)) {
        return false;
      }
      
      // Tworzymy unikalny podpis piosenki, żeby uniknąć sytuacji gdy iTunes zwraca
      // ten sam utwór z dwóch różnych albumów (inne trackId, ale ten sam kawałek).
      const signature = `${song.artistName.toLowerCase().trim()} - ${song.trackName.toLowerCase().trim()}`;
      if (seenSignatures.has(signature)) {
        return false;
      }
      
      seenSignatures.add(signature);
      seenIds.add(song.trackId);
      return true;
    });

    const shuffled = validSongs.sort(() => 0.5 - Math.random());

    const finalSelection = [];
    const usedArtists = new Set();
    
    // Krok 1: Wybieramy po jednym utworze od każdego artysty dla różnorodności
    for (const song of shuffled) {
      if (finalSelection.length >= count) break;
      const artist = song.artistName.toLowerCase().trim();
      if (!usedArtists.has(artist)) {
        usedArtists.add(artist);
        finalSelection.push(song);
      }
    }
    
    // Krok 2: Jeśli brakuje nam utworów do pełnej puli, dobieramy z pozostałych (dopuszczając powtórki artystów)
    if (finalSelection.length < count) {
      for (const song of shuffled) {
        if (finalSelection.length >= count) break;
        if (!finalSelection.find(s => s.trackId === song.trackId)) {
          finalSelection.push(song);
        }
      }
    }

    const playlist = finalSelection.map(song => ({
      id: song.trackId,
      title: song.trackName,
      artist: song.artistName,
      previewUrl: song.previewUrl,
      coverUrl: song.artworkUrl100.replace('100x100', '300x300')
    }));

    const dictionary = validSongs.map(song => ({
      id: song.trackId,
      title: song.trackName,
      artist: song.artistName,
      previewUrl: song.previewUrl,
      coverUrl: song.artworkUrl100.replace('100x100', '300x300')
    }));

    return { playlist, dictionary };
  } catch (error) {
    console.error("Błąd podczas pobierania muzyki:", error);
    alert("Błąd połączenia z API: " + error.message);
    return { playlist: [], dictionary: [] };
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

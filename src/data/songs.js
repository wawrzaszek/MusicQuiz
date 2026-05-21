// Baza danych utworów pogrupowana w kategorie
// Każdy utwór posiada unikalne ID z YouTube, Tytuł i Wykonawcę.

export const categories = [
  { id: 'radio', name: 'Radio Hits', color: '#ff4b4b' },
  { id: 'rock', name: 'Klasyczny Rock', color: '#fca311' },
  { id: 'party', name: 'Impreza', color: '#a200ff' },
  { id: 'hiphop', name: 'Hip-Hop', color: '#2a9d8f' }
];

export const songsDB = {
  radio: [
    { id: '4NRXx6U8ABQ', title: 'Blinding Lights', artist: 'The Weeknd' },
    { id: 'bgFAM2YW1w', title: "Don't Start Now", artist: 'Dua Lipa' },
    { id: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran' },
    { id: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5' }
  ],
  rock: [
    { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen' },
    { id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit', artist: 'Nirvana' },
    { id: 'v2AC41dglnM', title: 'Thunderstruck', artist: 'AC/DC' },
    { id: '1w7OgIMMRc4', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses' }
  ],
  party: [
    { id: 'zWaymcVmJ-A', title: 'Macarena', artist: 'Los del Rio' },
    { id: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi' },
    { id: '7zp1TbIG4rw', title: 'Danza Kuduro', artist: 'Don Omar' },
    { id: 'YvkRvt-E90', title: 'Wake Me Up', artist: 'Avicii' }
  ],
  hiphop: [
    { id: '_Yhyp-_hX2s', title: 'Lose Yourself', artist: 'Eminem' },
    { id: '5qm8PH4xAss', title: 'In Da Club', artist: '50 Cent' },
    { id: '_CL6n0FJZlc', title: 'Still D.R.E.', artist: 'Dr. Dre' },
    { id: 'tvTRZJ-4EyI', title: 'HUMBLE.', artist: 'Kendrick Lamar' }
  ]
};

// Funkcja pomocnicza do generowania fałszywych odpowiedzi dla quizu
export const getRandomWrongAnswers = (correctSong, category, count = 3) => {
  const categorySongs = songsDB[category];
  // Filtrujemy wszystkie piosenki, aby nie wylosować poprawnej
  let otherSongs = categorySongs.filter(s => s.id !== correctSong.id);
  
  // Jeśli w kategorii brakuje piosenek do błędnych odpowiedzi, dobierz z innych kategorii
  if (otherSongs.length < count) {
      Object.values(songsDB).forEach(catSongs => {
          otherSongs = [...otherSongs, ...catSongs.filter(s => s.id !== correctSong.id)];
      });
  }

  // Tasowanie tablicy
  const shuffled = otherSongs.sort(() => 0.5 - Math.random());
  
  // Zwracamy wybraną liczbę błędnych odpowiedzi (sformatowanych jako string "Artysta - Tytuł")
  return shuffled.slice(0, count).map(s => `${s.artist} - ${s.title}`);
};

exports.handler = async (event, context) => {
  try {
    const url = new URL('https://itunes.apple.com/search');
    
    // Kopiujemy wszystkie parametry z zapytania (np. term, media, limit)
    for (const [key, value] of Object.entries(event.queryStringParameters)) {
      url.searchParams.append(key, value);
    }

    // Wykonujemy żądanie do API Apple, nadpisując nagłówek User-Agent.
    // Jest to kluczowe do ominięcia błędu na iOS (iPhone): 
    // Gdy Apple wykryje nagłówek User-Agent z iPhone'a, API może zwrócić 
    // kod 302 i przekierować do schematu `musics://...`, co powoduje 
    // błędy CORS i zablokowanie zapytania przez przeglądarkę.
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Apple API responded with status ${response.status}` })
      };
    }

    const data = await response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

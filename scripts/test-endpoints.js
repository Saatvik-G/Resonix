const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function post(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const data = JSON.stringify(body);
    const req = http.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: rawData ? JSON.parse(rawData) : null,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: rawData,
            });
          }
        });
      }
    );
    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

async function get(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.get(url, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: rawData ? JSON.parse(rawData) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: rawData,
          });
        }
      });
    });
    req.on('error', (err) => reject(err));
  });
}

async function runTests() {
  console.log('=== STARTING ECHOVERSE FULL ROADMAP AUDIT ===\n');

  // 1. Core Discovery Modes: Search / Recommendations
  console.log('--- 1. Testing Core Discovery Features ---');
  
  // Search queries (text & emoji)
  const searchQueries = [
    { query: 'diljit dosanjh hits', type: 'text' },
    { query: 'chill acoustic indie', type: 'text' },
    { query: '🔥🕺🎉', type: 'emoji' }
  ];

  for (const sq of searchQueries) {
    const res = await post('/api/search', sq);
    console.log(`[Search: "${sq.query}"] Status: ${res.status}`);
    if (res.status === 200) {
      console.log(` -> Interpretation: ${res.body.interpretation}`);
      console.log(` -> Found: ${res.body.recommendations?.length} tracks`);
      if (res.body.recommendations?.length > 0) {
        console.log(` -> First match: "${res.body.recommendations[0].title}" by ${res.body.recommendations[0].artist}`);
        console.log(` -> Why matches: ${res.body.recommendations[0].whyThisMatches}`);
      }
    } else {
      console.error(` -> Failed:`, res.body);
    }
  }

  // Graceful degradation for empty search query
  console.log('\n[Search: Empty Query Degradation Check]');
  const emptySearch = await post('/api/search', { query: '' });
  console.log(` -> Empty query status: ${emptySearch.status}`);
  console.log(` -> Response:`, emptySearch.body);

  // Recommendations modes (color, weather, personality, activity, mood, creative)
  const modes = [
    { mode: 'color', value: 'Crimson' },
    { mode: 'color', value: 'Indigo' },
    { mode: 'weather', value: 'Rainy' },
    { mode: 'weather', value: 'Sunny' },
    { mode: 'personality', value: 'INTJ' },
    { mode: 'personality', value: 'INFP' },
    { mode: 'activity', value: 'Coding' },
    { mode: 'activity', value: 'Running' },
    { mode: 'mood', value: 'Dreamy' },
    { mode: 'creative', value: 'Tokyo Night' }
  ];

  for (const m of modes) {
    const res = await post('/api/recommendations', m);
    console.log(`[Recommendations Mode: "${m.mode}" Value: "${m.value}"] Status: ${res.status}`);
    if (res.status === 200) {
      console.log(` -> Interpretation: ${res.body.interpretation}`);
      console.log(` -> Tracks: ${res.body.recommendations?.length}`);
      if (res.body.recommendations?.length > 0) {
        console.log(` -> Sample: "${res.body.recommendations[0].title}" by ${res.body.recommendations[0].artist}`);
      }
    } else {
      console.error(` -> Failed:`, res.body);
    }
  }

  // Graceful degradation for empty recommendation query
  console.log('\n[Recommendations: Empty/Missing Mode Check]');
  const emptyRec = await post('/api/recommendations', { mode: 'color', value: '' });
  console.log(` -> Empty query status: ${emptyRec.status}`);
  console.log(` -> Response:`, emptyRec.body);


  // 2. AI Playlist Generator & Chat verification
  console.log('\n--- 2. Testing AI Playlist & Chat ---');
  const playlistPrompts = [
    'Retro synth-wave driving at 2am',
    'Chill study session with lo-fi beats',
    'Upbeat Punjabi party starters',
    'Rainy day folk and acoustic storytellers',
    'Atmospheric space exploration synth ambient'
  ];
  for (const prompt of playlistPrompts) {
    const res = await post('/api/playlist/generate', { prompt });
    console.log(`[Playlist Prompt: "${prompt}"] Status: ${res.status}`);
    if (res.status === 200) {
      console.log(` -> Name: "${res.body.name}"`);
      console.log(` -> Blurb: "${res.body.conceptBlurb}"`);
      console.log(` -> Track Count: ${res.body.tracks?.length}`);
    } else {
      console.error(` -> Failed:`, res.body);
    }
  }

  const chatMessages = [
    { role: 'user', content: 'I feel really stressed and tired from work. I need something to calm me down, maybe some acoustic or soft indie tracks.' }
  ];
  const chatRes = await post('/api/chat', { messages: chatMessages });
  console.log(`[AI Chat emotional triggers] Status: ${chatRes.status}`);
  if (chatRes.status === 200) {
    console.log(` -> Chat Reply snippet: "${chatRes.body.response?.substring(0, 150)}..."`);
  } else {
    console.error(` -> Failed:`, chatRes.body);
  }


  // 3. Genre Explorer & Data accuracy check
  console.log('\n--- 3. Testing Genre Explorer & Accuracy ---');
  const genres = ['pop', 'rock', 'electronic', 'jazz', 'hip-hop'];
  for (const genre of genres) {
    const res = await get(`/api/genre/${genre}`);
    console.log(`[Genre: "${genre}"] Status: ${res.status}`);
    if (res.status === 200) {
      console.log(` -> Popular Artists: ${res.body.popularArtists?.join(', ')}`);
      console.log(` -> Essential Albums: ${res.body.essentialAlbums?.length}`);
      console.log(` -> Underrated Artists: ${res.body.underratedArtists?.length}`);
      // Duplicate check:
      const uniqueArtists = new Set(res.body.popularArtists);
      if (uniqueArtists.size !== res.body.popularArtists.length) {
        console.warn(` -> WARNING: Duplicates found in popularArtists list!`);
      } else {
        console.log(` -> Artist Accuracy: Verified unique list`);
      }
    } else {
      console.error(` -> Failed:`, res.body);
    }
  }


  // 4. Music DNA & Lyric Mood compliance
  console.log('\n--- 4. Testing Music DNA & Lyric Mood ---');
  const dnaRes = await post('/api/music-dna', {
    history: 'Pasoori by Ali Sethi, Midnight City by M83, Starboy by The Weeknd',
    preferences: 'Dreamy synth-pop, Punjabi pop, dark R&B'
  });
  console.log(`[Music DNA Profile] Status: ${dnaRes.status}`);
  if (dnaRes.status === 200) {
    console.log(` -> Archetype: "${dnaRes.body.archetype}"`);
    console.log(` -> Traits: ${dnaRes.body.traits?.join(', ')}`);
    console.log(` -> Stats:`, dnaRes.body.stats);
  }

  const lyricRes = await post('/api/lyric-mood', { track: 'Bohemian Rhapsody', artist: 'Queen' });
  console.log(`[Lyric Mood Compliance Check] Status: ${lyricRes.status}`);
  if (lyricRes.status === 200) {
    console.log(` -> Mood: "${lyricRes.body.dominantMood}"`);
    console.log(` -> Vibe Tag: "${lyricRes.body.vibeTag}"`);
    console.log(` -> Contains Copyrighted Lyrics: ${resBodyContainsLyrics(lyricRes.body) ? 'YES (Violates rule!)' : 'NO (Compliant)'}`);
  }


  // 5. Decade Explorer, Artist Comparison, and Hidden Gems check
  console.log('\n--- 5. Testing Decades, Artist Comparison, Hidden Gems ---');
  const decadesRes = await get('/api/decades?decade=80s');
  console.log(`[Decade: 1980s GET] Status: ${decadesRes.status}`);
  if (decadesRes.status === 200) {
    console.log(` -> Recommendations Count: ${decadesRes.body.recommendations?.length}`);
  }

  const compareRes = await post('/api/compare-artists', { artist1: 'The Beatles', artist2: 'Radiohead' });
  console.log(`[Compare Artists: "The Beatles" vs "Radiohead"] Status: ${compareRes.status}`);
  if (compareRes.status === 200) {
    console.log(` -> Artist 1 Complexity: ${compareRes.body.artist1.moodProfile.complex}/100`);
    console.log(` -> Artist 2 Complexity: ${compareRes.body.artist2.moodProfile.complex}/100`);
    console.log(` -> Concept: ${compareRes.body.collaborationConcept.title}`);
  }

  const obscureCompare = await post('/api/compare-artists', { artist1: 'ObscureArtistXYZ123', artist2: 'SomeUnknownBand999' });
  console.log(`[Obscure Pair Comparison Degradation Check] Status: ${obscureCompare.status}`);
  if (obscureCompare.status === 200) {
    console.log(` -> Degradation Result: ${obscureCompare.body.artist1.name} vs ${obscureCompare.body.artist2.name}`);
    console.log(` -> Concept: ${obscureCompare.body.collaborationConcept.title}`);
  }

  const gemsRes = await get('/api/hidden-gems');
  console.log(`[Hidden Gems Listener Counts Check] Status: ${gemsRes.status}`);
  if (gemsRes.status === 200) {
    console.log(` -> Count: ${gemsRes.body.recommendations?.length}`);
    for (const gem of (gemsRes.body.recommendations || []).slice(0, 3)) {
      console.log(`   -> "${gem.title}" by ${gem.artist} (Listeners: ${gem.listeners || 'N/A'})`);
    }
  }


  // 6. Movie/Book/Location prompts (hallucination check)
  console.log('\n--- 6. Testing Movie/Book/Location Hallucination Check ---');
  const creativePrompts = [
    { mode: 'creative', value: 'Tokyo Night' },
    { mode: 'creative', value: 'Interstellar Soundtrack' },
    { mode: 'creative', value: 'Haruki Murakami Book Vibe' }
  ];
  for (const cp of creativePrompts) {
    const res = await post('/api/recommendations', cp);
    console.log(`[Creative: "${cp.value}"] Status: ${res.status}`);
    if (res.status === 200) {
      console.log(` -> Tracks generated: ${res.body.recommendations?.length}`);
      if (res.body.recommendations?.length > 0) {
        console.log(` -> Sample track: "${res.body.recommendations[0].title}" by ${res.body.recommendations[0].artist}`);
      }
    }
  }


  // 7. Trending/Charts data pipeline cache validation
  console.log('\n--- 7. Testing Trending/Charts Cache & Indian Hits Mapping ---');
  const trendingRes = await get('/api/trending');
  console.log(`[Trending API] Status: ${trendingRes.status}`);
  if (trendingRes.status === 200) {
    console.log(` -> Tracks Count: ${trendingRes.body.tracks?.length}`);
    console.log(` -> Cache Header: ${trendingRes.headers['cache-control'] || 'none'}`);
    const inTracks = trendingRes.body.tracks?.filter(t => t.language?.toLowerCase() === 'hindi' || t.language?.toLowerCase() === 'punjabi');
    console.log(` -> Indian Hits mapping sample size: ${inTracks?.length} tracks in trending`);
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

function resBodyContainsLyrics(body) {
  const serialized = JSON.stringify(body).toLowerCase();
  return serialized.includes('lyrics') && (
    serialized.includes('sky') ||
    serialized.includes('mama') ||
    serialized.includes('scaramouche') ||
    serialized.includes('wind blows')
  );
}

runTests().catch(console.error);

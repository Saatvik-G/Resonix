const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
let envData = fs.readFileSync(envPath, 'utf8');

envData.split('\n').forEach(line => {
  const clean = line.trim();
  if (!clean || clean.startsWith('#')) return;
  const idx = clean.indexOf('=');
  if (idx > 0) {
    const key = clean.substring(0, idx).trim();
    const val = clean.substring(idx + 1).trim();
    process.env[key] = val;
  }
});

console.log('Env loaded:');
console.log('LASTFM_API_KEY:', process.env.LASTFM_API_KEY);
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Test Gemini
async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello! Say 'Gemini is working' if you read this.");
    console.log('\n[Gemini Test] Result:', result.response.text());
  } catch (err) {
    console.error('\n[Gemini Test] Failed:', err);
  }
}

// Test Last.fm
async function testLastFM() {
  const apiKey = process.env.LASTFM_API_KEY;
  const url = `http://ws.audioscrobbler.com/2.0/?method=track.search&track=diljit&api_key=${apiKey}&format=json&limit=5`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('\n[Last.fm Test] Result Count:', data.results?.trackmatches?.track?.length || 0);
    if (data.results?.trackmatches?.track?.length > 0) {
      console.log('  Sample track:', data.results.trackmatches.track[0]);
    }
  } catch (err) {
    console.error('\n[Last.fm Test] Failed:', err);
  }
}

// Test Spotify
async function testSpotify() {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  try {
    const creds = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const data = await res.json();
    console.log('\n[Spotify Auth Test] Token received:', !!data.access_token);
    if (data.access_token) {
      const searchRes = await fetch(`https://api.spotify.com/v1/search?q=diljit&type=track&limit=2`, {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      const searchData = await searchRes.json();
      console.log('[Spotify Search Test] Found:', searchData.tracks?.items?.length || 0);
    } else {
      console.log('[Spotify Auth Test] Failed response:', data);
    }
  } catch (err) {
    console.error('\n[Spotify Test] Failed:', err);
  }
}

// Test YouTube
async function testYouTube() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const ytSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&q=diljit&type=video&key=${apiKey}`;
  try {
    const res = await fetch(ytSearchUrl);
    const data = await res.json();
    console.log('\n[YouTube Test] Found:', data.items?.length || 0);
    if (data.error) {
      console.log('  YouTube API Error details:', data.error);
    }
  } catch (err) {
    console.error('\n[YouTube Test] Failed:', err);
  }
}

async function run() {
  await testGemini();
  await testLastFM();
  await testSpotify();
  await testYouTube();
}

run();

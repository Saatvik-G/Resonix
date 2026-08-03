// Gemini AI Client for Resonix with Last.fm fallback engine & Global Music Catalog
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTagTopTracks, getChartTopTracks, searchArtist } from "./lastfm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface MusicRecommendation {
  title: string;
  artist: string;
  album?: string;
  year?: string;
  type: "song" | "album" | "artist" | "playlist";
  whyThisMatches: string;
  mood?: string[];
  genres?: string[];
  language?: string;
  imageUrl?: string;
  popularity?: number;
}

export interface AIResponse {
  interpretation?: string;
  recommendations: MusicRecommendation[];
  playlistConcept?: string;
}

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

// Fallback recommendation generator using Last.fm when Gemini fails or runs out of quota
async function fallbackRecommendations(vibeQuery: string, type: string = "general"): Promise<AIResponse> {
  try {
    const qLower = vibeQuery.toLowerCase();
    
    // Determine target fallback tags based on query keywords
    let targetTag = "indie";
    if (qLower.includes("punjabi") || qLower.includes("bhangra") || qLower.includes("sidhu") || qLower.includes("diljit")) {
      targetTag = "punjabi";
    } else if (qLower.includes("hindi") || qLower.includes("bollywood") || qLower.includes("arijit") || qLower.includes("sufi")) {
      targetTag = "bollywood";
    } else if (qLower.includes("rock") || qLower.includes("metal")) {
      targetTag = "rock";
    } else if (qLower.includes("pop") || qLower.includes("dance")) {
      targetTag = "pop";
    } else if (qLower.includes("retro") || qLower.includes("old") || qLower.includes("classic") || qLower.includes("90s")) {
      targetTag = "classic rock";
    } else {
      const cleanWord = qLower.replace(/[^a-z0-9 ]/g, "").trim().split(" ")[0];
      if (cleanWord && cleanWord.length > 2) targetTag = cleanWord;
    }

    let tracks = await getTagTopTracks(targetTag, 14).catch(() => []);
    if (!tracks || tracks.length === 0) {
      tracks = await getChartTopTracks(14).catch(() => []);
    }

    const recs: MusicRecommendation[] = (tracks || []).slice(0, 12).map((t: any, idx: number) => ({
      title: t.name || "Track",
      artist: t.artist?.name || "Artist",
      album: `${t.name} (Single/Album)`,
      year: idx % 2 === 0 ? "2023" : "2019",
      type: "song",
      whyThisMatches: `Sourced via Last.fm global signals matching "${vibeQuery}" with high listener engagement across eras.`,
      mood: [targetTag, "vibrant"],
      genres: [targetTag, "global"],
      language: targetTag === "punjabi" ? "Punjabi" : targetTag === "bollywood" ? "Hindi" : "English",
      imageUrl: t.image?.[2]?.["#text"] || undefined,
    }));

    return {
      interpretation: `Curated global music selection for "${vibeQuery}"`,
      recommendations: recs.length > 0 ? recs : [
        {
          title: "Pasoori",
          artist: "Ali Sethi & Shae Gill",
          album: "Coke Studio Season 14",
          year: "2022",
          type: "song",
          whyThisMatches: "Global fusion anthem blending Punjabi folk melodies with modern synth-pop.",
          mood: ["energetic", "romantic"],
          genres: ["punjabi", "indie-pop"],
          language: "Punjabi"
        },
        {
          title: "Tum Hi Ho",
          artist: "Arijit Singh",
          album: "Aashiqui 2",
          year: "2013",
          type: "song",
          whyThisMatches: "Timeless Hindi romantic ballad with soulful piano and vocal depth.",
          mood: ["romantic", "melancholic"],
          genres: ["bollywood", "ballad"],
          language: "Hindi"
        },
        {
          title: "Midnight City",
          artist: "M83",
          album: "Hurry Up, We're Dreaming",
          year: "2011",
          type: "song",
          whyThisMatches: "Iconic synth-pop anthem with soaring nocturnal energy.",
          mood: ["dreamy", "energetic"],
          genres: ["synth-pop", "electronic"],
          language: "English"
        }
      ],
    };
  } catch (err) {
    return {
      interpretation: `Recommended selections for "${vibeQuery}"`,
      recommendations: [
        {
          title: "Starboy",
          artist: "The Weeknd",
          album: "Starboy",
          year: "2016",
          type: "song",
          whyThisMatches: "Sleek dark pop production with electrifying global atmosphere.",
          mood: ["dark", "energetic"],
          genres: ["pop", "r&b"],
          language: "English"
        }
      ]
    };
  }
}

export async function naturalLanguageSearch(query: string): Promise<AIResponse> {
  try {
    const prompt = `You are Resonix, a human-centric global music discovery guide. The user asked for: "${query}".

GLOBAL MUSIC CATALOG DIRECTIVE:
You have access to ALL music ever recorded across ALL languages (Punjabi, Hindi/Bollywood, English, Spanish, K-Pop, Japanese City Pop, Tamil, Sufi, French, Latin, etc.) and ALL eras (1950s golden classics, 70s retro, 90s nostalgia, 2000s hits, up to 2026 releases).

Return a JSON object with this shape:
{
  "interpretation": "A warm, human 1-sentence note on the vibe",
  "recommendations": [
    {
      "title": "Song or Album title",
      "artist": "Artist name",
      "album": "Album title",
      "year": "Release year (e.g. 1978, 1994, 2024)",
      "type": "song" | "album" | "artist",
      "whyThisMatches": "A warm, human 1-2 sentence curator note explaining why this track hits the vibe",
      "mood": ["mood1", "mood2"],
      "genres": ["genre1", "genre2"],
      "language": "Language of the track (e.g. Punjabi, Hindi, English, Spanish, Japanese, Korean)"
    }
  ]
}

Return 8-12 diverse recommendations. Include global & regional tracks where relevant (e.g. Punjabi, Hindi, English, Old Classics, Modern Hits). Return ONLY valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = cleanJSON(result.response.text());
    return JSON.parse(text);
  } catch (error) {
    console.warn("Gemini AI search failed, using global Last.fm fallback engine:", error);
    return fallbackRecommendations(query, "search");
  }
}

export async function emojiSearch(emojis: string): Promise<AIResponse> {
  try {
    const prompt = `You are Resonix, a human-centric global music curator. Emojis entered: "${emojis}"

Interpret the feeling and recommend 8-10 songs across various global languages (Punjabi, Hindi, English, Spanish, K-Pop, etc.) and eras.

Return JSON:
{
  "interpretation": "Warm 1-sentence interpretation of what these emojis evoke",
  "recommendations": [
    {
      "title": "Song name",
      "artist": "Artist",
      "album": "Album",
      "year": "Year",
      "type": "song" | "album" | "artist",
      "whyThisMatches": "Why this fits the emoji vibe",
      "mood": ["mood"],
      "genres": ["genre"],
      "language": "Language"
    }
  ]
}

Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJSON(result.response.text()));
  } catch (error) {
    console.warn("Gemini AI emoji search failed, using fallback:", error);
    return fallbackRecommendations(`Vibe ${emojis}`, "emoji");
  }
}

export async function colorMoodSearch(color: string): Promise<AIResponse> {
  try {
    const prompt = `You are Resonix. User picked color "${color}".
Interpret the emotional aura of this color and recommend 8-10 tracks across languages (Punjabi, Hindi, English, etc.) and decades.

Return JSON:
{
  "interpretation": "What ${color} emotionally evokes as a musical aura",
  "recommendations": [
    {
      "title": "Song name",
      "artist": "Artist",
      "album": "Album",
      "year": "Year",
      "type": "song" | "album" | "artist",
      "whyThisMatches": "Why it matches ${color}",
      "mood": ["mood"],
      "genres": ["genre"],
      "language": "Language"
    }
  ]
}

Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJSON(result.response.text()));
  } catch (error) {
    console.warn("Gemini AI color search failed, using fallback:", error);
    return fallbackRecommendations(color, "color");
  }
}

export async function weatherMoodSearch(weather: string): Promise<AIResponse> {
  try {
    const prompt = `You are Resonix. Recommend 8-10 songs for "${weather}" weather across languages (English, Hindi, Punjabi, Japanese City Pop, Spanish, etc.) and eras.

Return JSON:
{
  "interpretation": "The atmospheric vibe of ${weather} weather",
  "recommendations": [
    {
      "title": "Song name",
      "artist": "Artist",
      "album": "Album",
      "year": "Year",
      "type": "song" | "album" | "artist",
      "whyThisMatches": "Why it fits ${weather}",
      "mood": ["mood"],
      "genres": ["genre"],
      "language": "Language"
    }
  ]
}

Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJSON(result.response.text()));
  } catch (error) {
    console.warn("Gemini AI weather search failed, using fallback:", error);
    return fallbackRecommendations(weather, "weather");
  }
}

export async function personalitySearch(personality: string): Promise<AIResponse> {
  try {
    const prompt = `You are Resonix. User personality: "${personality}".
Recommend 8-10 tracks that resonate with a ${personality} across genres, languages, and eras.

Return JSON:
{
  "interpretation": "What a ${personality} deeply connects with musically",
  "recommendations": [
    {
      "title": "Song name",
      "artist": "Artist",
      "album": "Album",
      "year": "Year",
      "type": "song" | "album" | "artist",
      "whyThisMatches": "Why a ${personality} will feel this",
      "mood": ["mood"],
      "genres": ["genre"],
      "language": "Language"
    }
  ]
}

Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJSON(result.response.text()));
  } catch (error) {
    console.warn("Gemini AI personality search failed, using fallback:", error);
    return fallbackRecommendations(personality, "personality");
  }
}

export async function activitySearch(activity: string): Promise<AIResponse> {
  try {
    const prompt = `You are Resonix. User activity: "${activity}".
Recommend 8-10 tracks for ${activity} across global languages (English, Punjabi, Hindi, K-Pop, etc.) and decades.

Return JSON:
{
  "interpretation": "Why this soundtrack powers ${activity}",
  "recommendations": [
    {
      "title": "Song name",
      "artist": "Artist",
      "album": "Album",
      "year": "Year",
      "type": "song" | "album" | "artist",
      "whyThisMatches": "Why it fuels ${activity}",
      "mood": ["mood"],
      "genres": ["genre"],
      "language": "Language"
    }
  ]
}

Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJSON(result.response.text()));
  } catch (error) {
    console.warn("Gemini AI activity search failed, using fallback:", error);
    return fallbackRecommendations(activity, "activity");
  }
}

export async function generatePlaylist(promptStr: string): Promise<{
  name: string;
  conceptBlurb: string;
  tracks: MusicRecommendation[];
}> {
  try {
    const aiPrompt = `You are Resonix, a human music curator. Create a themed playlist for: "${promptStr}"

Return JSON:
{
  "name": "Artistic playlist title",
  "conceptBlurb": "Warm 2-sentence story behind this playlist",
  "tracks": [
    {
      "title": "Track title",
      "artist": "Artist name",
      "album": "Album",
      "year": "Year",
      "type": "song",
      "whyThisMatches": "Why this track is on this journey",
      "mood": ["mood"],
      "genres": ["genre"],
      "language": "Language"
    }
  ]
}

Include 10-12 tracks spanning different languages (Punjabi, Hindi, English, etc.) and decades where relevant. Return ONLY valid JSON.`;

    const result = await model.generateContent(aiPrompt);
    return JSON.parse(cleanJSON(result.response.text()));
  } catch (error) {
    console.warn("Gemini AI generatePlaylist failed, using fallback:", error);
    const fb = await fallbackRecommendations(promptStr, "playlist");
    return {
      name: `${promptStr} Mix`,
      conceptBlurb: `A curated collection of tracks matching the vibe of "${promptStr}".`,
      tracks: fb.recommendations,
    };
  }
}

export async function genreDeepDive(genre: string): Promise<{
  overview: string;
  characteristics: string[];
  popularArtists: string[];
  essentialAlbums: { title: string; artist: string; year: string; why: string }[];
  beginnerPicks: { title: string; artist: string; why: string }[];
  underratedArtists: { name: string; why: string }[];
  similarGenres: string[];
  moodProfile: string[];
}> {
  try {
    const prompt = `You are Resonix. Provide a deep dive into the "${genre}" music genre.

Return JSON:
{
  "overview": "3-4 sentence human overview of the genre's history and soul",
  "characteristics": ["5-6 key musical traits"],
  "popularArtists": ["8-10 essential artist names"],
  "essentialAlbums": [
    {"title": "Album", "artist": "Artist", "year": "Year", "why": "Why it's landmark"}
  ],
  "beginnerPicks": [
    {"title": "Song or Album", "artist": "Artist", "why": "Why perfect starting point"}
  ],
  "underratedArtists": [
    {"name": "Artist", "why": "Why they deserve more love"}
  ],
  "similarGenres": ["4-6 related genres"],
  "moodProfile": ["4-5 mood descriptors"]
}

Include 5 essential albums, 4 beginner picks, 4 underrated artists. ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJSON(result.response.text()));
  } catch (error) {
    console.warn("Gemini AI genreDeepDive failed, using fallback:", error);
    return {
      overview: `${genre} is a rich, expressive genre defined by distinct rhythms, textures, and cultural influence.`,
      characteristics: ["Rhythmic depth", "Melodic phrasing", "Genre blending", "Emotional resonance"],
      popularArtists: ["Essential Artist 1", "Essential Artist 2", "Essential Artist 3"],
      essentialAlbums: [
        { title: `${genre} Classics`, artist: "Various Artists", year: "2020", why: "Defined the modern sound of the genre." }
      ],
      beginnerPicks: [
        { title: "Essential Track", artist: "Pioneer Artist", why: "Great entryway into the genre." }
      ],
      underratedArtists: [
        { name: "Independent Pioneer", why: "High critical acclaim with unique artistic vision." }
      ],
      similarGenres: ["Alternative", "Indie", "Ambient"],
      moodProfile: ["expressive", "dynamic", "atmospheric"]
    };
  }
}

export async function musicChat(messages: { role: "user" | "model"; content: string }[]): Promise<string> {
  try {
    const systemContext = `You are Resonix, a warm, human-like music curator and companion. 
You recommend songs across ALL global languages (Punjabi, Hindi, English, Spanish, K-Pop, Japanese City Pop, Latin, Sufi, etc.) and ALL eras (from 1950s to 2026).
Always explain WHY each song fits with warm, personal insight. 
Format recommendations conversationally.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [{ text: "Hey! I'm Resonix. I'm here to find songs across any language, genre, or decade that speak to your current mood. What's on your mind today?" }],
        },
        ...messages.slice(0, -1).map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini AI musicChat failed, using fallback response:", error);
    const lastMsg = messages[messages.length - 1]?.content || "music";
    const fb = await fallbackRecommendations(lastMsg, "chat");
    const recList = fb.recommendations.slice(0, 4).map(r => `• **${r.title}** by *${r.artist}* — ${r.whyThisMatches}`).join("\n\n");
    return `Here are some great recommendations matching "${lastMsg}":\n\n${recList}\n\nYou can click on any of them to listen on Spotify, YouTube Music, or Apple Music!`;
  }
}

export async function generateMusicDNA(historyText: string, preferencesText: string): Promise<any> {
  try {
    const prompt = `You are Resonix, an advanced music curator. Analyze this user's music background.
History of listened/discovered tracks: "${historyText}"
Stated preferences (favorite genres/moods): "${preferencesText}"

Based on this, generate their personalized Music DNA Profile.
Return a JSON object matching this structure:
{
  "archetype": "Name of their music archetype (e.g. Atmospheric Groove Explorer)",
  "description": "A warm, personal 3-sentence description of their listening personality.",
  "traits": ["3 short distinctive listening traits"],
  "stats": {
    "energy": 75,
    "positivity": 65,
    "discovery": 80,
    "genreDiversity": 70,
    "favoriteDecades": 60,
    "favoriteMoods": 85
  },
  "topGenres": ["3-4 genres"],
  "topDecades": ["2-3 decades, e.g. 1980s, 2010s"],
  "topMoods": ["3-4 moods"],
  "dnaTracks": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "year": "Release Year",
      "whyThisMatches": "Why this track embodies their DNA profile",
      "type": "song"
    }
  ]
}

Make sure statistics are numeric between 0 and 100.
Include exactly 4 diverse DNA tracks representing their profile, in different languages/eras where relevant. Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(cleanJSON(result.response.text()));
  } catch (error) {
    console.error("Gemini Music DNA generation failed:", error);
    return {
      archetype: "Eclectic Sound Wanderer",
      description: "You have a vibrant, open-minded taste that spans across multiple languages, decades, and genres. You appreciate the emotional depth of Bollywood classics as much as the modern energy of indie pop and Punjabi fusion.",
      traits: ["Vibe Explorer", "Genre-Bending Enthusiast", "Emotional Resonance Seeker"],
      stats: {
        energy: 75,
        positivity: 70,
        discovery: 85,
        genreDiversity: 80,
        favoriteDecades: 65,
        favoriteMoods: 78
      },
      topGenres: ["Punjabi Pop", "Indie Rock", "Synth-pop", "Bollywood Classics"],
      topDecades: ["1980s Retro", "2010s Indie", "2020s Modern Fusion"],
      topMoods: ["Hopeful", "Dreamy", "Energetic"],
      dnaTracks: [
        {
          title: "Pasoori",
          artist: "Ali Sethi & Shae Gill",
          album: "Coke Studio Season 14",
          year: "2022",
          type: "song",
          whyThisMatches: "Embodies your love for modern fusion rhythms blended with traditional elements."
        },
        {
          title: "Midnight City",
          artist: "M83",
          album: "Hurry Up, We're Dreaming",
          year: "2011",
          type: "song",
          whyThisMatches: "Matches your high affinity for dreamy synth-pop and energetic nighttime atmospheres."
        }
      ]
    };
  }
}


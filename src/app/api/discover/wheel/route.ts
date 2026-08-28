import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchSpotifyTracks } from "@/lib/spotify";
import { enrichRecommendationsWithArtwork } from "@/lib/artwork";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

const SURPRISE_THEMES: Record<string, string[]> = {
  genre: [
    "Post-Rock & Cinematic Instrumental",
    "Desert Blues & West African Grooves",
    "Electro-Swing & Retro beats",
    "Math Rock & Complex Guitar Tapping",
    "Darkwave & Gothic Synthpop"
  ],
  artist: [
    "Artists carrying the spirit of Aphex Twin and IDM",
    "Sufi rock and fusion inspired by A.R. Rahman",
    "Afrobeats pioneers inspired by Fela Kuti",
    "Goth rock inspired by Joy Division",
    "Indie folk inspired by Bon Iver"
  ],
  album: [
    "Sci-fi electronic concept albums",
    "Acoustic folk and storytelling masterpieces",
    "Shoegaze albums with massive wall-of-sound guitar effects",
    "Ambient albums designed for sleep and meditation"
  ],
  playlist: [
    "Cyberpunk night driving through neon streets",
    "Rainy afternoon inside a cozy Parisian cafe",
    "Jogging through an empty metropolitan city at dawn",
    "Late-night programming in a dim-lit bedroom"
  ],
  mood: [
    "Ethereal, floating, and dreamy state of mind",
    "Rebellious, angsty, and high energy punk vibe",
    "Melancholic, bittersweet, and nostalgic memories",
    "Warm, fuzzy, and comfortable acoustic warmth"
  ],
  country: [
    "Brazilian Bossa Nova & Samba",
    "Japanese City Pop & Shibuya-kei",
    "Icelandic Ambient & Neo-Classical",
    "French Touch House & Nu-Disco",
    "Nigerian Afrobeats & Highlife"
  ],
  decade: [
    "1970s Psychedelic Funk & Analog Grooves",
    "1980s New Wave & Synth-pop anthems",
    "1990s Trip Hop & Downtempo beats",
    "2000s Post-Punk Revival & Garage Rock"
  ],
  language: [
    "Spanish Dream Pop & Shoegaze",
    "Korean Indie Folk & R&B",
    "Japanese Math Rock & Instrumental",
    "French Pop & Chanson"
  ]
};

export async function POST(req: NextRequest) {
  try {
    const { category } = await req.json();
    if (!category) return NextResponse.json({ error: "Category required" }, { status: 400 });

    const themes = SURPRISE_THEMES[category.toLowerCase()] || ["General Chill Beats"];
    const surpriseTheme = themes[Math.floor(Math.random() * themes.length)];

    const prompt = `You are the Resonix AI, an elite music curator. Recommend 4 outstanding tracks for the following theme: "${surpriseTheme}".
Format the response strictly as a JSON object containing the fields:
- "theme": string (the exact theme or subcategory details)
- "recommendations": array of objects, each containing:
  - "title": string
  - "artist": string
  - "album": string (optional)
  - "year": string (optional)
  - "type": "song"
  - "whyThisMatches": string (a short, warm, poetic 1-2 sentence description matching the Resonix style)
  - "genres": array of strings
  - "language": string
  - "popularity": number (estimated between 1 and 100, where 90+ is mainstream and <40 is obscure/indie)

Example JSON structure:
{
  "theme": "Japanese City Pop",
  "recommendations": [
    {
      "title": "Plastic Love",
      "artist": "Mariya Takeuchi",
      "album": "Variety",
      "year": "1984",
      "type": "song",
      "whyThisMatches": "The crown jewel of Japanese city pop, blending nostalgic melodies with infectious disco-funk basslines.",
      "genres": ["City Pop", "J-Pop", "Funk"],
      "language": "Japanese",
      "popularity": 75
    }
  ]
}

Ensure the response contains only the raw JSON. No markdown ticks, no commentary.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanText = cleanJSON(text);
    const result = JSON.parse(cleanText);

    if (result && result.recommendations) {
      // Validate and enrich tracks using Spotify Search
      result.recommendations = await Promise.all(
        result.recommendations.map(async (rec: any) => {
          try {
            const query = `${rec.artist} ${rec.title}`;
            const spotifyResults = await searchSpotifyTracks(query, 1);
            if (spotifyResults && spotifyResults.length > 0) {
              const matched = spotifyResults[0];
              return {
                ...rec,
                title: matched.name,
                artist: matched.artist,
                album: matched.album,
                imageUrl: matched.imageUrl || rec.imageUrl,
                year: matched.releaseYear || rec.year,
                popularity: matched.popularity
              };
            }
          } catch (err) {
            console.warn("Spotify validation failed in Wheel API:", err);
          }
          return rec;
        })
      );

      // Fallback artwork
      result.recommendations = await enrichRecommendationsWithArtwork(result.recommendations);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Discovery Wheel API error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations for wheel" }, { status: 500 });
  }
}

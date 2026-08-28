import { NextRequest, NextResponse } from "next/server";
import { getTrackInfo } from "@/lib/lastfm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { enrichRecommendationsWithArtwork } from "@/lib/artwork";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

export async function GET(req: NextRequest) {
  try {
    const prompt = `You are Resonix, an editorial music connoisseur. Suggest 6 genuine "Hidden Gems" (underrated, low-playcount, B-sides, or indie masterpieces).
Include a mix of languages (e.g. Punjabi, Hindi, English, Spanish, Japanese City Pop, Tamil, etc.).
For each track, write a warm, poetic curator note explaining why it is a masterpiece.

Return a JSON object matching this structure:
{
  "gems": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "year": "Release Year",
      "whyThisMatches": "AI curator note explaining its beauty and why it deserves more ears",
      "genres": ["Genre"],
      "language": "Language of song"
    }
  ]
}

Return ONLY valid JSON.`;

    let parsed;
    try {
      const result = await model.generateContent(prompt);
      parsed = JSON.parse(cleanJSON(result.response.text()));
    } catch (aiErr) {
      console.warn("Gemini Hidden Gems generation failed, using metadata fallback:", aiErr);
      parsed = {
        gems: [
          {
            title: "Ocean Eyes",
            artist: "Billie Eilish",
            album: "dont smile at me",
            year: "2016",
            whyThisMatches: "A beautifully soft, bedroom-pop dreamscape that shows absolute vulnerability.",
            genres: ["Indie Pop", "Dream Pop"],
            language: "English"
          },
          {
            title: "Fade Into You",
            artist: "Mazzy Star",
            album: "So Tonight That I Might See",
            year: "1993",
            whyThisMatches: "A legendary slow-core shoegaze gem with warm acoustic slide guitar and hazy vocals.",
            genres: ["Dream Pop", "Alternative"],
            language: "English"
          },
          {
            title: "Baarishein",
            artist: "Anuv Jain",
            album: "Baarishein (Single)",
            year: "2018",
            whyThisMatches: "A minimalist finger-plucked guitar ballad from Indian indie singer-songwriter Anuv Jain.",
            genres: ["Indie Acoustic", "Indian Indie"],
            language: "Hindi"
          },
          {
            title: "La Llorona",
            artist: "Lhasa De Sela",
            album: "La Llorona",
            year: "1997",
            whyThisMatches: "A hauntingly beautiful acoustic folk gem blending traditional Mexican elements with indie songcraft.",
            genres: ["World", "Latin Folk"],
            language: "Spanish"
          },
          {
            title: "Kasoor",
            artist: "Prateek Kuhad",
            album: "Kasoor (Single)",
            year: "2020",
            whyThisMatches: "An intimate and warm acoustic pop track detailing love and memory.",
            genres: ["Indian Indie", "Singer-Songwriter"],
            language: "Hindi"
          },
          {
            title: "Blue Monday",
            artist: "New Order",
            album: "Power, Corruption & Lies",
            year: "1983",
            whyThisMatches: "The bridge between post-punk and synthpop, defining the electronic underground.",
            genres: ["Synthpop", "New Wave"],
            language: "English"
          }
        ]
      };
    }
    
    // Validate each track using Last.fm API
    const validatedGems = await Promise.all(
      (parsed.gems || []).map(async (gem: any) => {
        try {
          const info = await getTrackInfo(gem.artist, gem.title);
          let listeners = 15000; // fallback default
          if (info && info.listeners) {
            listeners = Number(info.listeners);
          }
          return {
            ...gem,
            listeners,
            popularity: Math.min(Math.round((listeners / 300000) * 100), 75), // Cap popularity so it stays underrated
            type: "song" as const
          };
        } catch (e) {
          return {
            ...gem,
            listeners: 12000,
            popularity: 20,
            type: "song" as const
          };
        }
      })
    );

    // Filter to gems below listener threshold (e.g. 200,000 listeners)
    const filteredGems = validatedGems.filter(g => g.listeners < 200000);

    const finalGems = filteredGems.length > 0 ? filteredGems : validatedGems;
    const enriched = await enrichRecommendationsWithArtwork(finalGems);

    return NextResponse.json({ recommendations: enriched });
  } catch (error) {
    console.error("Hidden Gems API error:", error);
    return NextResponse.json({ error: "Failed to load hidden gems" }, { status: 500 });
  }
}

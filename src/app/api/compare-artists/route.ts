import { NextRequest, NextResponse } from "next/server";
import { getArtistInfo } from "@/lib/lastfm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { artist1, artist2 } = await req.json();
    if (!artist1 || !artist2) {
      return NextResponse.json({ error: "Both artist names are required" }, { status: 400 });
    }

    const [info1, info2] = await Promise.all([
      getArtistInfo(artist1).catch(() => null),
      getArtistInfo(artist2).catch(() => null),
    ]);

    const stats1 = info1 ? {
      listeners: Number(info1.stats?.listeners || 0),
      playcount: Number(info1.stats?.playcount || 0),
      bio: info1.bio?.summary || "",
      tags: info1.tags?.tag?.map((t: any) => t.name) || [],
    } : { listeners: 0, playcount: 0, bio: "", tags: [] };

    const stats2 = info2 ? {
      listeners: Number(info2.stats?.listeners || 0),
      playcount: Number(info2.stats?.playcount || 0),
      bio: info2.bio?.summary || "",
      tags: info2.tags?.tag?.map((t: any) => t.name) || [],
    } : { listeners: 0, playcount: 0, bio: "", tags: [] };

    const prompt = `You are a legendary music critic and curator.
Analyze and compare the following two artists side-by-side:
Artist 1: "${artist1}" (Tags: ${stats1.tags.join(", ")}; Bio: ${stats1.bio.slice(0, 300)})
Artist 2: "${artist2}" (Tags: ${stats2.tags.join(", ")}; Bio: ${stats2.bio.slice(0, 300)})

Provide a structured JSON comparison detailing their soundscapes, influence, popularity, and mood profiles.
Return a JSON object matching this structure:
{
  "artist1": {
    "name": "${artist1}",
    "genres": ["3 main genres"],
    "moodProfile": {
      "darkness": 70,
      "energy": 80,
      "positivity": 40,
      "complex": 75
    },
    "influences": ["3 primary influences/contemporaries"]
  },
  "artist2": {
    "name": "${artist2}",
    "genres": ["3 main genres"],
    "moodProfile": {
      "darkness": 60,
      "energy": 70,
      "positivity": 50,
      "complex": 65
    },
    "influences": ["3 primary influences/contemporaries"]
  },
  "comparisonSummary": "A warm, critical 3-4 sentence editorial comparison of their songwriting, dynamic range, and overall legacy.",
  "collaborationConcept": {
    "title": "Hypothetical collaboration song title",
    "description": "A creative 2-sentence description of what their joint track would sound like musically and lyrically."
  }
}

Make sure mood scores are numeric between 0 and 100.
Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const comparison = JSON.parse(cleanJSON(result.response.text()));
    
    // Add real Last.fm numbers to the response
    return NextResponse.json({
      ...comparison,
      artist1Stats: {
        listeners: stats1.listeners,
        playcount: stats1.playcount,
      },
      artist2Stats: {
        listeners: stats2.listeners,
        playcount: stats2.playcount,
      }
    });
  } catch (error) {
    console.error("Compare Artists API error:", error);
    return NextResponse.json({ error: "Failed to compare artists" }, { status: 500 });
  }
}

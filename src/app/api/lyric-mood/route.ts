import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { track, artist, lyrics } = await req.json();
    if (!track || !artist) {
      return NextResponse.json({ error: "Track and artist are required" }, { status: 400 });
    }

    const prompt = `You are a professional musicologist and lyric analyst at Resonix.
Analyze the emotional and lyrical profile of the song "${track}" by "${artist}".
${lyrics ? `Lyrical context provided: "${lyrics}"` : "If you know the official lyrics, analyze those. Otherwise, analyze the thematic essence, emotional tone, and lyrical style of this song."}

Lyrical Mood Dimensions to evaluate (each from 0 to 100):
- hopeful
- melancholic
- dark
- romantic
- energetic
- dreamy
- aggressive
- peaceful

Return a JSON object:
{
  "dominantMood": "One main mood from the list (hopeful, melancholic, dark, romantic, energetic, dreamy, aggressive, peaceful)",
  "vibeTag": "A creative vibe tag describing the style (e.g. Ethereal Nostalgia, Angsty Poetry)",
  "analysis": "A detailed 3-sentence summary of the song's lyric themes, subtext, and emotional resonance.",
  "blend": {
    "hopeful": 10,
    "melancholic": 85,
    "dark": 40,
    "romantic": 30,
    "energetic": 5,
    "dreamy": 60,
    "aggressive": 0,
    "peaceful": 20
  },
  "highlightedLines": [
    {
      "line": "A powerful or iconic line from the song",
      "meaning": "Brief explanation of its emotional weight"
    }
  ]
}

Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const analysis = JSON.parse(cleanJSON(result.response.text()));
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Lyric Mood Analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze lyric mood" }, { status: 500 });
  }
}

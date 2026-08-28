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

    let comparison;
    try {
      const result = await model.generateContent(prompt);
      comparison = JSON.parse(cleanJSON(result.response.text()));
    } catch (aiErr) {
      console.warn("Gemini Artist Comparison failed, using metadata fallback:", aiErr);
      
      const genres1 = stats1.tags.slice(0, 3);
      if (genres1.length === 0) genres1.push("Alternative", "Indie", "Sonic Art");
      const genres2 = stats2.tags.slice(0, 3);
      if (genres2.length === 0) genres2.push("Alternative", "Electronic", "Acoustic");

      const influences1 = ["Related Pioneer", "Contemporary Peer", "Traditional Guide"];
      const influences2 = ["Pioneering Spirit", "Indie Icon", "Collaborative Artist"];

      comparison = {
        artist1: {
          name: artist1,
          genres: genres1,
          moodProfile: { darkness: 50, energy: 60, positivity: 50, complex: 55 },
          influences: influences1
        },
        artist2: {
          name: artist2,
          genres: genres2,
          moodProfile: { darkness: 45, energy: 65, positivity: 55, complex: 50 },
          influences: influences2
        },
        comparisonSummary: `${artist1} and ${artist2} represent distinct corners of the musical landscape. While ${artist1} relies on elements of ${genres1[0] || 'their signature sound'}, ${artist2} creates contrasts through ${genres2[0] || 'their arrangement style'}. Both display unique craftsmanship and connect with listeners through authentic expression.`,
        collaborationConcept: {
          title: `Echoes of ${artist1.substring(0,4)} & ${artist2.substring(0,4)}`,
          description: `A hypothetical crossover track blending the sonic aesthetics of both artists, featuring atmospheric textures layered with a driving rhythm section.`
        }
      };
    }
    
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

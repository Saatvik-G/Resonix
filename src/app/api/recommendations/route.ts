import { NextRequest, NextResponse } from "next/server";
import {
  colorMoodSearch,
  weatherMoodSearch,
  personalitySearch,
  activitySearch,
  naturalLanguageSearch
} from "@/lib/gemini";
import { searchSpotifyTracks } from "@/lib/spotify";
import { enrichRecommendationsWithArtwork } from "@/lib/artwork";

export async function POST(req: NextRequest) {
  try {
    const { mode, value } = await req.json();
    if (!mode || !value) return NextResponse.json({ error: "Mode and value required" }, { status: 400 });

    let result;
    switch (mode) {
      case "color": result = await colorMoodSearch(value); break;
      case "weather": result = await weatherMoodSearch(value); break;
      case "personality": result = await personalitySearch(value); break;
      case "activity": result = await activitySearch(value); break;
      case "mood": result = await weatherMoodSearch(value); break;
      case "creative": result = await naturalLanguageSearch(value); break;
      default: return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

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
            console.warn("Spotify validation failed for track, falling back to artwork enricher:", err);
          }
          return rec;
        })
      );

      // Fallback: Enrich any remaining tracks with iTunes artwork if Spotify didn't find them
      result.recommendations = await enrichRecommendationsWithArtwork(result.recommendations);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json({ error: "Recommendation failed" }, { status: 500 });
  }
}

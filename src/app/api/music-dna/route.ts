import { NextRequest, NextResponse } from "next/server";
import { generateMusicDNA } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";
import { enrichRecommendationsWithArtwork } from "@/lib/artwork";

export async function POST(req: NextRequest) {
  try {
    const { preferences } = await req.json();
    const supabase = await createClient();
    
    // Get user session
    const { data: { user } } = await supabase.auth.getUser();
    
    let historyText = "No direct listening history available.";
    let preferencesText = preferences ? JSON.stringify(preferences) : "Not specified.";

    if (user) {
      // Fetch discovery history
      const { data: history } = await supabase
        .from("discovery_history")
        .select("item_data, query, discovery_mode")
        .eq("user_id", user.id)
        .order("discovered_at", { ascending: false })
        .limit(20);
        
      // Fetch mood tracking
      const { data: moodData } = await supabase
        .from("mood_tracking")
        .select("mood, count")
        .eq("user_id", user.id)
        .limit(10);
        
      if (history && history.length > 0) {
        historyText = history.map(h => {
          const item = h.item_data as any;
          return `${item.title || item.name} by ${item.artist || item.name} (mode: ${h.discovery_mode || "general"})`;
        }).join(", ");
      }
      
      if (moodData && moodData.length > 0) {
        preferencesText += ` | Recent logged moods: ${moodData.map(m => `${m.mood} (x${m.count})`).join(", ")}`;
      }
    }

    const dna = await generateMusicDNA(historyText, preferencesText);
    
    // Enrich DNA tracks with artwork
    if (dna && dna.dnaTracks) {
      dna.dnaTracks = await enrichRecommendationsWithArtwork(dna.dnaTracks);
    }
    
    return NextResponse.json(dna);
  } catch (error) {
    console.error("Music DNA API error:", error);
    return NextResponse.json({ error: "Failed to generate Music DNA" }, { status: 500 });
  }
}

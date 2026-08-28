import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/supabase/mockDb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "mock-user";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_gamification")
      .select("xp, badges")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    // Fallback to mockDb
    const data = mockDb.getGamification(userId);
    return NextResponse.json({ xp: data.xp, badges: data.badges });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, xpToAdd, badgeToEarn } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      
      // Get current gamification state first
      const { data: current, error: getErr } = await supabase
        .from("user_gamification")
        .select("xp, badges")
        .eq("user_id", userId)
        .single();
        
      let newXp = current?.xp || 0;
      let newBadges = current?.badges || [];
      if (badgeToEarn) {
        if (!newBadges.includes(badgeToEarn)) {
          newBadges = [...newBadges, badgeToEarn];
          newXp += (xpToAdd || 0);
        }
      } else {
        newXp += (xpToAdd || 0);
      }

      // Upsert gamification record
      const { data, error } = await supabase
        .from("user_gamification")
        .upsert({
          user_id: userId,
          xp: newXp,
          badges: newBadges
        })
        .select("xp, badges")
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } catch (dbErr) {
      // Mock DB Fallback
      const data = mockDb.updateGamification(userId, xpToAdd || 0, badgeToEarn);
      return NextResponse.json({ xp: data.xp, badges: data.badges, fallback: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

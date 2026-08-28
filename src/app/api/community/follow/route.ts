import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockDb, MOCK_PROFILES } from "@/lib/supabase/mockDb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "mock-user";
  const type = searchParams.get("type"); // "followers" | "following"

  try {
    const supabase = await createClient();
    if (type === "followers") {
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);
      if (error) throw error;
      
      // Map and include mock display names if needed
      const mapped = data.map((f: any) => {
        const mockProfile = MOCK_PROFILES.find(p => p.id === f.follower_id);
        return {
          id: f.follower_id,
          display_name: mockProfile?.display_name || `User_${f.follower_id.slice(0, 5)}`
        };
      });
      return NextResponse.json({ followers: mapped });
    } else {
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);
      if (error) throw error;

      const mapped = data.map((f: any) => {
        const mockProfile = MOCK_PROFILES.find(p => p.id === f.following_id);
        return {
          id: f.following_id,
          display_name: mockProfile?.display_name || `User_${f.following_id.slice(0, 5)}`
        };
      });
      return NextResponse.json({ following: mapped });
    }
  } catch (err) {
    // Fallback to mockDb
    if (type === "followers") {
      const followers = mockDb.getFollowers(userId).map(f => {
        const mockProfile = MOCK_PROFILES.find(p => p.id === f.follower_id);
        return {
          id: f.follower_id,
          display_name: mockProfile?.display_name || `User_${f.follower_id.slice(0, 5)}`
        };
      });
      return NextResponse.json({ followers });
    } else {
      const following = mockDb.getFollowing(userId).map(f => {
        const mockProfile = MOCK_PROFILES.find(p => p.id === f.following_id);
        return {
          id: f.following_id,
          display_name: mockProfile?.display_name || `User_${f.following_id.slice(0, 5)}`
        };
      });
      return NextResponse.json({ following });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { followerId, followingId, action } = await req.json();
    if (!followerId || !followingId || !action) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      if (action === "follow") {
        const { error } = await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("follows").delete().eq("follower_id", followerId).eq("following_id", followingId);
        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    } catch (dbErr) {
      // Mock DB Fallback
      if (action === "follow") {
        mockDb.follow(followerId, followingId);
      } else {
        mockDb.unfollow(followerId, followingId);
      }
      return NextResponse.json({ success: true, fallback: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

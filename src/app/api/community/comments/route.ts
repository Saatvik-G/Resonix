import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockDb } from "@/lib/supabase/mockDb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get("playlistId");
  if (!playlistId) {
    return NextResponse.json({ error: "playlistId is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("playlist_comments")
      .select("id, playlist_id, user_id, content, created_at, profiles(display_name, avatar_url)")
      .eq("playlist_id", playlistId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const mapped = data.map((c: any) => ({
      id: c.id,
      playlist_id: c.playlist_id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      user: {
        display_name: c.profiles?.display_name || "Anonymous Lover",
        avatar_url: c.profiles?.avatar_url
      }
    }));

    return NextResponse.json({ comments: mapped });
  } catch (err) {
    // Fallback to mockDb
    const comments = mockDb.getComments(playlistId);
    return NextResponse.json({ comments });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { playlistId, userId, content, displayName } = await req.json();
    if (!playlistId || !userId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("playlist_comments")
        .insert({
          playlist_id: playlistId,
          user_id: userId,
          content
        })
        .select("id, playlist_id, user_id, content, created_at")
        .single();

      if (error) throw error;

      return NextResponse.json({
        comment: {
          ...data,
          user: { display_name: displayName || "You" }
        }
      });
    } catch (dbErr) {
      // Mock DB Fallback
      const comment = mockDb.addComment(playlistId, userId, content, displayName || "You");
      return NextResponse.json({ comment, fallback: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");
    const userId = searchParams.get("userId");

    if (!commentId || !userId) {
      return NextResponse.json({ error: "commentId and userId required" }, { status: 400 });
    }

    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("playlist_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", userId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    } catch (dbErr) {
      const success = mockDb.deleteComment(commentId, userId);
      return NextResponse.json({ success, fallback: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

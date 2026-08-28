import { NextRequest, NextResponse } from "next/server";
import { searchMBArtist } from "@/lib/musicbrainz";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) return NextResponse.json({ error: "Artist name required" }, { status: 400 });

    const artists = await searchMBArtist(name);
    if (artists && artists.length > 0) {
      // Find the first matching artist
      const artist = artists[0];
      return NextResponse.json({
        name: artist.name,
        country: artist.country || null, // e.g. "US", "GB", "IN"
        area: artist.area?.name || null
      });
    }
    return NextResponse.json({ country: null, area: null });
  } catch (error) {
    console.error("Artist country fetch failed:", error);
    return NextResponse.json({ country: null, area: null });
  }
}

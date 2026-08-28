import { NextRequest, NextResponse } from "next/server";
import { naturalLanguageSearch, emojiSearch, MusicRecommendation, AIResponse } from "@/lib/gemini";
import { searchTrackCatalog, searchArtist, getArtistTopTracks, getChartTopTracks } from "@/lib/lastfm";
import { searchSpotifyTracks } from "@/lib/spotify";
import { searchYouTubeTracks } from "@/lib/youtube";
import { enrichRecommendationsWithArtwork } from "@/lib/artwork";
import { fetchAppleMusicTrending } from "@/lib/apple-music";

// Helper to wrap slow AI calls with a fast timeout (1.8s) so the user gets sub-second response
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function detectCountry(req: NextRequest): string {
  const vercelCountry = req.headers.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry.length === 2) {
    return vercelCountry.toLowerCase();
  }

  const acceptLang = req.headers.get("accept-language");
  if (acceptLang) {
    const match = acceptLang.match(/([a-z]{2})-([A-Z]{2})/);
    if (match && match[2]) {
      return match[2].toLowerCase();
    }
  }

  return "in";
}

function matchesAppleMusic(item: MusicRecommendation, charts: any[]): { matched: boolean; index: number } {
  const normTitle = normalizeString(item.title || "");
  const normArtist = normalizeString(item.artist || "");

  for (let i = 0; i < charts.length; i++) {
    const song = charts[i];
    const normSongName = normalizeString(song.name || "");
    const normSongArtist = normalizeString(song.artistName || "");

    if (normTitle === normSongName && normArtist === normSongArtist) {
      return { matched: true, index: i };
    }

    if (normTitle === normSongName && (normArtist.includes(normSongArtist) || normSongArtist.includes(normArtist))) {
      return { matched: true, index: i };
    }
  }
  return { matched: false, index: -1 };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let query = body.query || "";
    const type = body.type || "text";
    const page = body.page || 1;
    const reqCountry = body.country;

    if (!query || query.trim() === "") {
      query = "trending hits";
    }

    const country = (reqCountry || detectCountry(req) || "in").toLowerCase();

    const aiFallback: AIResponse = { interpretation: `Curated music matches for "${query}"`, recommendations: [] };

    // Concurrently fetch AI vibe recommendations, Spotify, YouTube, Last.fm, and Apple Music charts!
    const [aiResult, spotifyTracks, youtubeTracks, lastfmTracks, appleMusicCharts] = await Promise.all([
      withTimeout(
        type === "emoji" ? emojiSearch(query) : naturalLanguageSearch(query),
        1800,
        aiFallback
      ),
      searchSpotifyTracks(query, 12).catch(() => []),
      searchYouTubeTracks(query, 6).catch(() => []),
      searchTrackCatalog(query, 12, page).catch(() => []),
      fetchAppleMusicTrending(country, 50).catch(() => []),
    ]);

    // Format Spotify catalog matches
    const spotifyRecs: MusicRecommendation[] = (spotifyTracks || []).map((t) => ({
      title: t.name,
      artist: t.artist,
      album: t.album,
      year: t.releaseYear,
      type: "song",
      whyThisMatches: `Top rated global hit on Spotify (Global Popularity Score: ${t.popularity}/100).`,
      mood: ["top rated", "popular"],
      genres: ["global"],
      language: "Global",
      imageUrl: t.imageUrl,
      popularity: t.popularity || 85,
    }));

    // Format AI recommendations
    const aiRecs: MusicRecommendation[] = (aiResult.recommendations || []).map((r, idx) => ({
      ...r,
      popularity: r.popularity || Math.max(90 - idx * 2, 70),
    }));

    // Format YouTube catalog matches
    const youtubeRecs: MusicRecommendation[] = (youtubeTracks || []).map((yt, idx) => ({
      title: yt.title,
      artist: yt.channel,
      album: "YouTube Exclusive / Live Session",
      year: "2024",
      type: "song",
      whyThisMatches: `Top trending YouTube release for "${query}".`,
      mood: ["live", "exclusive"],
      genres: ["global"],
      language: "Global",
      imageUrl: yt.imageUrl,
      popularity: Math.max(88 - idx * 2, 65),
    }));

    // Format Last.fm catalog matches
    const lastfmRecs: MusicRecommendation[] = (lastfmTracks || []).map((t: any, idx: number) => ({
      title: t.name,
      artist: t.artist,
      album: `${t.name} (Single)`,
      type: "song",
      whyThisMatches: `Global music catalog match for "${query}".`,
      mood: ["trending"],
      genres: ["global"],
      language: "Global",
      imageUrl: t.image?.[2]?.["#text"] || undefined,
      popularity: Math.max(82 - idx * 2, 60),
    }));

    // Merge Spotify + AI + YouTube + Last.fm results, removing duplicates
    const seen = new Set<string>();
    const combined: MusicRecommendation[] = [];

    const addUnique = (items: MusicRecommendation[]) => {
      for (const item of items) {
        const key = `${(item.artist || "").toLowerCase()}-${(item.title || "").toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      }
    };

    addUnique(spotifyRecs);
    addUnique(aiRecs);
    addUnique(youtubeRecs);
    addUnique(lastfmRecs);

    if (combined.length === 0) {
      let fallbackTracks: MusicRecommendation[] = [];
      const cleanQuery = query.trim();
      const artistsList = await searchArtist(cleanQuery, 3).catch(() => []);
      if (artistsList && artistsList.length > 0) {
        const topArtist = artistsList[0].name;
        const tracks = await getArtistTopTracks(topArtist, 10).catch(() => []);
        fallbackTracks = tracks.map((t: any) => ({
          title: t.name,
          artist: t.artist?.name || topArtist,
          album: `${t.name} (Single)`,
          type: "song",
          whyThisMatches: `Essential signature track by ${topArtist} matching your search.`,
          mood: ["trending"],
          genres: ["global"],
          language: "Global",
          popularity: 80,
        }));
      }

      if (fallbackTracks.length === 0) {
        const tracks = await getChartTopTracks(12).catch(() => []);
        fallbackTracks = tracks.map((t: any, idx: number) => ({
          title: t.name,
          artist: t.artist?.name || "Various Artists",
          album: `${t.name} (Hit)`,
          type: "song",
          whyThisMatches: "Trending global chartbuster recommendation.",
          mood: ["popular"],
          genres: ["pop"],
          language: "English",
          popularity: 85 - idx,
        }));
      }

      addUnique(fallbackTracks);
    }

    // Rank matching Last.fm tracks listener/popularity map
    const lastfmListenersMap = new Map<string, number>();
    for (const t of (lastfmTracks || [])) {
      const key = `${normalizeString(t.artist || "")}-${normalizeString(t.name || "")}`;
      const listeners = Number(t.listeners) || 0;
      lastfmListenersMap.set(key, listeners);
    }

    const itemsWithPopularity = combined.map((item) => {
      const key = `${normalizeString(item.artist || "")}-${normalizeString(item.title || "")}`;
      let listeners = lastfmListenersMap.get(key) || 0;

      if (!listeners) {
        if (item.popularity) {
          listeners = item.popularity * 1000;
        } else {
          listeners = 1000;
        }
      }

      const appleMatch = matchesAppleMusic(item, appleMusicCharts);

      return {
        item,
        appleMatch,
        listeners,
      };
    });

    itemsWithPopularity.sort((a, b) => {
      if (a.appleMatch.matched && !b.appleMatch.matched) return -1;
      if (!a.appleMatch.matched && b.appleMatch.matched) return 1;

      if (a.appleMatch.matched && b.appleMatch.matched) {
        return a.appleMatch.index - b.appleMatch.index;
      }

      return b.listeners - a.listeners;
    });

    const sortedCombined = itemsWithPopularity.map((x) => x.item);

    // Enrichment
    const enrichedRecs = await enrichRecommendationsWithArtwork(sortedCombined);

    // Is What You Meant / "Did you mean" logic
    let didYouMean: string | undefined = undefined;
    const normQuery = normalizeString(query);
    if (normQuery.length > 2 && appleMusicCharts.length > 0) {
      for (const song of appleMusicCharts) {
        const normName = normalizeString(song.name || "");
        const normArtist = normalizeString(song.artistName || "");

        if (normName !== normQuery && getLevenshteinDistance(normQuery, normName) <= 2) {
          didYouMean = `${song.name} by ${song.artistName}`;
          break;
        }
        if (normArtist !== normQuery && getLevenshteinDistance(normQuery, normArtist) <= 2) {
          didYouMean = song.artistName;
          break;
        }
        if (normName.includes(normQuery) && normName !== normQuery) {
          didYouMean = `${song.name} by ${song.artistName}`;
          break;
        }
      }
    }

    // Structured serverless logging for debuggability
    console.log(`[Search Route Log] query="${query}" country="${country}" combinedCount=${combined.length} didYouMean="${didYouMean || ""}"`);

    return new NextResponse(
      JSON.stringify({
        interpretation: aiResult.interpretation || `Search results for "${query}"`,
        recommendations: enrichedRecs,
        spotifyTotal: spotifyTracks.length,
        youtubeTotal: youtubeTracks.length,
        catalogTotal: combined.length,
        didYouMean,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error: any) {
    // Vercel serverless error logging
    console.error(`[Vercel Serverless Search Error] query failed:`, {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}


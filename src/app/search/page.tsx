"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2, Disc, Layers } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import SearchBar from "@/components/search/SearchBar";
import RecommendationCard from "@/components/ui/RecommendationCard";
import { useSearchStore } from "@/store";
import type { MusicRecommendation } from "@/lib/gemini";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const type = (searchParams.get("type") || "text") as "text" | "emoji";
  const { results, interpretation, isLoading, setResults, setLoading, setQuery, addToHistory } = useSearchStore();

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!q) return;
    setQuery(q);
    setPage(1);
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, type, page: 1 }),
        });
        const data = await res.json();
        const items = data.recommendations || [];
        // Attach metadata didYouMean to the results array reference
        if (data.didYouMean) {
          (items as any).didYouMean = data.didYouMean;
        }
        setResults(items, data.interpretation || "");
        addToHistory(q, type);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [q, type]);

  const loadMoreSongs = async () => {
    if (loadingMore || !q) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, type, page: nextPage }),
      });
      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        // Append new recommendations avoiding duplicates
        const existing = new Set(results.map((r) => `${r.artist.toLowerCase()}-${r.title.toLowerCase()}`));
        const newItems = data.recommendations.filter(
          (r: MusicRecommendation) => !existing.has(`${r.artist.toLowerCase()}-${r.title.toLowerCase()}`)
        );
        setResults([...results, ...newItems], interpretation);
        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredResults = results.filter((rec) => {
    if (activeFilter === "all") return true;
    const lang = (rec.language || "").toLowerCase();
    const artist = (rec.artist || "").toLowerCase();
    const title = (rec.title || "").toLowerCase();
    const why = (rec.whyThisMatches || "").toLowerCase();

    if (activeFilter === "punjabi") {
      return lang.includes("punjabi") || artist.includes("sidhu") || artist.includes("diljit") || why.includes("punjabi") || title.includes("punjabi");
    }
    if (activeFilter === "hindi") {
      return lang.includes("hindi") || artist.includes("arijit") || why.includes("bollywood") || why.includes("hindi");
    }
    if (activeFilter === "english") {
      return lang.includes("english") || (!lang.includes("punjabi") && !lang.includes("hindi"));
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8 space-y-6">
      <div>
        <SearchBar />
      </div>

      {q && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Disc size={22} className="text-amber-400 animate-vinyl" />
              {type === "emoji" ? "Vibe Interpretation: " : "Results for "}
              <span className="gradient-text">&ldquo;{q}&rdquo;</span>
            </h1>
            <span className="text-xs font-semibold text-zinc-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Showing {filteredResults.length} Songs & Artists
            </span>
          </div>

          {interpretation && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-4 glass rounded-2xl border border-amber-500/25 bg-amber-500/5"
            >
              <Sparkles size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">{interpretation}</p>
            </motion.div>
          )}

          {/* Did You Mean Suggestion indicator */}
          {results.length > 0 && (results as any).didYouMean && (
            <div className="text-xs text-amber-300 font-semibold px-4 flex items-center gap-1.5">
              <span>Did you mean:</span>
              <a
                href={`/search?q=${encodeURIComponent((results as any).didYouMean)}&type=${type}`}
                className="underline hover:text-amber-400 cursor-pointer"
              >
                {(results as any).didYouMean}
              </a>
              <span>?</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1 shrink-0">
              <Layers size={12} /> Filter:
            </span>
            {[
              { id: "all", label: "All Songs" },
              { id: "punjabi", label: "Punjabi & Desi 👳" },
              { id: "hindi", label: "Hindi / Bollywood 🇮🇳" },
              { id: "english", label: "English & Global 🎧" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                  activeFilter === f.id
                    ? "gradient-gold text-zinc-950 shadow-md"
                    : "glass border border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold animate-pulse">
            <Loader2 size={14} className="animate-spin text-amber-400" />
            <span>Scanning 100M+ global catalog & AI models...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="glass rounded-2xl p-4 border border-white/5 bg-[#121118]/40 h-44 flex flex-col justify-between animate-pulse">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl bg-white/5 flex-shrink-0" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
                <div className="h-10 bg-white/[0.02] rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence>
              {filteredResults.map((rec, i) => (
                <RecommendationCard key={`${rec.title}-${rec.artist}-${i}`} rec={rec} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
 
          {/* Load More Songs button */}
          <div className="flex flex-col items-center justify-center pt-6 pb-4">
            <button
              onClick={loadMoreSongs}
              disabled={loadingMore}
              className="glass border border-white/10 hover:border-amber-500/40 px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-white transition-all flex items-center gap-2 hover:scale-105"
            >
              {loadingMore ? <Loader2 size={15} className="animate-spin text-amber-400" /> : <Disc size={15} className="text-amber-400" />}
              {loadingMore ? "Searching Catalog…" : "Load More Songs from Global Catalog"}
            </button>
            <p className="text-[10px] text-zinc-500 mt-2">Accessing Last.fm & iTunes 100M+ track database</p>
          </div>
        </div>
      ) : q && !isLoading ? (
        <div className="text-center py-24 px-4 glass border border-white/5 rounded-3xl max-w-xl mx-auto space-y-5 bg-[#121118]/60">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <div className="space-y-2">
            <h3 className="font-outfit text-xl font-bold text-white">No musical matches found</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              We couldn't find matches for &ldquo;{q}&rdquo;. Try widening your query using different keywords or exploring genre tags.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <button
              onClick={() => {
                setQuery("soulful Hindi acoustic songs");
                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.value = "soulful Hindi acoustic songs";
                  searchInput.focus();
                }
              }}
              className="text-xs px-4 py-2 rounded-xl glass border border-white/10 text-zinc-300 hover:text-white hover:border-amber-500/30 transition-all font-medium"
            >
              Try: "soulful Hindi acoustic"
            </button>
            <button
              onClick={() => setActiveFilter("all")}
              className="text-xs px-4 py-2 rounded-xl gradient-gold text-zinc-950 font-bold hover:scale-105 transition-all"
            >
              Clear Active Filters
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-amber-400" /></div>}>
        <SearchResults />
      </Suspense>
      <BottomNav />
    </div>
  );
}

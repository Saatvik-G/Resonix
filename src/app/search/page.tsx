"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2, Disc, Layers, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import SearchBar from "@/components/search/SearchBar";
import RecommendationCard from "@/components/ui/RecommendationCard";
import { useSearchStore, useSceneStore } from "@/store";
import type { MusicRecommendation } from "@/lib/gemini";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const type = (searchParams.get("type") || "text") as "text" | "emoji";
  const { results, interpretation, isLoading, setResults, setLoading, setQuery, addToHistory } = useSearchStore();

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Advanced search filters states
  const [moodFilter, setMoodFilter] = useState("all");
  const [tempoFilter, setTempoFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [decadeFilter, setDecadeFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [popFilter, setPopFilter] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { setMood } = useSceneStore();

  useEffect(() => {
    if (moodFilter !== "all") {
      setMood(moodFilter);
    } else if (q) {
      setMood(q);
    } else {
      setMood("default");
    }
  }, [moodFilter, q, setMood]);

  useEffect(() => {
    return () => setMood("default");
  }, [setMood]);

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
    // 1. Language Filter
    if (langFilter !== "all") {
      const recLang = (rec.language || "").toLowerCase();
      if (!recLang.includes(langFilter.toLowerCase())) return false;
    }

    // 2. Mood Filter
    if (moodFilter !== "all") {
      const recMoods = (rec.mood || []).map(m => m.toLowerCase());
      const whyMatches = (rec.whyThisMatches || "").toLowerCase();
      const matchMood = recMoods.some(m => m.includes(moodFilter)) || whyMatches.includes(moodFilter);
      if (!matchMood) return false;
    }

    // 3. Tempo/Energy Filter
    if (tempoFilter !== "all") {
      const whyMatches = (rec.whyThisMatches || "").toLowerCase();
      const isHigh = whyMatches.includes("upbeat") || whyMatches.includes("energy") || whyMatches.includes("tempo") || whyMatches.includes("dance") || whyMatches.includes("fast") || whyMatches.includes("intense") || whyMatches.includes("high energy");
      const isLow = whyMatches.includes("slow") || whyMatches.includes("chill") || whyMatches.includes("ambient") || whyMatches.includes("meditat") || whyMatches.includes("soft") || whyMatches.includes("acoustic") || whyMatches.includes("lofi");
      
      if (tempoFilter === "high" && !isHigh) return false;
      if (tempoFilter === "low" && !isLow) return false;
      if (tempoFilter === "medium" && (isHigh || isLow)) return false;
    }

    // 4. Country Filter
    if (countryFilter !== "all") {
      const whyMatches = (rec.whyThisMatches || "").toLowerCase();
      const recLang = (rec.language || "").toLowerCase();
      const matchCountry = whyMatches.includes(countryFilter.toLowerCase()) || recLang.includes(countryFilter.toLowerCase());
      if (!matchCountry) return false;
    }

    // 5. Decade Filter
    if (decadeFilter !== "all") {
      const yearStr = rec.year ? String(rec.year) : "";
      if (!yearStr) return false;
      const year = parseInt(yearStr);
      if (isNaN(year)) return false;
      if (decadeFilter === "70s" && (year < 1970 || year >= 1980)) return false;
      if (decadeFilter === "80s" && (year < 1980 || year >= 1990)) return false;
      if (decadeFilter === "90s" && (year < 1990 || year >= 2000)) return false;
      if (decadeFilter === "00s" && (year < 2000 || year >= 2010)) return false;
      if (decadeFilter === "10s" && (year < 2010 || year >= 2020)) return false;
      if (decadeFilter === "20s" && (year < 2020 || year >= 2030)) return false;
    }

    // 6. Genre Filter
    if (genreFilter !== "all") {
      const recGenres = (rec.genres || []).map(g => g.toLowerCase());
      const whyMatches = (rec.whyThisMatches || "").toLowerCase();
      const matchGenre = recGenres.some(g => g.includes(genreFilter)) || whyMatches.includes(genreFilter);
      if (!matchGenre) return false;
    }

    // 7. Popularity Filter
    if (popFilter !== "all") {
      const pop = rec.popularity || 50;
      if (popFilter === "high" && pop < 75) return false;
      if (popFilter === "medium" && (pop < 40 || pop >= 75)) return false;
      if (popFilter === "low" && pop >= 40) return false;
    }

    return true;
  });

  const resetAllFilters = () => {
    setMoodFilter("all");
    setTempoFilter("all");
    setLangFilter("all");
    setCountryFilter("all");
    setDecadeFilter("all");
    setGenreFilter("all");
    setPopFilter("all");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8 space-y-6">
      <div>
        <SearchBar />
      </div>

      {q && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="font-playfair text-2xl sm:text-3xl font-black text-white uppercase flex items-center gap-2">
              <Disc size={20} className="text-[#fbbf24] animate-vinyl" />
              {type === "emoji" ? "Vibe Interpretation: " : "Archive: "}
              <span className="text-[#fbbf24]">&ldquo;{q}&rdquo;</span>
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  showAdvanced 
                    ? "bg-[#f4f3f6] text-[#0b0a0d] border-[#f4f3f6]" 
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                }`}
              >
                <SlidersHorizontal size={12} />
                Filters
              </button>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 bg-zinc-950 border border-zinc-850 px-3 py-1.5 rounded-none">
                {filteredResults.length} Items Found
              </span>
            </div>
          </div>

          {/* Advanced Filters Drawer */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border border-zinc-800 rounded-none p-5 bg-[#111014]/90 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Genre */}
                  <div>
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block mb-1.5">Genre</label>
                    <select
                      value={genreFilter}
                      onChange={(e) => setGenreFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-3 py-2 text-xs font-mono text-white outline-none focus:border-zinc-500"
                    >
                      <option className="bg-[#111014]" value="all">All Genres</option>
                      <option className="bg-[#111014]" value="pop">Pop</option>
                      <option className="bg-[#111014]" value="rock">Rock / Indie</option>
                      <option className="bg-[#111014]" value="jazz">Jazz / Soul</option>
                      <option className="bg-[#111014]" value="hip hop">Hip Hop</option>
                      <option className="bg-[#111014]" value="electronic">Electronic / Synth</option>
                      <option className="bg-[#111014]" value="ambient">Ambient / Chill</option>
                    </select>
                  </div>

                  {/* Mood */}
                  <div>
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block mb-1.5">Mood</label>
                    <select
                      value={moodFilter}
                      onChange={(e) => setMoodFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-3 py-2 text-xs font-mono text-white outline-none focus:border-zinc-500"
                    >
                      <option className="bg-[#111014]" value="all">All Moods</option>
                      <option className="bg-[#111014]" value="happy">Happy / Upbeat</option>
                      <option className="bg-[#111014]" value="sad">Sad / Melancholic</option>
                      <option className="bg-[#111014]" value="chill">Chill / Relaxed</option>
                      <option className="bg-[#111014]" value="dreamy">Dreamy / Ambient</option>
                      <option className="bg-[#111014]" value="romantic">Romantic</option>
                      <option className="bg-[#111014]" value="rebellious">Rebellious</option>
                    </select>
                  </div>

                  {/* Tempo/Energy */}
                  <div>
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block mb-1.5">Tempo / Energy</label>
                    <select
                      value={tempoFilter}
                      onChange={(e) => setTempoFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-3 py-2 text-xs font-mono text-white outline-none focus:border-zinc-500"
                    >
                      <option className="bg-[#111014]" value="all">All Tempos</option>
                      <option className="bg-[#111014]" value="high">High Energy</option>
                      <option className="bg-[#111014]" value="medium">Medium Vibe</option>
                      <option className="bg-[#111014]" value="low">Low / Relaxed</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block mb-1.5">Language</label>
                    <select
                      value={langFilter}
                      onChange={(e) => setLangFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-3 py-2 text-xs font-mono text-white outline-none focus:border-zinc-500"
                    >
                      <option className="bg-[#111014]" value="all">All Languages</option>
                      <option className="bg-[#111014]" value="english">English</option>
                      <option className="bg-[#111014]" value="hindi">Hindi</option>
                      <option className="bg-[#111014]" value="punjabi">Punjabi</option>
                      <option className="bg-[#111014]" value="spanish">Spanish</option>
                      <option className="bg-[#111014]" value="korean">Korean</option>
                      <option className="bg-[#111014]" value="japanese">Japanese</option>
                    </select>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block mb-1.5">Country / Region</label>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-3 py-2 text-xs font-mono text-white outline-none focus:border-zinc-500"
                    >
                      <option className="bg-[#111014]" value="all">All Countries</option>
                      <option className="bg-[#111014]" value="india">India</option>
                      <option className="bg-[#111014]" value="united kingdom">United Kingdom</option>
                      <option className="bg-[#111014]" value="united states">United States</option>
                      <option className="bg-[#111014]" value="france">France</option>
                      <option className="bg-[#111014]" value="korea">Korea</option>
                      <option className="bg-[#111014]" value="japan">Japan</option>
                      <option className="bg-[#111014]" value="brazil">Brazil</option>
                    </select>
                  </div>

                  {/* Decade */}
                  <div>
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block mb-1.5">Decade</label>
                    <select
                      value={decadeFilter}
                      onChange={(e) => setDecadeFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-3 py-2 text-xs font-mono text-white outline-none focus:border-zinc-500"
                    >
                      <option className="bg-[#111014]" value="all">All Decades</option>
                      <option className="bg-[#111014]" value="70s">1970s</option>
                      <option className="bg-[#111014]" value="80s">1980s</option>
                      <option className="bg-[#111014]" value="90s">1990s</option>
                      <option className="bg-[#111014]" value="00s">2000s</option>
                      <option className="bg-[#111014]" value="10s">2010s</option>
                      <option className="bg-[#111014]" value="20s">2020s</option>
                    </select>
                  </div>

                  {/* Popularity */}
                  <div>
                    <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block mb-1.5">Popularity</label>
                    <select
                      value={popFilter}
                      onChange={(e) => setPopFilter(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-3 py-2 text-xs font-mono text-white outline-none focus:border-zinc-500"
                    >
                      <option className="bg-[#111014]" value="all">All Popularity</option>
                      <option className="bg-[#111014]" value="high">Mainstream (75+)</option>
                      <option className="bg-[#111014]" value="medium">Mid-tier (40-74)</option>
                      <option className="bg-[#111014]" value="low">Indie / Obscure (&lt;40)</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={resetAllFilters}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-none py-2 text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {interpretation && (
            <div className="space-y-2">
              <motion.h3
                initial={{ letterSpacing: "0.15em", opacity: 0 }}
                animate={{ letterSpacing: "0.08em", opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="font-mono text-[10px] font-bold text-[#fbbf24] uppercase tracking-widest flex items-center gap-1.5 px-1"
              >
                <Sparkles size={12} className="text-[#fbbf24]" />
                // AI CURATOR VIBE SILHOUETTE
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-2.5 p-4 border border-zinc-850 bg-[#111014]/90 rounded-none"
              >
                <p className="text-xs font-mono text-zinc-300 leading-relaxed">{interpretation}</p>
              </motion.div>
            </div>
          )}

          {/* Did You Mean Suggestion indicator */}
          {results.length > 0 && (results as any).didYouMean && (
            <div className="text-xs font-mono text-[#fbbf24] uppercase tracking-wider px-1 flex items-center gap-1.5">
              <span>Did you mean:</span>
              <a
                href={`/search?q=${encodeURIComponent((results as any).didYouMean)}&type=${type}`}
                className="underline hover:text-white cursor-pointer"
              >
                {(results as any).didYouMean}
              </a>
              <span>?</span>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-wider animate-pulse">
            <Loader2 size={14} className="animate-spin text-[#fbbf24]" />
            <span>Scanning 100M+ global catalog indexes...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="border border-zinc-900 rounded-none p-4 bg-[#111014]/20 h-44 flex flex-col justify-between animate-pulse">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-none bg-zinc-900 border border-zinc-850 flex-shrink-0" />
                  <div className="flex-1 space-y-2.5 pt-1">
                    <div className="h-4 bg-zinc-850 rounded-none w-3/4" />
                    <div className="h-3 bg-zinc-900 rounded-none w-1/2" />
                    <div className="h-3 bg-zinc-900 rounded-none w-2/3" />
                  </div>
                </div>
                <div className="h-8 bg-zinc-900 rounded-none w-full" />
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
              className="border border-zinc-800 hover:border-zinc-550 px-8 py-3.5 rounded-none text-xs font-mono font-bold uppercase tracking-wider text-zinc-350 hover:text-white transition-all flex items-center gap-2 bg-[#111014] cursor-pointer"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin text-[#fbbf24]" /> : <Disc size={14} className="text-[#fbbf24]" />}
              {loadingMore ? "Searching Catalog…" : "Load More Songs from Archive"}
            </button>
            <p className="text-[9px] font-mono text-zinc-650 uppercase tracking-widest mt-2">// ACCESSING 100M+ TRACK DATABASE</p>
          </div>
        </div>
      ) : q && !isLoading ? (
        <div className="text-center py-20 px-6 border border-zinc-800 rounded-none max-w-xl mx-auto space-y-5 bg-[#111014]/50">
          <div className="w-12 h-12 rounded-none border border-zinc-800 bg-zinc-900 flex items-center justify-center mx-auto text-xl font-mono text-[#fbbf24]">
            [?]
          </div>
          <div className="space-y-2">
            <h3 className="font-playfair text-xl font-black uppercase text-white">No musical matches found</h3>
            <p className="text-xs font-mono text-zinc-500 max-w-md mx-auto leading-relaxed uppercase">
              // We couldn't find matches for this query. Try widening keywords or checking spelling.
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
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-2 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 bg-zinc-900 transition-all rounded-none cursor-pointer"
            >
              Try: "soulful Hindi acoustic"
            </button>
            <button
              onClick={() => resetAllFilters()}
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-2 bg-[#f4f3f6] text-[#0b0a0d] hover:bg-zinc-200 transition-all rounded-none cursor-pointer"
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

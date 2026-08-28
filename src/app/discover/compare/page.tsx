"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Scale, Loader2, Sparkles, AlertCircle, Users, Disc, Award, HelpCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Letterbox from "@/components/ui/Letterbox";

export default function CompareArtistsPage() {
  const [artist1, setArtist1] = useState("");
  const [artist2, setArtist2] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist1 || !artist2) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/compare-artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist1, artist2 }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("An error occurred during comparison.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen">
      <Letterbox active={!!result || loading} />
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="font-playfair text-3xl font-black uppercase text-white flex items-center justify-center sm:justify-start gap-2">
            <Scale className="text-[#fbbf24]" size={24} /> Compare Artists
          </h1>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 mt-1">// CROSS-EXAMINE THE SOUNDS, METRICS, AND STYLES OF TWO MUSICAL MINDS</p>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleCompare} className="border border-zinc-800 rounded-none p-6 bg-[#111014]/45 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            
            <div className="md:col-span-5">
              <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">// FIRST ARTIST</label>
              <input
                type="text"
                required
                placeholder="e.g. M83"
                value={artist1}
                onChange={(e) => setArtist1(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-700 outline-none focus:border-zinc-500"
              />
            </div>

            <div className="md:col-span-1 text-center font-mono text-[#fbbf24] font-bold text-sm">
              VS
            </div>

            <div className="md:col-span-5">
              <label className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">// SECOND ARTIST</label>
              <input
                type="text"
                required
                placeholder="e.g. The Weeknd"
                value={artist2}
                onChange={(e) => setArtist2(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-none px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-700 outline-none focus:border-zinc-500"
              />
            </div>

            <div className="md:col-span-11 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#f4f3f6] text-[#0b0a0d] hover:bg-zinc-200 py-3.5 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-[#0b0a0d]" /> Cross-Referencing...
                  </>
                ) : (
                  <>
                    <Scale size={13} /> Compare Soundscapes
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 size={24} className="text-[#fbbf24] animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-550">// CALCULATING ACOUSTIC FEATURES & COMPILING CROSSOVER SYNTHESIS...</p>
          </div>
        )}

        {error && (
          <div className="border border-rose-900 bg-rose-950/20 rounded-none p-6 text-center text-rose-200 text-xs font-mono uppercase flex flex-col items-center gap-2 max-w-md mx-auto">
            <AlertCircle size={20} className="text-rose-400" />
            {error}
          </div>
        )}

        {!loading && !result && !error && (
          <div className="border border-zinc-850 rounded-none p-12 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider bg-zinc-950/20 max-w-xl mx-auto">
            <Scale size={32} className="mx-auto text-zinc-800 mb-4" />
            // ENTER TWO ARTISTS TO DECONSTRUCT GENRE OVERLAPS, REGIONAL STATS & AI COMPARATIVE THESES //
          </div>
        )}

        {/* Results Showcase */}
        {!loading && result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            
            {/* Artists Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Artist 1 Card */}
              <div className="border border-zinc-800 rounded-none p-6 bg-[#111014]/25">
                <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#fbbf24]">// ARTIST A</span>
                <h2 className="font-playfair text-2xl font-black text-white uppercase mt-1 mb-4">{result.artist1.name}</h2>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-950 border border-zinc-850 rounded-none p-3.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase mb-1">
                      <Users size={11} /> Listeners
                    </div>
                    <span className="text-sm font-mono font-bold text-white">
                      {result.artist1Stats.listeners ? formatNumber(result.artist1Stats.listeners) : "N/A"}
                    </span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 rounded-none p-3.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase mb-1">
                      <Disc size={11} /> Playcount
                    </div>
                    <span className="text-sm font-mono font-bold text-white">
                      {result.artist1Stats.playcount ? formatNumber(result.artist1Stats.playcount) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Genres & Influences */}
                <div className="space-y-4">
                  <div>
                    <span className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Primary Genres</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.artist1.genres.map((g: string) => (
                        <span key={g} className="text-xs font-mono px-2.5 py-1 rounded-none border border-zinc-850 bg-zinc-950 text-zinc-400 uppercase">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Influences / Contemporaries</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.artist1.influences.map((inf: string) => (
                        <span key={inf} className="text-xs font-mono px-2.5 py-1 rounded-none border border-zinc-800 bg-zinc-900 text-zinc-300 uppercase">{inf}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mood Profiles */}
                <div className="mt-6 space-y-3 pt-6 border-t border-zinc-850">
                  <span className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Mood Silhouette</span>
                  {Object.entries(result.artist1.moodProfile).map(([mood, val]) => (
                    <div key={mood} className="space-y-1 font-mono uppercase text-[10px]">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">{mood}</span>
                        <span className="text-white font-bold">{val as number}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-900 border border-zinc-850 rounded-none overflow-hidden">
                        <div className="h-full bg-[#fbbf24] rounded-none" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artist 2 Card */}
              <div className="border border-zinc-800 rounded-none p-6 bg-[#111014]/25">
                <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#fbbf24]">// ARTIST B</span>
                <h2 className="font-playfair text-2xl font-black text-white uppercase mt-1 mb-4">{result.artist2.name}</h2>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-zinc-950 border border-zinc-850 rounded-none p-3.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase mb-1">
                      <Users size={11} /> Listeners
                    </div>
                    <span className="text-sm font-mono font-bold text-white">
                      {result.artist2Stats.listeners ? formatNumber(result.artist2Stats.listeners) : "N/A"}
                    </span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-850 rounded-none p-3.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase mb-1">
                      <Disc size={11} /> Playcount
                    </div>
                    <span className="text-sm font-mono font-bold text-white">
                      {result.artist2Stats.playcount ? formatNumber(result.artist2Stats.playcount) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Genres & Influences */}
                <div className="space-y-4">
                  <div>
                    <span className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Primary Genres</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.artist2.genres.map((g: string) => (
                        <span key={g} className="text-xs font-mono px-2.5 py-1 rounded-none border border-zinc-850 bg-zinc-950 text-zinc-400 uppercase">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Influences / Contemporaries</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.artist2.influences.map((inf: string) => (
                        <span key={inf} className="text-xs font-mono px-2.5 py-1 rounded-none border border-zinc-800 bg-zinc-900 text-zinc-300 uppercase">{inf}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mood Profiles */}
                <div className="mt-6 space-y-3 pt-6 border-t border-zinc-850">
                  <span className="block text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Mood Silhouette</span>
                  {Object.entries(result.artist2.moodProfile).map(([mood, val]) => (
                    <div key={mood} className="space-y-1 font-mono uppercase text-[10px]">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">{mood}</span>
                        <span className="text-white font-bold">{val as number}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-900 border border-zinc-850 rounded-none overflow-hidden">
                        <div className="h-full bg-[#fbbf24] rounded-none" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* AI Comparison Critical Summary */}
            <div className="border border-zinc-800 rounded-none p-6 sm:p-8 bg-zinc-950 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4 text-[#fbbf24]">
                <Sparkles size={16} />
                <motion.h3
                  initial={{ letterSpacing: "0.15em", opacity: 0 }}
                  animate={{ letterSpacing: "0.08em", opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="font-mono font-bold text-xs uppercase tracking-widest text-[#fbbf24]"
                >
                  // EDITORIAL SYNTHESIS
                </motion.h3>
              </div>
              <p className="text-zinc-300 font-mono text-xs uppercase tracking-wider leading-relaxed whitespace-pre-line">
                {result.comparisonSummary}
              </p>
            </div>

            {/* Hypothetical Collaboration Concept */}
            <div className="border border-zinc-800 rounded-none p-6 sm:p-8 bg-[#111014]/40">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#fbbf24] block mb-1"
              >
                // HYPOTHETICAL CROSSOVER
              </motion.span>
              <motion.h3
                initial={{ letterSpacing: "0.15em", opacity: 0 }}
                animate={{ letterSpacing: "0.08em", opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="font-playfair text-xl font-black text-white tracking-widest uppercase mb-2.5"
              >
                &ldquo;{result.collaborationConcept.title}&rdquo;
              </motion.h3>
              <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider leading-relaxed">
                {result.collaborationConcept.description}
              </p>
            </div>

          </motion.div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}

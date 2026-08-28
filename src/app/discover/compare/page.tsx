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
          <h1 className="font-outfit text-3xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <Scale className="text-amber-400" /> Compare Artists
          </h1>
          <p className="text-white/40 mt-1">Cross-examine the sounds, stats, and styles of two musical minds</p>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleCompare} className="glass border border-white/10 rounded-3xl p-6 bg-[#121118]/80 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">First Artist</label>
              <input
                type="text"
                required
                placeholder="e.g. M83"
                value={artist1}
                onChange={(e) => setArtist1(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="md:col-span-1 text-center font-outfit text-white/40 font-bold text-sm">
              VS
            </div>

            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Second Artist</label>
              <input
                type="text"
                required
                placeholder="e.g. The Weeknd"
                value={artist2}
                onChange={(e) => setArtist2(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="md:col-span-11 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 gradient-primary py-3 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Cross-Referencing...
                  </>
                ) : (
                  <>
                    <Scale size={16} /> Compare Soundscapes
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 size={36} className="text-amber-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-white/50">Retrieving listener engagement, acoustic features, and compiling AI summary...</p>
          </div>
        )}

        {error && (
          <div className="glass border border-red-500/20 bg-red-500/5 rounded-2xl p-6 text-center text-red-200 text-sm flex flex-col items-center gap-2 max-w-md mx-auto">
            <AlertCircle size={24} className="text-red-400" />
            {error}
          </div>
        )}

        {!loading && !result && !error && (
          <div className="glass border border-white/5 rounded-2xl p-12 text-center text-white/30 text-sm bg-white/[0.01] max-w-xl mx-auto">
            <Scale size={40} className="mx-auto text-white/10 mb-4" />
            Enter two artists to compare their global reach, genres, mood signatures, and read an AI-curated crossover thesis.
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
              <div className="glass border border-white/10 rounded-3xl p-6 bg-gradient-to-br from-amber-500/5 to-transparent">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Artist A</span>
                <h2 className="font-outfit text-2xl font-extrabold text-white mt-1 mb-4">{result.artist1.name}</h2>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                      <Users size={12} /> Listeners
                    </div>
                    <span className="text-base font-extrabold text-white">
                      {result.artist1Stats.listeners ? formatNumber(result.artist1Stats.listeners) : "N/A"}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                      <Disc size={12} /> Playcount
                    </div>
                    <span className="text-base font-extrabold text-white">
                      {result.artist1Stats.playcount ? formatNumber(result.artist1Stats.playcount) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Genres & Influences */}
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Primary Genres</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.artist1.genres.map((g: string) => (
                        <span key={g} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Influences / Contemporaries</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.artist1.influences.map((inf: string) => (
                        <span key={inf} className="text-xs px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20 text-amber-300">{inf}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mood Profiles */}
                <div className="mt-6 space-y-3 pt-6 border-t border-white/5">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mood Silhouette</span>
                  {Object.entries(result.artist1.moodProfile).map(([mood, val]) => (
                    <div key={mood} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60 capitalize">{mood}</span>
                        <span className="text-white/90 font-medium">{val as number}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artist 2 Card */}
              <div className="glass border border-white/10 rounded-3xl p-6 bg-gradient-to-br from-indigo-500/5 to-transparent">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Artist B</span>
                <h2 className="font-outfit text-2xl font-extrabold text-white mt-1 mb-4">{result.artist2.name}</h2>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                      <Users size={12} /> Listeners
                    </div>
                    <span className="text-base font-extrabold text-white">
                      {result.artist2Stats.listeners ? formatNumber(result.artist2Stats.listeners) : "N/A"}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                      <Disc size={12} /> Playcount
                    </div>
                    <span className="text-base font-extrabold text-white">
                      {result.artist2Stats.playcount ? formatNumber(result.artist2Stats.playcount) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Genres & Influences */}
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Primary Genres</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.artist2.genres.map((g: string) => (
                        <span key={g} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/80">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Influences / Contemporaries</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.artist2.influences.map((inf: string) => (
                        <span key={inf} className="text-xs px-2.5 py-1 rounded-md bg-indigo-400/10 border border-indigo-400/20 text-indigo-300">{inf}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mood Profiles */}
                <div className="mt-6 space-y-3 pt-6 border-t border-white/5">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mood Silhouette</span>
                  {Object.entries(result.artist2.moodProfile).map(([mood, val]) => (
                    <div key={mood} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60 capitalize">{mood}</span>
                        <span className="text-white/90 font-medium">{val as number}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* AI Comparison Critical Summary */}
            <div className="glass border border-white/10 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/5 to-indigo-500/5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4 text-amber-400">
                <Sparkles size={18} />
                <motion.h3
                  initial={{ letterSpacing: "0.25em", opacity: 0 }}
                  animate={{ letterSpacing: "0.12em", opacity: 1 }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                  className="font-outfit font-bold text-lg text-white uppercase tracking-widest"
                >
                  Editorial Synthesis
                </motion.h3>
              </div>
              <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-line">
                {result.comparisonSummary}
              </p>
            </div>

            {/* Hypothetical Collaboration Concept */}
            <div className="glass border border-white/10 rounded-3xl p-6 sm:p-8 bg-[#121118]/90">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400 block mb-1"
              >
                Hypothetical Crossover
              </motion.span>
              <motion.h3
                initial={{ letterSpacing: "0.25em", opacity: 0 }}
                animate={{ letterSpacing: "0.1em", opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="font-outfit text-xl font-black text-white tracking-widest uppercase mb-2.5"
              >
                "{result.collaborationConcept.title}"
              </motion.h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
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

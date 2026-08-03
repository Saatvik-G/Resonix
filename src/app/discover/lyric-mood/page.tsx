"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Search, Loader2, BookOpen, Quote, ShieldAlert, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

const MOOD_COLORS: Record<string, string> = {
  hopeful: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  melancholic: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  dark: "bg-zinc-800 text-zinc-300 border-zinc-700",
  romantic: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  energetic: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  dreamy: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  aggressive: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  peaceful: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

export default function LyricMoodPage() {
  const [track, setTrack] = useState("");
  const [artist, setArtist] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!track || !artist) return;
    setLoading(true);
    setAnalysis(null);
    setError("");

    try {
      const res = await fetch("/api/lyric-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, artist, lyrics }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAnalysis(data);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        
        {/* Title */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="font-outfit text-3xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <BookOpen className="text-amber-400" /> Lyric Mood Analysis
          </h1>
          <p className="text-white/40 mt-1">Deconstruct the emotional subtext and poetic themes of any song</p>
        </div>

        {/* Form & Input */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-5">
            <form onSubmit={handleAnalyze} className="glass border border-white/10 rounded-2xl p-5 bg-[#121118]/80 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Song Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pasoori"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Artist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Sethi"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Lyrics (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Paste lyrics block here to analyze specific verses..."
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 gradient-primary py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Search size={16} /> Analyze Lyrics
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results display */}
          <div className="md:col-span-7 flex flex-col justify-center">
            {loading && (
              <div className="text-center py-12">
                <Loader2 size={32} className="text-amber-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-white/50">Reading lyrics and measuring emotional frequency...</p>
              </div>
            )}

            {error && (
              <div className="glass border border-red-500/20 bg-red-500/5 rounded-2xl p-6 text-center text-red-200 text-sm flex flex-col items-center gap-2">
                <ShieldAlert size={24} className="text-red-400" />
                {error}
              </div>
            )}

            {!loading && !analysis && !error && (
              <div className="glass border border-white/5 rounded-2xl p-8 text-center text-white/30 text-sm bg-white/[0.01]">
                <Quote size={32} className="mx-auto text-white/10 mb-3" />
                Enter a song title and artist to uncover its emotional blend and poetic subtext.
              </div>
            )}

            {!loading && analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Header vibe info */}
                <div className="glass border border-white/10 rounded-2xl p-5 bg-[#121118]/80 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                    <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${MOOD_COLORS[analysis.dominantMood.toLowerCase()] || MOOD_COLORS.dreamy}`}>
                      Dominant: {analysis.dominantMood}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400/80">
                      {analysis.vibeTag}
                    </span>
                  </div>
                  <p className="text-zinc-200 text-sm leading-relaxed">
                    {analysis.analysis}
                  </p>
                </div>

                {/* Mood Blend Bars */}
                <div className="glass border border-white/10 rounded-2xl p-5 bg-[#121118]/80">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-400" /> Emotional Blend
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analysis.blend).map(([mood, val]) => (
                      <div key={mood} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-zinc-400 capitalize">{mood}</span>
                          <span className="text-zinc-200">{val as number}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                            style={{ width: `${val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlighted Lines */}
                {analysis.highlightedLines && analysis.highlightedLines.length > 0 && (
                  <div className="glass border border-white/10 rounded-2xl p-5 bg-[#121118]/80">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                      Key Lyric Insights
                    </h3>
                    <div className="space-y-4">
                      {analysis.highlightedLines.map((hl: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-amber-400/40 pl-3">
                          <p className="text-sm italic text-zinc-200 font-medium">"{hl.line}"</p>
                          <p className="text-xs text-white/50 mt-1">{hl.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </div>

        </div>

      </div>
      <BottomNav />
    </div>
  );
}

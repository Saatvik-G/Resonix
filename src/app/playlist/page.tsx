"use client";
import { useState, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Sparkles, Music2, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import ListenLinks from "@/components/ui/ListenLinks";
import { usePlaylistStore } from "@/store";
import type { MusicRecommendation } from "@/lib/gemini";
import Letterbox from "@/components/ui/Letterbox";

const SUGGESTED_PROMPTS = [
  "My first breakup at 3am",
  "Cyberpunk night in Tokyo",
  "Coffee shop on a rainy afternoon",
  "Running through a city at dawn",
  "Nostalgia for a summer that never happened",
  "Deep focus for a long coding session",
];

function PlaylistGeneratorContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const [prompt, setPrompt] = useState(initialPrompt);
  const { playlists, isGenerating, addPlaylist, setGenerating, removePlaylist } = usePlaylistStore();
  const [activePlaylist, setActivePlaylist] = useState<typeof playlists[0] | null>(null);

  useEffect(() => {
    if (initialPrompt) handleGenerate(initialPrompt);
  }, []);

  const handleGenerate = async (p?: string) => {
    const q = p || prompt;
    if (!q.trim() || isGenerating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/playlist/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      });
      const data = await res.json();
      addPlaylist(data);
      setActivePlaylist({ ...data, id: "", createdAt: Date.now() });
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
      <Letterbox active={!!activePlaylist || isGenerating} />
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-black uppercase text-white">AI Playlist Generator</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 mt-1">// DESCRIBE A SCENARIO OR EMOTIONAL ARCHETYPE TO DEPLOY A CURATED SEQUENCE</p>
      </div>

      {/* Generator input */}
      <div className="border border-zinc-800 rounded-none p-6 mb-6 bg-[#111014]/45">
        <div className="relative mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "My first breakup at 3am" or "Cyberpunk night in a neon city"'
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-none p-4 text-xs font-mono text-white placeholder-zinc-700 outline-none focus:border-zinc-500 resize-none transition-colors"
            onKeyDown={(e) => e.key === "Enter" && e.metaKey && handleGenerate()}
          />
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED_PROMPTS.map((s) => (
            <button
              key={s}
              onClick={() => { setPrompt(s); }}
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 border border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-550 transition-all rounded-none cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating || !prompt.trim()}
          className="flex items-center gap-2 bg-[#f4f3f6] text-[#0b0a0d] hover:bg-zinc-200 px-6 py-2.5 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? <Loader2 size={13} className="animate-spin text-[#0b0a0d]" /> : <Sparkles size={13} />}
          {isGenerating ? "Generating…" : "Generate Playlist"}
        </button>
      </div>

      {/* Active playlist result */}
      {activePlaylist && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-zinc-800 rounded-none p-6 mb-8 bg-zinc-950"
        >
          <div className="flex items-start justify-between gap-4 mb-4 border-b border-zinc-850 pb-4">
            <div>
              <div className="text-[9px] font-mono font-bold text-[#fbbf24] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Sparkles size={11} /> AI-Generated Playlist
              </div>
              <motion.h2
                initial={{ letterSpacing: "0.15em", opacity: 0 }}
                animate={{ letterSpacing: "0.08em", opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="font-playfair text-2xl font-black text-white tracking-widest uppercase"
              >
                {activePlaylist.name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-400 font-mono text-xs uppercase tracking-wider leading-relaxed mt-2 max-w-xl"
              >
                {activePlaylist.conceptBlurb}
              </motion.p>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-550 uppercase tracking-wider flex-shrink-0">
              <Music2 size={11} />
              {activePlaylist.tracks?.length || 0} tracks
            </div>
          </div>

          <div className="space-y-2">
            {activePlaylist.tracks?.map((track: MusicRecommendation, i: number) => (
              <motion.div
                key={`${track.title}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 border border-zinc-900 rounded-none p-3 bg-[#111014]/25 hover:border-zinc-700 transition-all group"
              >
                <span className="text-zinc-600 text-xs font-mono w-5 text-right flex-shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-none border border-zinc-800 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <Music2 size={12} className="text-[#fbbf24]" />
                </div>
                <div className="flex-1 min-w-0 font-mono">
                  <div className="font-bold text-white text-xs truncate uppercase">{track.title}</div>
                  <div className="text-[10px] text-zinc-500 truncate uppercase">{track.artist}</div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ListenLinks artist={track.artist} track={track.title} size="sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Previous playlists */}
      {playlists.length > 0 && (
        <div>
          <h3 className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">// PREVIOUS SPOTLIGHT ARCHIVES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {playlists.map((pl) => (
              <div key={pl.id} className="border border-zinc-850 rounded-none p-4 flex items-center gap-3 bg-zinc-950/20">
                <div className="w-8 h-8 rounded-none border border-zinc-800 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <Music2 size={12} className="text-[#fbbf24]" />
                </div>
                <div className="flex-1 min-w-0 font-mono">
                  <div className="font-bold text-white text-xs truncate uppercase">{pl.name}</div>
                  <div className="text-[9px] text-zinc-500 uppercase">{pl.tracks?.length} tracks</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActivePlaylist(pl)} className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-all rounded-none cursor-pointer">View</button>
                  <button onClick={() => removePlaylist(pl.id)} className="p-1 border border-zinc-800 hover:border-rose-900 hover:text-rose-400 text-zinc-600 transition-all rounded-none bg-zinc-900 cursor-pointer">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-violet-400" /></div>}>
        <PlaylistGeneratorContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}

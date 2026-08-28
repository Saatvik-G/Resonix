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
        <h1 className="font-outfit text-3xl font-bold text-white mb-1">AI Playlist Generator</h1>
        <p className="text-white/40">Describe a vibe, emotion, or scenario — get a curated playlist with a story</p>
      </div>

      {/* Generator input */}
      <div className="glass border border-white/10 rounded-2xl p-6 mb-6">
        <div className="relative mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "My first breakup at 3am" or "Cyberpunk night in a neon city"'
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/25 text-sm outline-none focus:border-violet-500/50 resize-none transition-colors"
            onKeyDown={(e) => e.key === "Enter" && e.metaKey && handleGenerate()}
          />
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED_PROMPTS.map((s) => (
            <button
              key={s}
              onClick={() => { setPrompt(s); }}
              className="text-xs px-3 py-1.5 rounded-full glass border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all"
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating || !prompt.trim()}
          className="flex items-center gap-2 gradient-primary px-6 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {isGenerating ? "Generating…" : "Generate Playlist"}
        </button>
      </div>

      {/* Active playlist result */}
      {activePlaylist && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-violet-500/20 rounded-2xl p-6 mb-8 bg-gradient-to-br from-violet-600/10 to-indigo-600/10"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs text-violet-400 font-medium mb-1 flex items-center gap-1.5">
                <Sparkles size={11} /> AI-Generated Playlist
              </div>
              <motion.h2
                initial={{ letterSpacing: "0.25em", opacity: 0 }}
                animate={{ letterSpacing: "0.1em", opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="font-outfit text-2xl font-black text-white tracking-widest uppercase"
              >
                {activePlaylist.name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1.0 }}
                className="text-white/50 text-sm mt-2 max-w-xl leading-relaxed italic"
              >
                {activePlaylist.conceptBlurb}
              </motion.p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/30 flex-shrink-0">
              <Music2 size={12} />
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
                className="flex items-center gap-4 glass rounded-xl p-3 border border-white/5 hover:border-white/10 group transition-all"
              >
                <span className="text-white/20 text-sm w-5 text-right flex-shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <Music2 size={12} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{track.title}</div>
                  <div className="text-xs text-white/40 truncate">{track.artist}</div>
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
          <h3 className="font-outfit font-semibold text-white/60 text-sm uppercase tracking-wider mb-3">Previous Playlists</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {playlists.map((pl) => (
              <div key={pl.id} className="glass border border-white/8 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Music2 size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{pl.name}</div>
                  <div className="text-xs text-white/30">{pl.tracks?.length} tracks</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActivePlaylist(pl)} className="text-xs px-2 py-1 rounded-lg glass border border-white/10 text-white/50 hover:text-white transition-all">View</button>
                  <button onClick={() => removePlaylist(pl.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                    <Trash2 size={12} />
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

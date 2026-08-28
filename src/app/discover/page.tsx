"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import MoodSelector from "@/components/discovery/MoodSelector";
import RecommendationCard from "@/components/ui/RecommendationCard";
import type { MusicRecommendation } from "@/lib/gemini";
import { earnXP } from "@/lib/gamificationClient";
import GenreDock from "@/components/discovery/GenreDock";
import { useSceneStore } from "@/store";

const COLORS = [
  { name: "Crimson", hex: "#dc2626" }, { name: "Orange", hex: "#ea580c" },
  { name: "Amber", hex: "#d97706" }, { name: "Lime", hex: "#65a30d" },
  { name: "Emerald", hex: "#059669" }, { name: "Cyan", hex: "#0891b2" },
  { name: "Indigo", hex: "#4338ca" }, { name: "Violet", hex: "#7c3aed" },
  { name: "Pink", hex: "#db2777" },
];

const WEATHERS = [
  { label: "Rainy", emoji: "🌧️" }, { label: "Sunny", emoji: "☀️" },
  { label: "Stormy", emoji: "⛈️" }, { label: "Foggy", emoji: "🌫️" },
  { label: "Snowy", emoji: "❄️" }, { label: "Cloudy", emoji: "☁️" },
  { label: "Windy", emoji: "🌬️" }, { label: "Night", emoji: "🌙" },
];

const PERSONALITIES = [
  { label: "INTJ", desc: "Architect" }, { label: "INFP", desc: "Mediator" },
  { label: "ENFP", desc: "Campaigner" }, { label: "ISTP", desc: "Virtuoso" },
  { label: "Night Owl", desc: "Late nights" }, { label: "Dreamer", desc: "Head in clouds" },
  { label: "Introvert", desc: "Solo mode" }, { label: "Explorer", desc: "Always curious" },
];

const ACTIVITIES = [
  { label: "Coding", emoji: "💻" }, { label: "Reading", emoji: "📚" },
  { label: "Running", emoji: "🏃" }, { label: "Gym", emoji: "💪" },
  { label: "Gaming", emoji: "🎮" }, { label: "Sleeping", emoji: "😴" },
  { label: "Road Trip", emoji: "🚗" }, { label: "Studying", emoji: "📖" },
  { label: "Cooking", emoji: "🍳" }, { label: "Meditating", emoji: "🧘" },
  { label: "Partying", emoji: "🎉" }, { label: "Cleaning", emoji: "🧹" },
];

const TABS = ["Mood", "Color", "Weather", "Personality", "Activity", "Creative"] as const;
type Tab = typeof TABS[number];

const CREATIVE_SUGGESTIONS = [
  { label: "Tokyo Night", category: "Location" },
  { label: "Interstellar Soundtrack", category: "Movie" },
  { label: "Haruki Murakami Book Vibe", category: "Book" },
  { label: "Sufi Sunset in Lahore", category: "Location" },
  { label: "Cyberpunk 2077 Night City", category: "Game / TV" },
  { label: "Amélie Paris Cafe", category: "Movie & Location" }
];

export default function DiscoverPage() {
  const [tab, setTab] = useState<Tab>("Mood");
  const [results, setResults] = useState<MusicRecommendation[]>([]);
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const { setMood } = useSceneStore();

  useEffect(() => {
    return () => setMood("default");
  }, []);

  const fetchRecs = async (mode: string, value: string) => {
    setSelected(value);
    setMood(value);
    setIsLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, value }),
      });
      const data = await res.json();
      setResults(data.recommendations || []);
      setInterpretation(data.interpretation || "");
      
      // Earn XP for using discovery modes
      if (data.recommendations && data.recommendations.length > 0) {
        let badgeToAward = "Explorer";
        if (value === "Night" || (mode === "weather" && value === "Night")) {
          badgeToAward = "Night Owl";
        }
        await earnXP(15, badgeToAward);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreativeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    fetchRecs("creative", customPrompt);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-playfair text-4xl font-black uppercase text-white">Discover Music</h1>
            <p className="text-zinc-550 mt-1 font-mono text-xs uppercase tracking-wider">// AI VIBE SILHOUETTE SELECTOR // AUDITED METRICS</p>
          </div>
          <Link
            href="/discover/wheel"
            className="flex items-center gap-1.5 px-4 py-2.5 border border-zinc-800 hover:border-[#fbbf24] bg-zinc-950 text-zinc-300 hover:text-white rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all w-fit"
          >
            // TRY DISCOVERY WHEEL
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8 border-b border-zinc-800 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(""); setResults([]); setCustomPrompt(""); setMood("default"); }}
              className={`flex-shrink-0 px-5 py-2 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                tab === t
                  ? "bg-[#f4f3f6] text-[#0b0a0d]"
                  : "border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 bg-zinc-950/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mb-8">
          {tab === "Mood" && (
            <MoodSelector onSelect={(m) => fetchRecs("mood", m)} selected={selected} />
          )}

          {tab === "Color" && (
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => fetchRecs("color", c.name)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-none border transition-all cursor-pointer ${
                    selected === c.name 
                      ? "border-[#f4f3f6] bg-[#f4f3f6] text-[#0b0a0d]" 
                      : "border-zinc-800 bg-[#111014]/40 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-none border border-zinc-800" style={{ backgroundColor: c.hex }} />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">{c.name}</span>
                </button>
              ))}
            </div>
          )}

          {tab === "Weather" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WEATHERS.map((w) => (
                <button
                  key={w.label}
                  onClick={() => fetchRecs("weather", w.label)}
                  className={`border rounded-none p-4 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    selected === w.label 
                      ? "border-[#f4f3f6] bg-[#f4f3f6] text-[#0b0a0d]" 
                      : "border-zinc-800 bg-[#111014]/40 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                    [{w.label}]
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">{w.label}</span>
                </button>
              ))}
            </div>
          )}

          {tab === "Personality" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.label}
                  onClick={() => fetchRecs("personality", p.label)}
                  className={`border rounded-none p-4 text-left transition-all cursor-pointer ${
                    selected === p.label 
                      ? "border-[#f4f3f6] bg-[#f4f3f6] text-[#0b0a0d]" 
                      : "border-zinc-800 bg-[#111014]/40 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <div className="font-mono font-bold text-sm uppercase tracking-wide">{p.label}</div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">{p.desc}</div>
                </button>
              ))}
            </div>
          )}

          {tab === "Activity" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {ACTIVITIES.map((a) => (
                <button
                  key={a.label}
                  onClick={() => fetchRecs("activity", a.label)}
                  className={`border rounded-none p-4 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                    selected === a.label 
                      ? "border-[#f4f3f6] bg-[#f4f3f6] text-[#0b0a0d]" 
                      : "border-zinc-800 bg-[#111014]/40 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                    //{a.label.substring(0,4)}//
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">{a.label}</span>
                </button>
              ))}
            </div>
          )}

          {tab === "Creative" && (
            <div className="max-w-2xl space-y-6">
              <form onSubmit={handleCreativeSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Type a location, movie, book, or abstract vibe..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-none px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center bg-[#f4f3f6] text-[#0b0a0d] px-5 py-2.5 rounded-none text-xs font-mono font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Explore
                </button>
              </form>

              <div>
                <span className="block text-[10px] font-mono font-bold text-zinc-550 uppercase tracking-widest mb-2.5">
                  // POPULAR INSPIRATIONS
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CREATIVE_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        setCustomPrompt(s.label);
                        fetchRecs("creative", s.label);
                      }}
                      className={`border rounded-none p-3 text-left transition-all cursor-pointer ${
                        selected === s.label
                          ? "border-[#fbbf24] bg-zinc-900 text-white"
                          : "border-zinc-800 bg-[#111014]/40 text-zinc-300 hover:border-zinc-700"
                      }`}
                    >
                      <div className="font-mono font-bold text-xs uppercase tracking-wide truncate">{s.label}</div>
                      <div className="text-[9px] font-mono text-zinc-500 uppercase mt-1">{s.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {interpretation && (
          <div className="mb-6">
            <motion.h3
              initial={{ letterSpacing: "0.15em", opacity: 0 }}
              animate={{ letterSpacing: "0.08em", opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="font-mono text-[10px] font-bold text-[#fbbf24] uppercase tracking-widest mb-2 flex items-center gap-1.5"
            >
              <Sparkles size={12} />
              // AI CURATOR VIBE SILHOUETTE
            </motion.h3>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-2 p-4 border border-zinc-800 bg-[#111014]/80 rounded-none"
            >
              <p className="text-xs font-mono text-zinc-300 leading-relaxed">{interpretation}</p>
            </motion.div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={24} className="text-[#fbbf24] animate-spin" />
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">// RETRIEVING AUDIO ARCHIVE RECORDS...</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((rec, i) => (
                <RecommendationCard
                  key={`${rec.title}-${i}`}
                  rec={rec}
                  index={i}
                  onFeedback={async (type) => {
                    if (type === "like") {
                      await earnXP(10, "Collector");
                    }
                  }}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
        <div className="mt-12 pt-8 border-t border-white/5">
          <GenreDock />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Loader2, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import RecommendationCard from "@/components/ui/RecommendationCard";
import { earnXP } from "@/lib/gamificationClient";
import type { MusicRecommendation } from "@/lib/gemini";

const WHEEL_SECTORS = [
  { label: "Genre", emoji: "🎸", color: "#a855f7" },      // Purple
  { label: "Artist", emoji: "👤", color: "#ec4899" },     // Pink
  { label: "Album", emoji: "💿", color: "#3b82f6" },      // Blue
  { label: "Playlist", emoji: "🎵", color: "#06b6d4" },   // Cyan
  { label: "Mood", emoji: "🔮", color: "#14b8a6" },       // Teal
  { label: "Country", emoji: "🗺️", color: "#f59e0b" },    // Amber
  { label: "Decade", emoji: "⏳", color: "#ef4444" },     // Red
  { label: "Language", emoji: "🗣️", color: "#10b981" }    // Emerald
];

export default function DiscoveryWheelPage() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pendingSector, setPendingSector] = useState<typeof WHEEL_SECTORS[0] | null>(null);
  const [selectedSector, setSelectedSector] = useState<typeof WHEEL_SECTORS[0] | null>(null);
  const [results, setResults] = useState<MusicRecommendation[]>([]);
  const [subTheme, setSubTheme] = useState("");
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [earnedNotice, setEarnedNotice] = useState("");

  const spinTheWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedSector(null);
    setResults([]);
    setSubTheme("");
    setEarnedNotice("");

    // Choose a random sector
    const sectorIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const targetSector = WHEEL_SECTORS[sectorIndex];
    
    // Each sector takes 360 / 8 = 45 degrees
    // We want the selected sector to line up with the pointer at 0 degrees (top).
    // The rotation needs to land on: 360 - (sectorIndex * 45) + (multiple full spins)
    // Add 4 to 7 full spins for natural momentum
    const extraSpins = (4 + Math.floor(Math.random() * 4)) * 360;
    const targetAngle = extraSpins + (360 - (sectorIndex * 45));
    
    setRotation(targetAngle);
    setPendingSector(targetSector);
  };

  const fetchWheelRecommendations = async (category: string) => {
    setIsLoadingRecs(true);
    try {
      const res = await fetch("/api/discover/wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category })
      });
      const data = await res.json();
      setResults(data.recommendations || []);
      setSubTheme(data.theme || "");

      // Reward user with XP
      const update = await earnXP(25, "Explorer");
      if (update) {
        setEarnedNotice(`+25 XP Awarded! You unlocked the surprise category: ${data.theme || category}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/discover" className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-outfit text-2xl font-bold text-white flex items-center gap-2">
              🧭 Discovery Wheel
            </h1>
            <p className="text-xs text-white/40">Spin the record for a serendipitous category recommendation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left/Center Column: Spinning Wheel */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative py-6">
            
            {/* Pointer at the top */}
            <div className="absolute top-0 z-20 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_4px_6px_rgba(251,191,36,0.4)]" />
              <div className="w-1.5 h-4 bg-amber-400 rounded-full mt-[-2px]" />
            </div>

            {/* Glowing wheel background shadow */}
            <div className="absolute w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

            {/* Spinner Wheel Container */}
            <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full p-2 border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl flex items-center justify-center">
              
              {/* Spinning part */}
              <motion.div
                className="w-full h-full rounded-full relative overflow-hidden flex items-center justify-center"
                style={{ originX: "50%", originY: "50%" }}
                animate={{ rotate: rotation }}
                transition={{
                  type: "spring",
                  stiffness: 10,
                  damping: 12,
                  mass: 2.2,
                  restDelta: 0.05
                }}
                onAnimationComplete={async () => {
                  if (isSpinning && pendingSector) {
                    setIsSpinning(false);
                    setSelectedSector(pendingSector);
                    await fetchWheelRecommendations(pendingSector.label);
                    setPendingSector(null);
                  }
                }}
              >
                {/* SVG sectors drawing */}
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-[22.5deg]">
                  {WHEEL_SECTORS.map((sector, idx) => {
                    const angle = 45; // 360 / 8
                    const startAngle = idx * angle;
                    // Draw a segment path
                    const radStart = (startAngle * Math.PI) / 180;
                    const radEnd = ((startAngle + angle) * Math.PI) / 180;
                    const x1 = 50 + 50 * Math.cos(radStart);
                    const y1 = 50 + 50 * Math.sin(radStart);
                    const x2 = 50 + 50 * Math.cos(radEnd);
                    const y2 = 50 + 50 * Math.sin(radEnd);
                    const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    return (
                      <path
                        key={idx}
                        d={d}
                        fill={sector.color}
                        fillOpacity="0.08"
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth="0.4"
                      />
                    );
                  })}
                </svg>

                {/* Content Overlay (labels & emojis inside sectors) */}
                {WHEEL_SECTORS.map((sector, idx) => {
                  // Position items at the center of each segment
                  const angle = 45;
                  const itemAngle = idx * angle + angle / 2;
                  const rad = (itemAngle * Math.PI) / 180;
                  const distance = 33; // Percentage from center
                  const x = 50 + distance * Math.cos(rad);
                  const y = 50 + distance * Math.sin(rad);

                  return (
                    <div
                      key={idx}
                      className="absolute flex flex-col items-center select-none"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: `translate(-50%, -50%) rotate(${itemAngle - 90}deg)`,
                      }}
                    >
                      <span className="text-xl sm:text-2xl">{sector.emoji}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-white/70 uppercase tracking-widest mt-0.5">
                        {sector.label}
                      </span>
                    </div>
                  );
                })}

                {/* Grooves to look like vinyl */}
                <div className="absolute inset-4 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-10 rounded-full border border-white/[0.03] pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-white/[0.04] pointer-events-none" />
                <div className="absolute inset-28 rounded-full border border-white/[0.05] pointer-events-none" />

              </motion.div>

              {/* Center Hub - Spin trigger */}
              <button
                onClick={spinTheWheel}
                disabled={isSpinning}
                className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/90 border border-white/20 hover:border-amber-400/40 shadow-2xl flex flex-col items-center justify-center text-center group cursor-pointer z-10 transition-colors disabled:cursor-not-allowed"
              >
                {/* Hub center pin */}
                <div className="absolute w-3 h-3 rounded-full bg-amber-400 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-black" />
                </div>
                <span className="font-outfit font-black text-[10px] text-white tracking-wider uppercase mt-6 group-hover:text-amber-300 transition-colors">
                  {isSpinning ? "Spinning" : "Spin"}
                </span>
              </button>

            </div>

          </div>

          {/* Right Column: Instructions / Results info */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="glass border border-white/8 rounded-2xl p-6 bg-[#121118]/40">
              <h3 className="font-outfit font-bold text-white text-lg mb-2 flex items-center gap-1.5">
                <Sparkles size={18} className="text-amber-400" /> Surprise Spin Mode
              </h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Need fresh music but don't know what to search? Let the Discovery Wheel pick a category. 
                Our AI will combine the result with a surprise sub-theme to deliver a custom mini-playlist.
              </p>

              <div className="mt-5 border-t border-white/5 pt-4">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider block mb-1">
                  Rewards
                </span>
                <p className="text-[11px] text-violet-400 font-semibold flex items-center gap-1.5">
                  <Trophy size={12} /> Spin rewards: +25 XP & unlocks hidden achievements
                </p>
              </div>
            </div>

            {/* Selected Sector status */}
            <AnimatePresence mode="wait">
              {selectedSector && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass border border-amber-500/20 rounded-2xl p-5 bg-gradient-to-r from-amber-500/[0.04] to-orange-500/[0.04] text-center"
                >
                  <span className="text-4xl block mb-2">{selectedSector.emoji}</span>
                  <h4 className="font-outfit font-black text-lg text-white uppercase tracking-wider">
                    Landed on {selectedSector.label}!
                  </h4>
                  {subTheme && (
                    <p className="text-xs text-amber-300 font-semibold mt-1">
                      Theme: {subTheme}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {earnedNotice && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <Sparkles size={14} /> {earnedNotice}
              </div>
            )}

          </div>

        </div>

        {/* Loading recommendations state */}
        {isLoadingRecs && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="text-violet-400 animate-spin" />
            <p className="text-white/40 text-sm">Curating special surprise selections for you...</p>
          </div>
        )}

        {/* Discovery recommendations display */}
        {results.length > 0 && !isLoadingRecs && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-12"
          >
            <h3 className="font-outfit font-bold text-white text-lg mb-6 flex items-center gap-2">
              🍿 Your Serendipitous Playlist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((rec, i) => (
                <RecommendationCard key={`${rec.title}-${i}`} rec={rec} index={i} />
              ))}
            </div>
          </motion.div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}

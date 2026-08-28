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
  { label: "Genre", emoji: "GEN", color: "#1c1917" },
  { label: "Artist", emoji: "ART", color: "#1c1917" },
  { label: "Album", emoji: "ALB", color: "#1c1917" },
  { label: "Playlist", emoji: "PLY", color: "#1c1917" },
  { label: "Mood", emoji: "MOD", color: "#1c1917" },
  { label: "Country", emoji: "CNT", color: "#1c1917" },
  { label: "Decade", emoji: "DEC", color: "#1c1917" },
  { label: "Language", emoji: "LNG", color: "#1c1917" }
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

    const sectorIndex = Math.floor(Math.random() * WHEEL_SECTORS.length);
    const targetSector = WHEEL_SECTORS[sectorIndex];
    
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
          <Link href="/discover" className="w-8 h-8 rounded-none border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
          </Link>
          <div>
            <h1 className="font-playfair text-2xl font-black uppercase text-white flex items-center gap-2">
              🧭 Discovery Wheel
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 mt-1">// SPIN THE RECORD // SERENDIPITOUS SELECTOR</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left/Center Column: Spinning Wheel */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative py-6">
            
            {/* Pointer at the top */}
            <div className="absolute top-0 z-20 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#fbbf24] drop-shadow-[0_4px_6px_rgba(251,191,36,0.3)]" />
              <div className="w-1 h-3 bg-[#fbbf24] mt-[-2px]" />
            </div>

            {/* Spinner Wheel Container */}
            <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full p-2 border border-zinc-800 bg-[#111014]/60 shadow-none flex items-center justify-center">
              
              {/* Spinning part */}
              <motion.div
                className="w-full h-full rounded-full relative overflow-hidden flex items-center justify-center bg-zinc-950"
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
                        fillOpacity="0.8"
                        stroke="#27272a"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </svg>

                {/* Content Overlay (labels & stamps inside sectors) */}
                {WHEEL_SECTORS.map((sector, idx) => {
                  const angle = 45;
                  const itemAngle = idx * angle + angle / 2;
                  const rad = (itemAngle * Math.PI) / 180;
                  const distance = 32;
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
                      <span className="text-[10px] font-mono font-bold text-[#fbbf24] tracking-wider bg-black px-1 border border-zinc-800">
                        {sector.emoji}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-1">
                        {sector.label}
                      </span>
                    </div>
                  );
                })}

                {/* Grooves to look like vinyl */}
                <div className="absolute inset-4 rounded-full border border-white/[0.015] pointer-events-none" />
                <div className="absolute inset-10 rounded-full border border-white/[0.015] pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-white/[0.02] pointer-events-none" />
                <div className="absolute inset-28 rounded-full border border-white/[0.03] pointer-events-none" />

              </motion.div>

              {/* Center Hub - Spin trigger */}
              <button
                onClick={spinTheWheel}
                disabled={isSpinning}
                className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black border-2 border-zinc-800 hover:border-[#fbbf24] shadow-none flex flex-col items-center justify-center text-center group cursor-pointer z-10 transition-colors disabled:cursor-not-allowed"
              >
                {/* Hub center pin */}
                <div className="absolute w-3 h-3 rounded-full bg-[#fbbf24] group-hover:scale-110 transition-transform flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-black" />
                </div>
                <span className="font-mono font-bold text-[9px] text-white tracking-wider uppercase mt-6 group-hover:text-[#fbbf24] transition-colors">
                  {isSpinning ? "Spinning" : "Spin"}
                </span>
              </button>

            </div>

          </div>

          {/* Right Column: Instructions / Results info */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="border border-zinc-800 rounded-none p-6 bg-[#111014]/40">
              <h3 className="font-playfair font-black text-white text-lg mb-2 flex items-center gap-1.5 uppercase">
                <Sparkles size={16} className="text-[#fbbf24]" /> Surprise Spin Mode
              </h3>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 leading-relaxed">
                // Need fresh music but don&apos;t know what to search? Let the Discovery Wheel pick a category. 
                Our AI will combine the result with a surprise sub-theme to deliver a custom mini-playlist.
              </p>

              <div className="mt-5 border-t border-zinc-850 pt-4">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Rewards Milestones
                </span>
                <p className="text-[10px] font-mono text-[#fbbf24] font-bold flex items-center gap-1.5 uppercase">
                  <Trophy size={11} /> Spin rewards: +25 XP & Unlocks archives
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
                  className="border border-[#fbbf24]/30 rounded-none p-5 bg-zinc-950 text-center"
                >
                  <span className="text-xs font-mono font-bold text-[#fbbf24] uppercase tracking-widest block mb-1">
                    [{selectedSector.emoji}]
                  </span>
                  <h4 className="font-playfair font-black text-lg text-white uppercase tracking-wider">
                    Landed on {selectedSector.label}!
                  </h4>
                  {subTheme && (
                    <p className="text-xs font-mono text-[#fbbf24] font-bold mt-1 uppercase">
                      Theme: {subTheme}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {earnedNotice && (
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-900 rounded-none px-4 py-3 flex items-center gap-2">
                <Sparkles size={13} /> {earnedNotice}
              </div>
            )}

          </div>

        </div>

        {/* Loading recommendations state */}
        {isLoadingRecs && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={24} className="text-[#fbbf24] animate-spin" />
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">// COMPILING VIBE SEQUENCE...</p>
          </div>
        )}

        {/* Discovery recommendations display */}
        {results.length > 0 && !isLoadingRecs && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="mt-12"
          >
            <h3 className="font-playfair font-black text-white text-lg mb-6 flex items-center gap-2 uppercase">
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

"use client";
import { motion } from "motion/react";
import { Disc } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-start border-b-2 border-[#f4f3f6] px-6 py-20 bg-[#0b0a0d] overflow-hidden text-[#f4f3f6]">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
        
        {/* Left Column: Concert Poster / Gig Flyer Typography Header */}
        <div className="lg:col-span-8 space-y-8 text-left">
          
          {/* Irregular hand-set bold typography block */}
          <div className="space-y-2 select-none">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs font-mono uppercase tracking-[0.3em] text-[#fbbf24] font-bold"
            >
              [ GIG ARCHIVE // ALL ERAS // ALL GENRES ]
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-playfair text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.95]"
            >
              <span className="block text-[#f4f3f6]">SOUNDS THAT</span>
              <span className="block text-[#fbbf24] font-sans font-bold text-4xl sm:text-5xl md:text-6xl tracking-tighter">RESONATE</span>
              <span className="block text-[#f4f3f6]">WITH THE SOUL.</span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed font-mono uppercase tracking-wide border-l-2 border-[#fbbf24] pl-4"
          >
            A high-fidelity editorial sound catalog. Bridging Punjabi, Bollywood, Indie, and City Pop since 1960. Verified metrics. Zero playback limits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="pt-4"
          >
            <SearchBar />
          </motion.div>
        </div>

        {/* Right Column: Gig Details / Print Information Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="lg:col-span-4 border-2 border-[#f4f3f6] p-6 bg-zinc-950 font-mono text-[10px] space-y-6 uppercase relative"
        >
          {/* Halftone/print-style design overlay line */}
          <div className="border-b border-[#f4f3f6]/20 pb-4 flex justify-between items-center text-zinc-500 font-bold">
            <span>INDEX NO. 40822</span>
            <span>EDITION: OCT 2026</span>
          </div>

          <div className="space-y-3">
            <span className="text-[#fbbf24] font-bold block tracking-wider">LINEUP SPOTLIGHT</span>
            <div className="space-y-1.5 text-zinc-300">
              <p className="font-bold">01 / PASOORI [PUNJABI FUSION]</p>
              <p className="font-bold">02 / STAY WITH ME [JAPANESE CITY POP]</p>
              <p className="font-bold">03 / TUM HI HO [BOLLYWOOD ROMANCE]</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-[#f4f3f6]/10 pt-4">
            <span className="text-zinc-400 font-bold block tracking-wider">TECHNICAL SPECIFICATIONS</span>
            <div className="grid grid-cols-2 gap-2 text-zinc-400">
              <div>
                <span className="text-zinc-650 block">ENGINE:</span>
                <span className="text-[#f4f3f6] font-bold">HYBRID AI/CURATOR</span>
              </div>
              <div>
                <span className="text-zinc-650 block">METRICS:</span>
                <span className="text-[#f4f3f6] font-bold">LAST.FM AUDITED</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#f4f3f6]/20 pt-4 flex justify-between items-center text-zinc-500">
            <span>PLATFORM: SPOTIFY / YT MUSIC / APPLE</span>
            <Disc className="animate-vinyl text-[#fbbf24]" size={14} />
          </div>
        </motion.div>

      </div>
    </section>
  );
}

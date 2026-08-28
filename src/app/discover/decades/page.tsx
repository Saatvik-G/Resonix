"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Calendar, Loader2, Disc, Star, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import RecommendationCard from "@/components/ui/RecommendationCard";

const DECADES = [
  { id: "60s", label: "1960s", name: "The Psychedelic & Soul Era", description: "Woodstock, Motown soul, and the British invasion. Bold, raw, and revolutionary." },
  { id: "70s", label: "1970s", name: "The Disco, Funk & Rock Era", description: "Glitzy disco dance floors, deep funk grooves, and stadium-filling classic rock riffs." },
  { id: "80s", label: "1980s", name: "The New Wave & Synth Era", description: "Neon synthpop, new wave poetry, and the birth of hip-hop and hair metal." },
  { id: "90s", label: "1990s", name: "The Grunge & R&B Era", description: "Seattle grunge guitar angst, golden-era hip-hop storytelling, and glossy vocal R&B." },
  { id: "2000s", label: "2000s", name: "The Millennium Pop & Indie Era", description: "Y2K dance-pop anthems, alternative indie rock revivals, and club-shaking rap hooks." },
  { id: "2010s", label: "2010s", name: "The EDM & Streaming Era", description: "Soaring EDM drops, moody soundcloud trap, and the rise of bedroom indie-pop." },
  { id: "2020s", label: "2020s", name: "The Modern Fusion Era", description: "Genre-blending bedroom beats, global Punjabi-pop crossovers, and TikTok revival hits." }
];

const ERA_COMPARISONS: Record<string, {
  iconic: { title: string; artist: string; year: string; popularity: string; why: string; cover: string };
  gem: { title: string; artist: string; year: string; obscurity: string; why: string; cover: string };
}> = {
  "60s": {
    iconic: { title: "Yesterday", artist: "The Beatles", year: "1965", popularity: "100%", why: "Yesterday is one of the most covered tracks in music history, defining 1960s melody and pop structure.", cover: "[YST]" },
    gem: { title: "Time of the Season", artist: "The Zombies", year: "1968", obscurity: "Low-key Classic", why: "A psychedelic masterpiece with lush organ riffs, iconic bass, and haunting breathy vocals.", cover: "[TOS]" }
  },
  "70s": {
    iconic: { title: "Stayin' Alive", artist: "Bee Gees", year: "1977", popularity: "99%", why: "The global soundtrack of the disco revolution, instantly recognizable by its four-on-the-floor beat.", cover: "[SAL]" },
    gem: { title: "Starman", artist: "David Bowie", year: "1972", obscurity: "Art-Rock Gem", why: "Bowie's cosmic alter-ego Ziggy Stardust invites listeners to a celestial glam-rock experience.", cover: "[STR]" }
  },
  "80s": {
    iconic: { title: "Billie Jean", artist: "Michael Jackson", year: "1982", popularity: "100%", why: "Redefined pop music and music videos forever, built on a legendary bassline and crisp production.", cover: "[BLJ]" },
    gem: { title: "Blue Monday", artist: "New Order", year: "1983", obscurity: "Synth Cult Hit", why: "The best-selling 12-inch single of all time, bridging post-punk and underground synthpop.", cover: "[BMN]" }
  },
  "90s": {
    iconic: { title: "Smells Like Teen Spirit", artist: "Nirvana", year: "1991", popularity: "98%", why: "The defining anthem of Generation X that catapulted Seattle grunge into mainstream culture.", cover: "[SLT]" },
    gem: { title: "Fade Into You", artist: "Mazzy Star", year: "1993", obscurity: "Dreamy Undercurrent", why: "A melancholic acoustic slide-guitar ballad with Hope Sandoval's ethereal vocals.", cover: "[FIY]" }
  },
  "2000s": {
    iconic: { title: "Toxic", artist: "Britney Spears", year: "2003", popularity: "95%", why: "A futuristic pop storm combining surf guitar, Bollywood strings, and unforgettable vocal hooks.", cover: "[TXC]" },
    gem: { title: "Digital Love", artist: "Daft Punk", year: "2001", obscurity: "Electronic Masterwork", why: "A retro-futuristic electronic romance anthem featuring a legendary synthesizer guitar-solo.", cover: "[DGL]" }
  },
  "2010s": {
    iconic: { title: "Get Lucky", artist: "Daft Punk ft. Pharrell", year: "2013", popularity: "94%", why: "A glorious revival of 70s disco-funk that dominated global charts and radio airwaves.", cover: "[GLK]" },
    gem: { title: "Midnight City", artist: "M83", year: "2011", obscurity: "Indie-Synth Anthem", why: "A dreamy shoegaze-pop hybrid with an iconic vocal synth lead and a blazing saxophone outro.", cover: "[MNC]" }
  },
  "2020s": {
    iconic: { title: "Blinding Lights", artist: "The Weeknd", year: "2020", popularity: "100%", why: "The biggest Billboard Hot 100 hit of all time, bringing back neon-drenched 80s synthwave.", cover: "[BDL]" },
    gem: { title: "Heat Waves", artist: "Glass Animals", year: "2020", obscurity: "Slow-burn Gem", why: "A bedroom-produced psychedelic indie-pop hit that slowly conquered global streaming charts.", cover: "[HWV]" }
  }
};

function BeforeAfterSlider({ decade }: { decade: string }) {
  const comp = ERA_COMPARISONS[decade];
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(600);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    
    if (containerRef.current) {
      setContainerWidth(containerRef.current.getBoundingClientRect().width);
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!comp) return null;

  return (
    <div className="flex flex-col gap-4 my-8">
      <div className="text-center">
        <h3 className="font-playfair text-base font-black uppercase text-white flex items-center justify-center gap-1.5">
          // ERA PROFILE COMPARISON
        </h3>
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
          Drag the center handle to reveal the <span className="text-[#fbbf24] font-bold">Iconic Hit</span> or the <span className="text-white font-bold">Hidden Gem</span> of the {decade}!
        </p>
      </div>

      <div
        ref={containerRef}
        onMouseMove={(e) => {
          if (isDragging) handleMove(e.clientX);
        }}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[320px] rounded-none overflow-hidden border border-zinc-800 select-none cursor-ew-resize bg-zinc-950"
      >
        {/* Iconic Hit (Left Side) */}
        <div className="absolute inset-0 w-full h-full bg-[#111014]/20 p-6 flex flex-col justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none bg-zinc-900 text-zinc-400 text-[9px] font-mono font-bold uppercase tracking-wider mb-4 border border-zinc-800">
              🔥 Iconic Hit ({comp.iconic.popularity} Popularity)
            </span>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-lg font-mono font-bold p-3 bg-zinc-900 border border-zinc-800 text-white rounded-none">{comp.iconic.cover}</span>
              <div>
                <h4 className="font-playfair font-black text-xl text-white uppercase leading-tight">{comp.iconic.title}</h4>
                <p className="text-[#fbbf24] font-mono font-bold text-xs uppercase">{comp.iconic.artist}</p>
                <p className="text-zinc-650 font-mono text-[10px] mt-0.5 uppercase">Released: {comp.iconic.year}</p>
              </div>
            </div>
            <p className="text-zinc-400 font-mono text-[11px] uppercase tracking-wide mt-4 leading-relaxed">
              {comp.iconic.why}
            </p>
          </div>
          <div className="text-[9px] font-mono font-bold text-zinc-700 uppercase tracking-widest">
            // ICONIC MAINSTREAM ANTHEMS
          </div>
        </div>

        {/* Hidden Gem (Right Side - clipped width based on sliderPos) */}
        <div
          className="absolute inset-y-0 right-0 h-full overflow-hidden bg-zinc-950 border-l border-zinc-800"
          style={{ left: `${sliderPos}%` }}
        >
          <div
            className="absolute inset-y-0 right-0 h-full p-6 flex flex-col justify-between"
            style={{ width: `${containerWidth}px` }}
          >
            <div className="max-w-md ml-auto text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none bg-zinc-900 text-zinc-400 text-[9px] font-mono font-bold uppercase tracking-wider mb-4 border border-zinc-800">
                💎 Hidden Gem ({comp.gem.obscurity})
              </span>
              <div className="flex items-center justify-end gap-4 mb-3">
                <div className="text-right">
                  <h4 className="font-playfair font-black text-xl text-white uppercase leading-tight">{comp.gem.title}</h4>
                  <p className="text-[#fbbf24] font-mono font-bold text-xs uppercase">{comp.gem.artist}</p>
                  <p className="text-zinc-650 font-mono text-[10px] mt-0.5 uppercase">Released: {comp.gem.year}</p>
                </div>
                <span className="text-lg font-mono font-bold p-3 bg-zinc-900 border border-zinc-800 text-white rounded-none">{comp.gem.cover}</span>
              </div>
              <p className="text-zinc-400 font-mono text-[11px] uppercase tracking-wide mt-4 leading-relaxed">
                {comp.gem.why}
              </p>
            </div>
            <div className="text-[9px] font-mono font-bold text-zinc-700 uppercase tracking-widest text-right">
              // UNDERGROUND & INDIE CLASSICS
            </div>
          </div>
        </div>

        {/* Drag Handle */}
        <motion.div
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="absolute top-0 bottom-0 w-1 bg-[#fbbf24] cursor-ew-resize z-30"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-none bg-[#fbbf24] border border-zinc-800 shadow-none flex items-center justify-center text-zinc-950 font-mono font-bold text-xs select-none">
            &lt;&gt;
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DecadeExplorerPage() {
  const [selectedDecade, setSelectedDecade] = useState("80s");
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDecadeTracks(selectedDecade);
  }, [selectedDecade]);

  const fetchDecadeTracks = async (decadeId: string) => {
    setLoading(true);
    setTracks([]);
    try {
      const res = await fetch(`/api/decades?decade=${decadeId}`);
      const data = await res.json();
      setTracks(data.recommendations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeDecade = DECADES.find(d => d.id === selectedDecade) || DECADES[2];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-black uppercase text-white flex items-center gap-2">
            <Calendar className="text-[#fbbf24]" /> Decade Explorer
          </h1>
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 mt-1">// JOURNEY THROUGH HISTORICAL SONIC MILESTONES</p>
        </div>

        {/* Decades Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {DECADES.map((dec) => {
            const isActive = dec.id === selectedDecade;
            return (
              <button
                key={dec.id}
                onClick={() => setSelectedDecade(dec.id)}
                className={`border rounded-none p-4 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group cursor-pointer ${
                  isActive
                    ? "border-[#fbbf24] bg-zinc-900 text-[#fbbf24]"
                    : "border-zinc-800 hover:border-zinc-500 bg-zinc-950 text-zinc-400"
                }`}
              >
                <Disc size={20} className={`mb-2 text-zinc-700 transition-all ${isActive ? "text-[#fbbf24] rotate-[360deg] duration-[5000ms] ease-linear infinite" : "group-hover:text-white"}`} />
                <span className="text-xs font-mono font-bold uppercase tracking-wider">{dec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Decade Showcase Banner */}
        <div className="border border-zinc-800 rounded-none p-6 sm:p-8 bg-[#111014]/40 relative overflow-hidden mb-8">
          <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#fbbf24]">
            // NOW EXPLORING ERA
          </span>
          <h2 className="font-playfair text-2xl sm:text-3xl font-black text-white uppercase mt-1 mb-2">
            {activeDecade.name}
          </h2>
          <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider leading-relaxed max-w-2xl">
            {activeDecade.description}
          </p>
        </div>

        {/* Side-by-side interactive before-after comparison slider */}
        <BeforeAfterSlider decade={selectedDecade} />

        {/* Results heading */}
        <div className="mt-12 mb-6">
          <h3 className="font-playfair text-xl font-black uppercase text-white">
            // TOP ARCHIVES & HIDDEN GEMS: {activeDecade.label}
          </h3>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider mt-1">// SELECTED CLASSICS FOR PLAYLISTING</p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={24} className="text-[#fbbf24] animate-spin" />
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">// ACCESSING DECADE DATABASES...</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tracks.map((rec, i) => (
                <RecommendationCard key={`${rec.title}-${i}`} rec={rec} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}

      </div>
      <BottomNav />
    </div>
  );
}

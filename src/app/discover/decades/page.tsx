"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Calendar, Loader2, Disc, Star, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import RecommendationCard from "@/components/ui/RecommendationCard";

const DECADES = [
  { id: "60s", label: "1960s", name: "The Psychedelic & Soul Era", description: "Woodstock, Motown soul, and the British invasion. Bold, raw, and revolutionary.", gradient: "from-amber-700/30 to-yellow-600/30", border: "border-amber-500/20" },
  { id: "70s", label: "1970s", name: "The Disco, Funk & Rock Era", description: "Glitzy disco dance floors, deep funk grooves, and stadium-filling classic rock riffs.", gradient: "from-orange-700/30 to-amber-700/30", border: "border-orange-500/20" },
  { id: "80s", label: "1980s", name: "The New Wave & Synth Era", description: "Neon synthpop, new wave poetry, and the birth of hip-hop and hair metal.", gradient: "from-pink-700/30 to-violet-700/30", border: "border-pink-500/20" },
  { id: "90s", label: "1990s", name: "The Grunge & R&B Era", description: "Seattle grunge guitar angst, golden-era hip-hop storytelling, and glossy vocal R&B.", gradient: "from-emerald-700/30 to-teal-700/30", border: "border-emerald-500/20" },
  { id: "2000s", label: "2000s", name: "The Millennium Pop & Indie Era", description: "Y2K dance-pop anthems, alternative indie rock revivals, and club-shaking rap hooks.", gradient: "from-blue-700/30 to-indigo-700/30", border: "border-blue-500/20" },
  { id: "2010s", label: "2010s", name: "The EDM & Streaming Era", description: "Soaring EDM drops, moody soundcloud trap, and the rise of bedroom indie-pop.", gradient: "from-violet-700/30 to-fuchsia-700/30", border: "border-violet-500/20" },
  { id: "2020s", label: "2020s", name: "The Modern Fusion Era", description: "Genre-blending bedroom beats, global Punjabi-pop crossovers, and TikTok revival hits.", gradient: "from-cyan-700/30 to-rose-700/30", border: "border-cyan-500/20" }
];

const ERA_COMPARISONS: Record<string, {
  iconic: { title: string; artist: string; year: string; popularity: string; why: string; cover: string };
  gem: { title: string; artist: string; year: string; obscurity: string; why: string; cover: string };
}> = {
  "60s": {
    iconic: { title: "Yesterday", artist: "The Beatles", year: "1965", popularity: "100%", why: "Yesterday is one of the most covered tracks in music history, defining 1960s melody and pop structure.", cover: "🎸" },
    gem: { title: "Time of the Season", artist: "The Zombies", year: "1968", obscurity: "Low-key Classic", why: "A psychedelic masterpiece with lush organ riffs, iconic bass, and haunting breathy vocals.", cover: "🌸" }
  },
  "70s": {
    iconic: { title: "Stayin' Alive", artist: "Bee Gees", year: "1977", popularity: "99%", why: "The global soundtrack of the disco revolution, instantly recognizable by its four-on-the-floor beat.", cover: "🕺" },
    gem: { title: "Starman", artist: "David Bowie", year: "1972", obscurity: "Art-Rock Gem", why: "Bowie's cosmic alter-ego Ziggy Stardust invites listeners to a celestial glam-rock experience.", cover: "⚡" }
  },
  "80s": {
    iconic: { title: "Billie Jean", artist: "Michael Jackson", year: "1982", popularity: "100%", why: "Redefined pop music and music videos forever, built on a legendary bassline and crisp production.", cover: "🎩" },
    gem: { title: "Blue Monday", artist: "New Order", year: "1983", obscurity: "Synth Cult Hit", why: "The best-selling 12-inch single of all time, bridging post-punk and underground synthpop.", cover: "🎹" }
  },
  "90s": {
    iconic: { title: "Smells Like Teen Spirit", artist: "Nirvana", year: "1991", popularity: "98%", why: "The defining anthem of Generation X that catapulted Seattle grunge into mainstream culture.", cover: "🎸" },
    gem: { title: "Fade Into You", artist: "Mazzy Star", year: "1993", obscurity: "Dreamy Undercurrent", why: "A melancholic acoustic slide-guitar ballad with Hope Sandoval's ethereal vocals.", cover: "🌌" }
  },
  "2000s": {
    iconic: { title: "Toxic", artist: "Britney Spears", year: "2003", popularity: "95%", why: "A futuristic pop storm combining surf guitar, Bollywood strings, and unforgettable vocal hooks.", cover: "💋" },
    gem: { title: "Digital Love", artist: "Daft Punk", year: "2001", obscurity: "Electronic Masterwork", why: "A retro-futuristic electronic romance anthem featuring a legendary synthesizer guitar-solo.", cover: "🤖" }
  },
  "2010s": {
    iconic: { title: "Get Lucky", artist: "Daft Punk ft. Pharrell", year: "2013", popularity: "94%", why: "A glorious revival of 70s disco-funk that dominated global charts and radio airwaves.", cover: "🕶️" },
    gem: { title: "Midnight City", artist: "M83", year: "2011", obscurity: "Indie-Synth Anthem", why: "A dreamy shoegaze-pop hybrid with an iconic vocal synth lead and a blazing saxophone outro.", cover: "🌃" }
  },
  "2020s": {
    iconic: { title: "Blinding Lights", artist: "The Weeknd", year: "2020", popularity: "100%", why: "The biggest Billboard Hot 100 hit of all time, bringing back neon-drenched 80s synthwave.", cover: "🚗" },
    gem: { title: "Heat Waves", artist: "Glass Animals", year: "2020", obscurity: "Slow-burn Gem", why: "A bedroom-produced psychedelic indie-pop hit that slowly conquered global streaming charts.", cover: "🌊" }
  }
};

function BeforeAfterSlider({ decade }: { decade: string }) {
  const comp = ERA_COMPARISONS[decade];
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 to 100)
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
        <h3 className="font-outfit text-base font-bold text-white flex items-center justify-center gap-1.5">
          ✨ Iconic Hit vs. Hidden Gem Comparison
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Drag the center handle to reveal the <span className="text-amber-400 font-semibold">Iconic Hit</span> or the <span className="text-violet-400 font-semibold">Hidden Gem</span> of the {decade}!
        </p>
      </div>

      <div
        ref={containerRef}
        onMouseMove={(e) => {
          if (isDragging) handleMove(e.clientX);
        }}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[320px] rounded-3xl overflow-hidden border border-white/10 select-none cursor-ew-resize bg-zinc-950"
      >
        {/* Iconic Hit (Left Side) */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-600/20 via-zinc-900 to-zinc-950 p-6 flex flex-col justify-between">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-4 border border-amber-500/30">
              🔥 Iconic Hit ({comp.iconic.popularity} Popularity)
            </span>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-5xl p-3 bg-white/5 border border-white/10 rounded-2xl">{comp.iconic.cover}</span>
              <div>
                <h4 className="font-outfit font-extrabold text-2xl text-white leading-tight">{comp.iconic.title}</h4>
                <p className="text-amber-400 font-medium text-sm">{comp.iconic.artist}</p>
                <p className="text-zinc-500 text-xs mt-0.5">Released: {comp.iconic.year}</p>
              </div>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mt-4 font-normal">
              {comp.iconic.why}
            </p>
          </div>
          <div className="text-[10px] font-bold text-amber-500/40 uppercase tracking-widest">
            Iconic Mainstream Anthems
          </div>
        </div>

        {/* Hidden Gem (Right Side - clipped width based on sliderPos) */}
        <div
          className="absolute inset-y-0 right-0 h-full overflow-hidden bg-gradient-to-br from-violet-600/20 via-zinc-900 to-zinc-950"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Offset div to crop rather than stretch content */}
          <div
            className="absolute inset-y-0 right-0 h-full p-6 flex flex-col justify-between"
            style={{ width: `${containerWidth}px` }}
          >
            <div className="max-w-md ml-auto text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider mb-4 border border-violet-500/30">
                💎 Hidden Gem ({comp.gem.obscurity})
              </span>
              <div className="flex items-center justify-end gap-4 mb-3">
                <div className="text-right">
                  <h4 className="font-outfit font-extrabold text-2xl text-white leading-tight">{comp.gem.title}</h4>
                  <p className="text-violet-400 font-medium text-sm">{comp.gem.artist}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">Released: {comp.gem.year}</p>
                </div>
                <span className="text-5xl p-3 bg-white/5 border border-white/10 rounded-2xl">{comp.gem.cover}</span>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mt-4 font-normal">
                {comp.gem.why}
              </p>
            </div>
            <div className="text-[10px] font-bold text-violet-500/40 uppercase tracking-widest text-right">
              Underground & Indie Classics
            </div>
          </div>
        </div>

        {/* Drag Handle */}
        <motion.div
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="absolute top-0 bottom-0 w-1 bg-amber-500/80 cursor-ew-resize z-30"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-amber-500 border border-white/20 shadow-lg flex items-center justify-center text-zinc-950 font-bold text-sm select-none">
            ↔
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
          <h1 className="font-outfit text-3xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-amber-400" /> Decade Explorer
          </h1>
          <p className="text-white/40 mt-1">Journey through the sonic milestones of music history</p>
        </div>

        {/* Decades Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {DECADES.map((dec) => {
            const isActive = dec.id === selectedDecade;
            return (
              <button
                key={dec.id}
                onClick={() => setSelectedDecade(dec.id)}
                className={`glass border rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group ${
                  isActive
                    ? "border-amber-500 bg-amber-500/10 shadow-lg"
                    : "border-white/10 hover:border-white/20 bg-white/[0.01]"
                }`}
              >
                <Disc size={28} className={`mb-2 text-zinc-600 transition-all ${isActive ? "text-amber-400 rotate-[360deg] duration-[5000ms] ease-linear infinite" : "group-hover:text-white/40"}`} />
                <span className="text-sm font-bold text-white font-outfit">{dec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Decade Showcase Banner */}
        <div className={`glass border ${activeDecade.border} rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${activeDecade.gradient} relative overflow-hidden mb-8`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400">
            Now Exploring Era
          </span>
          <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2">
            {activeDecade.name}
          </h2>
          <p className="text-zinc-300 text-sm max-w-2xl leading-relaxed">
            {activeDecade.description}
          </p>
        </div>

        {/* Side-by-side interactive before-after comparison slider */}
        <BeforeAfterSlider decade={selectedDecade} />

        {/* Results heading */}
        <div className="mt-12 mb-6">
          <h3 className="font-outfit text-xl font-bold text-white">
            Top Hits & Gems of the {activeDecade.label}
          </h3>
          <p className="text-zinc-400 text-xs mt-1">Recommended classic records to play next</p>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="text-amber-400 animate-spin" />
            <p className="text-white/40 text-sm">Spinning the records of the {activeDecade.label}...</p>
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

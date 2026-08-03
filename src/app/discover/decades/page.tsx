"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Loader2, Disc, Play } from "lucide-react";
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

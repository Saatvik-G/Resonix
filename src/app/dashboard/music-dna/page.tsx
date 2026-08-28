"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2, Music2, RefreshCw, BarChart2, Star, Layers, Calendar, Smile } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import RecommendationCard from "@/components/ui/RecommendationCard";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const AVAILABLE_GENRES = ["Punjabi", "Bollywood", "Hindi Indie", "Pop", "Indie Rock", "Synth-pop", "Jazz", "Electronic", "Classical", "Hip Hop"];
const AVAILABLE_MOODS = ["Dreamy", "Energetic", "Melancholic", "Hopeful", "Dark", "Peaceful", "Romantic", "Aggressive"];

export default function MusicDNAPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dnaData, setDnaData] = useState<any>(null);
  
  // Custom preference selections
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [sessionUser, setSessionUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSessionUser(user);
      }
    });

    // Check localStorage cache
    const cached = localStorage.getItem("resonix_music_dna");
    if (cached) {
      try {
        setDnaData(JSON.parse(cached));
      } catch (e) {
        console.error("Error parsing cached DNA", e);
      }
    }
  }, []);

  const generateDNA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/music-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            genres: selectedGenres,
            moods: selectedMoods,
          }
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setDnaData(data);
        localStorage.setItem("resonix_music_dna", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleToggleMood = (mood: string) => {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    );
  };

  const chartData = dnaData ? [
    { subject: "Energy", value: dnaData.stats.energy },
    { subject: "Positivity", value: dnaData.stats.positivity },
    { subject: "Discovery", value: dnaData.stats.discovery },
    { subject: "Diversity", value: dnaData.stats.genreDiversity },
    { subject: "Decades", value: dnaData.stats.favoriteDecades },
    { subject: "Moods", value: dnaData.stats.favoriteMoods },
  ] : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-black uppercase text-white flex items-center gap-2">
              <Layers className="text-[#fbbf24]" /> Music DNA Profile
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 mt-1">// ACOUSTIC FINGERPRINTS & PERSONALITY SPECTRA</p>
          </div>
          {dnaData && (
            <button
              onClick={() => {
                setDnaData(null);
                localStorage.removeItem("resonix_music_dna");
              }}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-950 rounded-none text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:border-[#fbbf24] transition-all cursor-pointer"
            >
              <RefreshCw size={12} /> Re-Analyze DNA
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={24} className="text-[#fbbf24] animate-spin" />
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">// DECODING SONIC METRICS & MATRIX SEQUENCING...</p>
          </div>
        )}

        {/* DNA Config / Preferences Picker (If no cache) */}
        {!loading && !dnaData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-800 rounded-none p-6 sm:p-8 bg-[#111014]/50 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-none border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                <Sparkles size={16} className="text-[#fbbf24]" />
              </div>
              <div>
                <h3 className="font-playfair text-lg font-black uppercase text-white">// GENERATE YOUR MUSIC DNA</h3>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wide mt-1">Select preferences below to construct your fingerprint spectrum.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Genres */}
              <div>
                <span className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                  // SELECT FAVORITE GENRES
                </span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_GENRES.map(genre => {
                    const selected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => handleToggleGenre(genre)}
                        className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-none border transition-all duration-200 cursor-pointer ${
                          selected
                            ? "bg-[#fbbf24] border-[#fbbf24] text-zinc-950 font-bold"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Moods */}
              <div>
                <span className="block text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2.5">
                  // SELECT PREFERRED MOODS
                </span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_MOODS.map(mood => {
                    const selected = selectedMoods.includes(mood);
                    return (
                      <button
                        key={mood}
                        onClick={() => handleToggleMood(mood)}
                        className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-none border transition-all duration-200 cursor-pointer ${
                          selected
                            ? "bg-[#fbbf24] border-[#fbbf24] text-zinc-950 font-bold"
                            : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500"
                        }`}
                      >
                        {mood}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={generateDNA}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[#f4f3f6] text-[#0b0a0d] hover:bg-zinc-200 py-3.5 px-4 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <BarChart2 size={14} /> Analyze & Create Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Dashboard Display */}
        {!loading && dnaData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Archetype card & stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-7 flex flex-col gap-6"
            >
              <div className="border border-zinc-800 rounded-none p-6 sm:p-8 bg-[#111014]/20 relative overflow-hidden">
                <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#fbbf24]">
                  // YOUR SONIC ARCHETYPE
                </span>
                <h2 className="font-playfair text-2xl sm:text-3xl font-black text-white uppercase mt-1 mb-3">
                  {dnaData.archetype}
                </h2>
                <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider leading-relaxed mb-6">
                  {dnaData.description}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap gap-2.5">
                  {dnaData.traits.map((trait: string) => (
                    <span
                      key={trait}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-zinc-850 bg-zinc-950 text-xs font-mono text-zinc-300 font-bold uppercase"
                    >
                      <Star size={11} className="text-[#fbbf24]" />
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Fingerprints */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-zinc-800 rounded-none p-5 bg-[#111014]/10">
                  <div className="flex items-center gap-2 mb-3 text-[#fbbf24] font-mono font-bold text-xs uppercase tracking-wider">
                    <Music2 size={13} /> Top Genres
                  </div>
                  <ul className="space-y-1.5 font-mono text-xs uppercase text-zinc-400">
                    {dnaData.topGenres.map((g: string) => (
                      <li key={g}>// {g}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-zinc-800 rounded-none p-5 bg-[#111014]/10">
                  <div className="flex items-center gap-2 mb-3 text-zinc-400 font-mono font-bold text-xs uppercase tracking-wider">
                    <Calendar size={13} /> Decades Profile
                  </div>
                  <ul className="space-y-1.5 font-mono text-xs uppercase text-zinc-400">
                    {dnaData.topDecades.map((d: string) => (
                      <li key={d}>// {d}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-zinc-800 rounded-none p-5 bg-[#111014]/10">
                  <div className="flex items-center gap-2 mb-3 text-[#fbbf24] font-mono font-bold text-xs uppercase tracking-wider">
                    <Smile size={13} /> Mood Synergy
                  </div>
                  <ul className="space-y-1.5 font-mono text-xs uppercase text-zinc-400">
                    {dnaData.topMoods.map((m: string) => (
                      <li key={m}>// {m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Right: Radar Chart Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-5 border border-zinc-800 rounded-none p-6 bg-[#111014]/30 flex flex-col justify-center min-h-[350px]"
            >
              <h3 className="font-mono text-xs font-bold text-center text-white uppercase tracking-widest mb-4">
                // ACOUSTIC DIMENSION INDEX
              </h3>
              <div className="w-full h-72">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="rgba(255, 255, 255, 0.04)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        stroke="rgba(255, 255, 255, 0.3)"
                        tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 9, fontWeight: 700, fontFamily: "monospace" }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        stroke="none"
                        tick={{ fill: "rgba(255, 255, 255, 0.2)", fontSize: 8, fontFamily: "monospace" }}
                      />
                      <Radar
                        name="My DNA"
                        dataKey="value"
                        stroke="#fbbf24"
                        fill="#fbbf24"
                        fillOpacity={0.15}
                        shape={(props: any) => {
                          const { points, stroke, fill, fillOpacity } = props;
                          if (!points || points.length === 0) return <g />;
                          
                          const pathString = points.reduce((acc: string, p: any, i: number) => {
                            return `${acc}${i === 0 ? "M" : "L"}${p.x},${p.y}`;
                          }, "") + "Z";

                          return (
                            <g>
                              <motion.path
                                d={pathString}
                                fill={fill}
                                fillOpacity={fillOpacity}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: fillOpacity }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                style={{ transformOrigin: `${props.cx}px ${props.cy}px` }}
                              />
                              <motion.path
                                d={pathString}
                                fill="none"
                                stroke={stroke}
                                strokeWidth={2}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                              />
                              {points.map((p: any, i: number) => (
                                <motion.circle
                                  key={i}
                                  cx={p.x}
                                  cy={p.y}
                                  r={3.5}
                                  fill="#0b0a0d"
                                  stroke={stroke}
                                  strokeWidth={1.5}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 1.0 + i * 0.1, duration: 0.2 }}
                                />
                              ))}
                            </g>
                          );
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0b0a0d",
                          borderColor: "#27272a",
                          borderRadius: "0px",
                          fontFamily: "monospace",
                          color: "#fff",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Bottom: Signature Sound Recommendations */}
            <div className="lg:col-span-12 mt-4">
              <h3 className="font-playfair text-xl font-black uppercase text-white mb-6">
                // DNA SIGNATURE SOUND RECORDS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dnaData.dnaTracks.map((rec: any, i: number) => (
                  <RecommendationCard key={rec.title} rec={rec} index={i} />
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}

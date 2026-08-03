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
            <h1 className="font-outfit text-3xl font-bold text-white flex items-center gap-2">
              <Layers className="text-amber-400" /> Music DNA Profile
            </h1>
            <p className="text-white/40 mt-1">Visualize your unique acoustic fingerprints and listening personality</p>
          </div>
          {dnaData && (
            <button
              onClick={() => {
                setDnaData(null);
                localStorage.removeItem("resonix_music_dna");
              }}
              className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:border-amber-500/30 transition-all bg-white/[0.02]"
            >
              <RefreshCw size={12} /> Re-Analyze DNA
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={36} className="text-amber-400 animate-spin" />
            <p className="text-white/50 text-sm font-medium">Extracting sonic metrics and compiling your profile...</p>
          </div>
        )}

        {/* DNA Config / Preferences Picker (If no cache) */}
        {!loading && !dnaData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-white/10 rounded-3xl p-6 sm:p-8 bg-[#121118]/80 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Sparkles size={18} className="text-amber-400" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-lg text-white">Generate Your Music DNA</h3>
                <p className="text-xs text-white/40">Select your preferences below (combined with your listening history if logged in)</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Genres */}
              <div>
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Select Favorite Genres
                </span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_GENRES.map(genre => {
                    const selected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => handleToggleGenre(genre)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                          selected
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 font-semibold"
                            : "bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:border-white/20"
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
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Select Preferred Moods
                </span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_MOODS.map(mood => {
                    const selected = selectedMoods.includes(mood);
                    return (
                      <button
                        key={mood}
                        onClick={() => handleToggleMood(mood)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                          selected
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 font-semibold"
                            : "bg-white/[0.02] border-white/5 text-white/60 hover:text-white hover:border-white/20"
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
                className="w-full mt-2 inline-flex items-center justify-center gap-2 gradient-primary py-3 px-4 rounded-xl text-sm font-semibold text-white hover:opacity-95 transition-all shadow-lg"
              >
                <BarChart2 size={16} /> Analyze & Create Profile
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
              <div className="glass border border-white/15 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-500/5 to-violet-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl" />
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400">
                  Your Sonic Persona
                </span>
                <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-3">
                  {dnaData.archetype}
                </h2>
                <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                  {dnaData.description}
                </p>

                {/* Traits */}
                <div className="flex flex-wrap gap-2.5">
                  {dnaData.traits.map((trait: string, idx: number) => (
                    <span
                      key={trait}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 font-medium"
                    >
                      <Star size={12} className="text-amber-400" />
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Fingerprints */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass border border-white/10 rounded-2xl p-5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-3 text-amber-300 font-semibold text-xs uppercase tracking-wider">
                    <Music2 size={14} /> Top Genres
                  </div>
                  <ul className="space-y-1.5">
                    {dnaData.topGenres.map((g: string) => (
                      <li key={g} className="text-sm text-zinc-300 font-medium">• {g}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass border border-white/10 rounded-2xl p-5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-3 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                    <Calendar size={14} /> Decades Profile
                  </div>
                  <ul className="space-y-1.5">
                    {dnaData.topDecades.map((d: string) => (
                      <li key={d} className="text-sm text-zinc-300 font-medium">• {d}</li>
                    ))}
                  </ul>
                </div>

                <div className="glass border border-white/10 rounded-2xl p-5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-3 text-pink-300 font-semibold text-xs uppercase tracking-wider">
                    <Smile size={14} /> Mood Synergy
                  </div>
                  <ul className="space-y-1.5">
                    {dnaData.topMoods.map((m: string) => (
                      <li key={m} className="text-sm text-zinc-300 font-medium">• {m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Right: Radar Chart Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-5 glass border border-white/10 rounded-3xl p-6 bg-[#121118]/80 flex flex-col justify-center min-h-[350px]"
            >
              <h3 className="font-outfit font-bold text-center text-white text-base mb-4">
                Acoustic Dimension Mix
              </h3>
              <div className="w-full h-72">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                      <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        stroke="rgba(255, 255, 255, 0.5)"
                        tick={{ fill: "rgba(255, 255, 255, 0.6)", fontSize: 10, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        stroke="none"
                        tick={{ fill: "rgba(255, 255, 255, 0.3)", fontSize: 8 }}
                      />
                      <Radar
                        name="My DNA"
                        dataKey="value"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.25}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1c1917",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "12px",
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
              <h3 className="font-outfit text-xl font-bold text-white mb-6">
                Your DNA Theme Tracks
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

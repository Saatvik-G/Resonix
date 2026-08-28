"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, Compass, ArrowRight, Disc, Flame, Globe } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import Hero from "@/components/layout/Hero";
import GenreDock from "@/components/discovery/GenreDock";
import MoodSelector from "@/components/discovery/MoodSelector";
import { useRouter } from "next/navigation";
import Letterbox from "@/components/ui/Letterbox";

const GLOBAL_SPOTLIGHTS = [
  { title: "Pasoori", artist: "Ali Sethi & Shae Gill", language: "Punjabi", mood: "Vibrant", why: "Electrifying Punjabi fusion that swept global charts with lush melodies", gradient: "from-amber-600/20 to-rose-600/20", emoji: "🪕" },
  { title: "Tum Hi Ho", artist: "Arijit Singh", language: "Hindi", mood: "Soulful", why: "Landmark Hindi romance ballad with piano, vocal passion, and haunting strings", gradient: "from-rose-600/20 to-amber-600/20", emoji: "🥀" },
  { title: "Stay With Me", artist: "Miki Matsubara", language: "Japanese", mood: "Retro City Pop", why: "1979 Japanese City Pop masterpiece bursting with brass horns and disco groove", gradient: "from-amber-500/20 to-indigo-600/20", emoji: "🌆" },
];

const GLOBAL_CATEGORIES = [
  { name: "Punjabi Hits & Folk", desc: "Sidhu Moosewala, Diljit, AP Dhillon, Nusrat", emoji: "👳", query: "Punjabi hits and folk" },
  { name: "Hindi & Bollywood", desc: "Arijit Singh, Kishore Kumar, AR Rahman", emoji: "🇮🇳", query: "best Hindi Bollywood classics and hits" },
  { name: "English Indie & Rock", desc: "Arctic Monkeys, The Weeknd, Queen, M83", emoji: "🎸", query: "English indie rock and pop" },
  { name: "Retro 70s-90s Gold", desc: "Timeless vinyl classics & nostalgia", emoji: "📻", query: "70s 80s 90s retro gold classics" },
  { name: "Latin & Spanish", desc: "Reggaeton, Bachata, Acoustic Flamenco", emoji: "💃", query: "Spanish Latin acoustic and pop" },
  { name: "K-Pop & Asian Pop", desc: "BTS, NewJeans, Japanese City Pop", emoji: "🌸", query: "K-Pop and Japanese City Pop" },
];

export default function HomePage() {
  const router = useRouter();
  const [isHeroActive, setIsHeroActive] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeroActive(window.scrollY < 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMoodSelect = (mood: string) => {
    router.push(`/discover?mode=mood&value=${encodeURIComponent(mood)}`);
  };

  return (
    <div className="min-h-screen relative">
      <Letterbox active={isHeroActive} />
      <Navbar />

      <Hero />

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 space-y-20">
        
        {/* GLOBAL MUSIC CATALOG CATEGORIES */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                <Globe size={20} className="text-zinc-500" />
                Global & Regional Soundscapes
              </h2>
              <p className="text-xs sm:text-sm text-zinc-550 mt-1">Explore iconic tracks across languages and cultures</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GLOBAL_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/search?q=${encodeURIComponent(cat.query)}`)}
                className="border border-zinc-800 hover:border-zinc-550 rounded-none p-5 cursor-pointer transition-all duration-300 bg-[#111014]/35 flex items-start gap-4"
              >
                <span className="text-3xl p-2 rounded-none bg-zinc-900 border border-zinc-800 shrink-0">{cat.emoji}</span>
                <div>
                  <h3 className="font-outfit font-extrabold text-white text-base">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* MOOD EXPLORER */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">How are you feeling?</h2>
              <p className="text-xs sm:text-sm text-zinc-550 mt-1">Select an emotional aura to get instant curated recommendations</p>
            </div>
            <Link href="/discover" className="flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
              All Filters <ArrowRight size={12} />
            </Link>
          </div>
          <MoodSelector onSelect={handleMoodSelect} />
        </motion.section>

        {/* GLOBAL SPOTLIGHT PICKS */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Flame size={20} className="text-zinc-500" />
            <div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">Curator Spotlight</h2>
              <p className="text-xs sm:text-sm text-zinc-550 mt-0.5">Hand-picked masterpieces with deep cultural impact</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GLOBAL_SPOTLIGHTS.map((pick, i) => (
              <motion.div
                key={pick.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="border border-zinc-800 hover:border-zinc-550 rounded-none p-6 bg-[#111014]/35 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => router.push(`/search?q=${encodeURIComponent(pick.title + " " + pick.artist)}`)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{pick.emoji}</span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-none bg-zinc-900 text-zinc-400 border border-zinc-800">
                      {pick.language}
                    </span>
                  </div>
                  <h3 className="font-outfit font-extrabold text-white text-xl">{pick.title}</h3>
                  <p className="text-zinc-400 text-sm font-medium mb-3">{pick.artist}</p>
                  <p className="text-zinc-500 text-xs leading-relaxed font-normal">{pick.why}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400 font-semibold font-mono">
                  <span>Explore song →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* GENRE GRID */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">Genre Deep Dives</h2>
              <p className="text-xs sm:text-sm text-zinc-555 mt-1">From Lo-Fi & City Pop to Afrobeats, Metal & Ghazals</p>
            </div>
          </div>
          <GenreDock />
        </motion.section>

        {/* AI CHAT CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="border border-zinc-800 rounded-none p-8 sm:p-12 text-center bg-[#111014]/40 relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                <Sparkles size={12} />
                Hybrid AI Curator Chat
              </div>
              <h2 className="font-playfair text-3xl sm:text-4xl font-normal text-white">
                Looking for something specific?
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                Tell Resonix: &ldquo;Recommend Punjabi acoustic songs for a rainy evening&rdquo; or &ldquo;90s Bollywood romantic hits like Arijit and Kishore Kumar&rdquo;.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 bg-[#f4f3f6] text-[#0b0a0d] px-8 py-3.5 rounded-none font-bold text-sm hover:bg-zinc-200 transition-colors shadow-none"
              >
                Start Chatting Now
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.section>

      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}

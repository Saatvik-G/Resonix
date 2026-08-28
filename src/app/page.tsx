"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, TrendingUp, Compass, ArrowRight, Disc, Flame, Globe } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import SearchBar from "@/components/search/SearchBar";
import MoodSelector from "@/components/discovery/MoodSelector";
import GenreDock from "@/components/discovery/GenreDock";
import FloatingAlbumCards from "@/components/discovery/FloatingAlbumCards";
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

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden pt-6 pb-12">
        <FloatingAlbumCards />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider"
          >
            <Disc size={13} className="animate-vinyl text-amber-400" />
            Every Language · Every Era · Every Vibe
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-outfit text-5xl sm:text-6xl md:text-7xl font-extrabold leading-none tracking-tight"
          >
            Music that <span className="gradient-text">resonates</span>
            <br />
            with your <span className="text-white underline decoration-amber-500/40 decoration-wavy">soul</span>.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Discover handpicked songs across <strong className="text-zinc-200">Punjabi, Hindi, English, Spanish, K-Pop & Retro 70s–2026</strong>. With human curator notes and zero playback restrictions.
          </motion.p>

          {/* Search Bar Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

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
                <Globe size={22} className="text-amber-400" />
                Global & Regional Soundscapes
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Explore iconic tracks across languages and cultures</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GLOBAL_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/search?q=${encodeURIComponent(cat.query)}`)}
                className="glass border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-300 bg-[#141318]/90 flex items-start gap-4"
              >
                <span className="text-4xl p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">{cat.emoji}</span>
                <div>
                  <h3 className="font-outfit font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{cat.desc}</p>
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">How are you feeling?</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">Select an emotional aura to get instant curated recommendations</p>
            </div>
            <Link href="/discover" className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
              All Filters <ArrowRight size={13} />
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
            <Flame size={20} className="text-amber-400" />
            <div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">Curator Spotlight</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Hand-picked masterpieces with deep cultural impact</p>
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
                className={`glass border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 bg-gradient-to-br ${pick.gradient} transition-all duration-300 cursor-pointer flex flex-col justify-between`}
                onClick={() => router.push(`/search?q=${encodeURIComponent(pick.title + " " + pick.artist)}`)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{pick.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pick.language}
                    </span>
                  </div>
                  <h3 className="font-outfit font-extrabold text-white text-xl">{pick.title}</h3>
                  <p className="text-amber-400/90 text-sm font-medium mb-3">{pick.artist}</p>
                  <p className="text-zinc-300 text-xs leading-relaxed font-normal">{pick.why}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-semibold">
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">Genre Deep Dives</h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">From Lo-Fi & City Pop to Afrobeats, Metal & Ghazals</p>
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
          <div className="glass border border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center bg-gradient-to-br from-amber-500/10 via-zinc-900 to-rose-500/10 relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} />
                Human-Like AI Curator Chat
              </div>
              <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-white">
                Looking for something specific?
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed font-normal">
                Tell Resonix: &ldquo;Recommend Punjabi acoustic songs for a rainy evening&rdquo; or &ldquo;90s Bollywood romantic hits like Arijit and Kishore Kumar&rdquo;.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 gradient-gold px-8 py-3.5 rounded-2xl font-extrabold text-zinc-950 hover:scale-105 transition-all duration-200 shadow-xl"
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

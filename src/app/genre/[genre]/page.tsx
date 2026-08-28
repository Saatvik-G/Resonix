"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Music2, Users, Star, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import ListenLinks from "@/components/ui/ListenLinks";

interface GenreData {
  overview: string;
  characteristics: string[];
  popularArtists: string[];
  essentialAlbums: { title: string; artist: string; year: string; why: string }[];
  beginnerPicks: { title: string; artist: string; why: string }[];
  underratedArtists: { name: string; why: string }[];
  similarGenres: string[];
  moodProfile: string[];
}

const TABS = ["Overview", "Artists", "Albums", "Hidden Gems", "Similar"] as const;

export default function GenrePage() {
  const params = useParams();
  const genre = decodeURIComponent(params.genre as string);
  const [data, setData] = useState<GenreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Overview");

  useEffect(() => {
    fetch(`/api/genre/${encodeURIComponent(genre)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [genre]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-550 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={12} /> Back
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-4xl sm:text-5xl font-black text-white capitalize mb-3 uppercase">{genre}</h1>
          {data?.moodProfile && (
            <div className="flex gap-2 flex-wrap">
              {data.moodProfile.map((m) => (
                <span key={m} className="text-[9px] font-mono font-bold px-2.5 py-1 border border-zinc-800 bg-zinc-950 text-zinc-400 uppercase tracking-wider rounded-none">{m}</span>
              ))}
            </div>
          )}
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={24} className="text-[#fbbf24] animate-spin" />
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-550">// RESEARCHING {genre.toUpperCase()}…</p>
          </div>
        ) : data ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-shrink-0 px-4 py-2 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === t
                      ? "bg-[#f4f3f6] text-[#0b0a0d] border border-[#f4f3f6]"
                      : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-550"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "Overview" && (
                  <div className="space-y-6">
                    <div className="border border-zinc-800 rounded-none p-6 bg-[#111014]/30">
                      <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider leading-relaxed">{data.overview}</p>
                    </div>
                    <div>
                      <h3 className="font-playfair font-black text-white uppercase text-sm mb-3 flex items-center gap-2">
                        <Sparkles size={14} className="text-[#fbbf24]" /> Characteristics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {data.characteristics.map((c) => (
                          <span key={c} className="border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase px-3 py-1.5 rounded-none bg-zinc-950">{c}</span>
                        ))}
                      </div>
                    </div>
                    {data.beginnerPicks && (
                      <div>
                        <h3 className="font-playfair font-black text-white uppercase text-sm mb-3 flex items-center gap-2">
                          <Star size={14} className="text-[#fbbf24]" /> Start Here
                        </h3>
                        <div className="space-y-3">
                          {data.beginnerPicks.map((p) => (
                            <div key={p.title} className="border border-zinc-800 rounded-none p-4 bg-[#111014]/25">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-playfair font-black text-white text-sm uppercase">{p.title}</div>
                                  <div className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">{p.artist}</div>
                                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide mt-1">{p.why}</p>
                                </div>
                                <ListenLinks artist={p.artist} track={p.title} size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "Artists" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {data.popularArtists.map((a, i) => (
                      <motion.div
                        key={a}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border border-zinc-800 rounded-none p-4 flex items-center gap-3 bg-[#111014]/20"
                      >
                        <div className="w-9 h-9 rounded-none border border-zinc-800 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                          <Users size={13} className="text-[#fbbf24]" />
                        </div>
                        <div>
                          <div className="font-playfair font-black text-white text-xs uppercase">{a}</div>
                          <ListenLinks artist={a} size="sm" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === "Albums" && (
                  <div className="space-y-3">
                    {data.essentialAlbums.map((album, i) => (
                      <motion.div
                        key={album.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="border border-zinc-800 rounded-none p-4 flex items-center gap-4 bg-[#111014]/25"
                      >
                        <div className="w-11 h-11 rounded-none border border-zinc-800 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                          <Music2 size={14} className="text-[#fbbf24]" />
                        </div>
                        <div className="flex-1 min-w-0 font-mono">
                          <div className="font-playfair font-black text-white text-sm uppercase truncate">{album.title}</div>
                          <div className="text-[10px] text-zinc-500 uppercase">{album.artist} · {album.year}</div>
                          <p className="text-[10px] text-zinc-550 uppercase mt-0.5 leading-relaxed">{album.why}</p>
                        </div>
                        <ListenLinks artist={album.artist} track={album.title} size="sm" />
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === "Hidden Gems" && (
                  <div className="space-y-3">
                    {data.underratedArtists.map((a, i) => (
                      <motion.div
                        key={a.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="border border-zinc-800 rounded-none p-4 bg-[#111014]/25"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-playfair font-black text-white uppercase text-sm">{a.name}</div>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide mt-1">{a.why}</p>
                          </div>
                          <ListenLinks artist={a.name} size="sm" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === "Similar" && (
                  <div className="flex flex-wrap gap-3">
                    {data.similarGenres.map((g) => (
                      <Link
                        key={g}
                        href={`/genre/${encodeURIComponent(g)}`}
                        className="border border-zinc-800 rounded-none px-5 py-3 text-xs font-mono font-bold text-zinc-400 hover:text-white hover:border-zinc-550 transition-all capitalize uppercase bg-zinc-950"
                      >
                        {g}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider text-center py-20">// COULD NOT LOAD GENRE DATA</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

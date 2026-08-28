"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2, RefreshCw, EyeOff, ShieldAlert, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import RecommendationCard from "@/components/ui/RecommendationCard";

export default function HiddenGemsPage() {
  const [gems, setGems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadGems = async () => {
    setLoading(true);
    setError("");
    setGems([]);
    try {
      const res = await fetch("/api/hidden-gems");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setGems(data.recommendations || []);
      }
    } catch (e) {
      setError("Failed to retrieve hidden gems.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGems();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-black uppercase text-white flex items-center gap-2">
              <EyeOff className="text-[#fbbf24]" /> Hidden Gems
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 mt-1">// UNDER-THE-RADAR ACOUSTIC ARCHIVES & INDEPENDENT RELEASES</p>
          </div>
          <button
            onClick={loadGems}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-950 rounded-none text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:border-[#fbbf24] transition-all cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-[#fbbf24]" : "text-[#fbbf24]"} /> Disinter New Gems
          </button>
        </div>

        {/* Banner */}
        <div className="border border-zinc-800 rounded-none p-6 bg-[#111014]/40 flex items-start gap-4 mb-8">
          <div className="w-10 h-10 rounded-none border border-zinc-700 bg-zinc-900 flex items-center justify-center flex-shrink-0">
            <Star size={16} className="text-[#fbbf24]" />
          </div>
          <div>
            <h3 className="font-playfair text-sm font-black uppercase text-white">// UNDER-THE-RADAR DISCOVERY</h3>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 leading-relaxed mt-1">
              These tracks are validated against global indexes to guarantee lifetime playcounts below 200K. Surfacing B-Sides, regional catalog artists, and bedroom producers.
            </p>
          </div>
        </div>

        {/* Loading / Error / Results */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 size={24} className="text-[#fbbf24] animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">// FILTERING METRICS & DIGGING DEEP CUTS...</p>
          </div>
        )}

        {error && (
          <div className="border border-rose-900 bg-rose-950/20 rounded-none p-6 text-center text-rose-200 text-xs font-mono uppercase flex flex-col items-center gap-2 max-w-md mx-auto">
            <ShieldAlert size={20} className="text-rose-400" />
            {error}
          </div>
        )}

        {!loading && gems.length > 0 && (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gems.map((rec, i) => (
                <div key={`${rec.title}-${i}`} className="relative group">
                  <RecommendationCard rec={rec} index={i} />
                  {rec.listeners && (
                    <div className="absolute top-3 left-3 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-none text-[8px] font-mono font-bold text-[#fbbf24] z-10 uppercase">
                      AUD: {formatNumber(rec.listeners)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AnimatePresence>
        )}

      </div>
      <BottomNav />
    </div>
  );
}

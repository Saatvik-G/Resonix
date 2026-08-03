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
            <h1 className="font-outfit text-3xl font-bold text-white flex items-center gap-2">
              <EyeOff className="text-amber-400" /> Hidden Gems
            </h1>
            <p className="text-white/40 mt-1">Lesser-known acoustic treasures with low playcounts that deserve to be heard</p>
          </div>
          <button
            onClick={loadGems}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:border-amber-500/30 transition-all bg-white/[0.02]"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Disinter New Gems
          </button>
        </div>

        {/* Banner */}
        <div className="glass border border-amber-500/10 rounded-3xl p-6 bg-gradient-to-br from-amber-500/5 to-transparent flex items-start gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Star size={18} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-outfit font-bold text-white text-sm">Under-the-Radar Discovery</h3>
            <p className="text-xs text-white/50 leading-relaxed mt-0.5">
              These tracks are validated against global listener counts to ensure they have less than 200,000 lifetime listeners. They represent indie songwriters, B-sides, and regional masterpieces.
            </p>
          </div>
        </div>

        {/* Loading / Error / Results */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 size={36} className="text-amber-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-white/50 font-medium">Scouring underground music archives and filtering listener metrics...</p>
          </div>
        )}

        {error && (
          <div className="glass border border-red-500/20 bg-red-500/5 rounded-2xl p-6 text-center text-red-200 text-sm flex flex-col items-center gap-2 max-w-md mx-auto">
            <ShieldAlert size={24} className="text-red-400" />
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
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-amber-400 z-10">
                      👥 {formatNumber(rec.listeners)} listeners
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

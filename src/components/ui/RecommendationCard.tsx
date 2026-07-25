"use client";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Disc, Sparkles, ThumbsUp, ThumbsDown, Globe, Calendar } from "lucide-react";
import ListenLinks from "./ListenLinks";
import type { MusicRecommendation } from "@/lib/gemini";

interface RecommendationCardProps {
  rec: MusicRecommendation;
  index?: number;
  onFeedback?: (type: "like" | "dismiss", reason?: string) => void;
}

const DISMISS_REASONS = [
  "Not my style", "Already know it", "Too mainstream", "Too obscure", "Wrong mood"
];

export default function RecommendationCard({ rec, index = 0, onFeedback }: RecommendationCardProps) {
  const [showDismiss, setShowDismiss] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="relative group h-full flex flex-col"
    >
      <div className="glass glass-hover rounded-2xl overflow-hidden transition-all duration-300 glow-card border border-white/10 hover:border-amber-500/30 flex flex-col h-full bg-[#121118]/80">
        
        {/* Main card header */}
        <div className="p-4 flex gap-3.5 items-start">
          {/* Album sleeve with vinyl disc background effect */}
          <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-amber-500/40 transition-colors">
            {rec.imageUrl && !imgError ? (
              <Image
                src={rec.imageUrl}
                alt={`Cover artwork for ${rec.title} by ${rec.artist}`}
                fill
                loading={index < 4 ? "eager" : "lazy"}
                sizes="(max-width: 80px) 100vw, 80px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 p-2 text-center" aria-label={`Cover sleeve for ${rec.title} by ${rec.artist}`}>
                <Disc size={28} className="text-amber-400/80 group-hover:animate-vinyl" aria-hidden="true" />
                <span className="text-[9px] text-zinc-400 font-medium truncate max-w-full mt-1">
                  {rec.artist}
                </span>
              </div>
            )}
            
            {/* Format pill */}
            <span className="absolute bottom-1 right-1 text-[9px] font-semibold uppercase bg-black/80 text-amber-300 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10">
              {rec.type}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex-1 min-w-0">
            <h3 className="font-outfit font-bold text-white text-base leading-snug truncate" title={rec.title}>
              {rec.title}
            </h3>
            <p className="text-xs text-amber-400/90 font-medium truncate mt-0.5">
              {rec.artist}
            </p>
            {rec.album && (
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {rec.album}
              </p>
            )}

            {/* Badges for Language, Year & Popularity */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
              {rec.popularity && rec.popularity >= 80 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  🔥 Top Rated
                </span>
              )}
              {rec.language && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                  <Globe size={10} />
                  {rec.language}
                </span>
              )}
              {rec.year && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10">
                  <Calendar size={10} />
                  {rec.year}
                </span>
              )}
            </div>
          </div>

          {/* Feedback controls */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => { setLiked(!liked); onFeedback?.("like"); }}
              className={`p-1.5 rounded-lg transition-all ${liked ? "bg-emerald-500/30 text-emerald-400" : "hover:bg-white/10 text-zinc-400 hover:text-emerald-400"}`}
              title="Love this"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => setShowDismiss(!showDismiss)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-all"
              title="Not for me"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        </div>

        {/* Curator Note / Why this matches - animated display or hover emphasis */}
        {rec.whyThisMatches && (
          <div className="px-4 py-2.5 mx-3 mb-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2 group-hover:bg-amber-500/[0.04] group-hover:border-amber-500/10 transition-all duration-300">
            <Sparkles size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300 leading-relaxed font-normal group-hover:text-white transition-colors">
              {rec.whyThisMatches}
            </p>
          </div>
        )}

        {/* Listen links footer */}
        <div className="mt-auto px-4 pb-4 pt-1 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
            Listen on
          </span>
          <ListenLinks artist={rec.artist} track={rec.type === "song" ? rec.title : undefined} size="sm" />
        </div>

        {/* Dismiss picker */}
        <AnimatePresence>
          {showDismiss && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-3 border-t border-white/10 pt-2 overflow-hidden bg-rose-500/5"
            >
              <p className="text-xs text-zinc-400 mb-2">Why dismiss?</p>
              <div className="flex gap-1 flex-wrap">
                {DISMISS_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      setDismissed(true);
                      onFeedback?.("dismiss", reason);
                    }}
                    className="text-[10px] px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

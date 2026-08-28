"use client";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useReducedMotion } from "motion/react";
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

  // 3D Tilt Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  // Rotate map (-0.5 to 0.5 relative mouse coords to -12 to 12 degrees rotation)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 25 });
  
  // Dynamic scale spring
  const scale = useSpring(1, { stiffness: 200, damping: 25 });

  // Foreground image translation
  const imgX = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 25 });
  const imgY = useSpring(useTransform(y, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 25 });

  // Shadow/background translation (moves in opposite direction)
  const shadowX = useSpring(useTransform(x, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 25 });
  const shadowY = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 25 });

  const cardAnimation = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3 } as any
      }
    : {
        initial: { opacity: 0, y: 40, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
        transition: { delay: index * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any
      };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - rect.width / 2;
    const mouseY = event.clientY - rect.top - rect.height / 2;
    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  };

  const handleMouseEnter = () => {
    if (!shouldReduceMotion) {
      scale.set(1.04);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  if (dismissed) return null;

  return (
    <motion.div
      {...cardAnimation}
      className="relative group h-full flex flex-col perspective-1000"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.98 }}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d",
        }}
        className="glass glass-hover rounded-2xl overflow-hidden glow-card border border-white/10 hover:border-amber-500/30 flex flex-col h-full bg-[#121118]/80 transition-shadow duration-300 hover:shadow-2xl hover:shadow-amber-500/5 select-none cursor-pointer"
      >
        
        {/* Main card header */}
        <div className="p-4 flex gap-3.5 items-start" style={{ transform: "translateZ(30px)" }}>
          {/* Album sleeve with vinyl disc background effect */}
          <div className="relative flex-shrink-0 w-20 h-20 perspective-500">
            {/* Background blur shadow */}
            {rec.imageUrl && !imgError && !shouldReduceMotion && (
              <motion.div
                style={{
                  x: shadowX,
                  y: shadowY,
                  scale: 1.1,
                }}
                className="absolute inset-0 rounded-xl overflow-hidden blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none -z-10"
              >
                <img
                  src={rec.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* The main artwork wrap */}
            <motion.div
              style={{
                x: shouldReduceMotion ? 0 : imgX,
                y: shouldReduceMotion ? 0 : imgY,
              }}
              className="w-full h-full rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-amber-500/40 transition-colors relative"
            >
              {rec.imageUrl && !imgError ? (
                <>
                  <Image
                    src={rec.imageUrl}
                    alt={`Cover artwork for ${rec.title} by ${rec.artist}`}
                    fill
                    loading={index < 4 ? "eager" : "lazy"}
                    sizes="(max-width: 80px) 100vw, 80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => setImgError(true)}
                  />
                  {/* Vignette Overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)] pointer-events-none z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 p-2 text-center" aria-label={`Cover sleeve for ${rec.title} by ${rec.artist}`}>
                  <Disc size={28} className="text-amber-400/80 group-hover:animate-vinyl" aria-hidden="true" />
                  <span className="text-[9px] text-zinc-400 font-medium truncate max-w-full mt-1">
                    {rec.artist}
                  </span>
                </div>
              )}
              
              {/* Format pill */}
              <span className="absolute bottom-1 right-1 text-[9px] font-semibold uppercase bg-black/80 text-amber-300 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10 z-20">
                {rec.type}
              </span>
            </motion.div>
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
              onClick={(e) => { e.stopPropagation(); setLiked(!liked); onFeedback?.("like"); }}
              className={`p-1.5 rounded-lg transition-all ${liked ? "bg-emerald-500/30 text-emerald-400" : "hover:bg-white/10 text-zinc-400 hover:text-emerald-400"}`}
              title="Love this"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDismiss(!showDismiss); }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-rose-400 transition-all"
              title="Not for me"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        </div>

        {/* Curator Note / Why this matches */}
        {rec.whyThisMatches && (
          <div 
            className="px-4 py-2.5 mx-3 mb-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-2 group-hover:bg-amber-500/[0.04] group-hover:border-amber-500/10 transition-all duration-300"
            style={{ transform: "translateZ(15px)" }}
          >
            <Sparkles size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300 leading-relaxed font-normal group-hover:text-white transition-colors">
              {rec.whyThisMatches}
            </p>
          </div>
        )}

        {/* Listen links footer */}
        <div className="mt-auto px-4 pb-4 pt-1 border-t border-white/5 flex items-center justify-between" style={{ transform: "translateZ(10px)" }}>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
            Listen on
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <ListenLinks artist={rec.artist} track={rec.type === "song" ? rec.title : undefined} size="sm" />
          </div>
        </div>

        {/* Dismiss picker */}
        <AnimatePresence>
          {showDismiss && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-3 border-t border-white/10 pt-2 overflow-hidden bg-rose-500/5"
              style={{ transform: "translateZ(5px)" }}
              onClick={(e) => e.stopPropagation()}
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

      </motion.div>
    </motion.div>
  );
}

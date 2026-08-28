"use client";
import { motion } from "motion/react";
import { useSceneStore } from "@/store";

const MOODS = [
  { label: "Happy", emoji: "😊", color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-400/50", glow: "hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]" },
  { label: "Melancholic", emoji: "🌧️", color: "from-blue-500/20 to-slate-500/20 border-blue-500/30 hover:border-blue-400/50", glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]" },
  { label: "Energetic", emoji: "⚡", color: "from-red-500/20 to-orange-500/20 border-red-500/30 hover:border-red-400/50", glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]" },
  { label: "Dreamy", emoji: "✨", color: "from-violet-500/20 to-pink-500/20 border-violet-500/30 hover:border-violet-400/50", glow: "hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]" },
  { label: "Dark", emoji: "🌑", color: "from-slate-700/40 to-gray-800/40 border-slate-600/30 hover:border-slate-500/50", glow: "hover:shadow-[0_0_20px_rgba(30,30,50,0.5)]" },
  { label: "Peaceful", emoji: "🌿", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-400/50", glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]" },
  { label: "Romantic", emoji: "🌹", color: "from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:border-pink-400/50", glow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]" },
  { label: "Focused", emoji: "🎯", color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:border-cyan-400/50", glow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]" },
];

interface MoodSelectorProps {
  onSelect?: (mood: string) => void;
  selected?: string;
}

export default function MoodSelector({ onSelect, selected }: MoodSelectorProps) {
  const { setMood } = useSceneStore();

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
      {MOODS.map((mood, i) => (
        <motion.button
          key={mood.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            onSelect?.(mood.label);
          }}
          onMouseEnter={() => setMood(mood.label)}
          onMouseLeave={() => setMood(selected || "default")}
          className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border bg-gradient-to-br transition-all duration-300 cursor-pointer ${mood.color} ${mood.glow} ${
            selected === mood.label ? "ring-2 ring-white/30 scale-105" : ""
          }`}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs font-medium text-white/80 whitespace-nowrap">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

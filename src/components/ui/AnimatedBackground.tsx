"use client";
import { motion, useReducedMotion } from "motion/react";
import { useSceneStore } from "@/store";

interface MoodConfig {
  orb1: string;
  orb2: string;
  orb3: string;
}

const MOOD_COLORS: Record<string, MoodConfig> = {
  default: {
    orb1: "rgba(245, 158, 11, 0.10)", // amber-500/10
    orb2: "rgba(244, 63, 94, 0.08)",   // rose-500/8
    orb3: "rgba(99, 102, 241, 0.08)",  // indigo-500/8
  },
  Happy: {
    orb1: "rgba(245, 158, 11, 0.15)", // amber-500/15
    orb2: "rgba(249, 115, 22, 0.10)",  // orange-500/10
    orb3: "rgba(234, 179, 8, 0.10)",   // yellow-500/10
  },
  Melancholic: {
    orb1: "rgba(100, 116, 139, 0.10)", // slate-500/10
    orb2: "rgba(113, 113, 122, 0.08)", // zinc-500/8
    orb3: "rgba(37, 99, 235, 0.08)",   // blue-600/8
  },
  Energetic: {
    orb1: "rgba(239, 68, 68, 0.15)",   // red-500/15
    orb2: "rgba(234, 88, 12, 0.10)",   // orange-600/10
    orb3: "rgba(244, 63, 94, 0.10)",   // rose-500/10
  },
  Dreamy: {
    orb1: "rgba(124, 58, 237, 0.15)",  // violet-500/15
    orb2: "rgba(236, 72, 153, 0.10)",  // pink-500/10
    orb3: "rgba(168, 85, 247, 0.10)",  // purple-500/10
  },
  Dark: {
    orb1: "rgba(79, 70, 229, 0.15)",   // indigo-600/15
    orb2: "rgba(124, 58, 237, 0.12)",  // violet-600/12
    orb3: "rgba(192, 38, 211, 0.08)",  // fuchsia-600/8
  },
  Peaceful: {
    orb1: "rgba(16, 185, 129, 0.12)",  // emerald-500/12
    orb2: "rgba(20, 184, 166, 0.10)",  // teal-500/10
    orb3: "rgba(132, 204, 22, 0.06)",  // lime-500/6
  },
  Romantic: {
    orb1: "rgba(236, 72, 153, 0.15)",  // pink-500/15
    orb2: "rgba(244, 63, 94, 0.15)",   // rose-500/15
    orb3: "rgba(239, 68, 68, 0.08)",   // red-500/8
  },
  Focused: {
    orb1: "rgba(6, 182, 212, 0.15)",   // cyan-500/15
    orb2: "rgba(59, 130, 246, 0.10)",  // blue-500/10
    orb3: "rgba(20, 184, 166, 0.08)",  // teal-500/8
  },
};

const getMoodConfig = (mood: string): MoodConfig => {
  const normalized = mood.toLowerCase();
  if (normalized.includes("happy") || normalized.includes("cozy") || normalized.includes("amber") || normalized.includes("vibrant")) {
    return MOOD_COLORS.Happy;
  }
  if (normalized.includes("melancholic") || normalized.includes("sad") || normalized.includes("grey-blue") || normalized.includes("rainy") || normalized.includes("foggy") || normalized.includes("cloudy")) {
    return MOOD_COLORS.Melancholic;
  }
  if (normalized.includes("energetic") || normalized.includes("stormy") || normalized.includes("gym") || normalized.includes("party") || normalized.includes("vibe")) {
    return MOOD_COLORS.Energetic;
  }
  if (normalized.includes("dreamy") || normalized.includes("cosmic") || normalized.includes("interstellar")) {
    return MOOD_COLORS.Dreamy;
  }
  if (normalized.includes("dark") || normalized.includes("night") || normalized.includes("violet") || normalized.includes("cyberpunk") || normalized.includes("retro")) {
    return MOOD_COLORS.Dark;
  }
  if (normalized.includes("peaceful") || normalized.includes("calm") || normalized.includes("relax") || normalized.includes("nature") || normalized.includes("meditating")) {
    return MOOD_COLORS.Peaceful;
  }
  if (normalized.includes("romantic") || normalized.includes("love") || normalized.includes("rose") || normalized.includes("soulful")) {
    return MOOD_COLORS.Romantic;
  }
  if (normalized.includes("focused") || normalized.includes("coding") || normalized.includes("studying") || normalized.includes("work")) {
    return MOOD_COLORS.Focused;
  }
  
  // Direct matches
  const keys = Object.keys(MOOD_COLORS);
  const found = keys.find(k => k.toLowerCase() === normalized);
  if (found) {
    return MOOD_COLORS[found];
  }
  
  return MOOD_COLORS.default;
};

export default function AnimatedBackground() {
  const { currentMood } = useSceneStore();
  const shouldReduceMotion = useReducedMotion();
  const colors = getMoodConfig(currentMood);

  const orb1Animation = shouldReduceMotion
    ? {}
    : {
        x: [0, 40, -20, 0],
        y: [0, -30, 20, 0],
        scale: [1, 1.15, 0.95, 1],
      };

  const orb2Animation = shouldReduceMotion
    ? {}
    : {
        x: [0, -50, 30, 0],
        y: [0, 40, -30, 0],
        scale: [1, 1.1, 0.9, 1],
      };

  const orb3Animation = shouldReduceMotion
    ? {}
    : {
        x: [0, 30, -30, 0],
        y: [0, 50, -20, 0],
      };

  const orb1Transition = shouldReduceMotion
    ? {}
    : { duration: 18, repeat: Infinity, ease: "easeInOut" };

  const orb2Transition = shouldReduceMotion
    ? {}
    : { duration: 22, repeat: Infinity, ease: "easeInOut" };

  const orb3Transition = shouldReduceMotion
    ? {}
    : { duration: 25, repeat: Infinity, ease: "easeInOut" };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Ambient gradient orbs */}
      <motion.div
        animate={{
          ...orb1Animation,
          backgroundColor: colors.orb1,
        }}
        transition={{
          ...orb1Transition,
          backgroundColor: { duration: 2.0, ease: "easeInOut" },
        } as any}
        className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[130px]"
      />
      <motion.div
        animate={{
          ...orb2Animation,
          backgroundColor: colors.orb2,
        }}
        transition={{
          ...orb2Transition,
          backgroundColor: { duration: 2.0, ease: "easeInOut" },
        } as any}
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[140px]"
      />
      <motion.div
        animate={{
          ...orb3Animation,
          backgroundColor: colors.orb3,
        }}
        transition={{
          ...orb3Transition,
          backgroundColor: { duration: 2.0, ease: "easeInOut" },
        } as any}
        className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full blur-[150px]"
      />

      {/* Subtle subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
    </div>
  );
}

"use client";

import { useMotionValue, useSpring, useTransform, motion } from "motion/react";
import { useRef } from "react";
import { useRouter } from "next/navigation";

export interface GenreItem {
  name: string;
  emoji: string;
  color: string;
  border: string;
  slug: string;
}

const GENRES: GenreItem[] = [
  { name: "Indie Rock", emoji: "🎸", color: "from-orange-500/20 to-red-500/20", border: "border-orange-500/20 hover:border-orange-400/40", slug: "indie rock" },
  { name: "Jazz", emoji: "🎷", color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/20 hover:border-amber-400/40", slug: "jazz" },
  { name: "Lo-fi", emoji: "🌙", color: "from-indigo-500/20 to-violet-500/20", border: "border-indigo-500/20 hover:border-indigo-400/40", slug: "lo-fi" },
  { name: "City Pop", emoji: "🌆", color: "from-pink-500/20 to-orange-500/20", border: "border-pink-500/20 hover:border-pink-400/40", slug: "city pop" },
  { name: "Afrobeats", emoji: "🥁", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/20 hover:border-green-400/40", slug: "afrobeats" },
  { name: "Electronic", emoji: "🎛️", color: "from-cyan-500/20 to-blue-500/20", border: "border-cyan-500/20 hover:border-cyan-400/40", slug: "electronic" },
  { name: "Classical", emoji: "🎻", color: "from-rose-500/20 to-pink-500/20", border: "border-rose-500/20 hover:border-rose-400/40", slug: "classical" },
  { name: "Hip-Hop", emoji: "🎤", color: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/20 hover:border-yellow-400/40", slug: "hip-hop" },
  { name: "R&B / Soul", emoji: "💜", color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/20 hover:border-violet-400/40", slug: "r&b" },
  { name: "Metal", emoji: "🤘", color: "from-slate-500/20 to-gray-500/20", border: "border-slate-500/20 hover:border-slate-400/40", slug: "metal" },
  { name: "Folk", emoji: "🪕", color: "from-lime-500/20 to-green-500/20", border: "border-lime-500/20 hover:border-lime-400/40", slug: "folk" },
  { name: "K-Pop", emoji: "🌸", color: "from-fuchsia-500/20 to-pink-500/20", border: "border-fuchsia-500/20 hover:border-fuchsia-400/40", slug: "k-pop" },
];

export default function GenreDock() {
  const router = useRouter();
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="text-center mb-2">
        <h3 className="font-outfit text-sm font-semibold uppercase tracking-wider text-zinc-400">
          🎵 Quick-Select Genre Dock
        </h3>
        <p className="text-xs text-zinc-500 mt-1">Hover to magnify, click to explore deep dives</p>
      </div>

      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="mx-auto flex h-24 items-end gap-3 rounded-3xl border border-white/10 bg-zinc-950/40 px-6 pb-4 shadow-2xl backdrop-blur-md w-fit max-w-full overflow-x-auto hide-scrollbar"
      >
        {GENRES.map((genre) => (
          <DockIcon
            key={genre.name}
            mouseX={mouseX}
            genre={genre}
            onClick={() => router.push(`/genre/${encodeURIComponent(genre.slug)}`)}
          />
        ))}
      </motion.div>
    </div>
  );
}

interface DockIconProps {
  mouseX: any;
  genre: GenreItem;
  onClick: () => void;
}

function DockIcon({ mouseX, genre, onClick }: DockIconProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [56, 92, 56]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [56, 92, 56]);

  const widthSpring = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightSpring = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.button
      ref={ref}
      style={{ width: widthSpring, height: heightSpring }}
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br ${genre.color} border ${genre.border} shadow-lg cursor-pointer transition-colors duration-300 shrink-0`}
    >
      <span className="text-3xl select-none group-hover:scale-110 transition-transform duration-200">
        {genre.emoji}
      </span>
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 rounded-lg bg-zinc-900 border border-white/10 px-2.5 py-1 text-xs font-semibold text-white transition-all group-hover:scale-100 whitespace-nowrap shadow-xl z-50">
        {genre.name}
      </span>
    </motion.button>
  );
}

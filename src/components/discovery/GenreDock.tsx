"use client";
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

  return (
    <div className="w-full py-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
        {GENRES.map((genre) => (
          <button
            key={genre.name}
            onClick={() => router.push(`/genre/${encodeURIComponent(genre.slug)}`)}
            className="flex flex-col items-center justify-center p-5 border border-zinc-800 bg-[#111014]/30 hover:bg-[#f4f3f6] hover:text-[#0b0a0d] hover:border-[#f4f3f6] transition-all duration-200 cursor-pointer group rounded-none"
          >
            <span className="text-3xl mb-2 select-none group-hover:scale-105 transition-transform duration-200">
              {genre.emoji}
            </span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-center block">
              {genre.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

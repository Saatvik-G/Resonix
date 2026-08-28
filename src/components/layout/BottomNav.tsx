"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, Search, Compass, ListMusic, MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/playlist", label: "Playlists", icon: ListMusic },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t-2 border-[#f4f3f6] bg-[#0b0a0d] pb-safe">
      <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 group py-1 px-2 rounded-none">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`p-1.5 rounded-none transition-all duration-200 ${
                  active ? "text-[#fbbf24] border border-[#fbbf24]/50 bg-zinc-900" : "text-zinc-500 group-hover:text-[#f4f3f6]"
                }`}
              >
                <Icon size={16} />
              </motion.div>
              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${active ? "text-[#fbbf24]" : "text-zinc-550"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

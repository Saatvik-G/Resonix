"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Home, Search, Compass, ListMusic, MessageCircle, User, Disc } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/playlist", label: "Playlists", icon: ListMusic },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#f4f3f6] bg-[#0b0a0d] py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-none border border-[#f4f3f6] bg-zinc-900 flex items-center justify-center group-hover:bg-[#fbbf24] transition-colors duration-250">
            <Disc size={16} className="text-[#f4f3f6] group-hover:text-[#0b0a0d] animate-vinyl" />
          </div>
          <div className="flex flex-col">
            <span className="font-playfair font-black text-xl tracking-tight text-[#f4f3f6] transition-colors">
              RESONIX
            </span>
            <span className="text-[8px] font-mono text-[#fbbf24] uppercase font-bold tracking-widest -mt-1.5 hidden sm:block">
              // MUSIC ARCHIVE
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                  active ? "text-[#fbbf24]" : "text-zinc-400 hover:text-[#f4f3f6] hover:bg-zinc-900"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-none border border-[#fbbf24]/50 bg-zinc-950/40"
                  />
                )}
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-zinc-800 hover:border-[#fbbf24] rounded-none px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-all bg-zinc-950"
          >
            <User size={13} className="text-[#fbbf24]" />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

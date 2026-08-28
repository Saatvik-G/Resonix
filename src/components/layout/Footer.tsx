import Link from "next/link";
import { ExternalLink, Mail, Music2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#f4f3f6] bg-[#0b0a0d] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-none border border-[#f4f3f6] bg-zinc-900 flex items-center justify-center">
                <span className="text-[#fbbf24] text-sm font-mono font-bold">RX</span>
              </div>
              <span className="font-playfair font-black text-xl text-[#f4f3f6] tracking-tight">RESONIX</span>
            </div>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 max-w-xs leading-relaxed">
              // AUDITED SOUND ARCHIVE // HYBRID CURATION MODE // ZERO LIMITS
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://github.com/Saatvik-G/Resonix.git" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-none border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#fbbf24] bg-zinc-950 transition-all">
                <ExternalLink size={14} />
              </a>
              <a href="mailto:contact@resonix.app"
                className="p-2 rounded-none border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#fbbf24] bg-zinc-950 transition-all">
                <Mail size={14} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">// DISCOVER</h4>
            <ul className="space-y-2 font-mono text-xs">
              {[
                { label: "SEARCH INDEX", href: "/search" },
                { label: "MOOD MATRIX", href: "/discover" },
                { label: "GENRE GRID", href: "/genre/indie rock" },
                { label: "AI SPOTLIGHTS", href: "/playlist" },
                { label: "CURATOR CHAT", href: "/chat" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-zinc-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">// METADATA</h4>
            <ul className="space-y-2 font-mono text-xs">
              {[
                { label: "ABOUT RESONIX", href: "#" },
                { label: "PRIVACY PROTOCOL", href: "#" },
                { label: "API INDEX", href: "#" },
                { label: "SOURCE CODE", href: "https://github.com/Saatvik-G/Resonix.git" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-zinc-400 hover:text-white transition-colors" target={l.href.startsWith("http") ? "_blank" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[10px] text-zinc-500">
          <p>© 2026 Resonix. Built with code & curation.</p>
          <p>Powered by Gemini AI · Last.fm · MusicBrainz Archive</p>
        </div>
      </div>
    </footer>
  );
}

"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, ArrowLeft, Plus, Search, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { earnXP } from "@/lib/gamificationClient";

interface ArtistTaste {
  name: string;
  country: string; // ISO Code
  area: string;    // Display area name
  coords: { x: number; y: number };
}

// Map of common country codes to map layout percentages (approximate x,y on a 800x400 map)
const COUNTRY_COORDS: Record<string, { x: number; y: number }> = {
  "US": { x: 140, y: 130 },
  "CA": { x: 130, y: 80 },
  "GB": { x: 380, y: 100 },
  "FR": { x: 395, y: 120 },
  "DE": { x: 415, y: 110 },
  "SE": { x: 425, y: 75 },
  "IN": { x: 570, y: 200 },
  "JP": { x: 690, y: 155 },
  "KR": { x: 670, y: 155 },
  "NG": { x: 410, y: 245 },
  "ZA": { x: 440, y: 310 },
  "AU": { x: 690, y: 310 },
  "BR": { x: 260, y: 260 },
  "MX": { x: 140, y: 185 },
  "CO": { x: 200, y: 230 },
  "JM": { x: 180, y: 195 },
  "IE": { x: 360, y: 100 },
  "IT": { x: 415, y: 135 },
  "ES": { x: 380, y: 140 },
  "NZ": { x: 740, y: 340 },
};

const DEFAULT_ARTISTS: ArtistTaste[] = [
  { name: "Sidhu Moose Wala", country: "IN", area: "India", coords: COUNTRY_COORDS["IN"] },
  { name: "Coldplay", country: "GB", area: "United Kingdom", coords: COUNTRY_COORDS["GB"] },
  { name: "Billie Eilish", country: "US", area: "United States", coords: COUNTRY_COORDS["US"] },
  { name: "Daft Punk", country: "FR", area: "France", coords: COUNTRY_COORDS["FR"] },
  { name: "BTS", country: "KR", area: "South Korea", coords: COUNTRY_COORDS["KR"] },
  { name: "Tems", country: "NG", area: "Nigeria", coords: COUNTRY_COORDS["NG"] }
];

export default function TasteMapPage() {
  const [artists, setArtists] = useState<ArtistTaste[]>(DEFAULT_ARTISTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/artist/country?name=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (!data || !data.country) {
        setError(`Could not find origin country for "${searchQuery}".`);
        setIsLoading(false);
        return;
      }

      // Check if already in list
      const exists = artists.some(a => a.name.toLowerCase() === data.name.toLowerCase());
      if (exists) {
        setError(`"${data.name}" is already mapped.`);
        setIsLoading(false);
        return;
      }

      // Find coords, or fallback to general area coords
      const countryCode = data.country;
      let coords = COUNTRY_COORDS[countryCode];
      
      if (!coords) {
        // Fallback random coords inside region if country is new
        coords = { 
          x: Math.floor(Math.random() * 500) + 150, 
          y: Math.floor(Math.random() * 200) + 80 
        };
      }

      const newArtist: ArtistTaste = {
        name: data.name,
        country: countryCode,
        area: data.area || "Global",
        coords
      };

      setArtists(prev => [...prev, newArtist]);
      setSuccess(`Mapped ${data.name} to ${data.area || countryCode}!`);
      setSearchQuery("");

      // Award XP
      await earnXP(20, "World Traveler");
    } catch (err) {
      console.error(err);
      setError("Failed to query artist origin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Group artists by country
  const countryGroups = artists.reduce<Record<string, { area: string; coords: { x: number; y: number }; artists: string[] }>>((acc, artist) => {
    if (!acc[artist.country]) {
      acc[artist.country] = {
        area: artist.area,
        coords: artist.coords,
        artists: []
      };
    }
    acc[artist.country].artists.push(artist.name);
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-outfit text-2xl font-bold text-white flex items-center gap-2">
              <Globe className="text-violet-400" size={22} /> Music Taste Map
            </h1>
            <p className="text-xs text-white/40">Visualize where your favorite artists originate from using MusicBrainz metadata</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Mapping Controls */}
          <div className="glass border border-white/8 rounded-2xl p-6 lg:col-span-1 space-y-6 h-fit bg-[#121118]/40">
            <div>
              <h3 className="font-outfit font-bold text-white text-base mb-2">Map an Artist</h3>
              <p className="text-xs text-white/40">Search any artist below to automatically query MusicBrainz and pin them on your world map.</p>
            </div>

            <form onSubmit={handleAddArtist} className="relative">
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Daft Punk, Diljit Dosanjh..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/25 outline-none focus:border-violet-500/50"
              />
              <Search className="absolute left-3.5 top-3 text-white/20" size={13} />
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="absolute right-2 top-1.5 w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white disabled:opacity-40"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              </button>
            </form>

            {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>}
            {success && <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-1"><Sparkles size={11} /> {success}</p>}

            {/* List of mapped artists */}
            <div className="border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Mapped Artists ({artists.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {artists.map((artist, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center glass border border-white/5 rounded-xl px-3 py-2 bg-white/[0.01]"
                    onMouseEnter={() => setHoveredCountry(artist.country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  >
                    <span className="text-xs font-semibold text-white">{artist.name}</span>
                    <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                      {artist.area}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive World Map */}
          <div className="glass border border-white/8 rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between min-h-[400px] relative overflow-hidden bg-black/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-outfit font-bold text-white text-base">Sonic Origin Map</h3>
              <span className="text-[10px] text-white/30 font-mono">Resonix SVG Map Engine v2.0</span>
            </div>

            {/* SVG Interactive Map Overlay */}
            <div className="relative w-full aspect-[2/1] bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-2">
              
              {/* Fake grid texture for sci-fi look */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px]" />

              <svg 
                viewBox="0 0 800 400" 
                className="w-full h-full text-white/10 select-none pointer-events-auto"
              >
                {/* Simplified Continents outlines */}
                {/* North America */}
                <path d="M 60,70 L 160,50 L 220,110 L 190,170 L 130,200 L 90,170 L 60,110 Z" fill="currentColor" className="hover:text-white/15 transition-colors duration-300" />
                {/* South America */}
                <path d="M 180,210 L 220,230 L 260,280 L 250,350 L 210,380 L 180,310 Z" fill="currentColor" className="hover:text-white/15 transition-colors duration-300" />
                {/* Europe */}
                <path d="M 350,70 L 460,60 L 450,140 L 380,160 Z" fill="currentColor" className="hover:text-white/15 transition-colors duration-300" />
                {/* Africa */}
                <path d="M 370,180 L 450,180 L 490,240 L 460,330 L 400,280 Z" fill="currentColor" className="hover:text-white/15 transition-colors duration-300" />
                {/* Asia */}
                <path d="M 470,50 L 710,50 L 730,190 L 600,240 L 510,180 Z" fill="currentColor" className="hover:text-white/15 transition-colors duration-300" />
                {/* Oceania */}
                <path d="M 660,280 L 740,290 L 760,350 L 690,360 Z" fill="currentColor" className="hover:text-white/15 transition-colors duration-300" />

                {/* Draw Glowing Pins for Mapped Countries */}
                {Object.entries(countryGroups).map(([code, group]) => {
                  const isHovered = hoveredCountry === code;
                  return (
                    <g 
                      key={code} 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCountry(code)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    >
                      {/* Pulse Circle */}
                      <circle 
                        cx={group.coords.x} 
                        cy={group.coords.y} 
                        r={isHovered ? 16 : 8} 
                        className={`fill-violet-500/20 transition-all duration-300 ${isHovered ? "animate-pulse" : ""}`} 
                      />
                      {/* Pin Center */}
                      <circle 
                        cx={group.coords.x} 
                        cy={group.coords.y} 
                        r={isHovered ? 6 : 4} 
                        className="fill-amber-400 stroke-black stroke-2" 
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic Popup Tooltip */}
              <AnimatePresence>
                {hoveredCountry && countryGroups[hoveredCountry] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-4 left-4 right-4 glass border border-amber-500/20 rounded-xl p-3 bg-black/90 pointer-events-none"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-amber-400">{countryGroups[hoveredCountry].area} ({hoveredCountry})</span>
                      <span className="text-[10px] text-white/40">{countryGroups[hoveredCountry].artists.length} Artist(s)</span>
                    </div>
                    <p className="text-[11px] text-white/80 font-medium leading-relaxed truncate">
                      {countryGroups[hoveredCountry].artists.join(", ")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Hover help instruction */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-white/30 italic">Hover over map markers to inspect the artists and their native regions.</p>
            </div>

          </div>

        </div>

      </div>
      <BottomNav />
    </div>
  );
}

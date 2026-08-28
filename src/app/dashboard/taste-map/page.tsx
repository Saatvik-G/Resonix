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
          <Link href="/dashboard" className="w-8 h-8 rounded-none border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={14} />
          </Link>
          <div>
            <h1 className="font-playfair text-2xl font-black uppercase text-white flex items-center gap-2">
              <Globe className="text-[#fbbf24]" size={20} /> Music Taste Map
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-550 mt-1">// VISUALIZE REGIONAL ORIGINS VIA MUSICBRAINZ INDEX</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Mapping Controls */}
          <div className="border border-zinc-800 rounded-none p-6 lg:col-span-1 space-y-6 h-fit bg-[#111014]/25">
            <div>
              <h3 className="font-playfair text-base font-black uppercase text-white">// MAP AN ARTIST</h3>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wide mt-1">Search any artist below to automatically query MusicBrainz and pin them on your world map.</p>
            </div>

            <form onSubmit={handleAddArtist} className="relative">
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Daft Punk, Diljit Dosanjh..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-none pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-zinc-700 outline-none focus:border-zinc-500"
              />
              <Search className="absolute left-3.5 top-3.5 text-zinc-600" size={13} />
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="absolute right-2 top-1.5 w-7 h-7 rounded-none bg-[#f4f3f6] text-[#0b0a0d] flex items-center justify-center disabled:opacity-40 cursor-pointer"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin text-[#0b0a0d]" /> : <Plus size={12} />}
              </button>
            </form>

            {error && <p className="text-xs font-mono uppercase text-rose-400 bg-rose-950/20 border border-rose-900 rounded-none px-3 py-2">{error}</p>}
            {success && <p className="text-xs font-mono uppercase text-emerald-400 bg-emerald-950/20 border border-emerald-900 rounded-none px-3 py-2 flex items-center gap-1"><Sparkles size={11} /> {success}</p>}

            {/* List of mapped artists */}
            <div className="border-t border-zinc-850 pt-4">
              <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3">Mapped Artists ({artists.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {artists.map((artist, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center border border-zinc-850 rounded-none px-3 py-2 bg-zinc-900/10"
                    onMouseEnter={() => setHoveredCountry(artist.country)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  >
                    <span className="text-xs font-mono font-bold text-white">{artist.name}</span>
                    <span className="text-[9px] font-mono font-bold text-[#fbbf24] bg-zinc-950 px-2 py-0.5 border border-zinc-800 uppercase">
                      {artist.area}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive World Map */}
          <div className="border border-zinc-800 rounded-none p-6 lg:col-span-2 flex flex-col justify-between min-h-[400px] relative overflow-hidden bg-[#111014]/10">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-playfair text-base font-black uppercase text-white">// SONIC ORIGIN MAP</h3>
              <span className="text-[9px] text-zinc-650 font-mono uppercase tracking-widest">Resonix SVG Map Engine v2.0</span>
            </div>

            {/* SVG Interactive Map Overlay */}
            <div className="relative w-full aspect-[2/1] bg-zinc-950 border border-zinc-850 rounded-none overflow-hidden flex items-center justify-center p-2">
              
              {/* Fake grid texture for sci-fi look */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:20px_20px]" />

              <svg 
                viewBox="0 0 800 400" 
                className="w-full h-full text-zinc-900 select-none pointer-events-auto"
              >
                {/* Simplified Continents outlines */}
                {/* North America */}
                <path d="M 60,70 L 160,50 L 220,110 L 190,170 L 130,200 L 90,170 L 60,110 Z" fill="currentColor" className="hover:text-zinc-800 transition-colors duration-300" />
                {/* South America */}
                <path d="M 180,210 L 220,230 L 260,280 L 250,350 L 210,380 L 180,310 Z" fill="currentColor" className="hover:text-zinc-800 transition-colors duration-300" />
                {/* Europe */}
                <path d="M 350,70 L 460,60 L 450,140 L 380,160 Z" fill="currentColor" className="hover:text-zinc-800 transition-colors duration-300" />
                {/* Africa */}
                <path d="M 370,180 L 450,180 L 490,240 L 460,330 L 400,280 Z" fill="currentColor" className="hover:text-zinc-800 transition-colors duration-300" />
                {/* Asia */}
                <path d="M 470,50 L 710,50 L 730,190 L 600,240 L 510,180 Z" fill="currentColor" className="hover:text-zinc-800 transition-colors duration-300" />
                {/* Oceania */}
                <path d="M 660,280 L 740,290 L 760,350 L 690,360 Z" fill="currentColor" className="hover:text-zinc-800 transition-colors duration-300" />

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
                        className={`fill-[#fbbf24]/10 transition-all duration-300 ${isHovered ? "animate-pulse" : ""}`} 
                      />
                      {/* Pin Center */}
                      <circle 
                        cx={group.coords.x} 
                        cy={group.coords.y} 
                        r={isHovered ? 6 : 4} 
                        className="fill-[#fbbf24] stroke-black stroke-2" 
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
                    className="absolute bottom-4 left-4 right-4 border border-zinc-800 rounded-none p-3 bg-zinc-950 pointer-events-none font-mono uppercase"
                  >
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className="font-bold text-[#fbbf24]">{countryGroups[hoveredCountry].area} ({hoveredCountry})</span>
                      <span className="text-zinc-500">{countryGroups[hoveredCountry].artists.length} Artist(s)</span>
                    </div>
                    <p className="text-[11px] text-white font-bold truncate">
                      {countryGroups[hoveredCountry].artists.join(", ")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Hover help instruction */}
            <div className="mt-4 text-center">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-550">// HOVER OVER MARKERS TO INSPECT NATIVE REGIONS //</p>
            </div>

          </div>

        </div>

      </div>
      <BottomNav />
    </div>
  );
}

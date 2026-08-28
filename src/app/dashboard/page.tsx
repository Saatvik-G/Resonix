"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Music2, ListMusic, Clock, LogOut, User, 
  Trophy, Users, MessageSquare, Send, Share2, Shield, 
  Globe, Heart, Calendar, Plus, Trash2, Loader2
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { usePlaylistStore } from "@/store";
import { earnXP } from "@/lib/gamificationClient";

const QUICK_ACTIONS = [
  { label: "Discover Music", icon: Sparkles, href: "/discover", border: "border-zinc-800" },
  { label: "AI Playlists", icon: ListMusic, href: "/playlist", border: "border-zinc-800" },
  { label: "Music Chat", icon: Music2, href: "/chat", border: "border-zinc-800" },
];

const BADGE_INFO = [
  { id: "Explorer", name: "Explorer", desc: "Try any recommendation mode", emoji: "🧭" },
  { id: "Genre Master", name: "Genre Master", desc: "Discover 3+ distinct genres", emoji: "🎸" },
  { id: "Night Owl", name: "Night Owl", desc: "Discover music in late night hours", emoji: "🦉" },
  { id: "Collector", name: "Collector", desc: "Like recommendations or save songs", emoji: "💎" },
  { id: "Indie Hunter", name: "Indie Hunter", desc: "Discover low popularity indie acts", emoji: "🏹" },
  { id: "Jazz Lover", name: "Jazz Lover", desc: "Appreciate acoustic & jazz cuts", emoji: "🎷" },
  { id: "World Traveler", name: "World Traveler", desc: "Explore global music taste maps", emoji: "🌍" },
  { id: "Hidden Gem Finder", name: "Hidden Gem Finder", desc: "Uncover a rare hidden gem", emoji: "🕵️" },
];

// Mock community public profiles
const INITIAL_PROFILES = [
  { id: "user-dj-vinyl", display_name: "DJ Vinyl Selector", bio: "Spinning deep cuts and dusty grooves. Obsessed with 70s analog synths.", genres: ["Jazz", "Funk", "Soul"] },
  { id: "user-lofi-chill", display_name: "LoFi Chill Beats", bio: "Late night study sessions and rain outside. 24/7 coding soundtracks.", genres: ["Lofi Hip Hop", "Ambient"] },
  { id: "user-indie-explorer", display_name: "Indie Explorer", bio: "Searching for the next great underground band. No mainstream.", genres: ["Indie Rock", "Dream Pop"] }
];

// Prepopulated shared playlists
const MOCK_COMMUNITY_PLAYLISTS = [
  {
    id: "featured-1",
    user_id: "user-dj-vinyl",
    author_name: "DJ Vinyl Selector",
    name: "Acoustic Gold & Analog Vibe",
    concept_blurb: "Warm brass and tape saturation. A collection of timeless grooves for late evenings.",
    tracks: [
      { title: "Come Fly With Me", artist: "Frank Sinatra", type: "song", whyThisMatches: "Classic swing with warm analog details." },
      { title: "My Favorite Things", artist: "John Coltrane", type: "song", whyThisMatches: "Improvisational jazz masterpiece." },
      { title: "What a Wonderful World", artist: "Louis Armstrong", type: "song", whyThisMatches: "Heartfelt brass and soul-stirring tone." }
    ]
  },
  {
    id: "featured-2",
    user_id: "user-lofi-chill",
    author_name: "LoFi Chill Beats",
    name: "Rainy Coding Sessions",
    concept_blurb: "Muffled piano chords and soft vinyl crackle to keep you in the zone.",
    tracks: [
      { title: "Snowfall", artist: "Øneheart", type: "song", whyThisMatches: "Ambient gem with dreamy winter soundscape." },
      { title: "Midnight Sun", artist: "Lofi Fruits", type: "song", whyThisMatches: "Relaxed beats for keyboard flow." }
    ]
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dna" | "community">("dna");
  
  // Gamification state
  const [xp, setXp] = useState(150);
  const [badges, setBadges] = useState<string[]>(["Explorer"]);
  
  // Community state
  const [following, setFollowing] = useState<string[]>(["user-dj-vinyl"]);
  const [communityPlaylists, setCommunityPlaylists] = useState(MOCK_COMMUNITY_PLAYLISTS);
  const [selectedPlaylist, setSelectedPlaylist] = useState<typeof MOCK_COMMUNITY_PLAYLISTS[0] | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Playlists from store
  const { playlists, removePlaylist } = usePlaylistStore();
  const [sharedPlaylistsList, setSharedPlaylistsList] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      loadGamification(user.id);
      loadFollowing(user.id);
      setLoading(false);
    });
  }, []);

  const loadGamification = async (uid: string) => {
    try {
      const res = await fetch(`/api/gamification?userId=${uid}`);
      const data = await res.json();
      if (data) {
        if (typeof data.xp === "number") setXp(data.xp);
        if (Array.isArray(data.badges)) setBadges(data.badges);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadFollowing = async (uid: string) => {
    try {
      const res = await fetch(`/api/community/follow?userId=${uid}&type=following`);
      const data = await res.json();
      if (data && Array.isArray(data.following)) {
        setFollowing(data.following.map((f: any) => f.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollowToggle = async (targetId: string) => {
    if (!user) return;
    const isFollowing = following.includes(targetId);
    const action = isFollowing ? "unfollow" : "follow";
    
    // Optimistic update
    if (isFollowing) {
      setFollowing(prev => prev.filter(id => id !== targetId));
    } else {
      setFollowing(prev => [...prev, targetId]);
    }

    try {
      await fetch("/api/community/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followerId: user.id,
          followingId: targetId,
          action
        })
      });
      
      if (action === "follow") {
        const update = await earnXP(15, "World Traveler");
        if (update) {
          setXp(update.xp);
          setBadges(update.badges);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Comments loading & posting
  const openPlaylistDetails = async (playlist: typeof MOCK_COMMUNITY_PLAYLISTS[0]) => {
    setSelectedPlaylist(playlist);
    setComments([]);
    try {
      const res = await fetch(`/api/community/comments?playlistId=${playlist.id}`);
      const data = await res.json();
      if (data && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPlaylist || !user) return;
    
    setIsPostingComment(true);
    const displayName = user.email?.split("@")[0] || "You";
    
    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: selectedPlaylist.id,
          userId: user.id,
          content: newComment.trim(),
          displayName
        })
      });
      const data = await res.json();
      if (data && data.comment) {
        setComments(prev => [...prev, data.comment]);
        setNewComment("");
        
        // Award XP for contributing to community
        const update = await earnXP(10);
        if (update) {
          setXp(update.xp);
          setBadges(update.badges);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/community/comments?commentId=${commentId}&userId=${user.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Share own playlist
  const handleSharePlaylist = async (playlist: any) => {
    if (!user) return;
    if (sharedPlaylistsList.includes(playlist.id)) return;
    
    const newShared = {
      id: playlist.id,
      user_id: user.id,
      author_name: user.email?.split("@")[0] || "You",
      name: playlist.name,
      concept_blurb: playlist.conceptBlurb || "A customized playlist crafted by Resonix AI.",
      tracks: playlist.tracks || []
    };

    setCommunityPlaylists(prev => [newShared, ...prev]);
    setSharedPlaylistsList(prev => [...prev, playlist.id]);

    // Reward XP for sharing playlist
    const update = await earnXP(25, "Collector");
    if (update) {
      setXp(update.xp);
      setBadges(update.badges);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0b0a0d] text-[#f4f3f6]">
        <Loader2 size={24} className="text-[#fbbf24] animate-spin" />
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">// INITIALIZING SECURE VISITOR PORT...</p>
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] || "Music Lover";
  
  // Gamification formulas
  const userLevel = Math.floor(xp / 100) + 1;
  const currentXpInLevel = xp % 100;
  const xpNeededForNextLevel = 100;
  const progressPercent = Math.min((currentXpInLevel / xpNeededForNextLevel) * 100, 100);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        
        {/* Welcome Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-zinc-800 rounded-none p-6 sm:p-8 mb-8 bg-[#111014]/50 relative overflow-hidden"
        >
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none border border-zinc-700 bg-zinc-900 flex items-center justify-center">
                <User size={16} className="text-[#fbbf24]" />
              </div>
              <div>
                <h1 className="font-playfair text-2xl font-black uppercase text-white">Hey, {displayName} 👋</h1>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Taste Map Link */}
              <Link
                href="/dashboard/taste-map"
                className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:border-[#fbbf24] bg-zinc-950 text-[#fbbf24] rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all"
              >
                <Globe size={12} /> Taste Map
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 hover:border-rose-800 bg-zinc-950 text-zinc-400 hover:text-rose-400 transition-all text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
              >
                <LogOut size={11} /> Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={action.href}
                  className="block border border-zinc-800 rounded-none p-5 bg-[#111014]/30 hover:border-[#fbbf24] hover:bg-[#111014]/60 transition-all duration-200"
                >
                  <Icon size={20} className="text-[#fbbf24] mb-3" />
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-white">{action.label}</h3>
                  <p className="text-[10px] font-mono text-zinc-550 mt-1 uppercase tracking-widest">// EXPLORE MODULE →</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Toggle Tabs */}
        <div className="flex border-b border-zinc-800 mb-6">
          <button
            onClick={() => setActiveTab("dna")}
            className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "dna" 
                ? "border-[#fbbf24] text-[#fbbf24]" 
                : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            <Trophy size={13} /> // DNA & GAMIFICATION
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "community" 
                ? "border-[#fbbf24] text-[#fbbf24]" 
                : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            <Users size={13} /> // COMMUNITY PORTAL
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "dna" ? (
            <motion.div
              key="dna"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Gamification summary card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Level / Progress */}
                <div className="border border-zinc-800 rounded-none p-6 bg-zinc-950/20 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                      // CURRENT RANK
                    </span>
                    <h3 className="text-2xl font-playfair font-black text-white uppercase">
                      Level {userLevel}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 mt-2 leading-relaxed">Earn XP by exploring genres, colors, moods & sharing curation lists.</p>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between font-mono text-[9px] text-zinc-400 mb-1.5 uppercase">
                      <span>{currentXpInLevel} / {xpNeededForNextLevel} XP</span>
                      <span>LVL {userLevel + 1}</span>
                    </div>
                    <div className="w-full h-3 bg-zinc-900 border border-zinc-850 rounded-none overflow-hidden">
                      <div 
                        className="h-full bg-[#fbbf24] transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total XP & Achievements */}
                <div className="border border-zinc-800 rounded-none p-6 md:col-span-2 flex flex-col justify-between bg-zinc-950/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                        // TOTAL EXPERIENCE ACCUMULATED
                      </span>
                      <h3 className="text-3xl font-playfair font-black text-[#fbbf24]">{xp} XP</h3>
                    </div>
                    <div className="w-9 h-9 rounded-none border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400">
                      <Trophy size={14} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-zinc-850 pt-4 font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">Badges Unlocked</span>
                      <span className="text-sm font-bold text-white">
                        {badges.length} / {BADGE_INFO.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">Next Reward Milestone</span>
                      <span className="text-[10px] text-[#fbbf24] font-bold block mt-0.5 uppercase">
                        Bronze Vinyl Holder
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Badges Grid */}
              <div>
                <h3 className="font-playfair font-black text-white text-lg uppercase mb-4">// ACOUSTIC BADGES</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {BADGE_INFO.map(badge => {
                    const isUnlocked = badges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={`border rounded-none p-4 text-center flex flex-col items-center justify-between min-h-[140px] transition-all ${
                          isUnlocked 
                            ? "border-zinc-700 bg-zinc-900/40" 
                            : "border-zinc-900 opacity-30 bg-transparent"
                        }`}
                      >
                        <span className="text-2xl mb-1.5 block">{badge.emoji}</span>
                        <h4 className="font-mono font-bold text-xs text-white mb-0.5 truncate max-w-full">
                          {badge.name}
                        </h4>
                        <p className="text-[9px] font-mono text-zinc-550 leading-snug uppercase">
                          {badge.desc}
                        </p>
                        {isUnlocked ? (
                          <span className="text-[8px] font-mono font-bold text-[#fbbf24] uppercase mt-2.5 tracking-wider border border-[#fbbf24]/30 bg-zinc-900 px-2 py-0.5">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase mt-2.5 tracking-wider">
                            LOCKED
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User's Created Playlists and Sharing */}
              <div>
                <h3 className="font-playfair font-black text-white text-lg uppercase mb-3">// MY CURATED SPOTLIGHT LISTS</h3>
                {playlists.length === 0 ? (
                  <div className="border border-zinc-850 rounded-none p-8 text-center bg-[#111014]/20">
                    <ListMusic size={24} className="text-zinc-650 mx-auto mb-3" />
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">// NO SPOTLIGHT PLAYLISTS SAVED YET.</p>
                    <Link
                      href="/playlist"
                      className="inline-flex items-center gap-1.5 mt-4 bg-[#f4f3f6] text-[#0b0a0d] px-4 py-2 rounded-none text-xs font-mono font-bold uppercase tracking-wider hover:bg-zinc-250 transition-all"
                    >
                      <Plus size={12} /> Generate Playlist
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {playlists.map(pl => {
                      const isShared = sharedPlaylistsList.includes(pl.id);
                      return (
                        <div key={pl.id} className="border border-zinc-800 rounded-none p-5 flex flex-col justify-between bg-[#111014]/25">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="font-mono font-bold text-sm text-white truncate flex-1 uppercase tracking-wide">{pl.name}</h4>
                              <button 
                                onClick={() => removePlaylist(pl.id)} 
                                className="text-zinc-600 hover:text-red-400 p-1 rounded-none transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <p className="text-xs font-sans text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                              {pl.conceptBlurb}
                            </p>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {pl.tracks.length} tracks • {new Date(pl.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between">
                            <button
                              onClick={() => handleSharePlaylist(pl)}
                              disabled={isShared}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                isShared 
                                  ? "border border-zinc-800 text-zinc-500 bg-zinc-950" 
                                  : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-white hover:text-white"
                              }`}
                            >
                              <Share2 size={12} />
                              {isShared ? "Shared with Community" : "Share to Community"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </motion.div>
          ) : (
            <motion.div
              key="community"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Community Profiles */}
              <div className="space-y-6 lg:col-span-1">
                <h3 className="font-playfair font-black text-white text-lg uppercase flex items-center gap-1.5">
                  <Users size={16} className="text-zinc-500" /> // CREATORS TO FOLLOW
                </h3>

                <div className="space-y-4">
                  {INITIAL_PROFILES.map(profile => {
                    const isFollowing = following.includes(profile.id);
                    return (
                      <div key={profile.id} className="border border-zinc-800 rounded-none p-4 flex flex-col justify-between bg-[#111014]/25">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <h4 className="font-mono font-bold text-xs uppercase tracking-wide text-white">{profile.display_name}</h4>
                              <span className="text-[9px] font-mono text-[#fbbf24] uppercase font-bold tracking-widest">CURATED INDEX</span>
                            </div>
                            <button
                              onClick={() => handleFollowToggle(profile.id)}
                              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-none transition-all cursor-pointer ${
                                isFollowing 
                                  ? "bg-zinc-900 text-zinc-500 border border-zinc-800 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900" 
                                  : "bg-[#f4f3f6] text-[#0b0a0d]"
                              }`}
                            >
                              {isFollowing ? "Following" : "Follow"}
                            </button>
                          </div>
                          <p className="text-xs font-sans text-zinc-400 leading-relaxed mb-3">
                            {profile.bio}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {profile.genres.map(g => (
                            <span key={g} className="text-[9px] font-mono border border-zinc-850 bg-zinc-950 text-zinc-400 px-1.5 py-0.5 rounded-none">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Columns: Shared Playlists and Comments */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-playfair font-black text-white text-lg uppercase flex items-center gap-1.5">
                  <Share2 size={16} className="text-zinc-500" /> // DISCOVER ARCHIVES
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {communityPlaylists.map(pl => (
                    <div 
                      key={pl.id} 
                      onClick={() => openPlaylistDetails(pl)}
                      className={`border rounded-none p-5 cursor-pointer transition-all bg-[#111014]/25 flex flex-col justify-between ${
                        selectedPlaylist?.id === pl.id ? "border-[#fbbf24] bg-zinc-900/20" : "border-zinc-800 hover:border-zinc-550"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-6 h-6 rounded-none border border-zinc-700 bg-zinc-900 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-400">
                            {pl.author_name[0].toUpperCase()}
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500">by {pl.author_name}</span>
                        </div>
                        <h4 className="font-mono font-bold text-white text-sm uppercase tracking-wide leading-snug mb-1.5">
                          {pl.name}
                        </h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3 font-sans">
                          {pl.concept_blurb}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-850 text-[9px] font-mono text-zinc-550">
                        <span>{pl.tracks.length} tracks</span>
                        <span className="flex items-center gap-1 text-[#fbbf24] font-bold hover:underline">
                          <MessageSquare size={10} /> Comments
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Playlist Tracks & Comments Drawer/Panel */}
                {selectedPlaylist && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-zinc-800 rounded-none p-6 bg-zinc-950"
                  >
                    <div className="flex justify-between items-start gap-4 mb-4 border-b border-zinc-850 pb-4">
                      <div>
                        <h4 className="font-playfair text-lg font-black uppercase text-white">{selectedPlaylist.name}</h4>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mt-1">// CONCEPT: {selectedPlaylist.concept_blurb}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedPlaylist(null)}
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 border border-zinc-800 text-zinc-400 hover:text-white rounded-none transition-colors cursor-pointer bg-zinc-900"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Track List */}
                      <div>
                        <h5 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
                          // TRACK LISTING
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {selectedPlaylist.tracks.map((t, idx) => (
                            <div key={idx} className="border border-zinc-850 bg-zinc-900/30 rounded-none p-3 font-mono">
                              <div className="font-bold text-white text-xs truncate uppercase">{t.title}</div>
                              <div className="text-[9px] text-[#fbbf24] mt-0.5 uppercase font-bold">{t.artist}</div>
                              <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">{t.whyThisMatches}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="flex flex-col h-60 justify-between font-mono">
                        <div>
                          <h5 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
                            // USER ANNOTATIONS ({comments.length})
                          </h5>
                          
                          {/* Comments List */}
                          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                            {comments.length === 0 ? (
                              <p className="text-xs text-zinc-650 italic py-4 text-center">No comments filed on record.</p>
                            ) : (
                              comments.map(c => (
                                <div key={c.id} className="text-[11px] bg-zinc-900/40 border border-zinc-850 rounded-none p-2.5 relative group">
                                  <div className="flex justify-between items-center mb-1 text-[9px]">
                                    <span className="font-bold text-zinc-400">{c.user?.display_name || "Anonymous"}</span>
                                    <span className="text-zinc-600">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-zinc-300 leading-relaxed">{c.content}</p>
                                  
                                  {/* Delete comment */}
                                  {user && c.user_id === user.id && (
                                    <button 
                                      onClick={() => handleDeleteComment(c.id)}
                                      className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Comment Input */}
                        <form onSubmit={handlePostComment} className="flex gap-1.5 mt-3 pt-3 border-t border-zinc-850">
                          <input 
                            type="text"
                            required
                            placeholder="Add comment... (+10 XP)"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                          />
                          <button
                            type="submit"
                            disabled={isPostingComment || !newComment.trim()}
                            className="w-8 h-8 rounded-none bg-[#f4f3f6] text-[#0b0a0d] flex items-center justify-center disabled:opacity-40 hover:bg-zinc-200 transition-all flex-shrink-0 cursor-pointer"
                          >
                            <Send size={11} />
                          </button>
                        </form>

                      </div>
                    </div>

                  </motion.div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <BottomNav />
    </div>
  );
}

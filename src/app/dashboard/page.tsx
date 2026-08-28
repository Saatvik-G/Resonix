"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Music2, ListMusic, Clock, LogOut, User, 
  Trophy, Users, MessageSquare, Send, Share2, Shield, 
  Globe, Heart, Calendar, Plus, Trash2
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
  { label: "Discover Music", icon: Sparkles, href: "/discover", gradient: "from-violet-600/20 to-indigo-600/20", border: "border-violet-500/20" },
  { label: "AI Playlists", icon: ListMusic, href: "/playlist", gradient: "from-cyan-600/20 to-blue-600/20", border: "border-cyan-500/20" },
  { label: "Music Chat", icon: Music2, href: "/chat", gradient: "from-pink-600/20 to-violet-600/20", border: "border-pink-500/20" },
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-white/8 rounded-3xl p-6 sm:p-8 mb-8 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-outfit text-2xl font-bold text-white">Hey, {displayName} 👋</h1>
                <p className="text-sm text-white/40">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Taste Map Link */}
              <Link
                href="/dashboard/taste-map"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-300 hover:opacity-90 transition-all text-xs font-semibold"
              >
                <Globe size={14} /> Taste Map
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-4 py-2 glass border border-white/10 rounded-xl text-white/40 hover:text-red-400 hover:border-red-500/20 transition-all text-xs flex-shrink-0"
              >
                <LogOut size={12} /> Sign Out
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={action.href}
                  className={`block glass border ${action.border} rounded-2xl p-5 bg-gradient-to-br ${action.gradient} hover:scale-[1.02] transition-all duration-200 glow-card`}
                >
                  <Icon size={24} className="text-white mb-3" />
                  <h3 className="font-outfit font-semibold text-white">{action.label}</h3>
                  <p className="text-xs text-white/40 mt-0.5">Explore feature →</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Toggle Tabs */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab("dna")}
            className={`px-6 py-3 font-outfit text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "dna" 
                ? "border-violet-500 text-white" 
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Trophy size={16} /> My DNA & Gamification
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`px-6 py-3 font-outfit text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "community" 
                ? "border-violet-500 text-white" 
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Users size={16} /> Community & Shared Playlists
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
                <div className="glass border border-violet-500/20 rounded-2xl p-6 bg-gradient-to-br from-violet-600/5 to-indigo-600/5 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-widest block mb-1">
                      CURRENT RANK
                    </span>
                    <h3 className="text-3xl font-outfit font-black text-white flex items-baseline gap-1.5">
                      Level {userLevel}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">Earn XP by discovering genres, colors, moods, & sharing playlists.</p>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-white/50 mb-1.5">
                      <span>{currentXpInLevel} / {xpNeededForNextLevel} XP</span>
                      <span>Level {userLevel + 1}</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full gradient-primary transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Total XP & Achievements */}
                <div className="glass border border-white/8 rounded-2xl p-6 md:col-span-2 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-1">
                        TOTAL EXPERIENCE
                      </span>
                      <h3 className="text-4xl font-outfit font-bold text-white">{xp} XP</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Trophy size={18} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-4">
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block">Badges Unlocked</span>
                      <span className="text-lg font-outfit font-semibold text-white">
                        {badges.length} / {BADGE_INFO.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase block">Next Reward</span>
                      <span className="text-xs text-violet-400 font-semibold block mt-0.5">
                        Bronze Vinyl Holder
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Badges Grid */}
              <div>
                <h3 className="font-outfit font-bold text-white text-lg mb-4">Acoustic Badges</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {BADGE_INFO.map(badge => {
                    const isUnlocked = badges.includes(badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={`glass border rounded-2xl p-4 text-center flex flex-col items-center transition-all ${
                          isUnlocked 
                            ? "border-amber-500/20 bg-amber-500/[0.02]" 
                            : "border-white/5 opacity-40 bg-transparent"
                        }`}
                      >
                        <span className="text-3xl mb-2.5 block">{badge.emoji}</span>
                        <h4 className="font-outfit font-bold text-sm text-white mb-0.5 truncate max-w-full">
                          {badge.name}
                        </h4>
                        <p className="text-[10px] text-white/40 leading-snug">
                          {badge.desc}
                        </p>
                        {isUnlocked ? (
                          <span className="text-[9px] font-bold text-amber-400 uppercase mt-2.5 tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-white/20 uppercase mt-2.5 tracking-wider">
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
                <h3 className="font-outfit font-bold text-white text-lg mb-3">My AI Playlists</h3>
                {playlists.length === 0 ? (
                  <div className="glass border border-white/5 rounded-2xl p-8 text-center">
                    <ListMusic size={32} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No playlists generated yet.</p>
                    <Link
                      href="/playlist"
                      className="inline-flex items-center gap-1.5 mt-3 gradient-primary px-4 py-2 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition-all"
                    >
                      <Plus size={12} /> Generate Playlist
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {playlists.map(pl => {
                      const isShared = sharedPlaylistsList.includes(pl.id);
                      return (
                        <div key={pl.id} className="glass border border-white/8 rounded-2xl p-5 flex flex-col justify-between bg-[#121118]/40">
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <h4 className="font-outfit font-bold text-white text-base truncate flex-1">{pl.name}</h4>
                              <button 
                                onClick={() => removePlaylist(pl.id)} 
                                className="text-white/20 hover:text-red-400 p-1 rounded transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <p className="text-xs text-white/55 line-clamp-2 leading-relaxed mb-3">
                              {pl.conceptBlurb}
                            </p>
                            <span className="text-[10px] text-white/30">
                              {pl.tracks.length} tracks • {new Date(pl.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            <button
                              onClick={() => handleSharePlaylist(pl)}
                              disabled={isShared}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isShared 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                              }`}
                            >
                              <Share2 size={12} />
                              {isShared ? "Shared with Community (+25 XP)" : "Share to Community"}
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
                <h3 className="font-outfit font-bold text-white text-lg flex items-center gap-1.5">
                  <Users size={18} className="text-violet-400" /> Creators to Follow
                </h3>

                <div className="space-y-4">
                  {INITIAL_PROFILES.map(profile => {
                    const isFollowing = following.includes(profile.id);
                    return (
                      <div key={profile.id} className="glass border border-white/8 rounded-2xl p-4 flex flex-col justify-between bg-[#121118]/40">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <h4 className="font-outfit font-bold text-white text-sm">{profile.display_name}</h4>
                              <span className="text-[10px] text-violet-400 font-medium">Curator</span>
                            </div>
                            <button
                              onClick={() => handleFollowToggle(profile.id)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                                isFollowing 
                                  ? "bg-white/5 text-white/50 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20" 
                                  : "gradient-primary text-white"
                              }`}
                            >
                              {isFollowing ? "Following" : "Follow"}
                            </button>
                          </div>
                          <p className="text-xs text-white/50 leading-relaxed mb-3">
                            {profile.bio}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {profile.genres.map(g => (
                            <span key={g} className="text-[9px] bg-white/5 border border-white/5 text-white/40 px-1.5 py-0.5 rounded">
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
                <h3 className="font-outfit font-bold text-white text-lg flex items-center gap-1.5">
                  <Share2 size={18} className="text-violet-400" /> Discover Shared Playlists
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {communityPlaylists.map(pl => (
                    <div 
                      key={pl.id} 
                      onClick={() => openPlaylistDetails(pl)}
                      className={`glass border rounded-2xl p-5 cursor-pointer hover:border-violet-500/30 transition-all bg-[#121118]/40 flex flex-col justify-between ${
                        selectedPlaylist?.id === pl.id ? "border-violet-500 ring-1 ring-violet-500/20 bg-violet-500/[0.02]" : "border-white/8"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-300">
                            {pl.author_name[0].toUpperCase()}
                          </div>
                          <span className="text-[11px] text-white/50">by {pl.author_name}</span>
                        </div>
                        <h4 className="font-outfit font-bold text-white text-base leading-snug mb-1.5">
                          {pl.name}
                        </h4>
                        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed mb-3">
                          {pl.concept_blurb}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] text-white/30">
                        <span>{pl.tracks.length} tracks</span>
                        <span className="flex items-center gap-1 text-violet-400 font-semibold hover:underline">
                          <MessageSquare size={10} /> Comments & Listen
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
                    className="glass border border-violet-500/20 rounded-2xl p-6 bg-gradient-to-b from-[#121118] to-black"
                  >
                    <div className="flex justify-between items-start gap-4 mb-4 border-b border-white/5 pb-4">
                      <div>
                        <h4 className="font-outfit font-bold text-white text-lg">{selectedPlaylist.name}</h4>
                        <p className="text-xs text-white/40 mt-0.5">Vibe concept: {selectedPlaylist.concept_blurb}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedPlaylist(null)}
                        className="text-xs px-2.5 py-1 glass border border-white/10 text-white/55 hover:text-white rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Track List */}
                      <div>
                        <h5 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2.5">
                          Tracks inside Playlist
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {selectedPlaylist.tracks.map((t, idx) => (
                            <div key={idx} className="glass border border-white/5 rounded-xl p-3 bg-white/[0.01]">
                              <div className="font-outfit font-semibold text-white text-xs truncate">{t.title}</div>
                              <div className="text-[10px] text-amber-400 mt-0.5">{t.artist}</div>
                              <p className="text-[9px] text-white/35 mt-1 leading-relaxed">{t.whyThisMatches}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="flex flex-col h-60 justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2.5">
                            Comments ({comments.length})
                          </h5>
                          
                          {/* Comments List */}
                          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                            {comments.length === 0 ? (
                              <p className="text-xs text-white/20 italic py-4 text-center">Be the first to leave a note...</p>
                            ) : (
                              comments.map(c => (
                                <div key={c.id} className="text-xs bg-white/[0.02] border border-white/5 rounded-xl p-2.5 relative group">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-violet-300">{c.user?.display_name || "Anonymous"}</span>
                                    <span className="text-[9px] text-white/25">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-white/70 leading-relaxed text-[11px]">{c.content}</p>
                                  
                                  {/* Delete comment */}
                                  {user && c.user_id === user.id && (
                                    <button 
                                      onClick={() => handleDeleteComment(c.id)}
                                      className="absolute top-2 right-2 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <form onSubmit={handlePostComment} className="flex gap-1.5 mt-3 pt-3 border-t border-white/5">
                          <input 
                            type="text"
                            required
                            placeholder="Add a comment... (+10 XP)"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50"
                          />
                          <button
                            type="submit"
                            disabled={isPostingComment || !newComment.trim()}
                            className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-all flex-shrink-0"
                          >
                            <Send size={12} />
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

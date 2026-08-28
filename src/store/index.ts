import { create } from "zustand";
import type { MusicRecommendation } from "@/lib/gemini";

interface SearchState {
  query: string;
  results: MusicRecommendation[];
  interpretation: string;
  isLoading: boolean;
  searchType: "text" | "emoji";
  history: { query: string; type: string; timestamp: number }[];
  setQuery: (q: string) => void;
  setResults: (r: MusicRecommendation[], interp?: string) => void;
  setLoading: (l: boolean) => void;
  setSearchType: (t: "text" | "emoji") => void;
  addToHistory: (query: string, type: string) => void;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  results: [],
  interpretation: "",
  isLoading: false,
  searchType: "text",
  history: [],
  setQuery: (query) => set({ query }),
  setResults: (results, interpretation = "") => set({ results, interpretation }),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchType: (searchType) => set({ searchType }),
  addToHistory: (query, type) =>
    set((s) => ({
      history: [{ query, type, timestamp: Date.now() }, ...s.history.slice(0, 19)],
    })),
  clearResults: () => set({ results: [], interpretation: "" }),
}));

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setLoading: (l: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { ...msg, id: crypto.randomUUID(), timestamp: Date.now() },
      ],
    })),
  setLoading: (isLoading) => set({ isLoading }),
  clearChat: () => set({ messages: [] }),
}));

interface PlaylistState {
  playlists: {
    id: string;
    name: string;
    conceptBlurb: string;
    tracks: MusicRecommendation[];
    createdAt: number;
  }[];
  isGenerating: boolean;
  addPlaylist: (p: { name: string; conceptBlurb: string; tracks: MusicRecommendation[] }) => void;
  setGenerating: (g: boolean) => void;
  removePlaylist: (id: string) => void;
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
  playlists: [],
  isGenerating: false,
  addPlaylist: (p) =>
    set((s) => ({
      playlists: [{ ...p, id: crypto.randomUUID(), createdAt: Date.now() }, ...s.playlists],
    })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  removePlaylist: (id) =>
    set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),
}));

interface DiscoveryState {
  trending: MusicRecommendation[];
  dailyPicks: MusicRecommendation[];
  featuredPlaylists: { name: string; conceptBlurb: string; tracks: MusicRecommendation[] }[];
  setTrending: (t: MusicRecommendation[]) => void;
  setDailyPicks: (d: MusicRecommendation[]) => void;
  setFeaturedPlaylists: (f: { name: string; conceptBlurb: string; tracks: MusicRecommendation[] }[]) => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set) => ({
  trending: [],
  dailyPicks: [],
  featuredPlaylists: [],
  setTrending: (trending) => set({ trending }),
  setDailyPicks: (dailyPicks) => set({ dailyPicks }),
  setFeaturedPlaylists: (featuredPlaylists) => set({ featuredPlaylists }),
}));

interface SceneState {
  currentMood: string;
  setMood: (mood: string) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  currentMood: "default",
  setMood: (currentMood) => set({ currentMood }),
}));

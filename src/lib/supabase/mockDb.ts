// Mock Database Fallback for Resonix

export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  personality_type?: string;
  favorite_genres?: string[];
  favorite_moods?: string[];
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface PlaylistComment {
  id: string;
  playlist_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface UserGamification {
  user_id: string;
  xp: number;
  badges: string[];
}

// Initial Mock Profiles
export const MOCK_PROFILES: Profile[] = [
  {
    id: "user-dj-vinyl",
    display_name: "DJ Vinyl Selector",
    avatar_url: "",
    bio: "Spinning deep cuts and dusty grooves. Obsessed with 70s analog synths.",
    personality_type: "The Curator",
    favorite_genres: ["Jazz", "Funk", "Soul", "Disco"],
    favorite_moods: ["Groovy", "Warm", "Nostalgic"]
  },
  {
    id: "user-lofi-chill",
    display_name: "LoFi Chill Beats",
    avatar_url: "",
    bio: "Late night study sessions and rain outside. 24/7 coding soundtracks.",
    personality_type: "The Relaxer",
    favorite_genres: ["Lofi Hip Hop", "Ambient", "Chillhop"],
    favorite_moods: ["Chill", "Dreamy", "Focus"]
  },
  {
    id: "user-indie-explorer",
    display_name: "Indie Explorer",
    avatar_url: "",
    bio: "Searching for the next great underground band. No mainstream allowed.",
    personality_type: "The Pioneer",
    favorite_genres: ["Indie Rock", "Dream Pop", "Shoegaze"],
    favorite_moods: ["Melancholic", "Ethereal", "Bittersweet"]
  }
];

// Mock database storage in-memory for server-side fallback
class MockDatabase {
  private follows: Follow[] = [];
  private comments: PlaylistComment[] = [
    {
      id: "comment-1",
      playlist_id: "featured-1",
      user_id: "user-dj-vinyl",
      content: "This track selection is absolutely stellar! That transition into track 3 is magic.",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      user: { display_name: "DJ Vinyl Selector" }
    },
    {
      id: "comment-2",
      playlist_id: "featured-1",
      user_id: "user-lofi-chill",
      content: "Super chill vibes. Perfect for my night drive.",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      user: { display_name: "LoFi Chill Beats" }
    }
  ];
  private gamification: Record<string, UserGamification> = {};

  constructor() {
    // Populate some default follows
    MOCK_PROFILES.forEach(profile => {
      // Current user (simulated) can be followed by DJ Vinyl
      this.follows.push({
        follower_id: profile.id,
        following_id: "mock-user", // default fallback user
        created_at: new Date().toISOString()
      });
    });
  }

  // Follows
  getFollowers(userId: string): Follow[] {
    return this.follows.filter(f => f.following_id === userId);
  }

  getFollowing(userId: string): Follow[] {
    return this.follows.filter(f => f.follower_id === userId);
  }

  follow(followerId: string, followingId: string): boolean {
    const exists = this.follows.some(f => f.follower_id === followerId && f.following_id === followingId);
    if (!exists) {
      this.follows.push({
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });
    }
    return true;
  }

  unfollow(followerId: string, followingId: string): boolean {
    this.follows = this.follows.filter(f => !(f.follower_id === followerId && f.following_id === followingId));
    return true;
  }

  // Comments
  getComments(playlistId: string): PlaylistComment[] {
    return this.comments.filter(c => c.playlist_id === playlistId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  addComment(playlistId: string, userId: string, content: string, displayName: string): PlaylistComment {
    const comment: PlaylistComment = {
      id: `comment-${Date.now()}`,
      playlist_id: playlistId,
      user_id: userId,
      content,
      created_at: new Date().toISOString(),
      user: { display_name: displayName }
    };
    this.comments.push(comment);
    return comment;
  }

  deleteComment(commentId: string, userId: string): boolean {
    const commentIndex = this.comments.findIndex(c => c.id === commentId && c.user_id === userId);
    if (commentIndex > -1) {
      this.comments.splice(commentIndex, 1);
      return true;
    }
    return false;
  }

  // Gamification
  getGamification(userId: string): UserGamification {
    if (!this.gamification[userId]) {
      this.gamification[userId] = {
        user_id: userId,
        xp: 150, // start with some XP
        badges: ["Explorer"]
      };
    }
    return this.gamification[userId];
  }

  updateGamification(userId: string, xpToAdd: number, badgeToEarn?: string): UserGamification {
    const record = this.getGamification(userId);
    record.xp += xpToAdd;
    if (badgeToEarn && !record.badges.includes(badgeToEarn)) {
      record.badges.push(badgeToEarn);
    }
    this.gamification[userId] = record;
    return record;
  }
}

// Global singleton for server-side
const globalForMock = global as unknown as { mockDb: MockDatabase };
export const mockDb = globalForMock.mockDb || new MockDatabase();
if (process.env.NODE_ENV !== "production") globalForMock.mockDb = mockDb;

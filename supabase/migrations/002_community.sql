-- Supabase Community Migrations

-- Follows table
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Playlist comments table
create table if not exists public.playlist_comments (
  id uuid default uuid_generate_v4() primary key,
  playlist_id uuid references public.saved_playlists(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- User gamification table
create table if not exists public.user_gamification (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  xp integer default 0 not null,
  badges text[] default '{}'
);

-- Enable RLS
alter table public.follows enable row level security;
alter table public.playlist_comments enable row level security;
alter table public.user_gamification enable row level security;

-- RLS Policies: Follows
create policy "Anyone can view follows" on public.follows
  for select using (true);
create policy "Users can follow others" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow others" on public.follows
  for delete using (auth.uid() = follower_id);

-- RLS Policies: Playlist Comments
create policy "Anyone can view comments" on public.playlist_comments
  for select using (true);
create policy "Users can post comments" on public.playlist_comments
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.playlist_comments
  for delete using (auth.uid() = user_id);

-- RLS Policies: User Gamification
create policy "Anyone can view gamification" on public.user_gamification
  for select using (true);
create policy "Users can manage their own gamification" on public.user_gamification
  for all using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_follows_follower_id on public.follows(follower_id);
create index if not exists idx_follows_following_id on public.follows(following_id);
create index if not exists idx_playlist_comments_playlist_id on public.playlist_comments(playlist_id);
create index if not exists idx_playlist_comments_user_id on public.playlist_comments(user_id);

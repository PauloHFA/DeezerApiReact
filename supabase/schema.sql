create table if not exists public.user_music_libraries (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default
    '{"playHistory":[],"searchHistory":[],"playlists":[]}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.user_music_libraries enable row level security;

drop policy if exists "Users manage their own music library"
  on public.user_music_libraries;

create policy "Users manage their own music library"
  on public.user_music_libraries
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.user_music_libraries to authenticated;

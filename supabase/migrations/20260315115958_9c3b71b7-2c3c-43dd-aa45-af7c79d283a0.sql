
CREATE TABLE public.cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  front text not null,
  back text not null,
  difficulty text default 'easy',
  deck text default 'Général',
  score int default 0,
  created_at timestamp with time zone default now()
);

CREATE TABLE public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  pct int not null,
  total int not null,
  difficulty text,
  created_at timestamp with time zone default now()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_own" ON public.cards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_own" ON public.sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

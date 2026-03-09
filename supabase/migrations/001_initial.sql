-- GAMES
create table games (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  mode text not null check (mode in ('test', 'classic', 'cabal')),
  status text not null default 'lobby' check (status in ('lobby', 'night', 'day', 'voting', 'second_voting', 'ended')),
  round integer not null default 1,
  host_id uuid,
  winner text check (winner in ('citizens', 'cabal')),
  point_of_order_pending boolean not null default false,
  night_log jsonb,
  wager_active boolean not null default false,
  wager_contract_address text,
  created_at timestamptz default now()
);

-- PLAYERS
create table players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  wallet_address text not null,
  display_name text not null,
  player_index integer not null,
  role text check (role in ('godfather', 'agbero', 'dibia', 'soldier', 'whistleblower', 'town_crier', 'nepo_baby', 'citizen', 'recruited_citizen')),
  team text check (team in ('cabal', 'citizen')),
  status text not null default 'alive' check (status in ('alive', 'eliminated')),
  is_bot boolean not null default false,
  nepo_shield_active boolean not null default false,
  town_crier_used boolean not null default false,
  has_wagered boolean not null default false,
  wager_target_id uuid references players(id),
  created_at timestamptz default now()
);

-- NIGHT ACTIONS
create table night_actions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  round integer not null,
  actor_id uuid references players(id),
  action_type text not null check (action_type in ('eliminate', 'investigate', 'protect', 'point_of_order', 'recruit', 'whistleblow')),
  target_id uuid references players(id),
  result text,
  created_at timestamptz default now()
);

-- VOTES
create table votes (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  round integer not null,
  vote_number integer not null default 1,
  voter_id uuid references players(id),
  target_id uuid references players(id),
  created_at timestamptz default now()
);

-- MESSAGES
create table messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade,
  player_id uuid references players(id),
  content text not null,
  phase text not null check (phase in ('day', 'cabal_night')),
  created_at timestamptz default now()
);

-- Enable Realtime on all game tables
alter publication supabase_realtime add table games;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table night_actions;

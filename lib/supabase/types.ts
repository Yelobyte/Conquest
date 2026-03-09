export type GameMode = 'test' | 'classic' | 'cabal'
export type GameStatus = 'lobby' | 'night' | 'day' | 'voting' | 'second_voting' | 'ended'
export type PlayerRole =
  | 'godfather'
  | 'agbero'
  | 'dibia'
  | 'soldier'
  | 'whistleblower'
  | 'town_crier'
  | 'nepo_baby'
  | 'citizen'
  | 'recruited_citizen'
export type PlayerTeam = 'cabal' | 'citizen'
export type PlayerStatus = 'alive' | 'eliminated'
export type ActionType = 'eliminate' | 'investigate' | 'protect' | 'point_of_order' | 'recruit' | 'whistleblow'
export type MessagePhase = 'day' | 'cabal_night'
export type WinnerType = 'citizens' | 'cabal'

export interface DbGame {
  id: string
  room_code: string
  mode: GameMode
  status: GameStatus
  round: number
  host_id: string | null
  winner: WinnerType | null
  point_of_order_pending: boolean
  night_log: unknown | null
  wager_active: boolean
  wager_contract_address: string | null
  created_at: string
}

export interface DbPlayer {
  id: string
  game_id: string
  wallet_address: string
  display_name: string
  player_index: number
  role: PlayerRole | null
  team: PlayerTeam | null
  status: PlayerStatus
  is_bot: boolean
  nepo_shield_active: boolean
  town_crier_used: boolean
  has_wagered: boolean
  wager_target_id: string | null
  created_at: string
}

export interface DbNightAction {
  id: string
  game_id: string
  round: number
  actor_id: string
  action_type: ActionType
  target_id: string
  result: string | null
  created_at: string
}

export interface DbVote {
  id: string
  game_id: string
  round: number
  vote_number: number
  voter_id: string
  target_id: string
  created_at: string
}

export interface DbMessage {
  id: string
  game_id: string
  player_id: string
  content: string
  phase: MessagePhase
  created_at: string
}

import { Role, Team, ROLE_TEAMS, ROLE_SETS } from './roles'

export interface LocalPlayer {
  id: string
  gameId: string
  displayName: string
  playerIndex: number
  role: Role
  team: Team
  status: 'alive' | 'eliminated'
  isBot: boolean
  nepoShieldActive: boolean
}

export interface NightAction {
  actorId: string
  actionType: 'eliminate' | 'investigate' | 'protect' | 'recruit' | 'whistleblow'
  targetId: string
  round: number
}

export interface NightLogEntry {
  type: 'elimination' | 'blocked' | 'nepo_saved' | 'agbero_revealed' | 'no_elimination'
  playerName?: string
  role?: Role
  agberoName?: string
}

export interface Vote {
  voterId: string
  targetId: string
  round: number
  voteNumber: number
}

export interface Message {
  id: string
  playerId: string
  playerName: string
  content: string
  phase: 'day' | 'cabal_night'
  timestamp: number
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

/**
 * Assigns roles to players. In test mode, Godfather is always a bot.
 * Returns players with roles assigned.
 */
export function assignRoles(players: LocalPlayer[]): LocalPlayer[] {
  const count = players.length
  const roleSet = ROLE_SETS[count] ?? ROLE_SETS[4]
  const shuffledRoles = shuffle(roleSet)

  // In test mode (4 players), ensure godfather goes to a bot
  const bots = players.filter((p) => p.isBot)

  const godfatherIdx = shuffledRoles.indexOf('godfather')
  if (godfatherIdx !== -1 && bots.length > 0) {
    // Swap godfather to first bot slot if it isn't already assigned to a bot
    const botIndices = bots.map((b) => players.indexOf(b))
    if (!botIndices.includes(godfatherIdx)) {
      const firstBotIdx = botIndices[0]
      ;[shuffledRoles[godfatherIdx], shuffledRoles[firstBotIdx]] = [
        shuffledRoles[firstBotIdx],
        shuffledRoles[godfatherIdx],
      ]
    }
  }

  return players.map((p, i) => ({
    ...p,
    role: shuffledRoles[i],
    team: ROLE_TEAMS[shuffledRoles[i]],
    nepoShieldActive: shuffledRoles[i] === 'nepo_baby',
  }))
}

/**
 * Resolves all night actions and returns the updated players + night log.
 * Strict order per §4: Cabal → Dibia → Soldier
 */
export function resolveNight(
  players: LocalPlayer[],
  actions: NightAction[],
  round: number
): { updatedPlayers: LocalPlayer[]; nightLog: NightLogEntry[] } {
  const log: NightLogEntry[] = []
  let updated = [...players]

  const roundActions = actions.filter((a) => a.round === round)
  const eliminateAction = roundActions.find((a) => a.actionType === 'eliminate')
  const protectAction = roundActions.find((a) => a.actionType === 'protect')

  if (!eliminateAction) {
    log.push({ type: 'no_elimination' })
    return { updatedPlayers: updated, nightLog: log }
  }

  const target = updated.find((p) => p.id === eliminateAction.targetId)
  const protectedId = protectAction?.targetId

  if (!target || target.status === 'eliminated') {
    log.push({ type: 'no_elimination' })
    return { updatedPlayers: updated, nightLog: log }
  }

  // 1. Soldier protection check
  if (protectedId === target.id) {
    log.push({ type: 'blocked' })
    return { updatedPlayers: updated, nightLog: log }
  }

  // 2. Nepo Baby first-hit check
  if (target.role === 'nepo_baby' && target.nepoShieldActive) {
    updated = updated.map((p) =>
      p.id === target.id ? { ...p, nepoShieldActive: false } : p
    )
    // Reveal a random agbero to all
    const agbero = updated.find((p) => p.role === 'agbero' && p.status === 'alive')
    log.push({ type: 'nepo_saved', agberoName: agbero?.displayName })
    return { updatedPlayers: updated, nightLog: log }
  }

  // 3. Eliminate target
  updated = updated.map((p) =>
    p.id === target.id ? { ...p, status: 'eliminated' as const } : p
  )
  log.push({ type: 'elimination', playerName: target.displayName, role: target.role })

  return { updatedPlayers: updated, nightLog: log }
}

/**
 * Win condition check — runs after every elimination.
 * Recruited citizens count as Cabal.
 */
export function checkWin(players: LocalPlayer[]): 'citizens' | 'cabal' | null {
  const alive = players.filter((p) => p.status === 'alive')
  const cabalAlive = alive.filter((p) => p.team === 'cabal').length
  const citizensAlive = alive.filter((p) => p.team === 'citizen').length

  if (cabalAlive === 0) return 'citizens'
  if (cabalAlive >= citizensAlive) return 'cabal'
  return null
}

/**
 * Dibia investigation — Godfather always returns 'citizen'.
 */
export function investigatePlayer(target: LocalPlayer): 'citizen' | 'cabal' {
  if (target.role === 'godfather') return 'citizen'
  return target.team === 'cabal' ? 'cabal' : 'citizen'
}

/**
 * Resolves a vote round. Returns the eliminated player (or null on tie).
 */
export function resolveVote(
  players: LocalPlayer[],
  votes: Vote[],
  round: number,
  voteNumber: number = 1
): { eliminated: LocalPlayer | null; tiedPlayers: LocalPlayer[] } {
  const alive = players.filter((p) => p.status === 'alive')
  const roundVotes = votes.filter((v) => v.round === round && v.voteNumber === voteNumber)

  const tally: Record<string, number> = {}
  for (const v of roundVotes) {
    tally[v.targetId] = (tally[v.targetId] ?? 0) + 1
  }

  if (Object.keys(tally).length === 0) return { eliminated: null, tiedPlayers: [] }

  const maxVotes = Math.max(...Object.values(tally))
  const topTargets = Object.entries(tally)
    .filter(([, count]) => count === maxVotes)
    .map(([id]) => alive.find((p) => p.id === id)!)
    .filter(Boolean)

  if (topTargets.length > 1) {
    return { eliminated: null, tiedPlayers: topTargets }
  }

  return { eliminated: topTargets[0] ?? null, tiedPlayers: [] }
}

export function eliminatePlayer(players: LocalPlayer[], playerId: string): LocalPlayer[] {
  return players.map((p) => (p.id === playerId ? { ...p, status: 'eliminated' as const } : p))
}

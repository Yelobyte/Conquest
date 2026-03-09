import { LocalPlayer, NightAction, Vote } from './engine'

export const BOT_NAMES = ['Oga Bot', 'Madam Winifred', 'Sen. K.K.']

// Bot timing — 5–8 seconds for night actions, 2–5s for votes
export const BOT_NIGHT_DELAY = () => Math.random() * 3000 + 5000
export const BOT_VOTE_DELAY = () => Math.random() * 3000 + 2000
export const BOT_CHAT_DELAY = () => Math.random() * 4000 + 3000

const BOT_PHRASES = {
  deflection: [
    'Why is nobody talking about what happened last night?',
    "I was asleep, I don't know anything.",
    "Oga, I'm just a citizen o. Leave me alone.",
    "The real Cabal is sitting quietly — check who hasn't spoken.",
  ],
  accusation: [
    "I'm not saying it's {player}, but I'm not NOT saying it either.",
    "Something about {player} is off. Just my gut.",
    'We should vote out {player} this round. Suspicious behaviour.',
  ],
  defense: [
    'I swear on my mother I am not Cabal.',
    'If I\'m Cabal, may lightning strike me now.',
    'My hands are clean. The Dibia can check me.',
  ],
  neutral: [
    "Let's hear from everyone before we vote.",
    "Who was protected last night? That's the real question.",
    'I say we vote {player}. No strong reason, just vibes.',
  ],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fillPlayer(phrase: string, players: LocalPlayer[]): string {
  const alive = players.filter((p) => p.status === 'alive')
  if (!phrase.includes('{player}') || alive.length === 0) return phrase
  return phrase.replace('{player}', pick(alive).displayName)
}

/**
 * Get a night action for a bot player.
 */
export function getBotNightAction(
  bot: LocalPlayer,
  allPlayers: LocalPlayer[],
  round: number
): NightAction | null {
  const alive = allPlayers.filter((p) => p.status === 'alive')

  if (bot.role === 'godfather' || bot.role === 'agbero') {
    // Target a random living non-Cabal player
    const targets = alive.filter((p) => p.team !== 'cabal' && p.id !== bot.id)
    if (targets.length === 0) return null
    return {
      actorId: bot.id,
      actionType: 'eliminate',
      targetId: pick(targets).id,
      round,
    }
  }

  if (bot.role === 'dibia') {
    // Investigate a random living player
    const targets = alive.filter((p) => p.id !== bot.id)
    if (targets.length === 0) return null
    return {
      actorId: bot.id,
      actionType: 'investigate',
      targetId: pick(targets).id,
      round,
    }
  }

  if (bot.role === 'soldier') {
    // Protect a random living player
    const targets = alive.filter((p) => p.id !== bot.id)
    if (targets.length === 0) return null
    return {
      actorId: bot.id,
      actionType: 'protect',
      targetId: pick(targets).id,
      round,
    }
  }

  return null
}

/**
 * Get a vote target for a bot player.
 * Cabal bots vote for Citizens; Citizen bots vote with bandwagon bias.
 */
export function getBotVoteTarget(
  bot: LocalPlayer,
  allPlayers: LocalPlayer[],
  currentVotes: Vote[],
  round: number
): string {
  const alive = allPlayers.filter((p) => p.status === 'alive' && p.id !== bot.id)

  if (bot.team === 'cabal') {
    // Never vote for Cabal teammates
    const citizenTargets = alive.filter((p) => p.team !== 'cabal')
    if (citizenTargets.length > 0) return pick(citizenTargets).id
    return pick(alive).id
  }

  // Citizen bots — bandwagon: 30% bias toward most-voted player
  const roundVotes = currentVotes.filter((v) => v.round === round)
  const tally: Record<string, number> = {}
  for (const v of roundVotes) {
    tally[v.targetId] = (tally[v.targetId] ?? 0) + 1
  }

  if (Math.random() < 0.3 && Object.keys(tally).length > 0) {
    const mostVoted = Object.entries(tally).sort(([, a], [, b]) => b - a)[0][0]
    const candidate = alive.find((p) => p.id === mostVoted)
    if (candidate) return candidate.id
  }

  return pick(alive).id
}

/**
 * Generate 1–2 chat messages for bots during Day discussion phase.
 */
export function getBotChatMessages(
  bot: LocalPlayer,
  allPlayers: LocalPlayer[]
): string[] {
  const categories = Object.keys(BOT_PHRASES) as (keyof typeof BOT_PHRASES)[]
  const count = Math.random() < 0.5 ? 1 : 2
  const messages: string[] = []

  for (let i = 0; i < count; i++) {
    const cat = pick(categories)
    const phrase = pick(BOT_PHRASES[cat])
    messages.push(fillPlayer(phrase, allPlayers))
  }

  return messages
}

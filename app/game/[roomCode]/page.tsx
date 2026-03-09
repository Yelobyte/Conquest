'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  LocalPlayer,
  NightAction,
  Vote,
  Message,
  assignRoles,
  resolveNight,
  resolveVote,
  eliminatePlayer,
  checkWin,
} from '@/lib/game/engine'
import {
  getBotNightAction,
  getBotVoteTarget,
  getBotChatMessages,
  BOT_NAMES,
  BOT_NIGHT_DELAY,
  BOT_VOTE_DELAY,
  BOT_CHAT_DELAY,
} from '@/lib/game/bots'
import { NARRATOR, ROLE_LABELS, hasNightAction } from '@/lib/game/roles'
import { generateId } from '@/lib/utils'

import RoleCard from '@/components/game/RoleCard'
import PlayerGrid from '@/components/game/PlayerGrid'
import PhaseBar from '@/components/game/PhaseBar'
import ChatPanel from '@/components/game/ChatPanel'
import VotingUI from '@/components/game/VotingUI'

type Phase =
  | 'role_reveal'
  | 'night'
  | 'night_result'
  | 'day'
  | 'voting'
  | 'vote_result'
  | 'ended'

const DISCUSSION_SECONDS = 90

function buildInitialPlayers(humanName: string): LocalPlayer[] {
  const gameId = generateId()
  const bots: LocalPlayer[] = BOT_NAMES.map((name, i) => ({
    id: generateId(),
    gameId,
    displayName: name,
    playerIndex: i,
    role: 'citizen',
    team: 'citizen',
    status: 'alive',
    isBot: true,
    nepoShieldActive: false,
  }))
  const human: LocalPlayer = {
    id: generateId(),
    gameId,
    displayName: humanName,
    playerIndex: 3,
    role: 'citizen',
    team: 'citizen',
    status: 'alive',
    isBot: false,
    nepoShieldActive: false,
  }
  return assignRoles([...bots, human])
}

function GamePageInner() {
  const searchParams = useSearchParams()
  const humanName = searchParams.get('name') ?? 'You'

  const [players, setPlayers] = useState<LocalPlayer[]>(() => buildInitialPlayers(humanName))
  const [phase, setPhase] = useState<Phase>('role_reveal')
  const [round, setRound] = useState(1)
  const [nightActions, setNightActions] = useState<NightAction[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [winner, setWinner] = useState<'citizens' | 'cabal' | null>(null)
  const [dayTimer, setDayTimer] = useState(DISCUSSION_SECONDS)
  const [voteEliminated, setVoteEliminated] = useState<LocalPlayer | null>(null)
  const [dayBannerText, setDayBannerText] = useState('')
  const [revealAllRoles, setRevealAllRoles] = useState(false)
  const [showRoleCard, setShowRoleCard] = useState(false)

  // Derived
  const human = players.find((p) => !p.isBot)!
  const humanHasVoted = votes.some(
    (v) => v.voterId === human?.id && v.round === round && v.voteNumber === 1
  )

  const addMessage = useCallback((player: LocalPlayer, content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        playerId: player.id,
        playerName: player.displayName,
        content,
        phase: 'day',
        timestamp: Date.now(),
      },
    ])
  }, [])

  const addNightAction = useCallback((action: NightAction) => {
    setNightActions((prev) => [...prev, action])
  }, [])

  const addVote = useCallback((vote: Vote) => {
    setVotes((prev) => [...prev, vote])
  }, [])

  // ─── Night phase: fire bot night actions ───────────────────────────────────
  useEffect(() => {
    if (phase !== 'night') return

    const aliveBots = players.filter(
      (p) => p.isBot && p.status === 'alive' && hasNightAction(p.role)
    )

    const timers: ReturnType<typeof setTimeout>[] = []
    aliveBots.forEach((bot) => {
      const t = setTimeout(() => {
        const action = getBotNightAction(bot, players, round)
        if (action) addNightAction(action)
      }, BOT_NIGHT_DELAY())
      timers.push(t)
    })

    return () => timers.forEach(clearTimeout)
  }, [phase, round]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Night phase: check if all night actors have acted → resolve ──────────
  useEffect(() => {
    if (phase !== 'night') return

    const alive = players.filter((p) => p.status === 'alive')
    const expectedActors = alive.filter((p) => hasNightAction(p.role))
    const roundActions = nightActions.filter((a) => a.round === round)
    const allActed = expectedActors.every((actor) =>
      roundActions.some((a) => a.actorId === actor.id)
    )

    if (!allActed) return

    const { updatedPlayers, nightLog: log } = resolveNight(players, nightActions, round)
    setPlayers(updatedPlayers)

    // Build day banner text
    const elim = log.find((l) => l.type === 'elimination')
    const nepoBaby = log.find((l) => l.type === 'nepo_saved')

    if (nepoBaby) {
      setDayBannerText(NARRATOR.dayNepoBaby(nepoBaby.agberoName ?? 'someone'))
    } else if (elim) {
      setDayBannerText(NARRATOR.dayEliminated(elim.playerName ?? ''))
    } else {
      setDayBannerText(NARRATOR.dayNobody)
    }

    // Check win before transitioning
    const win = checkWin(updatedPlayers)
    if (win) {
      setWinner(win)
      setRevealAllRoles(true)
      setPhase('ended')
      return
    }

    setPhase('night_result')
    const t = setTimeout(() => setPhase('day'), 3000)
    return () => clearTimeout(t)
  }, [nightActions, phase, round]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Day discussion: countdown timer ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'day') return
    setDayTimer(DISCUSSION_SECONDS)
    const interval = setInterval(() => {
      setDayTimer((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setPhase('voting')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase])

  // ─── Day phase: bots post chat messages ───────────────────────────────────
  useEffect(() => {
    if (phase !== 'day') return

    const aliveBots = players.filter((p) => p.isBot && p.status === 'alive')
    const timers: ReturnType<typeof setTimeout>[] = []

    aliveBots.forEach((bot) => {
      const msgs = getBotChatMessages(bot, players)
      msgs.forEach((msg, i) => {
        const t = setTimeout(
          () => addMessage(bot, msg),
          BOT_CHAT_DELAY() + i * 4000
        )
        timers.push(t)
      })
    })

    return () => timers.forEach(clearTimeout)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Voting phase: bots vote ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'voting') return

    const aliveBots = players.filter((p) => p.isBot && p.status === 'alive')
    const timers: ReturnType<typeof setTimeout>[] = []

    aliveBots.forEach((bot) => {
      const t = setTimeout(() => {
        const targetId = getBotVoteTarget(bot, players, votes, round)
        addVote({ voterId: bot.id, targetId, round, voteNumber: 1 })
      }, BOT_VOTE_DELAY())
      timers.push(t)
    })

    return () => timers.forEach(clearTimeout)
  }, [phase, round]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Voting phase: check if all votes are in → resolve ───────────────────
  useEffect(() => {
    if (phase !== 'voting') return

    const alive = players.filter((p) => p.status === 'alive')
    const roundVotes = votes.filter((v) => v.round === round && v.voteNumber === 1)
    if (roundVotes.length < alive.length) return

    const { eliminated } = resolveVote(players, votes, round, 1)
    setVoteEliminated(eliminated)

    if (eliminated) {
      const updated = eliminatePlayer(players, eliminated.id)
      setPlayers(updated)

      const win = checkWin(updated)
      if (win) {
        setWinner(win)
        setRevealAllRoles(true)
        setPhase('vote_result')
        // Show result briefly then end
        setTimeout(() => setPhase('ended'), 4000)
        return
      }
    }

    setPhase('vote_result')
    const t = setTimeout(() => {
      setRound((r) => r + 1)
      setNightActions([])
      setVoteEliminated(null)
      setPhase('night')
    }, 4000)
    return () => clearTimeout(t)
  }, [votes, phase, round]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Human actions ────────────────────────────────────────────────────────
  const handleHumanVote = (targetId: string) => {
    if (humanHasVoted || phase !== 'voting') return
    addVote({ voterId: human.id, targetId, round, voteNumber: 1 })
  }

  const handleHumanChat = (content: string) => {
    if (phase !== 'day') return
    addMessage(human, content)
  }

  const handleRestart = () => {
    setPlayers(buildInitialPlayers(humanName))
    setPhase('role_reveal')
    setRound(1)
    setNightActions([])
    setVotes([])
    setMessages([])
    setWinner(null)
    setDayTimer(DISCUSSION_SECONDS)
    setVoteEliminated(null)
    setRevealAllRoles(false)
  }

  // ─── Phase UI helpers ─────────────────────────────────────────────────────
  const phaseLabel =
    phase === 'night' || phase === 'night_result'
      ? 'night'
      : phase === 'day'
      ? 'day'
      : phase === 'voting' || phase === 'vote_result'
      ? 'day'
      : 'day'

  const phaseBannerText =
    phase === 'night' || phase === 'night_result'
      ? NARRATOR.nightBanner
      : phase === 'voting'
      ? NARRATOR.voteCall
      : phase === 'vote_result' && voteEliminated
      ? NARRATOR.voteResult(voteEliminated.displayName)
      : phase === 'vote_result'
      ? 'It was a tie — no one is eliminated this round.'
      : dayBannerText

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-parchment">
      {/* Role Reveal overlay (initial) */}
      {phase === 'role_reveal' && human && (
        <RoleCard role={human.role} onReady={() => setPhase('night')} />
      )}

      {/* Role peek overlay (persistent access) */}
      {showRoleCard && human && phase !== 'role_reveal' && (
        <RoleCard role={human.role} onReady={() => setShowRoleCard(false)} peek />
      )}

      {/* Game ended overlay */}
      {phase === 'ended' && (
        <div className="fixed inset-0 flex items-center justify-center bg-ink/80 z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-parchment border-2 border-gold p-8 text-center">
            <div className="text-5xl mb-4">{winner === 'citizens' ? '⚖️' : '🕴️'}</div>
            <h2 className="font-display text-2xl font-bold mb-4 text-ink">
              {winner === 'citizens' ? 'Citizens Win' : 'Cabal Wins'}
            </h2>
            <p className="font-sans text-sm text-ink-muted italic mb-6 leading-relaxed">
              {winner === 'citizens' ? NARRATOR.citizensWin : NARRATOR.cabalWins}
            </p>
            <div className="space-y-2 mb-6">
              {players.map((p) => (
                <div key={p.id} className="flex justify-between text-xs font-sans px-2">
                  <span className={p.status === 'eliminated' ? 'line-through text-ink/40' : ''}>
                    {p.displayName}
                  </span>
                  <span className={p.team === 'cabal' ? 'text-terracotta' : 'text-gold'}>
                    {ROLE_LABELS[p.role]}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={handleRestart}
              className="w-full bg-terracotta text-parchment font-sans font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Main game UI */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-ink">Cabal</h1>
          <div className="flex items-center gap-3">
            {phase !== 'role_reveal' && phase !== 'ended' && human && (
              <button
                onClick={() => setShowRoleCard(true)}
                className="text-xs font-sans font-semibold text-gold border border-gold/40 rounded-full px-3 py-1 hover:bg-gold/10 transition-colors"
              >
                My Role
              </button>
            )}
            <span className="text-xs font-sans text-ink-muted uppercase tracking-widest">
              Test Mode · Round {round}
            </span>
          </div>
        </div>

        {/* Phase banner */}
        {phase !== 'role_reveal' && phase !== 'ended' && (
          <PhaseBar
            phase={phaseLabel}
            round={round}
            message={phaseBannerText}
            timerSeconds={phase === 'day' ? dayTimer : undefined}
          />
        )}

        {/* Night status */}
        {(phase === 'night' || phase === 'night_result') && (
          <div className="rounded-xl bg-ink text-parchment p-4 text-center">
            <p className="text-sm font-sans text-parchment/60 mb-2">
              {phase === 'night_result' ? 'Night resolving...' : 'Waiting for night to pass...'}
            </p>
            <p className="text-xs font-sans text-parchment/40">
              The black SUVs are moving.
            </p>
          </div>
        )}

        {/* Player grid */}
        {phase !== 'role_reveal' && (
          <PlayerGrid
            players={players}
            humanId={human?.id ?? ''}
            revealRoles={revealAllRoles || phase === 'vote_result' || phase === 'night_result'}
            highlightIds={voteEliminated ? [voteEliminated.id] : []}
          />
        )}

        {/* Vote result banner */}
        {phase === 'vote_result' && voteEliminated && (
          <div className="rounded-xl border-2 border-terracotta bg-terracotta/10 p-4 text-center">
            <p className="font-display text-lg font-bold text-ink mb-1">
              {voteEliminated.displayName}
            </p>
            <p className="text-xs font-sans text-ink-muted">
              was a{' '}
              <span className={voteEliminated.team === 'cabal' ? 'text-terracotta font-semibold' : 'text-gold font-semibold'}>
                {ROLE_LABELS[voteEliminated.role]}
              </span>
            </p>
          </div>
        )}

        {/* Chat panel — visible during day and voting */}
        {(phase === 'day' || phase === 'voting') && (
          <ChatPanel
            messages={messages}
            locked={phase !== 'day'}
            onSend={handleHumanChat}
          />
        )}

        {/* Voting UI */}
        {phase === 'voting' && (
          <VotingUI
            players={players}
            humanId={human?.id ?? ''}
            votes={votes}
            round={round}
            humanHasVoted={humanHasVoted}
            onVote={handleHumanVote}
          />
        )}
      </div>
    </div>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-parchment" />}>
      <GamePageInner />
    </Suspense>
  )
}

'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  LocalPlayer, NightAction, Vote, Message,
  assignRoles, resolveNight, checkWin, eliminatePlayer,
  resolveVote, investigatePlayer, generateId,
} from '@/lib/game/engine'
import { Role, Team, ROLE_LABELS, ROLE_TEAMS, NARRATOR, hasNightAction } from '@/lib/game/roles'
import {
  BOT_NAMES, BOT_NIGHT_DELAY, BOT_VOTE_DELAY, BOT_CHAT_DELAY,
  getBotNightAction, getBotVoteTarget, getBotChatMessages,
} from '@/lib/game/bots'
import { Sounds } from '@/lib/sounds'

type Phase = 'role_reveal' | 'night' | 'night_result' | 'day' | 'voting' | 'second_voting' | 'vote_result' | 'ended'

const CARD_IMAGES: Record<string, string> = {
  godfather: '/cards/GodFather.png',
  agbero: '/cards/Agbero.png',
  dibia: '/cards/Dibia.png',
  soldier: '/cards/Soldier.png',
  whistleblower: '/cards/Whistleblower.png',
  nepo_baby: '/cards/Nepo-Baby.png',
  citizen: '/cards/Citizen.png',
  recruited_citizen: '/cards/Citizen.png',
}

function buildInitialPlayers(humanName: string): LocalPlayer[] {
  const gameId = generateId()
  const bots: LocalPlayer[] = BOT_NAMES.map((name, i) => ({
    id: generateId(), gameId, displayName: name, playerIndex: i,
    role: 'citizen' as Role, team: 'citizen' as Team,
    status: 'alive', isBot: true, nepoShieldActive: false,
  }))
  const human: LocalPlayer = {
    id: generateId(), gameId, displayName: humanName, playerIndex: 3,
    role: 'citizen' as Role, team: 'citizen' as Team,
    status: 'alive', isBot: false, nepoShieldActive: false,
  }
  return assignRoles([...bots, human])
}

function EmberParticles() {
  const embers = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${(i * 7.7 + 5) % 100}%`,
    delay: `${(i * 1.3) % 8}s`,
    duration: `${5 + (i * 1.1) % 5}s`,
    size: `${2 + (i % 3)}px`,
    color: i % 2 === 0 ? '#C9A84C' : '#C85A2A',
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {embers.map(e => (
        <div key={e.id} className="ember absolute bottom-0"
          style={{ left: e.left, width: e.size, height: e.size, background: e.color, animationDelay: e.delay, animationDuration: e.duration }} />
      ))}
    </div>
  )
}

function CountdownRing({ seconds, total, size = 56 }: { seconds: number; total: number; size?: number }) {
  const r = (size / 2) - 4, c = 2 * Math.PI * r
  const pct = Math.max(0, seconds / total)
  const color = pct > 0.5 ? '#C9A84C' : pct > 0.25 ? '#C85A2A' : '#EF4444'
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
      </svg>
      <span className="font-display font-black text-base text-white relative z-10" style={{ fontFamily: 'Fraunces, serif' }}>{seconds}</span>
    </div>
  )
}

function GamePageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const humanName = searchParams.get('name') ?? 'You'
  const wagerAvax = parseFloat(searchParams.get('wagerAvax') ?? '0') || 0
  const suspectName = searchParams.get('suspectName') ?? ''

  const [players, setPlayers] = useState<LocalPlayer[]>(() => buildInitialPlayers(humanName))
  const [phase, setPhase] = useState<Phase>('role_reveal')
  const [round, setRound] = useState(1)
  const [nightActions, setNightActions] = useState<NightAction[]>([])
  const [nightTimer, setNightTimer] = useState(30)
  const [nightTimedOut, setNightTimedOut] = useState(false)
  const nightResolvedRef = useRef(false)
  const [votes, setVotes] = useState<Vote[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [winner, setWinner] = useState<'citizens' | 'cabal' | null>(null)
  const [dayTimer, setDayTimer] = useState(60)
  const [votingTimer, setVotingTimer] = useState(30)
  const [votingTimedOut, setVotingTimedOut] = useState(false)
  const [voteEliminated, setVoteEliminated] = useState<LocalPlayer | null>(null)
  const [tiedPlayers, setTiedPlayers] = useState<LocalPlayer[]>([])
  const [dayBannerText, setDayBannerText] = useState('')
  const [revealAllRoles, setRevealAllRoles] = useState(false)
  const [showRoleCard, setShowRoleCard] = useState(false)
  const [dibiaResult, setDibiaResult] = useState<{ targetName: string; result: 'citizen' | 'cabal' } | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [humanNightActionDone, setHumanNightActionDone] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const human = players.find(p => !p.isBot) ?? null

  const addNightAction = useCallback((action: NightAction) => setNightActions(p => [...p, action]), [])
  const addVote = useCallback((vote: Vote) => setVotes(p => [...p, vote]), [])
  const addMessage = useCallback((msg: Message) => setMessages(p => [...p, msg]), [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // ── Bot night actions ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'night') return
    const bots = players.filter(p => p.isBot && p.status === 'alive')
    const timers: ReturnType<typeof setTimeout>[] = []
    bots.forEach(bot => {
      const action = getBotNightAction(bot, players, round)
      if (action) {
        const t = setTimeout(() => addNightAction(action), BOT_NIGHT_DELAY())
        timers.push(t)
      }
    })
    return () => timers.forEach(clearTimeout)
  }, [phase, round]) // eslint-disable-line

  // ── Night timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'night') return
    nightResolvedRef.current = false
    setNightTimedOut(false)
    setNightTimer(30)
    setHumanNightActionDone(false)
    const iv = setInterval(() => {
      setNightTimer(t => {
        if (t <= 1) { clearInterval(iv); setNightTimedOut(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [phase, round]) // eslint-disable-line

  // ── Night resolution ───────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'night') return
    const alive = players.filter(p => p.status === 'alive')
    const expected = alive.filter(p => hasNightAction(p.role))
    const roundActions = nightActions.filter(a => a.round === round)
    const allActed = expected.every(a => roundActions.some(x => x.actorId === a.id))
    if (!allActed && !nightTimedOut) return
    if (nightResolvedRef.current) return
    nightResolvedRef.current = true

    let actionsToUse = nightActions
    if (human && human.status === 'alive' && hasNightAction(human.role) && !humanNightActionDone) {
      const auto = getBotNightAction(human, players, round)
      if (auto) actionsToUse = [...nightActions, auto]
    }

    const { updatedPlayers, nightLog: log } = resolveNight(players, actionsToUse, round)
    setPlayers(updatedPlayers)
    Sounds.elimination()

    const elim = log.find(l => l.type === 'elimination')
    const nepo = log.find(l => l.type === 'nepo_saved')
    if (nepo) setDayBannerText(NARRATOR.dayNepoBaby(nepo.agberoName ?? 'someone'))
    else if (elim) setDayBannerText(NARRATOR.dayEliminated(elim.playerName ?? ''))
    else setDayBannerText(NARRATOR.dayNobody)

    const win = checkWin(updatedPlayers)
    if (win) {
      setWinner(win); setRevealAllRoles(true)
      Sounds[win === 'citizens' ? 'citizensWin' : 'cabalWins']()
      setPhase('ended'); return
    }
    setPhase('night_result')
    const t = setTimeout(() => { setPhase('day'); Sounds.dayBreak() }, 3000)
    return () => clearTimeout(t)
  }, [nightActions, nightTimedOut, phase, round]) // eslint-disable-line

  // ── Day deliberation timer (60s fallback → auto-starts voting) ─────────────
  useEffect(() => {
    if (phase !== 'day') return
    setDayTimer(60)
    const iv = setInterval(() => {
      setDayTimer(t => {
        if (t <= 1) { clearInterval(iv); setPhase('voting'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [phase, round]) // eslint-disable-line

  // ── Bot chat during day ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'day') return
    const bots = players.filter(p => p.isBot && p.status === 'alive')
    const timers: ReturnType<typeof setTimeout>[] = []
    bots.forEach(bot => {
      const msgs = getBotChatMessages(bot, players)
      msgs.forEach((content, i) => {
        const t = setTimeout(() => addMessage({
          id: generateId(), playerId: bot.id, playerName: bot.displayName,
          content, phase: 'day', timestamp: Date.now(),
        }), BOT_CHAT_DELAY() + i * 9000)
        timers.push(t)
      })
    })
    return () => timers.forEach(clearTimeout)
  }, [phase, round]) // eslint-disable-line

  // ── Voting timer (30s) — auto-votes for human if they haven't voted ────────
  useEffect(() => {
    if (phase !== 'voting') return
    setVotingTimedOut(false)
    setVotingTimer(30)
    const iv = setInterval(() => {
      setVotingTimer(t => {
        if (t <= 1) { clearInterval(iv); setVotingTimedOut(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [phase, round]) // eslint-disable-line

  // ── Auto-vote for human when voting timer expires ──────────────────────────
  useEffect(() => {
    if (!votingTimedOut || phase !== 'voting') return
    if (!human || human.status !== 'alive') return
    const alreadyVoted = votes.some(v => v.voterId === human.id && v.round === round && v.voteNumber === 1)
    if (alreadyVoted) return
    const targets = players.filter(p => p.status === 'alive' && p.id !== human.id)
    if (targets.length === 0) return
    const target = targets[Math.floor(Math.random() * targets.length)]
    addVote({ voterId: human.id, targetId: target.id, round, voteNumber: 1 })
    Sounds.vote()
  }, [votingTimedOut, phase, votes, round]) // eslint-disable-line

  // ── Resolve elimination (ref-based to prevent stale closure) ──────────────
  const resolveElimRef = useRef<(el: LocalPlayer | null) => void>(() => {})
  useEffect(() => {
    resolveElimRef.current = (eliminated: LocalPlayer | null) => {
      setVoteEliminated(eliminated)
      let updatedPlayers = players
      if (eliminated) {
        Sounds.elimination()
        updatedPlayers = eliminatePlayer(players, eliminated.id)
        setPlayers(updatedPlayers)
        const win = checkWin(updatedPlayers)
        if (win) {
          setWinner(win); setRevealAllRoles(true)
          Sounds[win === 'citizens' ? 'citizensWin' : 'cabalWins']()
          setPhase('vote_result')
          setTimeout(() => setPhase('ended'), 4500)
          return
        }
      }
      setPhase('vote_result')
      setTimeout(() => {
        setRound(r => r + 1)
        setVoteEliminated(null); setTiedPlayers([])
        setDibiaResult(null); setHumanNightActionDone(false)
        setVotingTimedOut(false)
        setPhase('night'); Sounds.nightFall()
      }, 4000)
    }
  }, [players])

  // ── Bot voting ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'voting' && phase !== 'second_voting') return
    const voteNumber = phase === 'voting' ? 1 : 2
    const aliveBots = players.filter(p => p.isBot && p.status === 'alive')
    const timers: ReturnType<typeof setTimeout>[] = []
    aliveBots.forEach(bot => {
      const t = setTimeout(() => {
        let targetId: string
        if (phase === 'second_voting' && tiedPlayers.length > 0) {
          const pool = tiedPlayers.filter(p => p.id !== bot.id && p.status === 'alive')
          const src = pool.length > 0 ? pool : tiedPlayers
          targetId = src[Math.floor(Math.random() * src.length)].id
        } else {
          targetId = getBotVoteTarget(bot, players, votes, round)
        }
        addVote({ voterId: bot.id, targetId, round, voteNumber })
        Sounds.vote()
      }, BOT_VOTE_DELAY())
      timers.push(t)
    })
    return () => timers.forEach(clearTimeout)
  }, [phase, round, tiedPlayers]) // eslint-disable-line

  // ── First vote resolution ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'voting') return
    const alive = players.filter(p => p.status === 'alive')
    const rv = votes.filter(v => v.round === round && v.voteNumber === 1)
    if (rv.length < alive.length) return
    const { eliminated, tiedPlayers: tied } = resolveVote(players, votes, round, 1)
    if (tied.length > 1) { setTiedPlayers(tied); setPhase('second_voting'); return }
    resolveElimRef.current(eliminated ?? null)
  }, [votes, phase, round]) // eslint-disable-line

  // ── Second vote resolution ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'second_voting') return
    const alive = players.filter(p => p.status === 'alive')
    const rv = votes.filter(v => v.round === round && v.voteNumber === 2)
    if (rv.length < alive.length) return
    const { eliminated } = resolveVote(players, votes, round, 2)
    resolveElimRef.current(eliminated ?? null)
  }, [votes, phase, round]) // eslint-disable-line

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleHumanNightAction = (targetId: string) => {
    if (!human || humanNightActionDone) return
    const actionType = human.role === 'dibia' ? 'investigate' : human.role === 'soldier' ? 'protect' : 'eliminate'
    addNightAction({ actorId: human.id, actionType, targetId, round })
    setHumanNightActionDone(true)
    Sounds.click()
    if (human.role === 'dibia') {
      const target = players.find(p => p.id === targetId)
      if (target) setDibiaResult({ targetName: target.displayName, result: investigatePlayer(target) })
    }
  }

  const handleHumanVote = (targetId: string) => {
    if (!human) return
    const vNum = phase === 'second_voting' ? 2 : 1
    if (votes.some(v => v.voterId === human.id && v.round === round && v.voteNumber === vNum)) return
    addVote({ voterId: human.id, targetId, round, voteNumber: vNum })
    Sounds.vote()
  }

  const handleHumanChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !human || phase !== 'day') return
    addMessage({ id: generateId(), playerId: human.id, playerName: human.displayName, content: chatInput.trim(), phase: 'day', timestamp: Date.now() })
    setChatInput('')
  }

  const startVoting = () => {
    setPhase('voting')
    Sounds.wager()
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const humanHasVoted = (vNum: number) => human ? votes.some(v => v.voterId === human.id && v.round === round && v.voteNumber === vNum) : false
  const tally = (() => {
    const vNum = phase === 'second_voting' ? 2 : 1
    return votes.filter(v => v.round === round && v.voteNumber === vNum).reduce((a, v) => { a[v.targetId] = (a[v.targetId] ?? 0) + 1; return a }, {} as Record<string, number>)
  })()
  const maxVotes = Math.max(0, ...Object.values(tally))

  const nightNightAction = human ? hasNightAction(human.role) : false
  const nightTargets = human ? (
    (human.role === 'godfather' || human.role === 'agbero')
      ? players.filter(p => p.status === 'alive' && p.team !== 'cabal' && p.id !== human.id)
      : players.filter(p => p.status === 'alive' && p.id !== human.id)
  ) : []

  const wagerWon = wagerAvax > 0 && suspectName && winner !== null &&
    players.find(p => p.displayName === suspectName)?.team === 'cabal'

  const isNight = phase === 'night' || phase === 'night_result'
  const aliveCount = players.filter(p => p.status === 'alive').length

  // ── ROLE REVEAL ────────────────────────────────────────────────────────────
  if (phase === 'role_reveal' && human) {
    const isCabal = human.team === 'cabal'
    return (
      <div className="fixed inset-0 game-bg flex items-center justify-center p-4 z-50">
        <EmberParticles />
        <div className={`relative max-w-sm w-full rounded-3xl p-8 text-center bounce-in z-10 ${isCabal ? 'card-frame-cabal bg-[#180808]' : 'card-frame-citizen bg-[#061510]'}`}>
          <div className="absolute top-0 inset-x-0 h-1 kente-strip rounded-t-3xl" />
          <p className={`text-xs font-sans uppercase tracking-widest mb-5 ${isCabal ? 'text-[#C85A2A]' : 'text-[#C9A84C]'}`}>Your Role</p>
          <img src={CARD_IMAGES[human.role] ?? '/cards/Citizen.png'} alt={human.role}
            className="w-44 h-52 object-cover mx-auto rounded-2xl mb-5 shadow-2xl float"
            style={{ border: `3px solid ${isCabal ? '#8B1A1A' : '#1E4035'}` }} />
          <h2 className="font-display font-black text-3xl text-white mb-2" style={{ fontFamily: 'Fraunces, serif' }}>{ROLE_LABELS[human.role]}</h2>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-sans uppercase tracking-wider mb-5 ${isCabal ? 'bg-[#8B1A1A]/30 text-[#C85A2A]' : 'bg-[#1E4035]/30 text-[#C9A84C]'}`}>
            {isCabal ? 'The Cabal' : 'The Citizens'}
          </span>
          <button
            onClick={() => { Sounds.roleReveal(); setPhase('night'); Sounds.nightFall() }}
            className={`w-full py-4 rounded-xl font-sans font-bold text-white hover:-translate-y-0.5 transition-transform text-base ${isCabal ? 'bg-[#8B1A1A] hover:bg-[#A01A1A]' : 'bg-[#1E4035] hover:bg-[#2D5040]'}`}
          >
            I understand my role
          </button>
        </div>
      </div>
    )
  }

  // ── GAME ENDED ─────────────────────────────────────────────────────────────
  if (phase === 'ended') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${winner === 'citizens' ? 'bg-[#06140A]' : 'bg-[#140606]'}`}>
        <EmberParticles />
        <div className="relative z-10 max-w-lg w-full space-y-6 bounce-in">
          <div className="text-7xl mb-2">{winner === 'citizens' ? '⚖️' : '👁️'}</div>
          <h1 className="font-display font-black text-4xl shimmer-text" style={{ fontFamily: 'Fraunces, serif' }}>
            {winner === 'citizens' ? 'Justice Prevails' : 'The Cabal Wins'}
          </h1>
          <p className="font-display italic text-[#C9A84C]/80 text-base leading-relaxed" style={{ fontFamily: 'Fraunces, serif' }}>
            {winner === 'citizens' ? NARRATOR.citizensWin : NARRATOR.cabalWins}
          </p>

          {wagerAvax > 0 && (
            <div className={`rounded-2xl p-5 border ${wagerWon ? 'border-[#C9A84C]/40 bg-[#C9A84C]/8' : 'border-red-900/40 bg-red-900/8'}`}
              style={{ background: wagerWon ? 'rgba(201,168,76,0.08)' : 'rgba(139,26,26,0.08)' }}>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#C4B090] mb-2">Wager Result</p>
              <p className="font-display font-black text-2xl text-white mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                {wagerWon ? `🏆 ${wagerAvax} AVAX — You called it!` : `💸 ${wagerAvax} AVAX — Wrong suspect`}
              </p>
              <p className="text-sm text-[#C4B090] font-sans">
                You wagered on <span className="font-bold text-white">{suspectName}</span>.{' '}
                {wagerWon ? 'They were Cabal. Contact house@conquest.gg to claim winnings.' : 'They were not Cabal. The house retains the pot.'}
              </p>
            </div>
          )}

          <div>
            <p className="text-[10px] font-sans uppercase tracking-widest text-[#C4B090] mb-3">The Truth — All Roles Revealed</p>
            <div className="grid grid-cols-2 gap-3">
              {players.map(p => (
                <div key={p.id} className={`rounded-2xl overflow-hidden border flex gap-0 ${ROLE_TEAMS[p.role] === 'cabal' ? 'border-[#8B1A1A]/40' : 'border-[#1E4035]/40'}`}
                  style={{ background: ROLE_TEAMS[p.role] === 'cabal' ? 'rgba(139,26,26,0.15)' : 'rgba(30,64,53,0.15)' }}>
                  <img src={CARD_IMAGES[p.role] ?? '/cards/Citizen.png'} alt="" className="w-14 h-20 object-cover shrink-0" />
                  <div className="p-3 text-left flex flex-col justify-center">
                    <p className="text-white font-sans font-bold text-sm leading-tight">{p.displayName}</p>
                    <p className={`text-xs font-sans ${ROLE_TEAMS[p.role] === 'cabal' ? 'text-[#C85A2A]' : 'text-[#C9A84C]'}`}>{ROLE_LABELS[p.role]}</p>
                    {p.status === 'eliminated' && <p className="text-[10px] text-white/25 font-sans mt-0.5">Sent to Kuje</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => router.push('/')} className="w-full bg-[#C9A84C] text-[#1C1710] font-sans font-bold py-4 rounded-xl hover:bg-[#E8C46A] transition-all text-base hover:-translate-y-0.5">
            Play Again
          </button>
        </div>
      </div>
    )
  }

  // ── MAIN GAME UI ───────────────────────────────────────────────────────────
  return (
    <div className="game-bg min-h-screen relative pb-10">
      <EmberParticles />

      {/* Role peek overlay */}
      {showRoleCard && human && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowRoleCard(false)}>
          <div onClick={e => e.stopPropagation()} className={`max-w-xs w-full rounded-3xl p-6 text-center bounce-in ${human.team === 'cabal' ? 'card-frame-cabal bg-[#180808]' : 'card-frame-citizen bg-[#061510]'}`}>
            <p className="text-[10px] font-sans text-[#C4B090] uppercase tracking-widest mb-3">Your Role — Private</p>
            <img src={CARD_IMAGES[human.role] ?? '/cards/Citizen.png'} alt="" className="w-32 h-40 object-cover mx-auto rounded-xl mb-3 float" />
            <h3 className="font-display font-black text-2xl text-white mb-1" style={{ fontFamily: 'Fraunces, serif' }}>{ROLE_LABELS[human.role]}</h3>
            <p className={`text-xs font-sans ${human.team === 'cabal' ? 'text-[#C85A2A]' : 'text-[#C9A84C]'}`}>
              {human.team === 'cabal' ? '● The Cabal' : '● The Citizens'}
            </p>
            <button onClick={() => setShowRoleCard(false)} className="w-full mt-5 py-2.5 rounded-xl font-sans font-semibold text-sm text-white bg-white/10 hover:bg-white/20 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 border-b border-white/8" style={{ background: 'rgba(10,6,3,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{isNight ? '🌙' : phase === 'voting' || phase === 'second_voting' ? '⚖️' : '☀️'}</span>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-wider text-white/40 leading-none mb-0.5">
                {isNight ? 'Night Phase'
                  : phase === 'day' ? 'Deliberation'
                  : phase === 'voting' ? 'Cast Your Vote'
                  : phase === 'second_voting' ? 'Re-vote — Tied'
                  : 'Verdict'}
              </p>
              <p className="text-sm font-display font-bold text-white leading-none" style={{ fontFamily: 'Fraunces, serif' }}>Round {round}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase === 'night' && <CountdownRing seconds={nightTimer} total={30} />}
            {phase === 'voting' && <CountdownRing seconds={votingTimer} total={30} />}

            {human && human.status === 'alive' && (
              <button onClick={() => setShowRoleCard(true)}
                className="text-[11px] font-sans font-bold border border-[#C9A84C]/40 text-[#C9A84C] px-3 py-1.5 rounded-full hover:bg-[#C9A84C]/10 transition-colors">
                My Role
              </button>
            )}

            {wagerAvax > 0 && (
              <div className="flex items-center gap-1.5 bg-[#C9A84C]/12 border border-[#C9A84C]/25 rounded-full px-3 py-1.5"
                style={{ background: 'rgba(201,168,76,0.12)' }}>
                <span className="text-sm">💰</span>
                <span className="text-xs font-sans font-bold text-[#C9A84C]">{wagerAvax} AVAX</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-5 space-y-4 relative z-10">

        {/* ── Night / Night-result banner ── */}
        {isNight && (
          <div className="rounded-2xl p-4 border border-[#C9A84C]/15" style={{ background: 'rgba(18,10,4,0.7)' }}>
            <p className="font-display italic text-[#C9A84C]/70 text-sm leading-relaxed" style={{ fontFamily: 'Fraunces, serif' }}>
              {phase === 'night_result' ? `📜 ${dayBannerText}` : `🌙 ${NARRATOR.nightBanner}`}
            </p>
          </div>
        )}

        {/* ── Day morning report banner ── */}
        {phase === 'day' && dayBannerText && (
          <div className="rounded-2xl p-4 border border-[#C9A84C]/25" style={{ background: 'rgba(201,168,76,0.07)' }}>
            <p className="font-display italic text-[#C9A84C] text-sm leading-relaxed" style={{ fontFamily: 'Fraunces, serif' }}>📜 {dayBannerText}</p>
          </div>
        )}

        {/* ── Vote result ── */}
        {phase === 'vote_result' && (
          <div className="rounded-2xl p-5 border text-center fade-in" style={{ background: 'rgba(139,26,26,0.12)', borderColor: 'rgba(200,90,42,0.25)' }}>
            {voteEliminated ? (
              <>
                <p className="font-display font-black text-xl text-white mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
                  {NARRATOR.voteResult(voteEliminated.displayName)}
                </p>
                <p className={`text-sm font-sans mt-1 ${ROLE_TEAMS[voteEliminated.role] === 'cabal' ? 'text-[#C85A2A]' : 'text-[#C9A84C]'}`}>
                  {voteEliminated.displayName} was <span className="font-bold">{ROLE_LABELS[voteEliminated.role]}</span>
                  {ROLE_TEAMS[voteEliminated.role] === 'cabal' ? ' — ⚖️ Justice served!' : ' — an innocent citizen.'}
                </p>
              </>
            ) : (
              <p className="font-display font-black text-xl text-white" style={{ fontFamily: 'Fraunces, serif' }}>
                The vote was tied — no one goes to Kuje today.
              </p>
            )}
            <p className="text-xs text-white/30 font-sans mt-3">Night falls again…</p>
          </div>
        )}

        {/* ── Second vote banner ── */}
        {phase === 'second_voting' && (
          <div className="rounded-2xl p-3 border border-[#C9A84C]/25 text-center" style={{ background: 'rgba(201,168,76,0.06)' }}>
            <p className="text-sm font-sans font-semibold text-[#C9A84C]">⚖️ Tie broken — Vote between tied suspects only</p>
          </div>
        )}

        {/* ── Dibia investigation result (private) ── */}
        {dibiaResult && human?.role === 'dibia' && (isNight || phase === 'day') && (
          <div className="rounded-xl border border-[#C9A84C]/25 p-3 flex items-center gap-3" style={{ background: 'rgba(201,168,76,0.06)' }}>
            <span className="text-xl">🔮</span>
            <p className="text-sm font-sans text-white">
              Investigation: <span className="font-bold">{dibiaResult.targetName}</span> is{' '}
              <span className={`font-bold ${dibiaResult.result === 'cabal' ? 'text-[#C85A2A]' : 'text-[#C9A84C]'}`}>
                {dibiaResult.result === 'cabal' ? 'CABAL' : 'a Citizen'}
              </span>
            </p>
          </div>
        )}

        {/* ── Human night action UI ── */}
        {phase === 'night' && human && human.status === 'alive' && nightNightAction && !humanNightActionDone && (
          <div className="rounded-2xl border border-[#C85A2A]/25 p-5 space-y-3" style={{ background: 'rgba(139,26,26,0.12)' }}>
            <p className="text-xs font-sans uppercase tracking-widest text-[#C85A2A] font-bold">
              {human.role === 'dibia' ? '🔮 Investigate a player' : human.role === 'soldier' ? '🛡️ Choose who to protect' : '🗡️ Choose your target tonight'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {nightTargets.map(p => (
                <button key={p.id} onClick={() => handleHumanNightAction(p.id)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 hover:border-[#C85A2A]/50 hover:bg-[#C85A2A]/10 transition-all text-left group">
                  <img src="/cards/Citizen.png" alt="" className="w-8 h-10 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform" />
                  <span className="font-sans text-sm font-semibold text-white">{p.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'night' && human && human.status === 'alive' && !nightNightAction && (
          <div className="rounded-2xl border border-white/8 p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-4xl mb-3">😴</div>
            <p className="font-display italic text-[#C4B090]" style={{ fontFamily: 'Fraunces, serif' }}>Night has fallen. The village sleeps.</p>
            <p className="text-xs text-[#C4B090]/40 font-sans mt-1.5">The Cabal is moving in the shadows. Wait for morning.</p>
          </div>
        )}

        {phase === 'night' && humanNightActionDone && (
          <div className="rounded-xl border border-[#1E4035]/40 p-4 text-center" style={{ background: 'rgba(30,64,53,0.12)' }}>
            <p className="text-sm font-sans text-[#C9A84C]">✓ Action submitted — waiting for others&hellip;</p>
          </div>
        )}

        {/* ── Player grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {players.map(p => {
            const isHuman = p.id === human?.id
            const isElim = p.status === 'eliminated'
            const votesForPlayer = tally[p.id] ?? 0
            const isLeading = votesForPlayer === maxVotes && votesForPlayer > 0 && (phase === 'voting' || phase === 'second_voting')
            const cardImg = revealAllRoles ? (CARD_IMAGES[p.role] ?? '/cards/Citizen.png') : isHuman ? (CARD_IMAGES[p.role] ?? '/cards/Citizen.png') : '/cards/Citizen.png'
            const inVotePool = phase !== 'second_voting' || tiedPlayers.some(t => t.id === p.id)
            const humanVoteNum = phase === 'second_voting' ? 2 : 1
            const canVote = (phase === 'voting' || phase === 'second_voting') && !isHuman && !isElim && !humanHasVoted(humanVoteNum) && inVotePool && human?.status === 'alive'
            const alreadyVotedFor = humanHasVoted(humanVoteNum) && tally[p.id] > 0 && votes.find(v => v.voterId === human?.id && v.round === round && v.voteNumber === humanVoteNum)?.targetId === p.id

            return (
              <div key={p.id} className={`relative rounded-2xl overflow-hidden border transition-all flex flex-col min-h-[190px] ${
                isElim ? 'opacity-35 border-white/8 grayscale' :
                alreadyVotedFor ? 'border-[#C85A2A] shadow-lg shadow-[#C85A2A]/20' :
                isLeading ? 'border-[#C85A2A]/60 shadow-[#C85A2A]/15 shadow-md' :
                isHuman ? 'border-[#C9A84C]/45' : 'border-white/10'
              }`} style={{ background: isElim ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)' }}>

                {isHuman && !isElim && (
                  <div className="absolute top-2 left-2 z-10 text-[9px] font-sans font-bold uppercase tracking-wider text-[#C9A84C] bg-[#C9A84C]/15 px-2 py-0.5 rounded-full">You</div>
                )}
                {alreadyVotedFor && (
                  <div className="absolute top-2 right-2 z-10 text-[9px] font-sans font-bold text-white bg-[#C85A2A] px-2 py-0.5 rounded-full">Your vote</div>
                )}
                {isLeading && !alreadyVotedFor && !isElim && (
                  <div className="absolute top-2 right-2 z-10 text-[9px] font-sans font-bold text-[#C85A2A]">🎯 {votesForPlayer}</div>
                )}

                <img src={cardImg} alt={p.displayName} className="w-full h-28 object-cover object-top" />

                <div className="p-3 flex-1 flex flex-col gap-1">
                  <p className={`font-sans font-bold text-sm leading-tight ${isElim ? 'line-through text-white/25' : 'text-white'}`}>
                    {p.displayName}
                  </p>
                  {revealAllRoles && (
                    <span className={`text-[10px] font-sans font-semibold ${ROLE_TEAMS[p.role] === 'cabal' ? 'text-[#C85A2A]' : 'text-[#C9A84C]'}`}>
                      {ROLE_LABELS[p.role]}
                    </span>
                  )}
                  {isElim && <span className="text-[9px] text-white/25 font-sans uppercase tracking-widest">Sent to Kuje</span>}
                  {!isElim && !isHuman && <span className="text-[10px] text-white/15 font-sans">🤖 bot</span>}
                </div>

                {canVote && (
                  <button onClick={() => handleHumanVote(p.id)}
                    className="w-full bg-[#C85A2A] text-white font-sans font-bold text-xs py-2.5 hover:bg-[#E8784A] transition-colors">
                    Vote Out
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* ── DAY DELIBERATION panel ── */}
        {phase === 'day' && (
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
              <span className="text-xs font-sans font-bold text-white/50 uppercase tracking-wider">🏛 Village Square</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans text-[#C9A84C] font-semibold">{dayTimer}s</span>
                <span className="text-[10px] text-white/30 font-sans">left to deliberate</span>
              </div>
            </div>

            <div className="h-52 overflow-y-auto p-4 space-y-3">
              {messages.filter(m => m.phase === 'day').map(m => {
                const isMe = m.playerId === human?.id
                return (
                  <div key={m.id} className={`flex gap-2 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0`}
                      style={{ background: isMe ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.08)' }}>
                      {isMe ? '👤' : '🤖'}
                    </div>
                    <div className={`max-w-[72%] rounded-2xl px-3.5 py-2 ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                      style={{ background: isMe ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.08)' }}>
                      <p className="text-[10px] font-sans font-semibold text-white/35 mb-0.5">{m.playerName}</p>
                      <p className="text-sm font-sans text-white/90 leading-snug">{m.content}</p>
                    </div>
                  </div>
                )
              })}
              {messages.filter(m => m.phase === 'day').length === 0 && (
                <p className="text-center text-xs font-sans italic text-white/20 pt-4">The village is quiet… for now.</p>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleHumanChat} className="border-t border-white/8 flex gap-2 p-3">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                placeholder="Speak your mind in the village square…"
                className="flex-1 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#C9A84C]/40 border border-white/10 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }} />
              <button type="submit" disabled={!chatInput.trim()}
                className="bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] font-sans font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-30 hover:bg-[#C9A84C]/30 transition-colors">
                Send
              </button>
            </form>
          </div>
        )}

        {/* ── READY TO VOTE button (day phase) ── */}
        {phase === 'day' && (
          <div className="space-y-2">
            <button onClick={startVoting}
              className="w-full py-4 rounded-2xl font-sans font-bold text-base text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #C85A2A, #8B1A1A)', boxShadow: '0 4px 24px rgba(200,90,42,0.35)' }}>
              ⚖️ Ready to Vote — Name the Agbero
            </button>
            <p className="text-center text-[10px] font-sans text-white/25">
              All players vote simultaneously. Timer auto-starts voting in {dayTimer}s.
            </p>
          </div>
        )}

        {/* ── VOTING phase UI ── */}
        {(phase === 'voting' || phase === 'second_voting') && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#C85A2A]/25 p-4 text-center" style={{ background: 'rgba(139,26,26,0.10)' }}>
              <p className="font-display font-black text-lg text-white mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
                {NARRATOR.voteCall}
              </p>
              {human && human.status === 'alive' && !humanHasVoted(phase === 'second_voting' ? 2 : 1) && (
                <p className="text-sm font-sans text-[#C85A2A] mt-2">
                  👆 Tap <strong>Vote Out</strong> on the suspect above — {votingTimer}s remaining
                </p>
              )}
              {human && human.status === 'alive' && humanHasVoted(phase === 'second_voting' ? 2 : 1) && (
                <p className="text-sm font-sans text-[#C9A84C] mt-2">✓ Your vote is cast. Waiting for others…</p>
              )}
              {human?.status === 'eliminated' && (
                <p className="text-sm font-sans text-white/40 mt-2 italic">You have been eliminated. Watch in silence.</p>
              )}
            </div>

            {/* Live vote tally */}
            <div className="rounded-xl border border-white/8 p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] font-sans uppercase tracking-wider text-white/30 font-bold">Live Tally</p>
              {players.filter(p => p.status === 'alive').map(p => {
                const count = tally[p.id] ?? 0
                const pct = aliveCount > 0 ? (count / aliveCount) * 100 : 0
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-xs font-sans text-white/60 w-24 truncate">{p.displayName}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full bg-[#C85A2A] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-sans font-bold text-white/50 w-4">{count}</span>
                  </div>
                )
              })}
            </div>

            {/* Chat replay (read-only during voting) */}
            {messages.filter(m => m.phase === 'day').length > 0 && (
              <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="px-4 py-2 border-b border-white/8 flex items-center gap-2">
                  <span className="text-[10px] font-sans font-bold text-white/30 uppercase tracking-wider">🔇 Chat locked — deliberation over</span>
                </div>
                <div className="h-28 overflow-y-auto p-3 space-y-2">
                  {messages.filter(m => m.phase === 'day').map(m => (
                    <div key={m.id} className="flex gap-2">
                      <span className="text-[10px] font-sans text-white/30 shrink-0">{m.playerName}:</span>
                      <span className="text-[10px] font-sans text-white/50 leading-snug">{m.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Night silence */}
        {isNight && (
          <p className="text-center text-xs font-sans italic text-white/15 py-2">The village is silent. Things are happening in the dark.</p>
        )}
      </div>
    </div>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="game-bg min-h-screen" />}>
      <GamePageInner />
    </Suspense>
  )
}

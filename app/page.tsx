'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useWriteContract } from 'wagmi'
import { parseEther, stringToHex, padHex } from 'viem'
import { generateRoomCode } from '@/lib/game/engine'
import { Sounds } from '@/lib/sounds'
import WalletButton from '@/components/platform/WalletButton'

const BOT_NAMES = ['Oga Bot', 'Madam Winifred', 'Sen. K.K.']
const BOT_ADDRESSES: Record<string, `0x${string}`> = {
  'Oga Bot':         '0x000000000000000000000000000000000000000A',
  'Madam Winifred':  '0x000000000000000000000000000000000000000B',
  'Sen. K.K.':       '0x000000000000000000000000000000000000000C',
}
const WAGER_ADDRESS = '0x7C1B5Ec310f28883B97c16dc822178B67285fbD6' as `0x${string}`
const WAGER_ABI = [
  {
    name: 'createWager',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'gameId', type: 'bytes32' },
      { name: 'targetPlayer', type: 'address' },
    ],
    outputs: [],
  },
] as const

const COMING_SOON = [
  { title: 'Ludo Splash', tag: 'Strategy / 2–4 Players', tagline: 'The board is back. The beef is real.', emoji: '🎲' },
  { title: "Schrödinger's Cat", tag: 'Mind Game / 3–8 Players', tagline: 'Alive. Dead. Both. Neither. You decide.', emoji: '🐱' },
  { title: 'Ọwọ Ni Kọkọ', tag: 'Negotiation / 4–10 Players', tagline: 'Money first. Trust later. Maybe.', emoji: '💰' },
  { title: 'Police Catch Thief', tag: 'Chase / 4–12 Players', tagline: 'Run. Hide. Or switch sides.', emoji: '🚔' },
  { title: 'Ayò', tag: 'Strategy / 2 Players', tagline: 'Ancient strategy. Modern warfare.', emoji: '⚫' },
  { title: 'The Hunt', tag: 'Adventure / 4–20 Players', tagline: 'Something is out there. So are you.', emoji: '🌿' },
  { title: '[CLASSIFIED]', tag: '???', tagline: "We're not ready to talk about this one yet.", emoji: '?' },
]

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const total = 3200
    const frame = () => {
      const elapsed = Date.now() - start
      const pct = Math.min(elapsed / total, 1)
      setProgress(pct)
      if (pct < 0.35) setPhase(0)
      else if (pct < 0.75) setPhase(1)
      else setPhase(2)
      if (pct < 1) requestAnimationFrame(frame)
      else setTimeout(onDone, 300)
    }
    requestAnimationFrame(frame)
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #2A1A08 0%, #12090300 40%, #0D0804 100%)', backgroundColor: '#0D0804' }}
    >
      {/* Floating character silhouettes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {phase >= 1 && (
          <>
            <img src="/cards/GodFather.png" alt="" className="absolute bottom-0 right-[15%] w-48 opacity-20 fade-slide-up"
              style={{ animationDelay: '0.1s', filter: 'brightness(0.4) sepia(1) hue-rotate(20deg)' }} />
            <img src="/cards/Agbero.png" alt="" className="absolute bottom-0 left-[10%] w-36 opacity-15 fade-slide-up"
              style={{ animationDelay: '0.3s', filter: 'brightness(0.3) sepia(1) hue-rotate(20deg)' }} />
            <img src="/cards/Dibia.png" alt="" className="absolute bottom-0 right-[5%] w-32 opacity-12 fade-slide-up"
              style={{ animationDelay: '0.5s', filter: 'brightness(0.3) sepia(1) hue-rotate(20deg)' }} />
          </>
        )}
      </div>

      {/* Logo */}
      <div className="relative z-10 text-center space-y-4 fade-slide-up">
        <img src="/Conquest_Logo.jpg" alt="Conquest" className="w-56 h-auto mx-auto float drop-shadow-2xl" />

        {phase >= 2 && (
          <p className="font-display italic text-xl text-[#C9A84C]/80 fade-in" style={{ fontFamily: 'Fraunces, serif' }}>
            &ldquo;Welcome. Let&apos;s play games and build bonds.&rdquo;
          </p>
        )}
      </div>

      {/* Kente progress bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress * 100}%`,
              background: 'repeating-linear-gradient(90deg, #C85A2A 0px, #C85A2A 16px, #C9A84C 16px, #C9A84C 32px, #1E4035 32px, #1E4035 48px, #C9A84C 48px, #C9A84C 64px)',
            }}
          />
        </div>
        <p className="text-center text-xs text-white/30 mt-3 uppercase tracking-widest font-sans">Loading the settlement&hellip;</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { isConnected, address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const [showSplash, setShowSplash] = useState(true)
  const [name, setName] = useState('')
  const [wagerAvax, setWagerAvax] = useState('')
  const [suspectIndex, setSuspectIndex] = useState(0)
  const [wagerLoading, setWagerLoading] = useState(false)
  const [showHowTo, setShowHowTo] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const startTestMode = async () => {
    Sounds.click()
    const playerName = name.trim() || 'Player'
    const roomCode = generateRoomCode()
    const avax = parseFloat(wagerAvax) || 0

    let wagerParams = ''
    if (avax > 0 && isConnected) {
      setWagerLoading(true)
      try {
        const gameId = padHex(stringToHex(roomCode), { size: 32 }) as `0x${string}`
        const suspectAddress = BOT_ADDRESSES[BOT_NAMES[suspectIndex]]
        await writeContractAsync({
          address: WAGER_ADDRESS,
          abi: WAGER_ABI,
          functionName: 'createWager',
          args: [gameId, suspectAddress],
          value: parseEther(avax.toString()),
        })
        Sounds.wager()
        wagerParams = `&wagerAvax=${avax}&suspectName=${encodeURIComponent(BOT_NAMES[suspectIndex])}`
      } catch {
        showToast('Wager cancelled. Starting without wager.')
      } finally {
        setWagerLoading(false)
      }
    }

    router.push(`/game/${roomCode}?mode=test&name=${encodeURIComponent(playerName)}${wagerParams}`)
  }

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-ink text-parchment px-5 py-3 rounded-xl text-sm font-sans shadow-xl bounce-in">
          {toastMsg}
        </div>
      )}

      {/* How To Play modal */}
      {showHowTo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm" onClick={() => setShowHowTo(false)}>
          <div className="relative bg-[#FBF6EE] rounded-3xl max-w-2xl w-full p-8 shadow-2xl card-frame" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowHowTo(false)} className="absolute top-4 right-4 text-ink/40 hover:text-ink text-2xl leading-none">×</button>
            <div className="kente-strip rounded-full mb-6" />
            <h2 className="font-display text-3xl font-black text-ink mb-2" style={{ fontFamily: 'Fraunces, serif' }}>How to Play Cabal</h2>
            <p className="font-display italic text-[#C9A84C] mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
              &ldquo;In the settlement, power moves in silence.&rdquo;
            </p>
            <div className="space-y-4 font-sans text-sm text-[#6B5A42]">
              {[
                ['🌙 Night Phase', 'The Cabal strikes under cover of darkness. Citizens sleep — the Godfather picks a target. The Dibia investigates. No one speaks.'],
                ['☀️ Day Phase', 'Morning breaks. An announcement is made. 90 seconds of open debate — accuse, defend, deflect. Chat is live.'],
                ['🗳️ Voting', 'The village votes someone out. Most votes sends them to Kuje. Ties trigger a second vote. Second tie: nobody goes.'],
                ['🏆 Win Condition', 'Citizens win if all Cabal are eliminated. Cabal wins when their numbers match the citizens remaining.'],
                ['💰 The Wager', 'Connect your wallet before the game. Pick who you think is Cabal. Lock AVAX. Win the pot if you\'re right.'],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3">
                  <span className="text-lg shrink-0">{title.split(' ')[0]}</span>
                  <div>
                    <p className="font-semibold text-ink text-xs uppercase tracking-wider mb-1">{title.slice(2)}</p>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 kente-strip rounded-full" />
          </div>
        </div>
      )}

      <div className={`min-h-screen transition-opacity duration-500 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        {/* Nav */}
        <nav className="sticky top-0 z-30 bg-[#F5EDDA]/95 backdrop-blur-sm border-b border-[#C9A84C]/20">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/Conquest_Logo.jpg" alt="Conquest" className="h-9 w-auto" />
              <span className="font-display font-black text-xl text-ink tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>Conquest</span>
            </div>
            <div className="hidden md:flex items-center gap-1 bg-[#EDE0C4] rounded-full px-1 py-1">
              {['Games', 'Friends', 'Leaderboard'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    Sounds.click()
                    router.push(tab === 'Games' ? '/' : `/${tab.toLowerCase()}`)
                  }}
                  className="px-4 py-1.5 rounded-full text-sm font-sans font-medium text-[#6B5A42] hover:bg-[#FBF6EE] hover:text-ink transition-all"
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-[#1E4035]/10 text-[#1E4035] rounded-full px-3 py-1.5 text-xs font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1E4035] animate-pulse" />
                Avalanche Fuji
              </div>
              <WalletButton />
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#EDE0C4]">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }} />

          <div className="max-w-7xl mx-auto px-6 py-10 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Text + CTAs */}
              <div className="space-y-6 fade-slide-up">
                <div className="inline-flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C85A2A] animate-pulse" />
                  <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#C85A2A]">Now Playing</span>
                </div>

                <div>
                  <h1 className="font-display font-black text-[80px] leading-none tracking-tight text-ink" style={{ fontFamily: 'Fraunces, serif', textShadow: '2px 4px 0 rgba(201,168,76,0.2)' }}>
                    CABAL
                  </h1>
                  <p className="font-display italic text-2xl text-[#C85A2A] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
                    You Go Do Jail
                  </p>
                  <p className="font-sans text-[#6B5A42] mt-3 text-base leading-relaxed max-w-md">
                    A social deduction game of power, politics, and settlement. Trust no one. The Cabal is already inside.
                  </p>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => { Sounds.click(); document.getElementById('play-section')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className="bg-[#C85A2A] text-white font-sans font-bold px-8 py-3.5 rounded-xl hover:bg-[#E8784A] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#C85A2A]/30"
                  >
                    Play Now
                  </button>
                  <button
                    onClick={() => { Sounds.click(); setShowHowTo(true) }}
                    className="border-2 border-[#C9A84C] text-[#C9A84C] font-sans font-bold px-8 py-3.5 rounded-xl hover:bg-[#C9A84C]/10 transition-all"
                  >
                    How to Play
                  </button>
                </div>

                <p className="text-xs font-sans text-[#C4B090]">Played by 500+ at Gameverse &amp; OyaMakeWeGroove</p>

                {/* Mode pills */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { emoji: '🤖', label: 'Test Mode', sub: 'Solo + Bots', available: true },
                    { emoji: '🎭', label: 'Classic Mode', sub: '4 Players', available: false },
                    { emoji: '👑', label: 'Full Mode', sub: '5+ Players', available: false },
                  ].map((m) => (
                    <button
                      key={m.label}
                      onClick={() => { Sounds.click(); if (!m.available) showToast('Coming soon!'); else document.getElementById('play-section')?.scrollIntoView({ behavior: 'smooth' }) }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-semibold border transition-all ${
                        m.available
                          ? 'border-[#C9A84C] bg-[#C9A84C]/15 text-ink hover:bg-[#C9A84C]/25'
                          : 'border-ink/10 text-[#C4B090] opacity-60'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                      <span className="text-[10px] opacity-60">— {m.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Character art */}
              <div className="relative hidden lg:flex justify-center items-end h-72">
                <img src="/cards/GodFather.png" alt="Godfather" className="absolute bottom-0 right-16 h-64 object-contain float drop-shadow-2xl" style={{ animationDelay: '0s' }} />
                <img src="/cards/Agbero.png" alt="Agbero" className="absolute bottom-0 left-8 h-52 object-contain float opacity-80 drop-shadow-xl" style={{ animationDelay: '1s' }} />
                <img src="/cards/Dibia.png" alt="Dibia" className="absolute bottom-0 right-4 h-44 object-contain float opacity-70 drop-shadow-xl" style={{ animationDelay: '2s' }} />
              </div>
            </div>
          </div>
          <div className="kente-strip" />
        </section>

        {/* Play section */}
        <section id="play-section" className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* Test Mode card */}
            <div className="card-frame bg-[#FBF6EE] p-8 space-y-6 fade-slide-up">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-sans font-bold uppercase tracking-[0.18em] text-[#C9A84C]">🤖 Test Mode</span>
                  <h2 className="font-display font-black text-3xl text-ink mt-1" style={{ fontFamily: 'Fraunces, serif' }}>Solo + Con-Bots</h2>
                  <p className="font-sans text-sm text-[#6B5A42] mt-2">Jump in instantly. You + 3 bots. Full game loop, no waiting.</p>
                </div>
                <div className="flex gap-1">
                  {['/cards/Agbero.png', '/cards/GodFather.png', '/cards/Dibia.png'].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-10 h-10 object-cover rounded-full border-2 border-[#EDE0C4]" style={{ marginLeft: i > 0 ? '-8px' : 0 }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#6B5A42] mb-2">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startTestMode()}
                  placeholder="Enter your name..."
                  maxLength={20}
                  className="w-full bg-white border border-[#C9A84C]/30 rounded-xl px-4 py-3 font-sans text-sm text-ink placeholder-[#C4B090] outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>

              {/* Wager section — only if wallet connected */}
              {isConnected && (
                <div className="border border-[#C9A84C]/30 rounded-2xl p-5 space-y-4 bg-[#C9A84C]/5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <div>
                      <p className="font-sans font-bold text-sm text-ink">Place a Wager</p>
                      <p className="text-xs text-[#6B5A42]">Lock AVAX on who you think is Cabal</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-sans font-bold text-[#6B5A42] uppercase tracking-wider mb-1.5">AVAX Amount</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={wagerAvax}
                        onChange={e => setWagerAvax(e.target.value)}
                        placeholder="0.1"
                        className="w-full bg-white border border-[#C9A84C]/30 rounded-xl px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-[#C9A84C]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans font-bold text-[#6B5A42] uppercase tracking-wider mb-1.5">Cabal Suspect</label>
                      <select
                        value={suspectIndex}
                        onChange={e => setSuspectIndex(Number(e.target.value))}
                        className="w-full bg-white border border-[#C9A84C]/30 rounded-xl px-3 py-2.5 font-sans text-sm text-ink outline-none focus:border-[#C9A84C]"
                      >
                        {BOT_NAMES.map((n, i) => <option key={n} value={i}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  {parseFloat(wagerAvax) > 0 && (
                    <p className="text-xs text-[#6B5A42] font-sans">
                      Wagering <span className="font-bold text-[#C9A84C]">{wagerAvax} AVAX</span> on{' '}
                      <span className="font-bold text-ink">{BOT_NAMES[suspectIndex]}</span> — locked until game ends.
                    </p>
                  )}
                  <p className="text-[10px] text-[#C4B090] font-sans">
                    Wallet: {address?.slice(0, 6)}…{address?.slice(-4)} · Fuji Testnet
                  </p>
                </div>
              )}

              {!isConnected && (
                <div className="border border-dashed border-[#C9A84C]/40 rounded-2xl p-4 text-center">
                  <p className="text-xs font-sans text-[#6B5A42]">
                    <span className="text-[#C9A84C] font-bold">Connect wallet</span> to place a wager on who you think is Cabal
                  </p>
                </div>
              )}

              <button
                onClick={startTestMode}
                disabled={wagerLoading}
                className="w-full bg-[#C85A2A] text-white font-sans font-bold py-4 rounded-xl hover:bg-[#E8784A] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#C85A2A]/30 disabled:opacity-60 disabled:pointer-events-none text-base"
              >
                {wagerLoading ? 'Confirming wager…' : parseFloat(wagerAvax) > 0 && isConnected ? `Wager ${wagerAvax} AVAX & Start →` : 'Start Test Mode →'}
              </button>
            </div>

            {/* Classic Mode — locked */}
            <div className="card-frame bg-[#FBF6EE] p-8 space-y-5 opacity-50 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#6B5A42] text-white text-[10px] font-sans font-bold uppercase tracking-wider px-3 py-1 rounded-full">Coming Soon</div>
              <span className="text-xs font-sans font-bold uppercase tracking-[0.18em] text-[#6B5A42]">🎭 Classic Mode</span>
              <h2 className="font-display font-black text-3xl text-ink" style={{ fontFamily: 'Fraunces, serif' }}>4–7 Players</h2>
              <p className="font-sans text-sm text-[#6B5A42]">Create a room, share the code, play with real people in real time. Wagers, full roles, Supabase Realtime sync.</p>
              <div className="grid grid-cols-3 gap-3">
                {['/cards/Citizen.png', '/cards/Soldier.png', '/cards/Whistleblower.png'].map((src, i) => (
                  <img key={i} src={src} alt="" className="w-full h-24 object-cover rounded-xl opacity-60" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon catalogue */}
        <section className="border-t border-[#C9A84C]/15 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display font-black text-2xl text-ink mb-2" style={{ fontFamily: 'Fraunces, serif' }}>More Games Coming to Conquest</h2>
            <p className="text-sm font-sans text-[#6B5A42] mb-6">The settlement is growing. Stay tuned.</p>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {COMING_SOON.map((game) => (
                <button
                  key={game.title}
                  onClick={() => { Sounds.click(); showToast('This game is on its way. Stay tuned.') }}
                  className="shrink-0 w-44 card-frame bg-[#FBF6EE] p-4 text-left hover:scale-105 transition-transform relative overflow-hidden opacity-70 hover:opacity-90"
                >
                  <div className="absolute top-2 right-2 rotate-12 bg-[#6B5A42]/80 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Soon</div>
                  <div className="text-3xl mb-3">{game.emoji}</div>
                  <p className="font-display font-bold text-sm text-ink leading-tight mb-1" style={{ fontFamily: 'Fraunces, serif' }}>{game.title}</p>
                  <p className="text-[10px] font-sans text-[#C4B090] uppercase tracking-wider mb-2">{game.tag}</p>
                  <p className="font-display italic text-xs text-[#6B5A42]" style={{ fontFamily: 'Fraunces, serif' }}>&ldquo;{game.tagline}&rdquo;</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#C9A84C]/15 py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/Conquest_Logo.jpg" alt="Conquest" className="h-7 w-auto" />
              <span className="text-xs text-[#C4B090] font-sans">by Yelobyte Studios</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-sans text-[#C4B090]">
              <a href="https://testnet.snowtrace.io/address/0x7C1B5Ec310f28883B97c16dc822178B67285fbD6" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A84C] transition-colors">
                Contract on Snowtrace ↗
              </a>
              <span>Avalanche Fuji Testnet</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

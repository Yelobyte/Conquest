'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateRoomCode } from '@/lib/game/engine'
import WalletButton from '@/components/platform/WalletButton'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')

  const startTestMode = () => {
    const playerName = name.trim() || 'Player'
    const roomCode = generateRoomCode()
    router.push(`/game/${roomCode}?mode=test&name=${encodeURIComponent(playerName)}`)
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
        <h1 className="font-display text-2xl font-bold text-ink tracking-tight">Conquest</h1>
        <WalletButton />
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="space-y-3">
            <h2 className="font-display text-4xl font-bold text-ink leading-tight">
              Play Cabal
            </h2>
            <p className="font-sans text-ink-muted text-base leading-relaxed">
              Social deduction. Political satire. Someone at this table is Cabal — and it might be you.
            </p>
          </div>

          {/* Test Mode card */}
          <div className="rounded-2xl border-2 border-gold bg-gold/10 p-6 space-y-4 text-left">
            <div>
              <span className="text-xs font-sans uppercase tracking-widest text-gold font-semibold">
                Test Mode
              </span>
              <h3 className="font-display text-xl font-bold text-ink mt-1">
                Solo + 3 Bots
              </h3>
              <p className="font-sans text-sm text-ink-muted mt-1">
                Play the full Cabal game loop instantly. No waiting for other players.
              </p>
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold text-ink-muted uppercase tracking-widest mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startTestMode()}
                placeholder="Enter your name..."
                maxLength={20}
                className="w-full bg-parchment border border-ink/20 rounded-xl px-4 py-3 font-sans text-sm text-ink placeholder-ink/30 outline-none focus:border-gold transition-colors"
              />
            </div>

            <button
              onClick={startTestMode}
              className="w-full bg-terracotta text-parchment font-sans font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              Start Test Mode →
            </button>
          </div>

          {/* Classic mode — coming in branch 2 */}
          <div className="rounded-2xl border-2 border-ink/10 p-6 text-left opacity-50">
            <span className="text-xs font-sans uppercase tracking-widest text-ink-muted font-semibold">
              Classic Mode
            </span>
            <h3 className="font-display text-xl font-bold text-ink mt-1">
              4–7 Players · Room Code
            </h3>
            <p className="font-sans text-sm text-ink-muted mt-1">
              Create a room, share the code, play with real people.
            </p>
            <p className="text-xs font-sans text-ink/30 mt-3 uppercase tracking-wider">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}

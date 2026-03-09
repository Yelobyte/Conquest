'use client'

import { LocalPlayer } from '@/lib/game/engine'
import { ROLE_LABELS } from '@/lib/game/roles'

interface PlayerGridProps {
  players: LocalPlayer[]
  humanId: string
  revealRoles?: boolean
  highlightIds?: string[]
}

export default function PlayerGrid({ players, humanId, revealRoles = false, highlightIds = [] }: PlayerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {players.map((player) => {
        const isHuman = player.id === humanId
        const isEliminated = player.status === 'eliminated'
        const isHighlighted = highlightIds.includes(player.id)

        return (
          <div
            key={player.id}
            className={`
              relative rounded-xl border-2 p-4 transition-all
              ${isEliminated
                ? 'opacity-40 border-ink/20 bg-ink/5'
                : isHighlighted
                ? 'border-terracotta bg-terracotta/10 shadow-md'
                : isHuman
                ? 'border-gold bg-gold/10'
                : 'border-ink/20 bg-parchment'
              }
            `}
          >
            {isHuman && (
              <span className="absolute top-2 right-2 text-[10px] font-sans uppercase tracking-widest text-gold font-semibold">
                You
              </span>
            )}

            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{player.isBot ? '🤖' : '👤'}</span>
              <span className={`font-sans font-semibold text-sm truncate ${isEliminated ? 'line-through' : ''}`}>
                {player.displayName}
              </span>
            </div>

            {isEliminated && revealRoles && player.role && (
              <div className="mt-1">
                <span
                  className={`text-xs font-sans px-2 py-0.5 rounded-full ${
                    player.team === 'cabal'
                      ? 'bg-terracotta/20 text-terracotta'
                      : 'bg-gold/20 text-gold'
                  }`}
                >
                  {ROLE_LABELS[player.role]}
                </span>
              </div>
            )}

            {isEliminated && (
              <div className="mt-1 text-xs font-sans text-ink/40 uppercase tracking-widest">
                Sent to Kuje
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

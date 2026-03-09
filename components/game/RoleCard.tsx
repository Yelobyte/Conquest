'use client'

import { Role, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_TEAMS } from '@/lib/game/roles'

interface RoleCardProps {
  role: Role
  onReady: () => void
}

const ROLE_ICONS: Record<string, string> = {
  godfather: '🕴️',
  agbero: '🤜',
  dibia: '🔮',
  soldier: '🛡️',
  whistleblower: '📁',
  town_crier: '📣',
  nepo_baby: '👶',
  citizen: '🧑‍💼',
  recruited_citizen: '🔄',
}

export default function RoleCard({ role, onReady }: RoleCardProps) {
  const team = ROLE_TEAMS[role]
  const isCabal = team === 'cabal'

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-ink/80 z-50 p-4">
      <div
        className={`w-full max-w-sm rounded-2xl border-2 p-8 text-center shadow-2xl ${
          isCabal
            ? 'bg-ink border-terracotta text-parchment'
            : 'bg-parchment border-gold text-ink'
        }`}
      >
        <p className={`text-xs font-sans uppercase tracking-widest mb-4 ${isCabal ? 'text-terracotta' : 'text-gold'}`}>
          Your Role
        </p>

        <div className="text-6xl mb-4">{ROLE_ICONS[role] ?? '🃏'}</div>

        <h2 className="font-display text-3xl font-bold mb-3">{ROLE_LABELS[role]}</h2>

        <div
          className={`inline-block px-3 py-1 rounded-full text-xs font-sans uppercase tracking-wider mb-6 ${
            isCabal ? 'bg-terracotta/20 text-terracotta' : 'bg-gold/20 text-gold'
          }`}
        >
          {isCabal ? 'The Cabal' : 'The Citizens'}
        </div>

        <p className={`font-sans text-sm leading-relaxed mb-8 ${isCabal ? 'text-parchment/80' : 'text-ink-muted'}`}>
          {ROLE_DESCRIPTIONS[role]}
        </p>

        <button
          onClick={onReady}
          className={`w-full py-3 rounded-xl font-sans font-semibold text-sm transition-opacity hover:opacity-90 ${
            isCabal
              ? 'bg-terracotta text-parchment'
              : 'bg-terracotta text-parchment'
          }`}
        >
          I understand my role
        </button>
      </div>
    </div>
  )
}

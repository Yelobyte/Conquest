'use client'

interface PhaseBarProps {
  phase: string
  round: number
  message: string
  timerSeconds?: number
}

export default function PhaseBar({ phase, round, message, timerSeconds }: PhaseBarProps) {
  const isNight = phase === 'night' || phase === 'night_result'

  return (
    <div
      className={`rounded-xl p-4 mb-4 ${
        isNight ? 'bg-ink text-parchment' : 'bg-gold/20 border border-gold/40 text-ink'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-sans uppercase tracking-widest opacity-60">
          {isNight ? '🌙 Night' : '☀️ Day'} — Round {round}
        </span>
        {timerSeconds !== undefined && (
          <span
            className={`text-sm font-sans font-bold tabular-nums ${
              timerSeconds <= 10 ? 'text-terracotta' : ''
            }`}
          >
            {timerSeconds}s
          </span>
        )}
      </div>
      <p className="font-sans text-sm leading-relaxed italic">{message}</p>
    </div>
  )
}

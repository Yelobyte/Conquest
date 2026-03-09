'use client'

interface WagerPotProps {
  totalAVAX: number
  participantCount: number
}

export default function WagerPot({ totalAVAX, participantCount }: WagerPotProps) {
  if (participantCount === 0) return null

  return (
    <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold/10 px-4 py-2">
      <span className="text-xs font-sans text-gold font-semibold uppercase tracking-wider">
        Wager Pot
      </span>
      <span className="text-sm font-sans font-bold text-ink">
        {totalAVAX.toFixed(4)} AVAX
        <span className="text-xs text-ink-muted ml-1">({participantCount} wagered)</span>
      </span>
    </div>
  )
}

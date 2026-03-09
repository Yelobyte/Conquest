'use client'

import { LocalPlayer, Vote } from '@/lib/game/engine'
import { NARRATOR } from '@/lib/game/roles'

interface VotingUIProps {
  players: LocalPlayer[]
  humanId: string
  votes: Vote[]
  round: number
  humanHasVoted: boolean
  onVote: (targetId: string) => void
}

export default function VotingUI({ players, humanId, votes, round, humanHasVoted, onVote }: VotingUIProps) {
  const alive = players.filter((p) => p.status === 'alive')
  const roundVotes = votes.filter((v) => v.round === round && v.voteNumber === 1)

  const tally: Record<string, number> = {}
  for (const v of roundVotes) {
    tally[v.targetId] = (tally[v.targetId] ?? 0) + 1
  }
  const maxVotes = Math.max(0, ...Object.values(tally))

  return (
    <div className="space-y-3">
      <p className="text-xs font-sans italic text-ink-muted text-center px-2">
        {NARRATOR.voteCall}
      </p>

      <div className="space-y-2">
        {alive.map((player) => {
          const isHuman = player.id === humanId
          const voteCount = tally[player.id] ?? 0
          const isLeading = voteCount === maxVotes && voteCount > 0

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                isLeading ? 'border-terracotta bg-terracotta/10' : 'border-ink/20 bg-parchment'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{player.isBot ? '🤖' : '👤'}</span>
                <span className="font-sans text-sm font-medium">
                  {player.displayName}
                  {isHuman && <span className="text-gold text-xs ml-1">(you)</span>}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {voteCount > 0 && (
                  <span className="text-xs font-sans text-terracotta font-bold">
                    {voteCount} vote{voteCount > 1 ? 's' : ''}
                  </span>
                )}

                {!isHuman && !humanHasVoted && (
                  <button
                    onClick={() => onVote(player.id)}
                    className="text-xs font-sans font-semibold bg-terracotta text-parchment px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Vote
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {humanHasVoted && (
        <p className="text-xs font-sans text-ink/50 text-center italic">
          Your vote is cast. Waiting for others...
        </p>
      )}
    </div>
  )
}

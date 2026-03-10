'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sounds } from '@/lib/sounds'

const PLAYERS = [
  { rank: 1, name: 'Chisom Eze', handle: 'CHI#0001', avatar: '👑', points: 9420, wins: 87, games: 112, winRate: 78, streak: 7, badges: ['⚔️','♟️','🎉','💬','🦉'], region: 'Lagos', trend: 'up' },
  { rank: 2, name: 'Tunde Bakare', handle: 'TUN#2200', avatar: '🧑🏿', points: 8750, wins: 74, games: 98, winRate: 76, streak: 4, badges: ['⚔️','♟️','🦉'], region: 'Abuja', trend: 'up' },
  { rank: 3, name: 'Ngozi Okafor', handle: 'NGO#3310', avatar: '👩🏾', points: 8130, wins: 68, games: 91, winRate: 75, streak: 2, badges: ['💬','♟️','🎉'], region: 'Enugu', trend: 'same' },
  { rank: 4, name: 'Funke Ola', handle: 'FUNKE#2219', avatar: '👩🏽', points: 3410, wins: 44, games: 62, winRate: 71, streak: 0, badges: ['♟️','🎉','⚔️','💬','🦉'], region: 'Ibadan', trend: 'up' },
  { rank: 5, name: 'Kelechi Amadi', handle: 'KEL#5544', avatar: '🧑🏽', points: 3200, wins: 39, games: 57, winRate: 68, streak: 3, badges: ['⚔️','🩸'], region: 'PH', trend: 'down' },
  { rank: 6, name: 'Temi Adeyemi', handle: 'TEMI#4421', avatar: '👩🏾', points: 2840, wins: 31, games: 47, winRate: 66, streak: 1, badges: ['💬','♟️','🎉','⚔️'], region: 'Lagos', trend: 'up' },
  { rank: 7, name: 'Adaeze Uche', handle: 'ADA#8812', avatar: '👩🏿', points: 2290, wins: 22, games: 39, winRate: 56, streak: 0, badges: ['💬','♟️','🎉'], region: 'Aba', trend: 'same' },
  { rank: 8, name: 'Chidera Obi', handle: 'CHI#7733', avatar: '🧑🏿', points: 1920, wins: 14, games: 28, winRate: 50, streak: 0, badges: ['🦉','🩸','💬'], region: 'Lagos', trend: 'down' },
  { rank: 9, name: 'Bisi Lawal', handle: 'BIS#9921', avatar: '👩🏽', points: 1540, wins: 11, games: 25, winRate: 44, streak: 2, badges: ['🎉'], region: 'Kano', trend: 'up' },
  { rank: 10, name: 'Emeka Nwoku', handle: 'MEK#5501', avatar: '🧑🏾', points: 1100, wins: 6, games: 15, winRate: 40, streak: 0, badges: ['🩸'], region: 'Asaba', trend: 'down' },
]

const BADGE_LABELS: Record<string, string> = {
  '💬': 'Chatty', '♟️': 'Strategist', '🎉': 'Fun Lover',
  '⚔️': 'Agbero Slayer', '🦉': 'Night Owl', '🩸': 'First Blood',
}

const TABS = ['All Time', 'This Week', 'This Month']

export default function LeaderboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState('All Time')
  const [hovered, setHovered] = useState<number | null>(null)

  const top3 = PLAYERS.slice(0, 3)
  const rest = PLAYERS.slice(3)

  return (
    <div className="min-h-screen bg-[#F5EDDA]">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-[#F5EDDA]/95 backdrop-blur-sm border-b border-[#C9A84C]/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => { Sounds.click(); router.push('/') }} className="flex items-center gap-2">
            <img src="/Conquest_Logo.jpg" alt="Conquest" className="h-9 w-auto" />
            <span className="font-display font-black text-xl text-[#1C1710]" style={{ fontFamily: 'Fraunces, serif' }}>Conquest</span>
          </button>
          <div className="flex items-center gap-1 bg-[#EDE0C4] rounded-full px-1 py-1">
            {['Games', 'Friends', 'Leaderboard'].map(t => (
              <button key={t} onClick={() => { Sounds.click(); router.push(t === 'Games' ? '/' : `/${t.toLowerCase()}`) }}
                className={`px-4 py-1.5 rounded-full text-sm font-sans font-medium transition-all ${t === 'Leaderboard' ? 'bg-[#FBF6EE] text-[#C85A2A] font-semibold shadow-sm' : 'text-[#6B5A42] hover:bg-[#FBF6EE]/60'}`}>
                {t}
              </button>
            ))}
          </div>
          <div />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl text-[#1C1710] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
            Hall of Conquest
          </h1>
          <p className="text-sm font-sans text-[#6B5A42]">The empire remembers its fiercest.</p>
          <div className="kente-strip rounded-full mt-4 max-w-xs mx-auto" />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex gap-1 bg-[#EDE0C4] rounded-full p-1">
            {TABS.map(t => (
              <button key={t} onClick={() => { Sounds.click(); setTab(t) }}
                className={`px-5 py-2 rounded-full text-sm font-sans font-medium transition-all ${tab === t ? 'bg-[#FBF6EE] text-[#C85A2A] font-semibold shadow-sm' : 'text-[#6B5A42] hover:text-[#1C1710]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div className="relative flex items-end justify-center gap-4 mb-10 px-4">
          {/* 2nd */}
          <div className="flex-1 max-w-[160px]">
            <div className="text-center mb-3">
              <div className="w-16 h-16 rounded-2xl bg-[#EDE0C4] flex items-center justify-center text-3xl mx-auto mb-2 shadow-md border-2 border-[#C4B090]">
                {top3[1].avatar}
              </div>
              <p className="font-sans font-bold text-sm text-[#1C1710] truncate">{top3[1].name}</p>
              <p className="text-[10px] font-sans text-[#C4B090]">{top3[1].handle}</p>
              <p className="font-display font-black text-lg text-[#1C1710] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>{top3[1].points.toLocaleString()}</p>
              <p className="text-[10px] font-sans text-[#C4B090]">pts</p>
            </div>
            <div className="bg-[#C4B090] rounded-t-2xl h-20 flex items-center justify-center">
              <span className="text-3xl">🥈</span>
            </div>
          </div>

          {/* 1st */}
          <div className="flex-1 max-w-[180px]">
            <div className="text-center mb-3">
              <div className="relative mx-auto w-fit">
                <div className="w-20 h-20 rounded-2xl bg-[#C9A84C]/20 flex items-center justify-center text-4xl mx-auto mb-2 shadow-lg border-2 border-[#C9A84C] pulse-glow">
                  {top3[0].avatar}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</div>
              </div>
              <p className="font-sans font-bold text-base text-[#1C1710] truncate">{top3[0].name}</p>
              <p className="text-[10px] font-sans text-[#C4B090]">{top3[0].handle}</p>
              <p className="font-display font-black text-2xl text-[#C9A84C] mt-1 shimmer-text" style={{ fontFamily: 'Fraunces, serif' }}>{top3[0].points.toLocaleString()}</p>
              <p className="text-[10px] font-sans text-[#C4B090]">pts</p>
            </div>
            <div className="bg-[#C9A84C] rounded-t-2xl h-28 flex items-center justify-center">
              <span className="text-4xl">🥇</span>
            </div>
          </div>

          {/* 3rd */}
          <div className="flex-1 max-w-[160px]">
            <div className="text-center mb-3">
              <div className="w-16 h-16 rounded-2xl bg-[#EDE0C4] flex items-center justify-center text-3xl mx-auto mb-2 shadow-md border-2 border-[#8B7355]">
                {top3[2].avatar}
              </div>
              <p className="font-sans font-bold text-sm text-[#1C1710] truncate">{top3[2].name}</p>
              <p className="text-[10px] font-sans text-[#C4B090]">{top3[2].handle}</p>
              <p className="font-display font-black text-lg text-[#1C1710] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>{top3[2].points.toLocaleString()}</p>
              <p className="text-[10px] font-sans text-[#C4B090]">pts</p>
            </div>
            <div className="bg-[#8B7355] rounded-t-2xl h-14 flex items-center justify-center">
              <span className="text-3xl">🥉</span>
            </div>
          </div>
        </div>

        {/* Streak banner */}
        <div className="mb-6 bg-[#1E4035] rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-sans font-bold text-sm text-[#FBF6EE]">Chisom Eze is on fire</p>
              <p className="text-[10px] font-sans text-[#C9A84C]">7-game win streak — Longest active streak</p>
            </div>
          </div>
          <span className="text-xs font-sans font-bold text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1.5 rounded-full border border-[#C9A84C]/30">🏆 Streak Leader</span>
        </div>

        {/* Ranked list */}
        <div className="card-frame bg-[#FBF6EE] overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-[#C4B090]/20 bg-[#EDE0C4]/50">
            <div className="col-span-1 text-[10px] font-sans font-bold uppercase tracking-wider text-[#C4B090]">#</div>
            <div className="col-span-4 text-[10px] font-sans font-bold uppercase tracking-wider text-[#C4B090]">Player</div>
            <div className="col-span-2 text-[10px] font-sans font-bold uppercase tracking-wider text-[#C4B090] text-right">Points</div>
            <div className="col-span-2 text-[10px] font-sans font-bold uppercase tracking-wider text-[#C4B090] text-right">Win Rate</div>
            <div className="col-span-2 text-[10px] font-sans font-bold uppercase tracking-wider text-[#C4B090] text-right">Games</div>
            <div className="col-span-1 text-[10px] font-sans font-bold uppercase tracking-wider text-[#C4B090] text-right">🔥</div>
          </div>

          {rest.map((p) => (
            <div
              key={p.rank}
              onMouseEnter={() => setHovered(p.rank)}
              onMouseLeave={() => setHovered(null)}
              className={`grid grid-cols-12 gap-2 px-5 py-4 border-b border-[#C4B090]/10 last:border-0 transition-colors ${hovered === p.rank ? 'bg-[#EDE0C4]/40' : ''}`}
            >
              <div className="col-span-1 flex items-center">
                <span className="text-sm font-display font-black text-[#6B5A42]" style={{ fontFamily: 'Fraunces, serif' }}>{p.rank}</span>
              </div>

              <div className="col-span-4 flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#EDE0C4] flex items-center justify-center text-xl">
                    {p.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#FBF6EE] ${p.trend === 'up' ? 'bg-[#1E4035]' : p.trend === 'down' ? 'bg-[#C85A2A]' : 'bg-[#C4B090]'}`} />
                </div>
                <div className="min-w-0">
                  <p className="font-sans font-semibold text-sm text-[#1C1710] truncate">{p.name}</p>
                  <p className="text-[10px] font-sans text-[#C4B090]">{p.region}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <span className="font-display font-black text-sm text-[#C9A84C]" style={{ fontFamily: 'Fraunces, serif' }}>{p.points.toLocaleString()}</span>
              </div>

              <div className="col-span-2 flex items-center justify-end gap-1">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-sans font-bold text-[#1C1710]">{p.winRate}%</span>
                  <div className="w-16 h-1 rounded-full bg-[#EDE0C4] mt-1">
                    <div className="h-full rounded-full bg-[#1E4035]" style={{ width: `${p.winRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-end">
                <div className="text-right">
                  <p className="text-sm font-sans font-semibold text-[#1C1710]">{p.wins}W</p>
                  <p className="text-[10px] font-sans text-[#C4B090]">{p.games} played</p>
                </div>
              </div>

              <div className="col-span-1 flex items-center justify-end">
                {p.streak > 0 ? (
                  <span className="text-xs font-sans font-bold text-[#C85A2A]">×{p.streak}</span>
                ) : (
                  <span className="text-xs text-[#C4B090]">—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Your standing */}
        <div className="mt-4 border-2 border-[#C9A84C]/40 rounded-2xl px-5 py-4 bg-[#C9A84C]/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EDE0C4] flex items-center justify-center text-xl">😤</div>
            <div>
              <p className="font-sans font-bold text-sm text-[#1C1710]">YOU#1234 <span className="text-[#C4B090] font-normal">· You</span></p>
              <p className="text-[10px] font-sans text-[#C4B090]">Rank #42 globally</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display font-black text-lg text-[#C9A84C]" style={{ fontFamily: 'Fraunces, serif' }}>640</p>
            <p className="text-[10px] font-sans text-[#C4B090]">pts</p>
          </div>
        </div>

        {/* Badge legend */}
        <div className="mt-8">
          <p className="text-xs font-sans font-bold uppercase tracking-wider text-[#C4B090] mb-3">Badge Legend</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(BADGE_LABELS).map(([emoji, label]) => (
              <div key={emoji} className="flex items-center gap-1.5 bg-[#FBF6EE] border border-[#C4B090]/25 rounded-full px-3 py-1.5 text-xs">
                <span>{emoji}</span>
                <span className="font-sans text-[#6B5A42]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

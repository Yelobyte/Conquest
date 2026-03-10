'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sounds } from '@/lib/sounds'

const FRIENDS = [
  { id: 'f1', name: 'Temi Adeyemi', handle: 'TEMI#4421', avatar: '👩🏾', online: true, inGame: true, points: 2840, games: 47, wins: 31, badges: ['💬','♟️','🎉','⚔️'], mutualGames: 12, lastPlayed: '2h ago' },
  { id: 'f2', name: 'Chidera Obi', handle: 'CHI#7733', avatar: '🧑🏿', online: true, inGame: false, points: 1920, games: 28, wins: 14, badges: ['🦉','🩸','💬'], mutualGames: 7, lastPlayed: '5h ago' },
  { id: 'f3', name: 'Funke Ola', handle: 'FUNKE#2219', avatar: '👩🏽', online: false, inGame: false, points: 3410, games: 62, wins: 44, badges: ['♟️','🎉','⚔️','💬','🦉'], mutualGames: 19, lastPlayed: '1d ago' },
  { id: 'f4', name: 'Emeka Nwoku', handle: 'MEK#5501', avatar: '🧑🏾', online: true, inGame: false, points: 1100, games: 15, wins: 6, badges: ['🩸'], mutualGames: 3, lastPlayed: '3d ago' },
  { id: 'f5', name: 'Adaeze Uche', handle: 'ADA#8812', avatar: '👩🏿', online: false, inGame: false, points: 2290, games: 39, wins: 22, badges: ['💬','♟️','🎉'], mutualGames: 8, lastPlayed: '1w ago' },
]

const BADGE_LABELS: Record<string, string> = {
  '💬': 'Chatty', '♟️': 'Strategy Master', '🎉': 'Fun Lover',
  '⚔️': 'Agbero Hunter', '🦉': 'Night Owl', '🩸': 'First Blood',
}

export default function FriendsPage() {
  const router = useRouter()
  const [selected, setSelected] = useState(FRIENDS[0])
  const [showAdd, setShowAdd] = useState(false)
  const [addInput, setAddInput] = useState('')

  return (
    <div className="min-h-screen bg-[#F5EDDA]">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-[#F5EDDA]/95 backdrop-blur-sm border-b border-[#C9A84C]/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => { Sounds.click(); router.push('/') }} className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <span className="font-display font-black text-xl text-[#1C1710]" style={{ fontFamily: 'Fraunces, serif' }}>Conquest</span>
          </button>
          <div className="flex items-center gap-1 bg-[#EDE0C4] rounded-full px-1 py-1">
            {['Games', 'Friends', 'Leaderboard'].map(tab => (
              <button key={tab} onClick={() => { Sounds.click(); router.push(tab === 'Games' ? '/' : `/${tab.toLowerCase()}`) }}
                className={`px-4 py-1.5 rounded-full text-sm font-sans font-medium transition-all ${tab === 'Friends' ? 'bg-[#FBF6EE] text-[#C85A2A] font-semibold shadow-sm' : 'text-[#6B5A42] hover:bg-[#FBF6EE]/60'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-black text-3xl text-[#1C1710]" style={{ fontFamily: 'Fraunces, serif' }}>Your Circle</h1>
            <p className="text-sm font-sans text-[#6B5A42] mt-1">Your crew. Your rivals. Your settlement.</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="bg-[#C85A2A] text-white font-sans font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#E8784A] transition-all hover:-translate-y-0.5">
            + Add Friend
          </button>
        </div>

        {/* Add friend modal */}
        {showAdd && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#1C1710]/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <div onClick={e => e.stopPropagation()} className="bg-[#FBF6EE] rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl card-frame bounce-in">
              <div className="kente-strip rounded-full mb-5" />
              <h3 className="font-display font-black text-2xl text-[#1C1710] mb-1" style={{ fontFamily: 'Fraunces, serif' }}>Add a Friend</h3>
              <p className="text-sm text-[#6B5A42] font-sans mb-5">Enter their Conquest ID to connect.</p>
              <input value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="e.g. TEMI#4421"
                className="w-full bg-white border border-[#C9A84C]/30 rounded-xl px-4 py-3 font-sans text-sm text-[#1C1710] outline-none focus:border-[#C9A84C] mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 border border-[#C4B090] text-[#6B5A42] font-sans font-semibold py-3 rounded-xl text-sm hover:bg-[#EDE0C4] transition-colors">Cancel</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-[#C85A2A] text-white font-sans font-bold py-3 rounded-xl text-sm hover:bg-[#E8784A] transition-colors">Send Request</button>
              </div>
              <div className="mt-4 p-3 bg-[#EDE0C4] rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-sans text-[#C4B090] uppercase tracking-wider">Your ID</p>
                  <p className="font-sans font-bold text-sm text-[#1C1710]">YOU#1234</p>
                </div>
                <button onClick={() => navigator.clipboard?.writeText('YOU#1234')}
                  className="text-xs font-sans font-bold text-[#C9A84C] border border-[#C9A84C]/30 px-3 py-1.5 rounded-lg hover:bg-[#C9A84C]/10 transition-colors">
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Friends list */}
          <div className="lg:col-span-1 space-y-2">
            {FRIENDS.map(f => (
              <button key={f.id} onClick={() => { Sounds.click(); setSelected(f) }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${selected.id === f.id ? 'border-[#C9A84C] bg-[#C9A84C]/8 shadow-sm' : 'border-[#C4B090]/25 bg-[#FBF6EE] hover:border-[#C9A84C]/40'}`}
                style={{ background: selected.id === f.id ? 'rgba(201,168,76,0.08)' : undefined }}>
                <div className="relative">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#EDE0C4] text-2xl">
                    {f.avatar}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#FBF6EE] ${f.online ? f.inGame ? 'bg-[#C9A84C]' : 'bg-[#1E4035]' : 'bg-[#C4B090]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-sm text-[#1C1710] truncate">{f.name}</p>
                  <p className="text-[10px] font-sans text-[#C4B090]">{f.inGame ? '🎮 In game' : f.online ? '● Online' : f.lastPlayed}</p>
                </div>
                <span className="text-xs font-sans font-bold text-[#C9A84C]">{f.points.toLocaleString()}</span>
              </button>
            ))}
          </div>

          {/* Friend detail */}
          <div className="lg:col-span-2 card-frame bg-[#FBF6EE] p-8 space-y-6 fade-in">
            <div className="flex items-start gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[#EDE0C4] flex items-center justify-center text-5xl pulse-glow">
                  {selected.avatar}
                </div>
                {selected.online && (
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#FBF6EE] ${selected.inGame ? 'bg-[#C9A84C]' : 'bg-[#1E4035]'}`} />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-display font-black text-2xl text-[#1C1710]" style={{ fontFamily: 'Fraunces, serif' }}>{selected.name}</h2>
                <p className="text-xs font-sans text-[#C4B090] uppercase tracking-wider mt-0.5">{selected.handle}</p>
                <p className="text-sm font-sans text-[#6B5A42] mt-1">{selected.inGame ? '🎮 Currently in a game' : selected.online ? '● Online now' : `Last seen ${selected.lastPlayed}`}</p>
              </div>
              <button onClick={() => Sounds.wager()}
                className="bg-[#C85A2A] text-white font-sans font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#E8784A] transition-all">
                Challenge
              </button>
            </div>

            <div className="kente-strip rounded-full" />

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Connection Points', value: selected.points.toLocaleString(), icon: '⭐' },
                { label: 'Games Together', value: selected.mutualGames, icon: '🎮' },
                { label: 'Win Rate', value: `${Math.round((selected.wins / selected.games) * 100)}%`, icon: '🏆' },
              ].map(stat => (
                <div key={stat.label} className="bg-[#EDE0C4] rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <p className="font-display font-black text-xl text-[#1C1710]" style={{ fontFamily: 'Fraunces, serif' }}>{stat.value}</p>
                  <p className="text-[10px] font-sans text-[#C4B090] uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-wider text-[#C4B090] mb-3">Badges Earned</p>
              <div className="flex gap-2 flex-wrap">
                {selected.badges.map(b => (
                  <div key={b} title={BADGE_LABELS[b]} className="flex items-center gap-1.5 bg-[#EDE0C4] rounded-full px-3 py-1.5 text-sm cursor-default">
                    <span>{b}</span>
                    <span className="text-[10px] font-sans text-[#6B5A42]">{BADGE_LABELS[b]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-sans font-bold uppercase tracking-wider text-[#C4B090] mb-3">Recent Games Together</p>
              <div className="space-y-2">
                {[
                  { game: 'Cabal', result: 'Citizens Won', when: '2h ago', role: 'Dibia' },
                  { game: 'Cabal', result: 'Cabal Won', when: '1d ago', role: 'Citizen' },
                  { game: 'Cabal', result: 'Citizens Won', when: '3d ago', role: 'Godfather' },
                ].slice(0, 3).map((g, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#EDE0C4] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base">🃏</span>
                      <div>
                        <p className="text-sm font-sans font-semibold text-[#1C1710]">{g.game}</p>
                        <p className="text-[10px] font-sans text-[#C4B090]">{g.when} · You were {g.role}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-sans font-bold ${g.result.includes('Citizens') ? 'text-[#1E4035]' : 'text-[#C85A2A]'}`}>{g.result}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'

// ─── Roadmap data ────────────────────────────────────────────────────────────
const PHASES = [
  {
    phase: '01',
    label: 'Foundation',
    period: 'Now',
    status: 'live' as const,
    headline: 'Conquest — Cabal',
    items: [
      'Flagship game live: Cabal, a social deduction game set in Nigerian political life',
      'Bot mode for solo play and onboarding',
      'On-chain wagering via CabalWager on Avalanche Fuji',
      'Web3 wallet login — MetaMask, WalletConnect',
      'Real-time multiplayer via Supabase with up to 8 players',
      'Leaderboard, friend system, and player profiles',
    ],
  },
  {
    phase: '02',
    label: 'Events Layer',
    period: 'Q2 2025',
    status: 'building' as const,
    headline: 'Live Event Mode',
    items: [
      'Event organiser dashboard — host Conquest at any ticketed event',
      'Large-room mode supporting 20–100 simultaneous players',
      'QR-code session join for walk-in audiences',
      'Branded event packs: custom characters, room themes, prize pools',
      'B2B licensing model for corporate, entertainment, and community events',
      'First event pilots in Lagos and Abuja',
    ],
  },
  {
    phase: '03',
    label: 'Catalogue Expansion',
    period: 'Q3 2025',
    status: 'planned' as const,
    headline: 'The Second Game',
    items: [
      'Second title launches — from the "Coming Soon" catalogue',
      'Shared wallet and profile system across all Conquest games',
      'Achievement system with on-chain badge ownership',
      'Expansion into Ghana, Kenya, and South Africa',
      'African diaspora marketing push (UK, US, Canada)',
      'Platform reaches 100,000 registered players',
    ],
  },
  {
    phase: '04',
    label: 'Platform Scale',
    period: 'Q4 2025 — 2026',
    status: 'planned' as const,
    headline: 'The Long Game',
    items: [
      '500,000 – 1M monthly active users across five markets',
      'Full game catalogue: Ludo Splash, Ọwọ Ni Kọkọ, Ayò, and more',
      'Esports infrastructure: leagues, prize pools, community broadcasts',
      'Creator tools: build and publish your own Conquest game mode',
      '$500K+ monthly revenue target across all four monetisation streams',
      'Conquest becomes the defining social platform for the African generation',
    ],
  },
]

const METRICS = [
  { value: '80M+', label: 'Active gamers in Nigeria alone' },
  { value: '200M+', label: 'Players across 6 Sub-Saharan markets' },
  { value: '370M+', label: 'African diaspora addressable community' },
  { value: '45–60M', label: 'Social gaming segment — Nigeria, Ghana, Kenya, SA' },
]

const STREAMS = [
  {
    icon: '🎟',
    title: 'Event Licensing',
    description:
      'B2B contracts with event organisers. Nigeria hosts tens of thousands of ticketed events annually. 1% capture at $200 average = $2M revenue from a single market.',
  },
  {
    icon: '⚡',
    title: 'Freemium In-App',
    description:
      'Premium character skins, game expansions, and cosmetic unlocks. Players invest in how they show up at the table.',
  },
  {
    icon: '🔗',
    title: 'Wager Fees',
    description:
      'A protocol fee on every on-chain wager placed. As player volume scales, this compounds without marginal cost.',
  },
  {
    icon: '🏆',
    title: 'Esports Commissions',
    description:
      'Prize pool commissions from organised leagues and tournaments. Conquest sits at the table for every competitive event it powers.',
  },
]

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'live' | 'building' | 'planned' }) {
  const map = {
    live:     { label: 'Live',     bg: '#1E4035', text: '#6EE7B7' },
    building: { label: 'Building', bg: '#3B2506', text: '#C9A84C' },
    planned:  { label: 'Planned',  bg: '#1C1710', text: '#C4B090' },
  }
  const { label, bg, text } = map[status]
  return (
    <span
      className="text-xs font-mono tracking-widest uppercase px-2 py-0.5 rounded-full"
      style={{ background: bg, color: text }}
    >
      {label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VisionPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--parchment)' }}>

      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: 'rgba(245,237,218,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--parchment-deep)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <img src="/Conquest_Logo.jpg" alt="Conquest" className="h-9 w-auto" />
          <span className="font-display font-black text-xl tracking-tight" style={{ color: 'var(--ink)', fontFamily: 'Fraunces, serif' }}>
            Conquest
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>Play</Link>
          <Link href="/leaderboard" className="text-sm font-medium" style={{ color: 'var(--ink-soft)' }}>Leaderboard</Link>
          <Link href="/vision" className="text-sm font-semibold" style={{ color: 'var(--terracotta)' }}>Vision</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center">
        {/* Background accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 65%)',
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs font-mono tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--gold)' }}>
            Product Vision
          </p>
          <h1
            className="text-5xl sm:text-6xl font-black leading-[1.05] mb-8"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}
          >
            Human connection<br />
            <span style={{ color: 'var(--terracotta)' }}>deserves infrastructure.</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--ink-soft)' }}>
            The tools people use to stay close — messaging apps, video calls, social media — are passive.
            They let you observe each other. Conquest is building the <em>active layer</em>: a platform
            where people do things together, and those shared experiences compound into something real over time.
          </p>
        </div>
      </section>

      {/* ── Vision body ── */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Pull quote */}
          <blockquote
            className="border-l-4 pl-6 py-2"
            style={{ borderColor: 'var(--gold)', fontFamily: 'Fraunces, serif' }}
          >
            <p className="text-2xl font-semibold leading-snug" style={{ color: 'var(--ink)' }}>
              &ldquo;Every game played is a deposit into a relationship. Every laugh, every accusation
              across the table, every late-night session with someone three time zones away —
              Conquest captures that and gives it meaning.&rdquo;
            </p>
          </blockquote>

          {/* Body paragraphs */}
          <div className="space-y-6 text-base leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            <p>
              The long-term vision is a platform that serves every context where people want to connect:
              intimate friend groups, large live events, long-distance relationships, online communities,
              and competitive esports leagues — with a growing catalogue of games designed specifically
              to create those moments. Not games for gaming&rsquo;s sake. Games engineered for human connection.
            </p>
            <p>
              Conquest is building from Africa outward. The platform is rooted in Nigerian and West African
              identity: the characters, the language, the humour, the social dynamics. That specificity is
              the foundation for global relevance. The product does not borrow from a universal template
              and apply a cultural veneer. The culture is the architecture.
            </p>
            <p>
              On-chain infrastructure powers the trust and rewards layer: wagers, prize pools, achievement
              ownership. But it is never the product. The product is the feeling of being in a room —
              physical or digital — fully present with the people you care about, doing something that makes
              you lose track of time.
            </p>
            <p className="font-semibold" style={{ color: 'var(--ink)' }}>
              That is the future Conquest is building toward. Not a gaming app. A new social ritual —
              and a very successful business.
            </p>
          </div>
        </div>
      </section>

      {/* ── Market ── */}
      <section className="px-6 py-20" style={{ background: 'var(--parchment-deep)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.3em] uppercase mb-3 text-center" style={{ color: 'var(--gold)' }}>
            The Opportunity
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black text-center mb-14"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}
          >
            370 million people.<br />Zero platforms built for them.
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {METRICS.map(m => (
              <div
                key={m.label}
                className="rounded-2xl p-6 flex flex-col gap-2"
                style={{ background: 'var(--parchment)', border: '1px solid rgba(201,168,76,0.25)' }}
              >
                <span className="text-4xl font-black" style={{ fontFamily: 'Fraunces, serif', color: 'var(--terracotta)' }}>
                  {m.value}
                </span>
                <span className="text-sm leading-snug" style={{ color: 'var(--ink-soft)' }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-center mt-8 max-w-2xl mx-auto" style={{ color: 'var(--ink-soft)' }}>
            Nigeria alone has over 80 million active gamers — the majority aged 18–35, mobile-first, socially
            connected, and deeply underserved by platforms not built with them in mind. Conquest&rsquo;s immediate
            serviceable market in Nigeria, Ghana, Kenya, and South Africa represents 45–60 million active social players.
          </p>
        </div>
      </section>

      {/* ── Revenue streams ── */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-mono tracking-[0.3em] uppercase mb-3 text-center" style={{ color: 'var(--gold)' }}>
            Business Model
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black text-center mb-14"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}
          >
            Four revenue streams.<br />One compounding platform.
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {STREAMS.map(s => (
              <div
                key={s.title}
                className="rounded-2xl p-7 flex flex-col gap-3"
                style={{ background: 'var(--parchment-deep)', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                <span className="text-3xl">{s.icon}</span>
                <h3 className="text-lg font-bold" style={{ color: 'var(--ink)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{s.description}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-10 rounded-2xl p-8 text-center"
            style={{ background: 'var(--ink)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <p className="text-sm font-mono tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
              Year 3 Target
            </p>
            <p className="text-5xl font-black mb-3" style={{ fontFamily: 'Fraunces, serif', color: 'var(--parchment)' }}>
              $500K+ / month
            </p>
            <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--ink-faint)' }}>
              With 500,000–1,000,000 monthly active users and event operations running across five markets.
              The event organiser layer is particularly defensible — it generates recurring B2B contracts and
              drives mass consumer acquisition at zero marginal cost.
            </p>
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="px-6 py-20" style={{ background: 'var(--ink)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-mono tracking-[0.3em] uppercase mb-3 text-center" style={{ color: 'var(--gold)' }}>
            Roadmap
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black text-center mb-16"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--parchment)' }}
          >
            Where we are.<br />Where we&rsquo;re going.
          </h2>

          <div className="relative">
            {/* Vertical connector */}
            <div
              className="absolute left-[27px] top-6 bottom-6 w-px"
              style={{ background: 'rgba(201,168,76,0.2)' }}
            />

            <div className="space-y-10">
              {PHASES.map((p) => (
                <div key={p.phase} className="relative flex gap-8">
                  {/* Phase number node */}
                  <div className="relative flex-shrink-0 flex flex-col items-center" style={{ width: 56 }}>
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black z-10"
                      style={{
                        fontFamily: 'Fraunces, serif',
                        background: p.status === 'live' ? 'var(--gold)' : p.status === 'building' ? '#3B2506' : '#1C1710',
                        color: p.status === 'live' ? 'var(--ink)' : 'var(--parchment)',
                        border: p.status === 'live' ? 'none' : '1px solid rgba(201,168,76,0.25)',
                      }}
                    >
                      {p.phase}
                    </div>
                  </div>

                  {/* Phase content */}
                  <div
                    className="flex-1 rounded-2xl p-7 mb-1"
                    style={{
                      background: p.status === 'live' ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                      border: p.status === 'live' ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                        {p.label}
                      </span>
                      <StatusBadge status={p.status} />
                      <span className="text-xs font-mono" style={{ color: 'var(--ink-faint)' }}>{p.period}</span>
                    </div>

                    <h3
                      className="text-xl font-black mb-4"
                      style={{ fontFamily: 'Fraunces, serif', color: 'var(--parchment)' }}
                    >
                      {p.headline}
                    </h3>

                    <ul className="space-y-2">
                      {p.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--ink-faint)' }}>
                          <span className="mt-[3px] flex-shrink-0" style={{ color: 'var(--gold)' }}>—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <img src="/Conquest_Logo.jpg" alt="Conquest" className="h-16 w-auto mx-auto mb-8 opacity-80" />
          <h2
            className="text-3xl sm:text-4xl font-black mb-6"
            style={{ fontFamily: 'Fraunces, serif', color: 'var(--ink)' }}
          >
            Not a gaming app.<br />A new social ritual.
          </h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            Conquest is building from Africa outward — rooted in Nigerian and West African identity,
            engineered for global relevance. Join us at the table.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 rounded-full text-sm font-bold tracking-wide transition-opacity hover:opacity-80"
            style={{ background: 'var(--terracotta)', color: '#fff' }}
          >
            Play Conquest
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-8 flex items-center justify-between border-t"
        style={{ borderColor: 'var(--parchment-deep)', color: 'var(--ink-soft)' }}
      >
        <div className="flex items-center gap-2">
          <img src="/Conquest_Logo.jpg" alt="Conquest" className="h-7 w-auto opacity-70" />
          <span className="font-display font-black text-sm" style={{ fontFamily: 'Fraunces, serif' }}>Conquest</span>
          <span className="text-sm ml-1">by Yelobyte Studios</span>
        </div>
        <div className="flex gap-6 text-sm">
          <Link href="/" className="hover:opacity-70">Play</Link>
          <Link href="/leaderboard" className="hover:opacity-70">Leaderboard</Link>
          <Link href="/friends" className="hover:opacity-70">Friends</Link>
        </div>
      </footer>

    </div>
  )
}

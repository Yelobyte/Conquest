let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq: number, type: OscillatorType, start: number, dur: number, vol = 0.25) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + start)
  gain.gain.setValueAtTime(0, c.currentTime + start)
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + dur + 0.05)
}

export const Sounds = {
  nightFall: () => {
    tone(80, 'sine', 0, 2.5, 0.5)
    tone(60, 'triangle', 0.4, 2, 0.3)
    tone(110, 'sine', 0.8, 1.2, 0.2)
  },
  dayBreak: () => {
    tone(392, 'sine', 0, 0.4, 0.3)
    tone(494, 'sine', 0.2, 0.4, 0.25)
    tone(587, 'sine', 0.4, 0.7, 0.3)
    tone(784, 'sine', 0.6, 0.5, 0.15)
  },
  roleReveal: () => {
    tone(220, 'triangle', 0, 0.3, 0.4)
    tone(277, 'triangle', 0.15, 0.3, 0.35)
    tone(330, 'triangle', 0.3, 0.3, 0.3)
    tone(440, 'sine', 0.45, 0.8, 0.4)
  },
  elimination: () => {
    tone(200, 'sawtooth', 0, 0.3, 0.4)
    tone(160, 'sawtooth', 0.2, 0.4, 0.35)
    tone(120, 'sawtooth', 0.5, 0.6, 0.4)
    tone(80, 'sine', 0.8, 1.0, 0.3)
  },
  vote: () => {
    tone(523, 'sine', 0, 0.12, 0.2)
    tone(440, 'sine', 0.08, 0.12, 0.15)
  },
  citizensWin: () => {
    [440, 554, 659, 880, 1108].forEach((f, i) => {
      tone(f, 'triangle', i * 0.13, 0.6, 0.3)
    })
    tone(1320, 'sine', 0.7, 1.2, 0.2)
  },
  cabalWins: () => {
    tone(220, 'sawtooth', 0, 1.5, 0.45)
    tone(174, 'sawtooth', 0.5, 1.5, 0.35)
    tone(130, 'sine', 1.0, 2.5, 0.5)
    tone(98, 'triangle', 1.8, 1.5, 0.3)
  },
  wager: () => {
    tone(523, 'sine', 0, 0.2, 0.3)
    tone(659, 'sine', 0.15, 0.2, 0.3)
    tone(784, 'sine', 0.3, 0.4, 0.35)
    tone(1047, 'sine', 0.5, 0.4, 0.2)
  },
  click: () => {
    tone(800, 'sine', 0, 0.08, 0.15)
  },
}

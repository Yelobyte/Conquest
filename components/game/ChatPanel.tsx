'use client'

import { useEffect, useRef, useState } from 'react'
import { Message } from '@/lib/game/engine'
import { NARRATOR } from '@/lib/game/roles'

interface ChatPanelProps {
  messages: Message[]
  locked: boolean
  onSend: (content: string) => void
}

export default function ChatPanel({ messages, locked, onSend }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || locked) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div className="flex flex-col h-48 border border-ink/20 rounded-xl overflow-hidden bg-parchment/60">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-ink/40 font-sans italic text-center pt-4">
            The room is silent.
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2 items-start">
            <span className="text-xs font-sans font-semibold text-gold shrink-0 mt-0.5">
              {msg.playerName}
            </span>
            <span className="text-xs font-sans text-ink leading-relaxed">{msg.content}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={`border-t border-ink/10 p-2 flex gap-2 ${locked ? 'bg-ink/5' : ''}`}>
        {locked ? (
          <p className="text-xs font-sans text-ink/40 italic w-full text-center py-1">
            {NARRATOR.chatLocked}
          </p>
        ) : (
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Say something..."
              className="flex-1 text-xs font-sans bg-transparent outline-none text-ink placeholder-ink/30"
              maxLength={200}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="text-xs font-sans font-semibold text-terracotta disabled:opacity-30 px-2"
            >
              Send
            </button>
          </>
        )}
      </div>
    </div>
  )
}

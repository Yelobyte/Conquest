'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="text-xs font-sans font-semibold border border-ink/20 rounded-lg px-3 py-2 hover:bg-ink/5 transition-colors"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="text-xs font-sans font-semibold bg-terracotta text-parchment rounded-lg px-3 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}

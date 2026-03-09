import { createConfig, http } from 'wagmi'
import { avalancheFuji } from 'wagmi/chains'
import { metaMask, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'Conquest' }), // Core Wallet uses Coinbase connector
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
})

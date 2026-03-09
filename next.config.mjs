/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Stub optional connector peer deps that wagmi bundles but aren't needed at build time
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@base-org/account': false,
      '@walletconnect/ethereum-provider': false,
      '@react-native-async-storage/async-storage': false,
    }
    return config
  },
}

export default nextConfig

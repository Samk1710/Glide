'use client'

import { SessionProvider } from "next-auth/react";
import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from 'react'
import { TelegramAuthProvider } from '@/contexts/TelegramAuthContext'

import {config} from '@/lib/wagmi-config'

// const config = getDefaultConfig({
//   appName: 'Glide',
//   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || '7fca28a51fc7faf46402c981989c35d0',
//   chains: [mainnet, polygon, optimism, arbitrum, base],
//   ssr: true,
// })

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#000000',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <SessionProvider>
            <TelegramAuthProvider>
              {children}
            </TelegramAuthProvider>
          </SessionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
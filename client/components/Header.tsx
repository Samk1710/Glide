"use client"

import { Button } from "@/components/ui/button"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import TelegramStatus from "@/components/TelegramStatus";
import { useTelegramStatus } from "@/hooks/useTelegramStatus";

export default function Header() {
  const { data: session } = useSession();
  const { isConnected, userInfo, loading } = useTelegramStatus();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
              <img 
                src="/glide.png" 
                alt="Glide Logo" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xl font-bold text-white font-inter">Glide</span>
            </Link>
          </div>

          {/* Telegram Status */}
          <div className="hidden lg:flex">
            {!loading && (
              <TelegramStatus 
                isConnected={isConnected} 
                userInfo={userInfo}
                compact={true}
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/airdrops" className="text-white/80 hover:text-white transition-colors cursor-pointer">
              Airdrops
            </Link>
            <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors cursor-pointer">
              Dashboard
            </Link>
            <Link href="/telegram" className="text-white/80 hover:text-white transition-colors cursor-pointer">
              Telegram
            </Link>
            <Link href="/onboarding" className="text-white/80 hover:text-white transition-colors cursor-pointer">
              Setup Agent
            </Link>
            
            {/* Twitter Profile Avatar */}
            {session?.user && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img
                    alt={session.user.name || 'Twitter Profile'}
                    src={session.user.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${session.user.email}`}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-white text-sm">@{(session.user as any)?.username || session.user?.name}</span>
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                return (
                  <>
                    {!connected ? (
                      <Button
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent cursor-pointer"
                        onClick={openConnectModal}
                      >
                        Connect Wallet
                      </Button>
                    ) : chain.unsupported ? (
                      <Button
                        variant="outline"
                        className="border-red-500/50 text-red-300 hover:bg-red-500/10 bg-transparent cursor-pointer"
                        onClick={openChainModal}
                      >
                        Wrong Network
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={openChainModal}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors cursor-pointer"
                        >
                          {chain.hasIcon && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-4 h-4"
                            />
                          )}
                          <span className="text-green-300 text-sm">{chain.name}</span>
                        </button>
                        <button
                          onClick={openAccountModal}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors cursor-pointer"
                        >
                          <img
                            alt={account.displayName ?? account.address}
                            src={account.ensAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${account.address}`}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-green-300 text-sm">{account.displayName}</span>
                        </button>
                      </div>
                    )}
                  </>
                );
              }}
            </ConnectButton.Custom>
          </nav>
        </div>
      </div>
    </header>
  )
}

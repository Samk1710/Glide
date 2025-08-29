"use client"

import { Button } from "@/components/ui/button"
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm"></div>
            </div>
            <span className="text-xl font-bold text-white font-inter">Glide</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-white/80 hover:text-white transition-colors cursor-pointer">
              Home
            </a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors cursor-pointer">
              About
            </a>
            <Link href="/airdrops" className="text-white/80 hover:text-white transition-colors cursor-pointer">
              Airdrops
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
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          {chain.hasIcon && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-4 h-4"
                            />
                          )}
                          <span className="text-white text-sm">{chain.name}</span>
                        </button>
                        <button
                          onClick={openAccountModal}
                          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <img
                            alt={account.displayName ?? account.address}
                            src={account.ensAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${account.address}`}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-white text-sm">{account.displayName}</span>
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

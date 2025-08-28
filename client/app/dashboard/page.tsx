"use client";

import { useTelegram } from '@/hoo              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <img
                  src={user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}&background=dc2626&color=fff&size=40`}
                  alt={`${user.first_name}'s profile`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user.first_name} {user.last_name || ''}
                  </span>
                  {user.username && (
                    <span className="text-xs text-white/60">@{user.username}</span>
                  )}
                </div>
              </div>;
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Dashboard() {
  const { isConnected, user, disconnect } = useTelegram();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not connected to Telegram
    if (!isConnected && !user) {
      router.push('/');
    }
  }, [isConnected, user, router]);

  const handleDisconnect = async () => {
    await disconnect();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Telegram Profile */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm"></div>
              </div>
              <span className="text-xl font-bold text-white font-inter">Glide</span>
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              {/* Telegram Profile Avatar */}
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <img
                  src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName)}&background=dc2626&color=fff&size=40`}
                  alt={`${user.firstName}'s profile`}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user.firstName} {user.lastName || ''}
                  </span>
                  {user.username && (
                    <span className="text-xs text-white/60">@{user.username}</span>
                  )}
                </div>
              </div>

              {/* Wallet Connection */}
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

              {/* Disconnect Button */}
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="border-red-500/50 text-red-300 hover:bg-red-500/10 bg-transparent cursor-pointer"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Welcome to Glide Dashboard
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              You're now connected via Telegram! Your AI-driven airdrop automation platform is ready.
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Telegram Account</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName)}&background=dc2626&color=fff&size=60`}
                  alt={`${user.firstName}'s profile`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-medium">
                    {user.firstName} {user.lastName || ''}
                  </p>
                  {user.username && (
                    <p className="text-white/60 text-sm">@{user.username}</p>
                  )}
                </div>
              </div>
              <div className="text-sm text-white/60 space-y-1">
                <p>User ID: {user.id}</p>
                <p>Auth Date: {new Date(user.authDate * 1000).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Airdrop Monitor</h3>
              <p className="text-white/70 text-sm">
                AI-powered monitoring of upcoming airdrops and participation opportunities.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Auto Participation</h3>
              <p className="text-white/70 text-sm">
                Automated participation in eligible airdrops based on your preferences.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Rewards Tracking</h3>
              <p className="text-white/70 text-sm">
                Consolidated view of all your airdrop rewards in one place.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

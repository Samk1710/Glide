"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTelegram } from '@/hooks/useTelegram';
import { useRouter } from 'next/navigation';
import { TelegramAuthDialog } from '@/components/TelegramAuthDialog';
import LightRays from "./LightRays";

interface HeroSectionProps {
  onLearnMore: () => void;
}

export default function HeroSection({ onLearnMore }: HeroSectionProps) {
  const { isConnected: isTelegramConnected, user, refreshUser } = useTelegram();
  const router = useRouter();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleTelegramConnect = () => {
    setShowAuthDialog(true);
  };

  const handleAuthSuccess = async () => {
    await refreshUser();
    // Redirect to dashboard after successful connection
    router.push('/dashboard');
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Light Rays Effect */}
      <div className="absolute inset-0 z-10">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ff1a1a"
          raysSpeed={1.2}
          lightSpread={1.2}
          rayLength={4}
          followMouse={true}
          mouseInfluence={0.08}
          noiseAmount={0.0}
          distortion={0.0}
          className="opacity-60"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-600 mr-2 animate-pulse"></div>
            <span className="text-sm text-white/80">AI Agent Active</span>
          </div>
        </div>


        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-inter leading-tight">
          Land yourself with
          <br />
          <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">Glide</span>
        </h1>

        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          AI-driven platform that automates crypto airdrop participation and
          consolidates rewards into a single wallet.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <>
                  {!connected ? (
                    <Button
                      size="lg"
                      className="bg-red-700 hover:bg-red-900 text-white px-8 py-4 text-lg font-semibold rounded-lg cursor-pointer"
                      onClick={openConnectModal}
                    >
                      Connect Wallet
                    </Button>
                  ) : chain.unsupported ? (
                    <Button
                      size="lg"
                      className="bg-red-700 hover:bg-red-900 text-white px-8 py-4 text-lg font-semibold rounded-lg cursor-pointer"
                      onClick={openChainModal}
                    >
                      Wrong Network
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-lg cursor-not-allowed opacity-60"
                      disabled
                    >
                      Wallet Connected
                    </Button>
                  )}
                </>
              );
            }}
          </ConnectButton.Custom>
          
          {/* Telegram Connect Button */}
          {!isTelegramConnected ? (
            <Button
              size="lg"
              onClick={handleTelegramConnect}
              className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-lg cursor-pointer"
            >
              Connect Telegram
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => router.push('/dashboard')}
              className="bg-green-600 hover:bg-green-800 text-white px-8 py-4 text-lg font-semibold rounded-lg cursor-pointer"
            >
              Go to Dashboard
            </Button>
          )}
          
          <Button
            size="lg"
            variant="outline"
            onClick={onLearnMore}
            className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-lg backdrop-blur-sm bg-transparent cursor-pointer"
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Telegram Auth Dialog */}
      <TelegramAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </section>
  );
}

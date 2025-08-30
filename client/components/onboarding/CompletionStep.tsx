"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Wallet, MessageSquare, Shield, ArrowRight, Star } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner';

interface CompletionStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function CompletionStep({ data, updateData, onNext }: CompletionStepProps) {
  const router = useRouter();
  const { saveOnboardingData, updateAgentPreferences } = useUserProfile();

  const handleGetStarted = async () => {
    try {
      // Save final completion step
      await saveOnboardingData({
        step: 4,
        agentPreferences: {
          autoEnrollment: false,
          riskTolerance: 'medium' as const,
          maxDailyTransactions: 10,
          minimumAirdropValue: 10,
          preferredNetworks: ['avalanche', 'ethereum', 'bsc'],
          blacklistedTokens: [],
          customInstructions: ''
        }
      });

      toast.success('Onboarding completed successfully!');
      console.log('Navigating to dashboard with data:', data);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
      // Still navigate to dashboard
      router.push('/dashboard');
    }
  };

  const getSetupSummary = () => {
    const summary = {
      walletConnected: data.agentWallet?.isConnected || false,
      telegramConnected: data.telegram?.isVerified || false,
      chatRoomsSelected: data.telegram?.selectedChatRooms?.length || 0,
      activeWallets: data.activeWallets?.length || 0,
      hasRestrictions: data.agentWallet?.restrictions?.length > 0
    };
    return summary;
  };

  const summary = getSetupSummary();
  const completionPercentage = Math.round(
    ((summary.walletConnected ? 1 : 0) +
     (summary.telegramConnected ? 1 : 0) +
     (summary.chatRoomsSelected > 0 ? 1 : 0) +
     (summary.activeWallets > 0 ? 1 : 0)) / 4 * 100
  );

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border-green-500/20">
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Setup Complete!</h2>
          <p className="text-white/80 mb-4">
            Your AI agent is now ready to start working for you.
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-white/80 ml-2">{completionPercentage}% Complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Setup Summary */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Setup Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Agent Wallet */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                summary.walletConnected ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Agent Wallet</p>
                <p className="text-white/60 text-sm">
                  {summary.walletConnected ? 'Connected and configured' : 'Not connected'}
                </p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${
              summary.walletConnected 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-gray-500/20 text-gray-300'
            }`}>
              {summary.walletConnected ? 'Ready' : 'Pending'}
            </div>
          </div>

          {/* Telegram Integration */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                summary.telegramConnected ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Telegram Integration</p>
                <p className="text-white/60 text-sm">
                  {summary.telegramConnected 
                    ? `${summary.chatRoomsSelected} chat rooms selected` 
                    : 'Not connected'
                  }
                </p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${
              summary.telegramConnected 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-gray-500/20 text-gray-300'
            }`}>
              {summary.telegramConnected ? 'Connected' : 'Pending'}
            </div>
          </div>

          {/* Active Wallets */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                summary.activeWallets > 0 ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Active Wallets</p>
                <p className="text-white/60 text-sm">
                  {summary.activeWallets > 0 
                    ? `${summary.activeWallets} wallet${summary.activeWallets > 1 ? 's' : ''} monitored` 
                    : 'No wallets added'
                  }
                </p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded text-xs ${
              summary.activeWallets > 0 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-gray-500/20 text-gray-300'
            }`}>
              {summary.activeWallets > 0 ? 'Monitoring' : 'None'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-blue-400" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-blue-300 font-medium">Explore Your Dashboard</p>
                <p className="text-blue-200/80 text-sm">
                  View your agent's activity, transaction monitoring, and chat insights.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-purple-300 font-medium">Customize Agent Behavior</p>
                <p className="text-purple-200/80 text-sm">
                  Fine-tune your agent's responses and trading strategies.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-green-300 font-medium">Start Trading</p>
                <p className="text-green-200/80 text-sm">
                  Let your agent analyze markets and execute trades based on your settings.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Get Started Button */}
      <Card className="bg-gradient-to-r from-red-500/20 to-purple-500/20 backdrop-blur-sm border-red-500/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to Begin?</h3>
          <p className="text-white/80 mb-4">
            Your AI agent is configured and ready to start working. Click below to access your dashboard.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-medium px-8"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">Need help getting started?</p>
            <div className="flex justify-center gap-4 text-sm">
              <button className="text-blue-400 hover:text-blue-300 underline">
                View Documentation
              </button>
              <button className="text-green-400 hover:text-green-300 underline">
                Contact Support
              </button>
              <button className="text-purple-400 hover:text-purple-300 underline">
                Join Community
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

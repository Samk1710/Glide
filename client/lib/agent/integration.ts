"use client";

import { WalletData } from '@/types/onboarding';

export interface AgentIntegration {
  agentAddress: string;
  userWallets: WalletData[];
  telegramConfig?: {
    phoneNumber: string;
    channels: string[];
  };
}

/**
 * Initialize agent with user's onboarding data
 */
export async function setupAgentWithOnboardingData(
  agentAddress: string,
  onboardingData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Set up user wallets in the agent
    if (onboardingData.activeWallets && onboardingData.activeWallets.length > 0) {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_user_wallets',
          agentAddress,
          wallets: onboardingData.activeWallets
        })
      });

      const result = await response.json();
      if (!result.success) {
        return { success: false, error: `Failed to set user wallets: ${result.error}` };
      }
    }

    // Set up Telegram monitoring if configured
    if (onboardingData.telegram?.phoneNumber && onboardingData.telegram?.isVerified) {
      try {
        // Connect to Telegram
        const telegramResponse = await fetch('/api/telegram-monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'connect',
            phoneNumber: onboardingData.telegram.phoneNumber,
            apiId: process.env.NEXT_PUBLIC_TELEGRAM_API_ID,
            apiHash: process.env.NEXT_PUBLIC_TELEGRAM_API_HASH
          })
        });

        const telegramResult = await telegramResponse.json();
        
        if (telegramResult.success) {
          // Add selected chat rooms to monitoring
          if (onboardingData.telegram.selectedChatRooms) {
            for (const chatRoom of onboardingData.telegram.selectedChatRooms) {
              try {
                await fetch('/api/telegram-monitor', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'add_channel',
                    phoneNumber: onboardingData.telegram.phoneNumber,
                    channelUsername: chatRoom.name
                  })
                });
              } catch (error) {
                console.warn(`Failed to add channel ${chatRoom.name}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.warn('Telegram setup failed:', error);
        // Don't fail the entire setup for telegram issues
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Agent setup failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get agent recommendations for user
 */
export async function getAgentRecommendations(agentAddress: string) {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze_airdrops',
        agentAddress
      })
    });

    const result = await response.json();
    return result.success ? result.data : [];

  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
}

/**
 * Auto-enroll user in eligible airdrops
 */
export async function autoEnrollUser(agentAddress: string) {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'auto_enroll',
        agentAddress
      })
    });

    const result = await response.json();
    return result.success ? result.data : { enrolled: [], failed: [] };

  } catch (error) {
    console.error('Auto-enrollment failed:', error);
    return { enrolled: [], failed: [] };
  }
}

/**
 * Check agent status and health
 */
export async function checkAgentHealth(agentAddress: string) {
  try {
    const [balanceResponse, activitiesResponse] = await Promise.all([
      fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_balance',
          agentAddress
        })
      }),
      fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_activities',
          agentAddress
        })
      })
    ]);

    const [balanceResult, activitiesResult] = await Promise.all([
      balanceResponse.json(),
      activitiesResponse.json()
    ]);

    return {
      isHealthy: balanceResult.success && activitiesResult.success,
      balance: balanceResult.success ? balanceResult.data.balance : '0',
      recentActivities: activitiesResult.success ? activitiesResult.data.slice(0, 5) : [],
      lastActivity: activitiesResult.success && activitiesResult.data.length > 0 
        ? activitiesResult.data[0].timestamp 
        : null
    };

  } catch (error) {
    console.error('Agent health check failed:', error);
    return {
      isHealthy: false,
      balance: '0',
      recentActivities: [],
      lastActivity: null
    };
  }
}

/**
 * Get available airdrops from database
 */
export async function getAvailableAirdrops(limit: number = 20) {
  try {
    const response = await fetch(`/api/airdrops?limit=${limit}`);
    const result = await response.json();
    return result.success ? result.data : [];

  } catch (error) {
    console.error('Failed to get available airdrops:', error);
    return [];
  }
}

/**
 * Chat with the agent
 */
export async function chatWithAgent(agentAddress: string, message: string) {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        agentAddress,
        message
      })
    });

    const result = await response.json();
    return result.success ? result.data.response : 'Sorry, I couldn\'t process that request.';

  } catch (error) {
    console.error('Agent chat failed:', error);
    return 'Error communicating with agent.';
  }
}

/**
 * Default agent suggestions for new users
 */
export const defaultAgentStrategies = {
  conservative: {
    name: 'Conservative Strategy',
    description: 'Focus on high-confidence, low-risk opportunities',
    settings: {
      minProbability: 'high',
      maxDailySpend: 100,
      excludeCategories: ['meme', 'high-risk']
    }
  },
  balanced: {
    name: 'Balanced Strategy', 
    description: 'Mix of stable and growth opportunities',
    settings: {
      minProbability: 'medium',
      maxDailySpend: 500,
      includeCategories: ['defi', 'infrastructure', 'gaming']
    }
  },
  aggressive: {
    name: 'Aggressive Strategy',
    description: 'High-risk, high-reward opportunity hunting',
    settings: {
      minProbability: 'low',
      maxDailySpend: 1000,
      includeCategories: ['all']
    }
  }
};

/**
 * Common airdrop categories for filtering
 */
export const airdropCategories = [
  'DeFi',
  'Infrastructure', 
  'Gaming',
  'NFT',
  'Layer 2',
  'Bridge',
  'DEX',
  'Lending',
  'Staking',
  'DAO',
  'Metaverse',
  'Social',
  'Privacy',
  'Oracle',
  'Derivatives'
];

/**
 * Supported blockchain networks
 */
export const supportedNetworks = [
  { id: 'avalanche-fuji', name: 'Avalanche Fuji', chainId: 43113 },
  { id: 'avalanche', name: 'Avalanche', chainId: 43114 },
  { id: 'ethereum', name: 'Ethereum', chainId: 1 },
  { id: 'bsc', name: 'BSC', chainId: 56 },
  { id: 'polygon', name: 'Polygon', chainId: 137 },
  { id: 'arbitrum', name: 'Arbitrum', chainId: 42161 },
  { id: 'optimism', name: 'Optimism', chainId: 10 },
  { id: 'base', name: 'Base', chainId: 8453 },
  { id: 'fantom', name: 'Fantom', chainId: 250 },
  { id: 'solana', name: 'Solana', chainId: 101 }
];

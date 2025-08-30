import 'server-only';
import { Airdrop } from '@/types/airdrop';
import { WalletData } from '@/types/onboarding';
import { ethers } from 'ethers';
import { agentWalletManager } from './wallet-manager';

export interface WalletAnalysis {
  address: string;
  network: string;
  transactionCount: number;
  balance: string;
  tokenHoldings: TokenHolding[];
  nftHoldings: NFTHolding[];
  defiActivity: DeFiActivity;
  socialMetrics: SocialMetrics;
}

export interface TokenHolding {
  contract: string;
  symbol: string;
  balance: string;
  valueUsd: number;
}

export interface NFTHolding {
  contract: string;
  collection: string;
  tokenIds: string[];
  quantity: number;
}

export interface DeFiActivity {
  swapVolume: number;
  lpPositions: LPPosition[];
  stakingPositions: StakingPosition[];
  governanceVotes: number;
}

export interface LPPosition {
  pool: string;
  liquidityUsd: number;
  durationDays: number;
}

export interface StakingPosition {
  contract: string;
  amount: string;
  durationDays: number;
}

export interface SocialMetrics {
  twitterFollows: string[];
  discordMemberships: string[];
  completedQuests: Quest[];
}

export interface Quest {
  platform: string;
  title: string;
  completed: boolean;
  points: number;
}

export interface EligibilityResult {
  airdropSlug: string;
  isEligible: boolean;
  score: number;
  requirements: {
    onchain: RequirementStatus;
    offchain: RequirementStatus;
  };
  recommendations: string[];
  estimatedValue: number;
  autoEnrollable: boolean;
}

export interface RequirementStatus {
  met: boolean;
  details: Record<string, boolean>;
  missingRequirements: string[];
}

class AirdropAnalysisEngine {
  private static instance: AirdropAnalysisEngine;
  private rpcProviders = new Map<string, ethers.JsonRpcProvider>();

  private constructor() {}

  static getInstance(): AirdropAnalysisEngine {
    if (!AirdropAnalysisEngine.instance) {
      AirdropAnalysisEngine.instance = new AirdropAnalysisEngine();
    }
    return AirdropAnalysisEngine.instance;
  }

  /**
   * Get RPC provider for a specific chain
   */
  private getRpcProvider(chainId: number): ethers.JsonRpcProvider {
    const key = chainId.toString();
    if (!this.rpcProviders.has(key)) {
      // You'll need to configure RPC URLs for different chains
      const rpcUrl = this.getChainRpcUrl(chainId);
      this.rpcProviders.set(key, new ethers.JsonRpcProvider(rpcUrl));
    }
    return this.rpcProviders.get(key)!;
  }

  /**
   * Get RPC URL for chain ID
   */
  private getChainRpcUrl(chainId: number): string {
    const rpcUrls: Record<number, string> = {
      1: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
      43113: process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
      43114: process.env.AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
      56: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
      137: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/',
      42161: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      10: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
      8453: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    };

    return rpcUrls[chainId] || process.env.NEXT_PUBLIC_RPC_URL || '';
  }

  /**
   * Analyze a wallet for blockchain activity
   */
  async analyzeWallet(wallet: WalletData): Promise<WalletAnalysis> {
    try {
      const chainId = this.getChainIdFromNetwork(wallet.network);
      const provider = this.getRpcProvider(chainId);

      // Get transaction count
      const transactionCount = await provider.getTransactionCount(wallet.address);

      // Get native balance
      const balance = await provider.getBalance(wallet.address);

      // For now, return basic analysis - you can extend this with more sophisticated data
      const analysis: WalletAnalysis = {
        address: wallet.address,
        network: wallet.network,
        transactionCount,
        balance: ethers.formatEther(balance),
        tokenHoldings: await this.getTokenHoldings(wallet.address, chainId),
        nftHoldings: await this.getNFTHoldings(wallet.address, chainId),
        defiActivity: await this.getDeFiActivity(wallet.address, chainId),
        socialMetrics: await this.getSocialMetrics(wallet.address)
      };

      return analysis;

    } catch (error) {
      console.error('Error analyzing wallet:', error);
      return this.getDefaultWalletAnalysis(wallet);
    }
  }

  /**
   * Check if a wallet meets airdrop requirements
   */
  async checkAirdropEligibility(
    wallets: WalletData[], 
    airdrop: Airdrop
  ): Promise<EligibilityResult> {
    try {
      // Analyze all user wallets
      const walletAnalyses = await Promise.all(
        wallets.map(wallet => this.analyzeWallet(wallet))
      );

      // Check onchain requirements
      const onchainStatus = await this.checkOnchainRequirements(
        walletAnalyses, 
        airdrop.requirements.onchain
      );

      // Check offchain requirements
      const offchainStatus = await this.checkOffchainRequirements(
        walletAnalyses,
        airdrop.requirements.offchain
      );

      // Calculate eligibility score
      const score = this.calculateEligibilityScore(onchainStatus, offchainStatus, airdrop);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        onchainStatus, 
        offchainStatus, 
        airdrop
      );

      // Estimate potential value
      const estimatedValue = this.estimateAirdropValue(score, airdrop);

      const result: EligibilityResult = {
        airdropSlug: airdrop.slug,
        isEligible: onchainStatus.met && offchainStatus.met,
        score,
        requirements: {
          onchain: onchainStatus,
          offchain: offchainStatus
        },
        recommendations,
        estimatedValue,
        autoEnrollable: onchainStatus.met && offchainStatus.met
      };

      return result;

    } catch (error) {
      console.error('Error checking airdrop eligibility:', error);
      return this.getDefaultEligibilityResult(airdrop.slug);
    }
  }

  /**
   * Auto-enroll user in eligible airdrops
   */
  async autoEnrollInAirdrop(
    agentWalletAddress: string,
    airdrop: Airdrop,
    userWallets: WalletData[]
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const agentWallet = agentWalletManager.getAgentWallet(agentWalletAddress);
      if (!agentWallet) {
        throw new Error('Agent wallet not found');
      }

      // Check eligibility first
      const eligibility = await this.checkAirdropEligibility(userWallets, airdrop);
      if (!eligibility.isEligible) {
        return {
          success: false,
          error: 'User not eligible for this airdrop'
        };
      }

      // Perform enrollment actions based on airdrop requirements
      const enrollmentActions = await this.generateEnrollmentActions(airdrop, userWallets);
      
      let txHash: string | undefined;

      // Execute onchain actions if needed
      for (const action of enrollmentActions.onchain) {
        try {
          const hash = await agentWalletManager.executeTransaction(agentWalletAddress, {
            to: action.to,
            value: action.value,
            data: action.data
          });
          
          if (!txHash) txHash = hash; // Store first transaction hash
          
          console.log(`Executed enrollment action: ${action.type} - ${hash}`);
        } catch (error) {
          console.error(`Failed to execute enrollment action ${action.type}:`, error);
        }
      }

      // Execute offchain actions
      for (const action of enrollmentActions.offchain) {
        try {
          await this.executeOffchainAction(action);
          console.log(`Executed offchain action: ${action.type}`);
        } catch (error) {
          console.error(`Failed to execute offchain action ${action.type}:`, error);
        }
      }

      return {
        success: true,
        txHash
      };

    } catch (error) {
      console.error('Error auto-enrolling in airdrop:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods
  private getChainIdFromNetwork(network: string): number {
    const networkMap: Record<string, number> = {
      'ethereum': 1,
      'avalanche-fuji': 43113,
      'avalanche': 43114,
      'bsc': 56,
      'polygon': 137,
      'arbitrum': 42161,
      'optimism': 10,
      'base': 8453,
      'solana': 101 // Special case for Solana
    };
    return networkMap[network.toLowerCase()] || 43113; // Default to Avalanche Fuji
  }

  private async getTokenHoldings(address: string, chainId: number): Promise<TokenHolding[]> {
    // Implement token balance fetching logic
    // You can use services like Alchemy, Moralis, or direct contract calls
    return [];
  }

  private async getNFTHoldings(address: string, chainId: number): Promise<NFTHolding[]> {
    // Implement NFT holdings fetching logic
    return [];
  }

  private async getDeFiActivity(address: string, chainId: number): Promise<DeFiActivity> {
    // Implement DeFi activity analysis
    return {
      swapVolume: 0,
      lpPositions: [],
      stakingPositions: [],
      governanceVotes: 0
    };
  }

  private async getSocialMetrics(address: string): Promise<SocialMetrics> {
    // Implement social metrics fetching
    return {
      twitterFollows: [],
      discordMemberships: [],
      completedQuests: []
    };
  }

  private async checkOnchainRequirements(
    walletAnalyses: WalletAnalysis[], 
    requirements: any
  ): Promise<RequirementStatus> {
    const details: Record<string, boolean> = {};
    const missingRequirements: string[] = [];

    // Check minimum transactions
    const totalTxCount = walletAnalyses.reduce((sum, w) => sum + w.transactionCount, 0);
    details.min_transactions = totalTxCount >= requirements.min_transactions;
    if (!details.min_transactions) {
      missingRequirements.push(`Need ${requirements.min_transactions - totalTxCount} more transactions`);
    }

    // Add more requirement checks here...

    return {
      met: Object.values(details).every(Boolean),
      details,
      missingRequirements
    };
  }

  private async checkOffchainRequirements(
    walletAnalyses: WalletAnalysis[],
    requirements: any
  ): Promise<RequirementStatus> {
    const details: Record<string, boolean> = {};
    const missingRequirements: string[] = [];

    // Check Twitter follows, Discord joins, etc.
    details.twitter_follows = requirements.twitter_follow?.length === 0 || true; // Simplified
    details.discord_joins = requirements.discord_join?.length === 0 || true; // Simplified
    details.kyc = !requirements.kyc_required || false; // Simplified

    return {
      met: Object.values(details).every(Boolean),
      details,
      missingRequirements
    };
  }

  private calculateEligibilityScore(
    onchainStatus: RequirementStatus,
    offchainStatus: RequirementStatus,
    airdrop: Airdrop
  ): number {
    const weights = airdrop.allocation.weights;
    let score = 0;

    if (onchainStatus.met) score += weights.onchain_activity;
    if (offchainStatus.met) score += weights.social;
    
    return Math.min(100, score);
  }

  private generateRecommendations(
    onchainStatus: RequirementStatus,
    offchainStatus: RequirementStatus,
    airdrop: Airdrop
  ): string[] {
    const recommendations: string[] = [];

    onchainStatus.missingRequirements.forEach(req => {
      recommendations.push(`Complete onchain requirement: ${req}`);
    });

    offchainStatus.missingRequirements.forEach(req => {
      recommendations.push(`Complete offchain requirement: ${req}`);
    });

    return recommendations;
  }

  private estimateAirdropValue(score: number, airdrop: Airdrop): number {
    const [min, max] = airdrop.estimates.expected_value_usd_range;
    return min + (max - min) * (score / 100);
  }

  private async generateEnrollmentActions(airdrop: Airdrop, userWallets: WalletData[]): Promise<{
    onchain: any[];
    offchain: any[];
  }> {
    return {
      onchain: [], // Generate based on airdrop requirements
      offchain: [] // Generate based on social requirements
    };
  }

  private async executeOffchainAction(action: any): Promise<void> {
    // Implement offchain action execution (Twitter follows, Discord joins, etc.)
  }

  private getDefaultWalletAnalysis(wallet: WalletData): WalletAnalysis {
    return {
      address: wallet.address,
      network: wallet.network,
      transactionCount: 0,
      balance: '0',
      tokenHoldings: [],
      nftHoldings: [],
      defiActivity: {
        swapVolume: 0,
        lpPositions: [],
        stakingPositions: [],
        governanceVotes: 0
      },
      socialMetrics: {
        twitterFollows: [],
        discordMemberships: [],
        completedQuests: []
      }
    };
  }

  private getDefaultEligibilityResult(airdropSlug: string): EligibilityResult {
    return {
      airdropSlug,
      isEligible: false,
      score: 0,
      requirements: {
        onchain: { met: false, details: {}, missingRequirements: [] },
        offchain: { met: false, details: {}, missingRequirements: [] }
      },
      recommendations: [],
      estimatedValue: 0,
      autoEnrollable: false
    };
  }
}

export const airdropAnalysisEngine = AirdropAnalysisEngine.getInstance();

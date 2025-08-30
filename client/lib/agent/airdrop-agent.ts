import 'server-only';
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AgentkitToolkit } from "@0xgasless/agentkit";
import { agentWalletManager, type AgentWallet } from './wallet-manager';
import { airdropAnalysisEngine, type EligibilityResult } from './analysis-engine';
import { Airdrop } from '@/types/airdrop';
import { WalletData, OnboardingData } from '@/types/onboarding';
import AirdropModel from '@/lib/models/Airdrop';
import { dbConnect } from '@/lib/db';

export interface AgentConfig {
  openRouterApiKey: string;
  rpcUrl: string;
  apiKey: string;
  chainId: number;
}

export interface AirdropRecommendation {
  airdrop: Airdrop;
  eligibility: EligibilityResult;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

export interface AgentActivity {
  timestamp: string;
  type: 'analysis' | 'enrollment' | 'notification' | 'error';
  airdropSlug?: string;
  message: string;
  txHash?: string;
}

class AirdropAgent {
  private agentWallet?: AgentWallet;
  private llm: ChatOpenAI;
  private agent: any;
  private config: any;
  private userWallets: WalletData[] = [];
  private activities: AgentActivity[] = [];

  constructor(private agentConfig: AgentConfig) {
    this.llm = new ChatOpenAI({
      model: "gpt-4o",
      openAIApiKey: agentConfig.openRouterApiKey,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
    });
  }

  /**
   * Initialize agent with a new wallet
   */
  async initializeWithNewWallet(): Promise<{ address: string; privateKey: string }> {
    try {
      this.agentWallet = await agentWalletManager.createAgentWallet({
        rpcUrl: this.agentConfig.rpcUrl,
        apiKey: this.agentConfig.apiKey,
        chainId: this.agentConfig.chainId,
        userId: "default-user" // Replace with actual user ID if available
      });

      await this.setupAgent();

      this.addActivity({
        type: 'notification',
        message: `Agent wallet created: ${this.agentWallet.address}`
      });

      return {
        address: this.agentWallet.address,
        privateKey: this.agentWallet.privateKey
      };

    } catch (error) {
      console.error('Failed to initialize agent with new wallet:', error);
      throw error;
    }
  }

  /**
   * Initialize agent with imported wallet
   */
  async initializeWithImportedWallet(privateKey: string): Promise<string> {
    try {
      this.agentWallet = await agentWalletManager.importAgentWallet({
        privateKey: privateKey as `0x${string}`,
        rpcUrl: this.agentConfig.rpcUrl,
        apiKey: this.agentConfig.apiKey,
        chainId: this.agentConfig.chainId,
        userId: "default-user" // Replace with actual user ID if available
      });

      await this.setupAgent();

      this.addActivity({
        type: 'notification',
        message: `Agent wallet imported: ${this.agentWallet.address}`
      });

      return this.agentWallet.address;

    } catch (error) {
      console.error('Failed to initialize agent with imported wallet:', error);
      throw error;
    }
  }

  /**
   * Set up the LangChain agent with 0xGasless tools
   */
  private async setupAgent(): Promise<void> {
    if (!this.agentWallet) {
      throw new Error('Agent wallet not initialized');
    }

    try {
      const toolkit = new AgentkitToolkit(this.agentWallet.agentkit);
      const tools = toolkit.getTools();

      const memory = new MemorySaver();
      this.config = { configurable: { thread_id: "airdrop-agent" } };

      this.agent = createReactAgent({
        llm: this.llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
          You are an advanced Airdrop Agent specialized in analyzing and participating in cryptocurrency airdrops.
          
          Your capabilities include:
          🎯 AIRDROP ANALYSIS:
          - Monitor and analyze upcoming airdrops from multiple sources
          - Check user wallet eligibility against airdrop requirements
          - Calculate potential airdrop values and probability scores
          - Generate actionable recommendations for users
          
          🔄 AUTO-ENROLLMENT:
          - Automatically enroll eligible users in airdrops
          - Execute required onchain transactions (swaps, stakes, transfers)
          - Complete offchain requirements (social follows, quest completions)
          - Optimize gas usage and transaction timing on Avalanche Fuji
          
          💰 WALLET MANAGEMENT:
          - Analyze user wallet activity across multiple chains
          - Track token holdings, NFTs, and DeFi positions
          - Monitor transaction history and patterns on Avalanche
          - Ensure security and compliance with airdrop rules
          
          🚨 SMART DECISION MAKING:
          - Prioritize high-value, high-probability airdrops
          - Avoid sybil detection and maintain good standing
          - Balance risk and reward for each opportunity
          - Provide clear explanations for all decisions
          
          You operate primarily on Avalanche Fuji testnet for safe testing and development.
          
          When analyzing airdrops:
          1. 📊 Evaluate eligibility based on user's wallet history
          2. 💎 Calculate expected value and probability
          3. ⚡ Identify required actions for enrollment
          4. 🎯 Prioritize based on ROI and effort required
          5. 🔐 Ensure all actions maintain security and compliance
          
          Always provide clear, actionable insights and maintain the highest security standards.
        `,
      });

      console.log('Agent setup completed successfully');

    } catch (error) {
      console.error('Failed to setup agent:', error);
      throw error;
    }
  }

  /**
   * Set user's active wallets
   */
  setUserWallets(wallets: WalletData[]): void {
    this.userWallets = wallets;
    this.addActivity({
      type: 'notification',
      message: `Updated user wallets: ${wallets.length} wallet(s) configured`
    });
  }

  /**
   * Analyze all available airdrops for the user
   */
  async analyzeAirdrops(): Promise<AirdropRecommendation[]> {
    try {
      await dbConnect();

      // Fetch all active airdrops
      const airdrops = await AirdropModel.find({
        'timeline.rumor_window_end': { $gt: new Date() }
      }).sort({ 'estimates.expected_value_usd_range.1': -1 });

      const recommendations: AirdropRecommendation[] = [];

      // Analyze each airdrop
      for (const airdrop of airdrops) {
        try {
          const eligibility = await airdropAnalysisEngine.checkAirdropEligibility(
            this.userWallets,
            airdrop
          );

          const priority = this.calculatePriority(eligibility, airdrop);

          recommendations.push({
            airdrop,
            eligibility,
            priority,
            actionRequired: !eligibility.isEligible && eligibility.recommendations.length > 0
          });

          this.addActivity({
            type: 'analysis',
            airdropSlug: airdrop.slug,
            message: `Analyzed ${airdrop.name}: ${eligibility.isEligible ? 'Eligible' : 'Not eligible'} (Score: ${eligibility.score})`
          });

        } catch (error) {
          console.error(`Error analyzing airdrop ${airdrop.slug}:`, error);
          this.addActivity({
            type: 'error',
            airdropSlug: airdrop.slug,
            message: `Failed to analyze ${airdrop.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }

      // Sort by priority and expected value
      recommendations.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.eligibility.estimatedValue - a.eligibility.estimatedValue;
      });

      return recommendations;

    } catch (error) {
      console.error('Error analyzing airdrops:', error);
      this.addActivity({
        type: 'error',
        message: `Failed to analyze airdrops: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return [];
    }
  }

  /**
   * Auto-enroll in eligible airdrops
   */
  async autoEnrollInEligibleAirdrops(): Promise<{ enrolled: string[]; failed: string[] }> {
    if (!this.agentWallet) {
      throw new Error('Agent wallet not initialized');
    }

    const recommendations = await this.analyzeAirdrops();
    const eligibleAirdrops = recommendations.filter(rec => rec.eligibility.isEligible);

    const enrolled: string[] = [];
    const failed: string[] = [];

    for (const recommendation of eligibleAirdrops) {
      try {
        const result = await airdropAnalysisEngine.autoEnrollInAirdrop(
          this.agentWallet.address,
          recommendation.airdrop,
          this.userWallets
        );

        if (result.success) {
          enrolled.push(recommendation.airdrop.slug);
          this.addActivity({
            type: 'enrollment',
            airdropSlug: recommendation.airdrop.slug,
            message: `Successfully enrolled in ${recommendation.airdrop.name}`,
            txHash: result.txHash
          });
        } else {
          failed.push(recommendation.airdrop.slug);
          this.addActivity({
            type: 'error',
            airdropSlug: recommendation.airdrop.slug,
            message: `Failed to enroll in ${recommendation.airdrop.name}: ${result.error}`
          });
        }

      } catch (error) {
        failed.push(recommendation.airdrop.slug);
        this.addActivity({
          type: 'error',
          airdropSlug: recommendation.airdrop.slug,
          message: `Error enrolling in ${recommendation.airdrop.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return { enrolled, failed };
  }

  /**
   * Get agent wallet balance
   */
  async getAgentWalletBalance(): Promise<string> {
    if (!this.agentWallet) return '0';
    return await agentWalletManager.getWalletBalance(this.agentWallet.address);
  }

  /**
   * Get agent activities
   */
  getActivities(): AgentActivity[] {
    return this.activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Chat with the agent
   */
  async chat(message: string): Promise<string> {
    if (!this.agent) {
      return "Agent not initialized. Please create or import an agent wallet first.";
    }

    try {
      const stream = await this.agent.stream({
        messages: [{ role: "human", content: message }]
      }, this.config);

      let response = "";
      for await (const chunk of stream) {
        if (chunk.agent?.messages?.length > 0) {
          const lastMessage = chunk.agent.messages[chunk.agent.messages.length - 1];
          if (lastMessage.kwargs?.content) {
            response = lastMessage.kwargs.content;
          }
        }
      }

      this.addActivity({
        type: 'notification',
        message: `Chat: ${message.slice(0, 50)}... -> ${response.slice(0, 50)}...`
      });

      return response || "I'm sorry, I couldn't process that request.";

    } catch (error) {
      console.error('Error in agent chat:', error);
      const errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.addActivity({
        type: 'error',
        message: errorMessage
      });
      return errorMessage;
    }
  }

  /**
   * Calculate airdrop priority
   */
  private calculatePriority(eligibility: EligibilityResult, airdrop: Airdrop): 'high' | 'medium' | 'low' {
    if (eligibility.isEligible && eligibility.estimatedValue > 1000) return 'high';
    if (eligibility.isEligible || (eligibility.score > 70 && eligibility.estimatedValue > 500)) return 'medium';
    return 'low';
  }

  /**
   * Add activity log
   */
  private addActivity(activity: Omit<AgentActivity, 'timestamp'>): void {
    this.activities.push({
      ...activity,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(-100);
    }
  }
}

// Export factory function
export function createAirdropAgent(config: AgentConfig): AirdropAgent {
  return new AirdropAgent(config);
}

export type { AirdropAgent };

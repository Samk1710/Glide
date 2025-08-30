import UserProfileManager from './user-profile-manager';
import { AgentSessionManager } from './session-manager';

export interface AgentExecutionContext {
  userId: string;
  profile: any;
  session: any;
  walletInfo: {
    agentWallet: any;
    activeWallets: any[];
  };
  telegramPreferences: any;
  agentPreferences: any;
}

export class EnhancedAgentManager {
  /**
   * Initialize agent context with user profile data
   */
  static async initializeAgentContext(userId: string): Promise<AgentExecutionContext | null> {
    try {
      // Load user profile
      const profile = await UserProfileManager.getUserProfile(userId);
      if (!profile) {
        console.error('No user profile found for', userId);
        return null;
      }

      // Load agent session
      const session = await AgentSessionManager.getSession(userId);
      
      // Extract relevant data
      const walletInfo = {
        agentWallet: profile.agentWallet,
        activeWallets: profile.activeWallets || []
      };

      const context: AgentExecutionContext = {
        userId,
        profile,
        session,
        walletInfo,
        telegramPreferences: profile.telegramPreferences,
        agentPreferences: profile.agentPreferences
      };

      console.log('Agent context initialized for user:', userId);
      return context;
    } catch (error) {
      console.error('Error initializing agent context:', error);
      return null;
    }
  }

  /**
   * Execute agent functions with user context
   */
  static async executeAgentAction(
    context: AgentExecutionContext,
    action: string,
    params?: any
  ): Promise<any> {
    try {
      console.log(`Executing agent action: ${action} for user: ${context.userId}`);

      switch (action) {
        case 'analyze_airdrops':
          return await this.analyzeAirdrops(context, params);
        
        case 'monitor_telegram':
          return await this.monitorTelegramChannels(context, params);
        
        case 'check_wallet_eligibility':
          return await this.checkWalletEligibility(context, params);
        
        case 'execute_airdrop_enrollment':
          return await this.executeAirdropEnrollment(context, params);
        
        case 'generate_daily_report':
          return await this.generateDailyReport(context, params);
        
        default:
          throw new Error(`Unknown agent action: ${action}`);
      }
    } catch (error) {
      console.error(`Error executing agent action ${action}:`, error);
      throw error;
    }
  }

  /**
   * Analyze airdrops using user preferences and wallet data
   */
  private static async analyzeAirdrops(
    context: AgentExecutionContext,
    params?: any
  ): Promise<any> {
    const { walletInfo, agentPreferences, telegramPreferences } = context;

    console.log('Analyzing airdrops with user context...');

    // Use user's preferred networks
    const networksToAnalyze = agentPreferences?.preferredNetworks || ['avalanche', 'ethereum', 'bsc'];
    
    // Use user's active wallets for eligibility checking
    const walletsToCheck = walletInfo.activeWallets.filter(wallet => wallet.isActive);
    
    // Use user's telegram channels for monitoring
    const channelsToMonitor = telegramPreferences?.selectedChannels
      ?.filter((channel: any) => channel.isSelected)
      ?.map((channel: any) => channel.chatId) || [];

    const analysis = {
      userId: context.userId,
      timestamp: new Date(),
      networks: networksToAnalyze,
      walletsAnalyzed: walletsToCheck.length,
      channelsMonitored: channelsToMonitor.length,
      minValue: agentPreferences?.minimumAirdropValue || 10,
      riskTolerance: agentPreferences?.riskTolerance || 'medium',
      // This would contain actual airdrop analysis results
      potentialAirdrops: [],
      eligibleAirdrops: [],
      recommendations: []
    };

    // Update analytics
    await UserProfileManager.updateAnalytics(context.userId, {
      totalAirdropsFound: analysis.potentialAirdrops.length,
      successRate: 0 // Would be calculated based on historical data
    });

    return analysis;
  }

  /**
   * Monitor telegram channels using user's selected channels
   */
  private static async monitorTelegramChannels(
    context: AgentExecutionContext,
    params?: any
  ): Promise<any> {
    const { telegramPreferences } = context;

    if (!telegramPreferences?.isConnected || !telegramPreferences.sessionString) {
      throw new Error('Telegram not connected for this user');
    }

    const selectedChannels = telegramPreferences.selectedChannels
      ?.filter((channel: any) => channel.isSelected) || [];

    console.log(`Monitoring ${selectedChannels.length} channels for user ${context.userId}`);

    const monitoring = {
      userId: context.userId,
      timestamp: new Date(),
      sessionString: telegramPreferences.sessionString,
      channels: selectedChannels,
      keywords: telegramPreferences.monitoringKeywords || [],
      notifications: telegramPreferences.notificationSettings,
      // This would contain actual monitoring results
      newMessages: [],
      airdropAlerts: [],
      filteredResults: []
    };

    return monitoring;
  }

  /**
   * Check wallet eligibility using user's active wallets
   */
  private static async checkWalletEligibility(
    context: AgentExecutionContext,
    params?: any
  ): Promise<any> {
    const { walletInfo, agentPreferences } = context;
    const { airdropId } = params || {};

    if (!airdropId) {
      throw new Error('Airdrop ID required for eligibility check');
    }

    const activeWallets = walletInfo.activeWallets.filter(wallet => wallet.isActive);
    
    console.log(`Checking eligibility for ${activeWallets.length} wallets`);

    const eligibilityCheck = {
      userId: context.userId,
      airdropId,
      timestamp: new Date(),
      walletsChecked: activeWallets.map(wallet => ({
        address: wallet.address,
        network: wallet.network,
        balance: wallet.balance,
        // This would contain actual eligibility results
        isEligible: false,
        eligibilityReason: '',
        potentialReward: 0
      })),
      agentWallet: walletInfo.agentWallet,
      preferences: agentPreferences
    };

    return eligibilityCheck;
  }

  /**
   * Execute airdrop enrollment using agent wallet
   */
  private static async executeAirdropEnrollment(
    context: AgentExecutionContext,
    params?: any
  ): Promise<any> {
    const { walletInfo, agentPreferences, session } = context;
    const { airdropId, walletAddress } = params || {};

    if (!agentPreferences?.autoEnrollment) {
      throw new Error('Auto-enrollment not enabled for this user');
    }

    if (!session || !walletInfo.agentWallet?.isConnected) {
      throw new Error('Agent wallet not available');
    }

    console.log(`Executing airdrop enrollment for user ${context.userId}`);

    const enrollment = {
      userId: context.userId,
      airdropId,
      walletAddress,
      timestamp: new Date(),
      agentWalletAddress: walletInfo.agentWallet.address,
      maxDailyTransactions: agentPreferences.maxDailyTransactions || 10,
      // This would contain actual enrollment results
      transactionHash: '',
      status: 'pending',
      estimatedReward: 0
    };

    // Update analytics
    await UserProfileManager.updateAnalytics(context.userId, {
      totalAirdropsJoined: 1 // Increment
    });

    return enrollment;
  }

  /**
   * Generate daily report for user
   */
  private static async generateDailyReport(
    context: AgentExecutionContext,
    params?: any
  ): Promise<any> {
    const { userId, walletInfo, telegramPreferences, agentPreferences, profile } = context;

    console.log(`Generating daily report for user ${userId}`);

    const report = {
      userId,
      date: new Date().toDateString(),
      timestamp: new Date(),
      summary: {
        activeWallets: walletInfo.activeWallets.length,
        monitoredChannels: telegramPreferences?.selectedChannels?.filter((c: any) => c.isSelected).length || 0,
        agentWalletConnected: walletInfo.agentWallet?.isConnected || false,
        telegramConnected: telegramPreferences?.isConnected || false
      },
      analytics: profile.analytics,
      preferences: agentPreferences,
      recommendations: [
        // This would contain AI-generated recommendations
      ],
      upcomingAirdrops: [
        // This would contain upcoming airdrop opportunities
      ]
    };

    return report;
  }

  /**
   * Update user preferences and save to profile
   */
  static async updateUserPreferences(
    userId: string,
    preferences: any
  ): Promise<boolean> {
    try {
      const success = await UserProfileManager.updateAgentPreferences(userId, preferences);
      
      if (success) {
        console.log('User preferences updated successfully');
        return true;
      } else {
        console.error('Failed to update user preferences');
        return false;
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }

  /**
   * Get user's current settings and status
   */
  static async getUserStatus(userId: string): Promise<any> {
    try {
      const profile = await UserProfileManager.getUserProfile(userId);
      if (!profile) {
        return { error: 'User profile not found' };
      }

      const status = {
        userId,
        onboardingCompleted: profile.onboardingCompleted,
        onboardingStep: profile.onboardingStep,
        agentWalletConnected: profile.agentWallet?.isConnected || false,
        telegramConnected: profile.telegramPreferences?.isConnected || false,
        activeWalletsCount: profile.activeWallets?.length || 0,
        lastActiveAt: profile.lastActiveAt,
        analytics: profile.analytics,
        preferences: profile.agentPreferences
      };

      return status;
    } catch (error) {
      console.error('Error getting user status:', error);
      return { error: 'Failed to get user status' };
    }
  }
}

export default EnhancedAgentManager;

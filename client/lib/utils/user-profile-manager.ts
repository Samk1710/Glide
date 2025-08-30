import { dbConnect } from '../db';
import UserProfile, { IUserProfile } from '../models/UserProfile';
import { generateDeviceFingerprint, hashIP } from './encryption';

export interface OnboardingData {
  step: number;
  agentWallet?: {
    address: string;
    chainId: number;
    restrictions?: string;
    notes?: string;
  };
  activeWallets?: Array<{
    address: string;
    network: string;
    balance?: string;
    nickname?: string;
  }>;
  telegramData?: {
    phoneNumber: string;
    sessionString: string;
    selectedChannels: Array<{
      chatId: string;
      title: string;
      type: 'group' | 'channel' | 'private';
      memberCount?: number;
      isSelected: boolean;
      keywords?: string[];
    }>;
    monitoringKeywords: string[];
    notificationSettings?: {
      newAirdrops: boolean;
      eligibleAirdrops: boolean;
      autoEnrollment: boolean;
      dailySummary: boolean;
    };
  };
  agentPreferences?: {
    autoEnrollment: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
    maxDailyTransactions: number;
    minimumAirdropValue: number;
    preferredNetworks: string[];
    blacklistedTokens: string[];
    customInstructions?: string;
  };
}

export interface UserMetadata {
  userAgent?: string;
  ipAddress?: string;
  referralSource?: string;
}

export class UserProfileManager {
  /**
   * Create or update user profile with onboarding data
   */
  static async saveOnboardingData(
    userId: string, 
    onboardingData: OnboardingData,
    metadata?: UserMetadata
  ): Promise<IUserProfile> {
    try {
      await dbConnect();

      const updateData: Partial<IUserProfile> = {
        userId,
        onboardingStep: onboardingData.step,
        onboardingCompleted: onboardingData.step >= 4, // Assuming 4 steps total
        lastActiveAt: new Date()
      };

      // Update agent wallet data
      if (onboardingData.agentWallet) {
        updateData.agentWallet = {
          address: onboardingData.agentWallet.address,
          chainId: onboardingData.agentWallet.chainId,
          restrictions: onboardingData.agentWallet.restrictions,
          notes: onboardingData.agentWallet.notes,
          isConnected: true
        };
      }

      // Update active wallets
      if (onboardingData.activeWallets) {
        updateData.activeWallets = onboardingData.activeWallets.map(wallet => ({
          address: wallet.address,
          network: wallet.network,
          balance: wallet.balance,
          nickname: wallet.nickname,
          isActive: true,
          lastChecked: new Date()
        }));
      }

      // Update telegram preferences
      if (onboardingData.telegramData) {
        updateData.telegramPreferences = {
          isConnected: true,
          phoneNumber: onboardingData.telegramData.phoneNumber,
          sessionString: onboardingData.telegramData.sessionString,
          selectedChannels: onboardingData.telegramData.selectedChannels,
          monitoringKeywords: onboardingData.telegramData.monitoringKeywords,
          notificationSettings: onboardingData.telegramData.notificationSettings || {
            newAirdrops: true,
            eligibleAirdrops: true,
            autoEnrollment: false,
            dailySummary: true
          }
        };
      }

      // Update agent preferences
      if (onboardingData.agentPreferences) {
        updateData.agentPreferences = onboardingData.agentPreferences;
      }

      // Update metadata
      if (metadata) {
        updateData.metadata = {
          userAgent: metadata.userAgent,
          ipHash: metadata.ipAddress ? hashIP(metadata.ipAddress) : undefined,
          deviceFingerprint: generateDeviceFingerprint(metadata.userAgent || ''),
          referralSource: metadata.referralSource,
          version: '1.0.0'
        };
      }

      const userProfile = await UserProfile.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { upsert: true, new: true, runValidators: true }
      );

      console.log(`User profile saved for ${userId}, step ${onboardingData.step}`);
      return userProfile;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw new Error('Failed to save user profile');
    }
  }

  /**
   * Get complete user profile by userId
   */
  static async getUserProfile(userId: string): Promise<IUserProfile | null> {
    try {
      await dbConnect();
      
      const profile = await UserProfile.findOne({ userId });
      if (profile) {
        // Update last active timestamp
        profile.lastActiveAt = new Date();
        await profile.save();
      }
      
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update telegram session data
   */
  static async updateTelegramSession(
    userId: string,
    sessionString: string,
    phoneNumber?: string
  ): Promise<boolean> {
    try {
      await dbConnect();
      
      const result = await UserProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            'telegramPreferences.sessionString': sessionString,
            'telegramPreferences.phoneNumber': phoneNumber,
            'telegramPreferences.isConnected': true,
            lastActiveAt: new Date()
          }
        },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('Error updating telegram session:', error);
      return false;
    }
  }

  /**
   * Update selected channels for monitoring
   */
  static async updateSelectedChannels(
    userId: string,
    channels: Array<{
      chatId: string;
      title: string;
      type: 'group' | 'channel' | 'private';
      memberCount?: number;
      isSelected: boolean;
      keywords?: string[];
    }>
  ): Promise<boolean> {
    try {
      await dbConnect();
      
      const result = await UserProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            'telegramPreferences.selectedChannels': channels,
            lastActiveAt: new Date()
          }
        },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('Error updating selected channels:', error);
      return false;
    }
  }

  /**
   * Update agent preferences
   */
  static async updateAgentPreferences(
    userId: string,
    preferences: Partial<{
      autoEnrollment: boolean;
      riskTolerance: 'low' | 'medium' | 'high';
      maxDailyTransactions: number;
      minimumAirdropValue: number;
      preferredNetworks: string[];
      blacklistedTokens: string[];
      customInstructions: string;
    }>
  ): Promise<boolean> {
    try {
      await dbConnect();
      
      const updateFields: Record<string, any> = {};
      Object.keys(preferences).forEach(key => {
        updateFields[`agentPreferences.${key}`] = preferences[key as keyof typeof preferences];
      });
      updateFields.lastActiveAt = new Date();

      const result = await UserProfile.findOneAndUpdate(
        { userId },
        { $set: updateFields },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('Error updating agent preferences:', error);
      return false;
    }
  }

  /**
   * Update analytics data
   */
  static async updateAnalytics(
    userId: string,
    analytics: {
      totalAirdropsFound?: number;
      totalAirdropsJoined?: number;
      totalValueEarned?: number;
      successRate?: number;
    }
  ): Promise<boolean> {
    try {
      await dbConnect();
      
      const updateFields: Record<string, any> = {};
      Object.keys(analytics).forEach(key => {
        if (analytics[key as keyof typeof analytics] !== undefined) {
          updateFields[`analytics.${key}`] = analytics[key as keyof typeof analytics];
        }
      });
      updateFields['analytics.lastAnalysisDate'] = new Date();
      updateFields.lastActiveAt = new Date();

      const result = await UserProfile.findOneAndUpdate(
        { userId },
        { $set: updateFields },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('Error updating analytics:', error);
      return false;
    }
  }

  /**
   * Get user's telegram preferences
   */
  static async getTelegramPreferences(userId: string) {
    try {
      await dbConnect();
      
      const profile = await UserProfile.findOne({ userId }, 'telegramPreferences');
      return profile?.telegramPreferences || null;
    } catch (error) {
      console.error('Error getting telegram preferences:', error);
      return null;
    }
  }

  /**
   * Get user's agent wallet info
   */
  static async getAgentWalletInfo(userId: string) {
    try {
      await dbConnect();
      
      const profile = await UserProfile.findOne({ userId }, 'agentWallet');
      return profile?.agentWallet || null;
    } catch (error) {
      console.error('Error getting agent wallet info:', error);
      return null;
    }
  }

  /**
   * Get user's active wallets
   */
  static async getActiveWallets(userId: string) {
    try {
      await dbConnect();
      
      const profile = await UserProfile.findOne({ userId }, 'activeWallets');
      return profile?.activeWallets || [];
    } catch (error) {
      console.error('Error getting active wallets:', error);
      return [];
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async isOnboardingCompleted(userId: string): Promise<boolean> {
    try {
      await dbConnect();
      
      const profile = await UserProfile.findOne({ userId }, 'onboardingCompleted');
      return profile?.onboardingCompleted || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Delete user profile
   */
  static async deleteUserProfile(userId: string): Promise<boolean> {
    try {
      await dbConnect();
      
      const result = await UserProfile.findOneAndDelete({ userId });
      return !!result;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
  }
}

export default UserProfileManager;

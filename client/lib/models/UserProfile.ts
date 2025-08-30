import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;
  onboardingCompleted: boolean;
  onboardingStep: number;
  
  // Agent Wallet Information
  agentWallet: {
    address?: string;
    chainId: number;
    restrictions?: string;
    notes?: string;
    isConnected: boolean;
    sessionId?: string;
  };
  
  // Active Wallets Information
  activeWallets: Array<{
    address: string;
    network: string;
    balance?: string;
    lastChecked?: Date;
    isActive: boolean;
    nickname?: string;
  }>;
  
  // Telegram Preferences
  telegramPreferences: {
    isConnected: boolean;
    phoneNumber?: string;
    sessionString?: string;
    selectedChannels: Array<{
      chatId: string;
      title: string;
      type: 'group' | 'channel' | 'private';
      memberCount?: number;
      isSelected: boolean;
      keywords?: string[];
    }>;
    monitoringKeywords: string[];
    notificationSettings: {
      newAirdrops: boolean;
      eligibleAirdrops: boolean;
      autoEnrollment: boolean;
      dailySummary: boolean;
    };
  };
  
  // Agent Preferences
  agentPreferences: {
    autoEnrollment: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
    maxDailyTransactions: number;
    minimumAirdropValue: number;
    preferredNetworks: string[];
    blacklistedTokens: string[];
    customInstructions?: string;
  };
  
  // Analytics Data
  analytics: {
    totalAirdropsFound: number;
    totalAirdropsJoined: number;
    totalValueEarned: number;
    lastAnalysisDate?: Date;
    successRate: number;
  };
  
  // Metadata
  metadata: {
    userAgent?: string;
    ipHash?: string;
    deviceFingerprint?: string;
    referralSource?: string;
    version: string;
  };
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastActiveAt: { 
    type: Date, 
    default: Date.now 
  },
  onboardingCompleted: { 
    type: Boolean, 
    default: false 
  },
  onboardingStep: { 
    type: Number, 
    default: 0 
  },
  
  agentWallet: {
    address: String,
    chainId: { type: Number, default: 43113 },
    restrictions: String,
    notes: String,
    isConnected: { type: Boolean, default: false },
    sessionId: String
  },
  
  activeWallets: [{
    address: { type: String, required: true },
    network: { type: String, required: true },
    balance: String,
    lastChecked: Date,
    isActive: { type: Boolean, default: true },
    nickname: String
  }],
  
  telegramPreferences: {
    isConnected: { type: Boolean, default: false },
    phoneNumber: String,
    sessionString: String,
    selectedChannels: [{
      chatId: { type: String, required: true },
      title: { type: String, required: true },
      type: { 
        type: String, 
        enum: ['group', 'channel', 'private'], 
        required: true 
      },
      memberCount: Number,
      isSelected: { type: Boolean, default: false },
      keywords: [String]
    }],
    monitoringKeywords: [String],
    notificationSettings: {
      newAirdrops: { type: Boolean, default: true },
      eligibleAirdrops: { type: Boolean, default: true },
      autoEnrollment: { type: Boolean, default: false },
      dailySummary: { type: Boolean, default: true }
    }
  },
  
  agentPreferences: {
    autoEnrollment: { type: Boolean, default: false },
    riskTolerance: { 
      type: String, 
      enum: ['low', 'medium', 'high'], 
      default: 'medium' 
    },
    maxDailyTransactions: { type: Number, default: 10 },
    minimumAirdropValue: { type: Number, default: 10 },
    preferredNetworks: { 
      type: [String], 
      default: ['avalanche', 'ethereum', 'bsc'] 
    },
    blacklistedTokens: [String],
    customInstructions: String
  },
  
  analytics: {
    totalAirdropsFound: { type: Number, default: 0 },
    totalAirdropsJoined: { type: Number, default: 0 },
    totalValueEarned: { type: Number, default: 0 },
    lastAnalysisDate: Date,
    successRate: { type: Number, default: 0 }
  },
  
  metadata: {
    userAgent: String,
    ipHash: String,
    deviceFingerprint: String,
    referralSource: String,
    version: { type: String, default: '1.0.0' }
  }
}, { 
  timestamps: true,
  collection: 'userProfiles'
});

// Indexes for performance
UserProfileSchema.index({ userId: 1 });
UserProfileSchema.index({ 'agentWallet.address': 1 });
UserProfileSchema.index({ 'telegramPreferences.isConnected': 1 });
UserProfileSchema.index({ onboardingCompleted: 1 });
UserProfileSchema.index({ lastActiveAt: 1 });

export default (mongoose.models.UserProfile as mongoose.Model<IUserProfile>) || 
               mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);

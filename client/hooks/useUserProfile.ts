import { useState, useEffect, useCallback } from 'react';
import { OnboardingData, UserMetadata } from '../lib/utils/user-profile-manager';

interface UserProfile {
  userId: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
  agentWallet?: {
    address?: string;
    chainId: number;
    restrictions?: string;
    notes?: string;
    isConnected: boolean;
    sessionId?: string;
  };
  activeWallets?: Array<{
    address: string;
    network: string;
    balance?: string;
    nickname?: string;
    isActive: boolean;
  }>;
  telegramPreferences?: {
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
  agentPreferences?: {
    autoEnrollment: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
    maxDailyTransactions: number;
    minimumAirdropValue: number;
    preferredNetworks: string[];
    blacklistedTokens: string[];
    customInstructions?: string;
  };
  analytics?: {
    totalAirdropsFound: number;
    totalAirdropsJoined: number;
    totalValueEarned: number;
    successRate: number;
    lastAnalysisDate?: Date;
  };
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  saveOnboardingData: (data: OnboardingData, metadata?: UserMetadata) => Promise<boolean>;
  updateTelegramSession: (sessionString: string, phoneNumber?: string) => Promise<boolean>;
  updateSelectedChannels: (channels: any[]) => Promise<boolean>;
  updateAgentPreferences: (preferences: any) => Promise<boolean>;
  updateAnalytics: (analytics: any) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
}

export const useUserProfile = (userId?: string): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate or get user ID
  const getUserId = useCallback(() => {
    if (userId) return userId;
    
    let storedUserId = localStorage.getItem('glide_user_id');
    console.log('Retrieved stored user ID:', storedUserId);
    
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('Generated new user ID:', storedUserId);
      localStorage.setItem('glide_user_id', storedUserId);
    } else {
      console.log('Using existing user ID:', storedUserId);
    }
    
    return storedUserId;
  }, [userId]);

  // Fetch user profile from API
  const fetchProfile = useCallback(async (userIdToFetch: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/user-profile?userId=${userIdToFetch}`);
      
      // If user doesn't exist (404), that's normal for new users - create empty profile
      if (response.status === 404) {
        setProfile({
          userId: userIdToFetch,
          onboardingCompleted: false,
          onboardingStep: 0
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        // Cache profile in localStorage
        localStorage.setItem('glide_user_profile', JSON.stringify(data.profile));
      } else {
        throw new Error(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save onboarding data
  const saveOnboardingData = useCallback(async (
    data: OnboardingData, 
    metadata?: UserMetadata
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const userIdToUse = getUserId();
      
      // Get user metadata
      const userMetadata: UserMetadata = {
        userAgent: navigator.userAgent,
        ipAddress: '', // Will be detected on server
        referralSource: metadata?.referralSource || document.referrer || 'direct',
        ...metadata
      };

      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdToUse,
          onboardingData: data,
          metadata: userMetadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      const result = await response.json();
      if (result.success) {
        setProfile(result.profile);
        // Update localStorage cache
        localStorage.setItem('glide_user_profile', JSON.stringify(result.profile));
        return true;
      } else {
        throw new Error(result.error || 'Failed to save data');
      }
    } catch (err) {
      console.error('Error saving onboarding data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Update telegram session
  const updateTelegramSession = useCallback(async (
    sessionString: string, 
    phoneNumber?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const userIdToUse = getUserId();

      const response = await fetch('/api/user-profile/telegram', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdToUse,
          sessionString,
          phoneNumber
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update telegram session');
      }

      const result = await response.json();
      if (result.success) {
        await fetchProfile(userIdToUse); // Refresh profile
        return true;
      } else {
        throw new Error(result.error || 'Failed to update session');
      }
    } catch (err) {
      console.error('Error updating telegram session:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getUserId, fetchProfile]);

  // Update selected channels
  const updateSelectedChannels = useCallback(async (channels: any[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const userIdToUse = getUserId();

      const response = await fetch('/api/user-profile/channels', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdToUse,
          channels
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update selected channels');
      }

      const result = await response.json();
      if (result.success) {
        await fetchProfile(userIdToUse); // Refresh profile
        return true;
      } else {
        throw new Error(result.error || 'Failed to update channels');
      }
    } catch (err) {
      console.error('Error updating selected channels:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getUserId, fetchProfile]);

  // Update agent preferences
  const updateAgentPreferences = useCallback(async (preferences: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const userIdToUse = getUserId();

      const response = await fetch('/api/user-profile/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdToUse,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agent preferences');
      }

      const result = await response.json();
      if (result.success) {
        await fetchProfile(userIdToUse); // Refresh profile
        return true;
      } else {
        throw new Error(result.error || 'Failed to update preferences');
      }
    } catch (err) {
      console.error('Error updating agent preferences:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getUserId, fetchProfile]);

  // Update analytics
  const updateAnalytics = useCallback(async (analytics: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const userIdToUse = getUserId();

      const response = await fetch('/api/user-profile/analytics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userIdToUse,
          analytics
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update analytics');
      }

      const result = await response.json();
      if (result.success) {
        await fetchProfile(userIdToUse); // Refresh profile
        return true;
      } else {
        throw new Error(result.error || 'Failed to update analytics');
      }
    } catch (err) {
      console.error('Error updating analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getUserId, fetchProfile]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    const userIdToUse = getUserId();
    await fetchProfile(userIdToUse);
  }, [getUserId, fetchProfile]);

  // Clear profile data
  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
    localStorage.removeItem('glide_user_profile');
    localStorage.removeItem('glide_user_id');
  }, []);

  // Initialize profile on mount
  useEffect(() => {
    const userIdToUse = getUserId();
    
    // Try to load from localStorage first
    const cachedProfile = localStorage.getItem('glide_user_profile');
    if (cachedProfile) {
      try {
        setProfile(JSON.parse(cachedProfile));
      } catch (err) {
        console.error('Error parsing cached profile:', err);
      }
    }

    // Then fetch fresh data from server
    fetchProfile(userIdToUse);
  }, [getUserId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    saveOnboardingData,
    updateTelegramSession,
    updateSelectedChannels,
    updateAgentPreferences,
    updateAnalytics,
    refreshProfile,
    clearProfile
  };
};

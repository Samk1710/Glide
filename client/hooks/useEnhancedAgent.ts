import { useState, useCallback } from 'react';
import { useUserProfile } from './useUserProfile';

interface AgentExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  context?: {
    userId: string;
    onboardingCompleted: boolean;
    agentWalletConnected: boolean;
    telegramConnected: boolean;
    activeWalletsCount: number;
  };
}

interface UserStatus {
  userId: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
  agentWalletConnected: boolean;
  telegramConnected: boolean;
  activeWalletsCount: number;
  lastActiveAt: Date;
  analytics: any;
  preferences: any;
}

interface UseEnhancedAgentReturn {
  loading: boolean;
  error: string | null;
  userStatus: UserStatus | null;
  executeAction: (action: string, params?: any) => Promise<AgentExecutionResult>;
  getUserStatus: () => Promise<UserStatus | null>;
  updatePreferences: (preferences: any) => Promise<boolean>;
  analyzeAirdrops: (params?: any) => Promise<any>;
  monitorTelegram: (params?: any) => Promise<any>;
  checkWalletEligibility: (airdropId: string) => Promise<any>;
  executeAirdropEnrollment: (airdropId: string, walletAddress?: string) => Promise<any>;
  generateDailyReport: () => Promise<any>;
}

export const useEnhancedAgent = (): UseEnhancedAgentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  
  const { profile } = useUserProfile();

  // Get current user ID
  const getUserId = useCallback(() => {
    let userId = localStorage.getItem('glide_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('glide_user_id', userId);
    }
    return userId;
  }, []);

  // Execute any agent action
  const executeAction = useCallback(async (
    action: string, 
    params?: any
  ): Promise<AgentExecutionResult> => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();

      const response = await fetch('/api/enhanced-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          params
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Update user status if provided
        if (result.context) {
          setUserStatus(prev => ({
            ...prev,
            ...result.context
          } as UserStatus));
        }
        return result;
      } else {
        throw new Error(result.error || 'Agent action failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Agent action error:', err);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Get user status
  const getUserStatus = useCallback(async (): Promise<UserStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();

      const response = await fetch(`/api/enhanced-agent?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setUserStatus(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get user status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Get user status error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();

      const response = await fetch('/api/enhanced-agent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Refresh user status
        await getUserStatus();
        return true;
      } else {
        throw new Error(result.error || 'Failed to update preferences');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Update preferences error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getUserId, getUserStatus]);

  // Analyze airdrops
  const analyzeAirdrops = useCallback(async (params?: any) => {
    const result = await executeAction('analyze_airdrops', params);
    return result.success ? result.data : null;
  }, [executeAction]);

  // Monitor telegram channels
  const monitorTelegram = useCallback(async (params?: any) => {
    const result = await executeAction('monitor_telegram', params);
    return result.success ? result.data : null;
  }, [executeAction]);

  // Check wallet eligibility for airdrop
  const checkWalletEligibility = useCallback(async (airdropId: string) => {
    const result = await executeAction('check_wallet_eligibility', { airdropId });
    return result.success ? result.data : null;
  }, [executeAction]);

  // Execute airdrop enrollment
  const executeAirdropEnrollment = useCallback(async (airdropId: string, walletAddress?: string) => {
    const result = await executeAction('execute_airdrop_enrollment', { airdropId, walletAddress });
    return result.success ? result.data : null;
  }, [executeAction]);

  // Generate daily report
  const generateDailyReport = useCallback(async () => {
    const result = await executeAction('generate_daily_report');
    return result.success ? result.data : null;
  }, [executeAction]);

  return {
    loading,
    error,
    userStatus,
    executeAction,
    getUserStatus,
    updatePreferences,
    analyzeAirdrops,
    monitorTelegram,
    checkWalletEligibility,
    executeAirdropEnrollment,
    generateDailyReport
  };
};

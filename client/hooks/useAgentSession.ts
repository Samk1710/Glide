"use client";

import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';

export interface AgentSession {
  address: string | null;
  chainId: number;
  sessionId: string | null;
  isConnected: boolean;
}

export function useAgentSession() {
  const { profile: userProfile } = useUserProfile();
  const [session, setSession] = useState<AgentSession>({
    address: null,
    chainId: 43113,
    sessionId: null,
    isConnected: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check session status
  const checkSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!userProfile?.userId) {
        console.log('No user ID available, cannot check session');
        setSession({
          address: null,
          chainId: 43113,
          sessionId: null,
          isConnected: false
        });
        return;
      }

      console.log('Checking session for userId:', userProfile.userId);
      const response = await fetch(`/api/agent?action=session_status&userId=${encodeURIComponent(userProfile.userId)}`);
      const result = await response.json();
      
      console.log('Session status response:', result);
      
      if (result.isConnected && result.sessionData) {
        setSession({
          address: result.sessionData.agentAddress,
          chainId: result.sessionData.chainId,
          sessionId: result.sessionData.sessionId,
          isConnected: true
        });
      } else {
        setSession({
          address: null,
          chainId: 43113,
          sessionId: null,
          isConnected: false
        });
      }
    } catch (err) {
      console.error('Session check error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSession({
        address: null,
        chainId: 43113,
        sessionId: null,
        isConnected: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Restore session
  const restoreSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!userProfile?.userId) {
        setError('No user ID available');
        return false;
      }
      
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'restore_session',
          userId: userProfile.userId 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSession({
          address: result.data.address,
          chainId: result.data.chainId || 43113,
          sessionId: result.data.sessionId,
          isConnected: true
        });
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Create new wallet
  const createWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!userProfile?.userId) {
        const errorMsg = 'No user ID available - user profile may still be loading';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      console.log('Creating wallet for userId:', userProfile.userId);
      
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create_wallet',
          userId: userProfile.userId 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create wallet API error:', response.status, errorText);
        const errorMsg = `API request failed: ${response.status}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      const result = await response.json();
      
      console.log('Create wallet result:', result);
      
      if (result.success) {
        setSession({
          address: result.data.address,
          chainId: 43113,
          sessionId: result.data.sessionId,
          isConnected: true
        });
        return {
          success: true,
          address: result.data.address,
          privateKey: result.data.privateKey,
          chainId: result.data.chainId
        };
      } else {
        const errorMsg = result.error || 'Unknown error from API';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Create wallet error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Import wallet
  const importWallet = async (privateKey: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!userProfile?.userId) {
        const errorMsg = 'No user ID available - user profile may still be loading';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      console.log('Importing wallet for userId:', userProfile.userId);
      
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'import_wallet',
          privateKey,
          userId: userProfile.userId 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Import wallet API error:', response.status, errorText);
        const errorMsg = `API request failed: ${response.status}`;
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      const result = await response.json();
      
      console.log('Import wallet result:', result);
      
      if (result.success) {
        setSession({
          address: result.data.address,
          chainId: 43113,
          sessionId: result.data.sessionId,
          isConnected: true
        });
        return { 
          success: true, 
          address: result.data.address,
          chainId: 43113
        };
      } else {
        const errorMsg = result.error || 'Unknown error from API';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Import wallet error:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear session
  const clearSession = async () => {
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'clear_session',
          userId: userProfile?.userId 
        })
      });
      
      setSession({
        address: null,
        chainId: 43113,
        sessionId: null,
        isConnected: false
      });
      
      return response.ok;
    } catch (err) {
      console.error('Failed to clear session:', err);
      return false;
    }
  };

  // Extend session
  const extendSession = async () => {
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'extend_session',
          userId: userProfile?.userId 
        })
      });
      
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Failed to extend session:', err);
      return false;
    }
  };

  // Get wallet balance
  const getBalance = async () => {
    if (!session.address) return '0';
    
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'get_balance',
          agentAddress: session.address,
          userId: userProfile?.userId 
        })
      });
      
      const result = await response.json();
      return result.success ? result.data.balance : '0';
    } catch (err) {
      console.error('Failed to get balance:', err);
      return '0';
    }
  };

  // Auto-check session on mount and when userProfile changes
  useEffect(() => {
    checkSession();
  }, [userProfile?.userId]);

  // Auto-extend session every 30 minutes if connected
  useEffect(() => {
    if (!session.isConnected) return;

    const interval = setInterval(() => {
      extendSession();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [session.isConnected]);

  return {
    session,
    isLoading,
    error,
    checkSession,
    restoreSession,
    createWallet,
    importWallet,
    clearSession,
    extendSession,
    getBalance,
    // Computed properties
    isConnected: session.isConnected,
    address: session.address,
    chainId: session.chainId,
    sessionId: session.sessionId
  };
}

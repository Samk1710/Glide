"use client";

import { useState, useEffect } from 'react';
import { telegramService, TelegramUser } from '@/services/telegram';

export const useTelegram = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    checkExistingSession();
  }, []);

  "use client";

import { useState, useEffect } from 'react';
import { telegramService, TelegramUser } from '@/services/telegram';

export const useTelegram = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    try {
      const authenticated = telegramService.isAuthenticated();
      if (authenticated) {
        setIsConnected(true);
        const userInfo = telegramService.getCurrentUser();
        setUser(userInfo);
      }
    } catch (err) {
      console.error('Error checking existing session:', err);
    }
  };

  const connect = async (): Promise<boolean> => {
    setIsConnecting(true);
    setError(null);

    try {
      // The actual connection is now handled by the TelegramAuthDialog
      // This method just checks if we're already connected
      const authenticated = telegramService.isAuthenticated();
      if (authenticated) {
        setIsConnected(true);
        const userInfo = telegramService.getCurrentUser();
        setUser(userInfo);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'An error occurred while connecting to Telegram');
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await telegramService.logout();
      setIsConnected(false);
      setUser(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred while disconnecting');
    }
  };

  // Method to refresh user data after successful authentication
  const refreshUserData = () => {
    const authenticated = telegramService.isAuthenticated();
    if (authenticated) {
      setIsConnected(true);
      const userInfo = telegramService.getCurrentUser();
      setUser(userInfo);
      setError(null);
    }
  };

  return {
    isConnected,
    isConnecting,
    user,
    error,
    connect,
    disconnect,
    refreshUserData,
  };
};

  const refreshUser = async () => {
    try {
      const userInfo = await telegramService.getCurrentUser();
      setUser(userInfo);
      setIsConnected(!!userInfo);
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const disconnect = async () => {
    try {
      await telegramService.logout();
      setIsConnected(false);
      setUser(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred while disconnecting');
    }
  };

  return {
    isConnected,
    user,
    error,
    disconnect,
    refreshUser,
  };
};

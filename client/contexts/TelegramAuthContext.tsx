"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  phone: string;
}

interface TelegramAuthContextType {
  user: TelegramUser | null;
  session: string | null;
  isAuthenticated: boolean;
  login: (user: TelegramUser, session: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

interface TelegramAuthProviderProps {
  children: ReactNode;
}

export function TelegramAuthProvider({ children }: TelegramAuthProviderProps) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('telegram_user');
    const savedSession = localStorage.getItem('telegram_session');
    
    if (savedUser && savedSession) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setSession(savedSession);
        setIsAuthenticated(true);
        console.log('✅ Telegram session restored for:', parsedUser.first_name);
      } catch (error) {
        console.error('Failed to restore Telegram session:', error);
        localStorage.removeItem('telegram_user');
        localStorage.removeItem('telegram_session');
      }
    }
  }, []);

  const login = (userData: TelegramUser, sessionToken: string) => {
    setUser(userData);
    setSession(sessionToken);
    setIsAuthenticated(true);
    
    // Save to localStorage
    localStorage.setItem('telegram_user', JSON.stringify(userData));
    localStorage.setItem('telegram_session', sessionToken);
    
    console.log('✅ Telegram user logged in:', userData.first_name);
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('telegram_user');
    localStorage.removeItem('telegram_session');
    
    console.log('👋 Telegram user logged out');
  };

  const checkAuth = () => {
    return isAuthenticated && !!user && !!session;
  };

  const value = {
    user,
    session,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };

  return (
    <TelegramAuthContext.Provider value={value}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}

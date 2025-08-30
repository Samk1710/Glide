"use client"

import { useState, useEffect } from 'react';

interface TelegramStatus {
  isConnected: boolean;
  userInfo?: any;
  error?: string;
}

export function useTelegramStatus() {
  const [status, setStatus] = useState<TelegramStatus>({
    isConnected: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTelegramStatus = async () => {
      try {
        const response = await fetch('/api/telegram-debug?action=status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStatus({
            isConnected: data.isConnected || false,
            userInfo: data.userInfo || null,
            error: data.error || null,
          });
        } else {
          setStatus({
            isConnected: false,
            error: 'Failed to check status',
          });
        }
      } catch (error) {
        setStatus({
          isConnected: false,
          error: 'Connection error',
        });
      } finally {
        setLoading(false);
      }
    };

    checkTelegramStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkTelegramStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { ...status, loading };
}
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface TelegramStatusProps {
  isConnected: boolean;
  userInfo?: any;
  compact?: boolean;
}

export default function TelegramStatus({ isConnected, userInfo, compact = false }: TelegramStatusProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-md border border-white/10">
        {isConnected ? (
          <Wifi className="w-3 h-3 text-green-400" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-400" />
        )}
        <span className="text-xs text-white/80">
          Telegram
        </span>
        <span className="text-xs text-white/60">
          {isConnected ? "Connected" : "Offline"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-green-300 text-sm">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">Offline</span>
          </>
        )}
      </div>

      {/* User Info */}
      {userInfo && isConnected && (
        <div className="text-white/60 text-sm">
          {userInfo.first_name} ({userInfo.phone})
        </div>
      )}
    </div>
  );
}

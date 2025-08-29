import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, X, Wifi, WifiOff } from 'lucide-react';

interface TelegramStatusProps {
  isConnected: boolean;
  isRealMode: boolean;
  userInfo?: any;
}

export default function TelegramStatus({ isConnected, isRealMode, userInfo }: TelegramStatusProps) {
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
            <span className="text-red-300 text-sm">Disconnected</span>
          </>
        )}
      </div>

      {/* Real/Mock Mode */}
      <div className="flex items-center gap-2">
        {isRealMode ? (
          <>
            <Check className="w-4 h-4 text-blue-400" />
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              Real Data
            </Badge>
          </>
        ) : (
          <>
            <X className="w-4 h-4 text-yellow-400" />
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
              Mock Data
            </Badge>
          </>
        )}
      </div>

      {/* User Info */}
      {userInfo && (
        <div className="text-white/60 text-sm">
          {userInfo.first_name} ({userInfo.phone})
        </div>
      )}
    </div>
  );
}

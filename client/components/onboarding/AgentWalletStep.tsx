"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Wallet, Shield, AlertTriangle, Info } from 'lucide-react';

interface AgentWalletStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function AgentWalletStep({ data, updateData, onNext }: AgentWalletStepProps) {
  const [restrictions, setRestrictions] = useState(data.agentWallet?.restrictions || '');
  const [notes, setNotes] = useState(data.agentWallet?.notes || '');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleContinue = () => {
    updateData({
      agentWallet: {
        restrictions,
        notes,
        isConnected: isWalletConnected
      }
    });
    onNext();
  };

  const handleWalletConnection = () => {
    // This is where you'll implement actual wallet connection logic
    setIsWalletConnected(true);
  };

  const restrictionExamples = [
    "Daily transaction limit: $1000",
    "No transactions to unknown addresses",
    "Require approval for transactions > $500",
    "Only allow DeFi protocol interactions",
    "Block high-risk token trades"
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Connection Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-red-400" />
            Agent Wallet Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isWalletConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <div>
                <p className="text-white font-medium">
                  {isWalletConnected ? 'Wallet Connected' : 'Connect Agent Wallet'}
                </p>
                <p className="text-white/60 text-sm">
                  {isWalletConnected 
                    ? 'Your agent wallet is ready for use' 
                    : 'Connect a wallet for your AI agent to use'
                  }
                </p>
              </div>
            </div>
            <Button
              onClick={handleWalletConnection}
              disabled={isWalletConnected}
              className={isWalletConnected 
                ? 'bg-green-600 text-white cursor-default' 
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {isWalletConnected ? 'Connected' : 'Connect Wallet'}
            </Button>
          </div>

          {isWalletConnected && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Shield className="w-4 h-4" />
                <span className="font-medium">Wallet Connected Successfully</span>
              </div>
              <p className="text-green-200/80 text-sm">
                Address: 0x742d35Cc6e8c9e5b8e8C7B1a2c8F9E1d2F3A4B5C
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funding Information */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            Funding Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2">How to Fund Your Agent Wallet</h4>
            <ul className="text-blue-200/80 text-sm space-y-1">
              <li>• Transfer funds from your main wallet to the agent wallet</li>
              <li>• Ensure sufficient balance for gas fees and transactions</li>
              <li>• Monitor balance regularly to avoid failed transactions</li>
              <li>• Set up automatic funding if needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Restrictions and Notes Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Agent Restrictions & Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="restrictions" className="text-white/80 mb-2 block">
              Transaction Restrictions
            </Label>
            <Textarea
              id="restrictions"
              placeholder="Define any restrictions for your agent (e.g., daily limits, approved addresses, etc.)"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-24"
            />
            <div className="mt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                    View Examples
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Restriction Examples</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Here are some common restrictions you might want to set:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    {restrictionExamples.map((example, index) => (
                      <div key={index} className="p-2 bg-gray-800 rounded text-sm text-gray-200">
                        {example}
                      </div>
                    ))}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                      Close
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-white/80 mb-2 block">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or configuration details for your agent"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-20"
            />
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium text-sm mb-1">Important Security Notes</p>
                <ul className="text-yellow-200/80 text-sm space-y-1">
                  <li>• Never share your agent wallet private keys</li>
                  <li>• Regularly monitor your agent's transactions</li>
                  <li>• Set appropriate spending limits to minimize risk</li>
                  <li>• Review and update restrictions as needed</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

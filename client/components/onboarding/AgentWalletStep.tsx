"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Wallet, Shield, AlertTriangle, Info, Download, Key, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAgentSession } from '@/hooks/useAgentSession';

interface AgentWalletStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function AgentWalletStep({ data, updateData, onNext }: AgentWalletStepProps) {
  const [restrictions, setRestrictions] = useState(data.agentWallet?.restrictions || '');
  const [notes, setNotes] = useState(data.agentWallet?.notes || '');
  const [isWalletConnected, setIsWalletConnected] = useState(data.agentWallet?.isConnected || false);
  const [walletAddress, setWalletAddress] = useState(data.agentWallet?.address || '');
  const [privateKey, setPrivateKey] = useState(data.agentWallet?.privateKey || '');
  const [importKey, setImportKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  // Initialize user profile and agent session hooks
  const { profile, saveOnboardingData } = useUserProfile();
  const { session, createWallet, importWallet, isLoading: sessionLoading } = useAgentSession();

  // Use ref to track if restoration has already happened
  const hasRestoredRef = useRef(false);

  // Try to restore from session on component mount - only once
  useEffect(() => {
    const restoreSession = async () => {
      if (hasRestoredRef.current) return; // Prevent multiple restorations
      
      try {
        setIsRestoringSession(true);

        // First check if user has existing profile with agent wallet
        if (profile?.agentWallet?.isConnected && profile.agentWallet.address) {
          setWalletAddress(profile.agentWallet.address);
          setIsWalletConnected(true);
          setRestrictions(profile.agentWallet.restrictions || '');
          setNotes(profile.agentWallet.notes || '');
          
          // Update parent component data
          updateData({
            ...data,
            agentWallet: {
              address: profile.agentWallet.address,
              isConnected: true,
              restrictions: profile.agentWallet.restrictions,
              notes: profile.agentWallet.notes,
              chainId: profile.agentWallet.chainId
            }
          });
          
          hasRestoredRef.current = true;
          toast.success('Agent wallet restored from profile');
          return;
        }

        // Fallback to session restoration if no profile data
        if (session?.address) {
          setWalletAddress(session.address);
          setIsWalletConnected(true);
          
          updateData({
            ...data,
            agentWallet: {
              address: session.address,
              isConnected: true,
              restrictions,
              notes,
              chainId: session.chainId
            }
          });
          
          hasRestoredRef.current = true;
          toast.success('Agent wallet restored from session');
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setIsRestoringSession(false);
      }
    };

    // Only run restoration if we have profile or session data and haven't restored yet
    if ((profile?.agentWallet?.isConnected || session?.address) && !hasRestoredRef.current) {
      restoreSession();
    }
  }, [profile?.agentWallet?.isConnected, session?.address]); // Only depend on key restoration conditions

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      // Use the new agent session system
      const result = await createWallet();
      
      // Handle null or error results
      if (!result) {
        toast.error('Failed to create wallet: No response from wallet creation');
        return;
      }
      
      if (!result.success) {
        toast.error('Failed to create wallet: ' + (result.error || 'Unknown error'));
        return;
      }
      
      if (result.success && result.address) {
        setWalletAddress(result.address);
        setIsWalletConnected(true);
        
        // Update component data
        const walletData = {
          address: result.address,
          isConnected: true,
          restrictions,
          notes,
          chainId: 43113 // Use default since result.chainId might not exist
        };

        updateData({
          ...data,
          agentWallet: walletData
        });

        // Save to user profile
        await saveOnboardingData({
          step: 1,
          agentWallet: walletData
        });
        
        toast.success('Agent wallet created successfully!');
      } else {
        toast.error('Failed to create wallet: Invalid response from server');
      }
    } catch (error) {
      console.error('Create wallet error:', error);
      toast.error('Error creating wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importKey.trim()) {
      toast.error('Please enter a private key');
      return;
    }

    setIsImporting(true);
    try {
      // Use the new agent session system
      const result = await importWallet(importKey.trim());
      
      // Handle null or error results
      if (!result) {
        toast.error('Failed to import wallet: No response from wallet import');
        return;
      }
      
      if (!result.success) {
        toast.error('Failed to import wallet: ' + (result.error || 'Unknown error'));
        return;
      }
      
      if (result.success && result.address) {
        setWalletAddress(result.address);
        setIsWalletConnected(true);
        setShowImportDialog(false);
        setImportKey('');
        
        // Update component data
        const walletData = {
          address: result.address,
          isConnected: true,
          restrictions,
          notes,
          chainId: 43113 // Use default
        };

        updateData({
          ...data,
          agentWallet: walletData
        });

        // Save to user profile
        await saveOnboardingData({
          step: 1,
          agentWallet: walletData
        });
        
        toast.success('Agent wallet imported successfully!');
      } else {
        toast.error('Failed to import wallet: Invalid response from server');
      }
    } catch (error) {
      console.error('Import wallet error:', error);
      toast.error('Error importing wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleContinue = async () => {
    const walletData = {
      restrictions,
      notes,
      isConnected: isWalletConnected,
      address: walletAddress,
      chainId: 43113
    };

    updateData({
      ...data,
      agentWallet: walletData
    });

    // Save current step data to user profile
    await saveOnboardingData({
      step: 1,
      agentWallet: walletData
    });
    onNext();
  };

  const downloadWalletInfo = () => {
    const walletData = {
      address: walletAddress,
      privateKey: privateKey,
      network: 'Avalanche Fuji', // Avalanche Fuji testnet
      restrictions: restrictions,
      notes: notes,
      createdAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(walletData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glide-agent-wallet-${walletAddress.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
          {isRestoringSession ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-3 text-white/80">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Restoring agent wallet session...</span>
              </div>
            </div>
          ) : !isWalletConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <div>
                    <p className="text-white font-medium">Agent Wallet Setup</p>
                    <p className="text-white/60 text-sm">
                      Create a new wallet or import an existing one for your agent
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleCreateWallet}
                  disabled={isCreating}
                  className="bg-red-600 hover:bg-red-700 text-white h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <Plus className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">{isCreating ? 'Creating...' : 'Create New Wallet'}</div>
                    <div className="text-xs opacity-80">Generate a fresh agent wallet</div>
                  </div>
                </Button>

                <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <Key className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">Import Wallet</div>
                        <div className="text-xs opacity-80">Use existing private key</div>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Import Agent Wallet</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        Enter your private key to import an existing wallet for your agent.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="private-key" className="text-white">Private Key</Label>
                        <Input
                          id="private-key"
                          type="password"
                          value={importKey}
                          onChange={(e) => setImportKey(e.target.value)}
                          placeholder="0x..."
                          className="bg-gray-800 border-gray-600 text-white mt-2"
                        />
                      </div>
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-400 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium text-sm">Security Warning</span>
                        </div>
                        <p className="text-yellow-200/80 text-xs">
                          Never share your private key. Store it securely and only import trusted wallets.
                        </p>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleImportWallet}
                        disabled={isImporting || !importKey.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isImporting ? 'Importing...' : 'Import Wallet'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Agent Wallet Connected</span>
                </div>
                <div className="space-y-2">
                  <p className="text-green-200/80 text-sm">
                    <span className="font-medium">Address:</span> {walletAddress}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={downloadWalletInfo}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Wallet Info
                    </Button>
                  </div>
                </div>
              </div>
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
              <li>• Transfer AVAX from your main wallet to the agent wallet</li>
              <li>• Ensure sufficient balance for gas fees and transactions on Fuji</li>
              <li>• Monitor balance regularly to avoid failed transactions</li>
              <li>• Agent uses 0xGasless for gasless transactions when possible</li>
              <li>• Get free Fuji AVAX from faucet for testing: <a href="https://faucet.avax.network/" target="_blank" className="text-blue-300 underline">faucet.avax.network</a></li>
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

      {/* Continue Button */}
      <div className="flex justify-end pt-6">
        <Button
          onClick={handleContinue}
          disabled={!isWalletConnected}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Continue to Telegram Setup
        </Button>
      </div>
    </div>
  );
}

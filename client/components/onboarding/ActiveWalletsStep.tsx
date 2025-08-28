"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Link, 
  Shield,
  Signature,
  Loader2,
  Check,
  AlertTriangle
} from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { formatWalletAddress, isDuplicateWallet } from '@/utils/onboarding';
import { WalletData } from '@/types/onboarding';

interface ActiveWalletsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function ActiveWalletsStep({ data, updateData, onNext }: ActiveWalletsStepProps) {
  const [wallets, setWallets] = useState<WalletData[]>(data.activeWallets || []);
  const [newWalletName, setNewWalletName] = useState('');
  const [showAddresses, setShowAddresses] = useState<{[key: string]: boolean}>({});
  const [copiedAddresses, setCopiedAddresses] = useState<{[key: string]: boolean}>({});
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  
  // Get connected wallet info from wagmi
  const { address: connectedAddress, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const networks = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
    { id: 'bsc', name: 'BSC', symbol: 'BNB' },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH' },
    { id: 'optimism', name: 'Optimism', symbol: 'ETH' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' }
  ];

  const getCurrentNetworkInfo = () => {
    if (!chain) return { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' };
    
    const networkMap: { [key: number]: string } = {
      1: 'ethereum',
      137: 'polygon',
      56: 'bsc',
      42161: 'arbitrum',
      10: 'optimism'
    };
    
    const networkId = networkMap[chain.id] || 'ethereum';
    return networks.find(n => n.id === networkId) || networks[0];
  };

  const addWalletWithSignature = async () => {
    if (!newWalletName.trim()) {
      alert('Please enter a wallet name');
      return;
    }

    if (!isConnected || !connectedAddress) {
      alert('Please connect your wallet first');
      return;
    }

    // Check if wallet is already added
    if (isDuplicateWallet(connectedAddress, wallets)) {
      alert('This wallet address is already added');
      return;
    }

    setIsSigningMessage(true);

    try {
      // Create verification message
      const timestamp = Date.now();
      const message = `Verify wallet ownership for Glide\n\nWallet: ${connectedAddress}\nName: ${newWalletName}\nTimestamp: ${timestamp}\n\nSigning this message proves you own this wallet address.`;
      
      // Request signature from user
      const signature = await signMessageAsync({ message });
      
      if (signature) {
        const currentNetwork = getCurrentNetworkInfo();
        
        const wallet: WalletData = {
          id: generateId(),
          address: connectedAddress,
          name: newWalletName.trim(),
          network: currentNetwork.id,
          isValid: true,
          balance: 'Loading...',
          signature,
          verificationMessage: message,
          verifiedAt: timestamp
        };

        setWallets([...wallets, wallet]);
        setNewWalletName('');

        // Fetch real balance using API
        fetchWalletBalance(wallet);
        
        alert('✅ Wallet verified and added successfully!\n\n💡 To add another wallet, switch to a different account in your wallet extension and repeat the process.');
      }
    } catch (error: any) {
      console.error('Error signing message:', error);
      if (error.code === 4001) {
        alert('❌ Signature was rejected by user');
      } else {
        alert('❌ Failed to verify wallet ownership. Please try again.');
      }
    } finally {
      setIsSigningMessage(false);
    }
  };

  const removeWallet = (id: string) => {
    setWallets(wallets.filter(wallet => wallet.id !== id));
  };

  const generateId = (): string => {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const fetchWalletBalance = async (wallet: WalletData) => {
    try {
      const response = await fetch(`/api/wallet-balance?address=${wallet.address}&network=${wallet.network}`);
      const result = await response.json();
      
      if (result.success) {
        setWallets(prev => prev.map(w => 
          w.id === wallet.id 
            ? { ...w, balance: `${result.balance} ${result.symbol || 'ETH'}` }
            : w
        ));
      } else {
        setWallets(prev => prev.map(w => 
          w.id === wallet.id 
            ? { ...w, balance: 'Error loading balance' }
            : w
        ));
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWallets(prev => prev.map(w => 
        w.id === wallet.id 
          ? { ...w, balance: 'Error loading balance' }
          : w
      ));
    }
  };

  const toggleAddressVisibility = (id: string) => {
    setShowAddresses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyAddress = async (address: string, id: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddresses(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedAddresses(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const maskAddress = (address: string): string => {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkDisplay = (network: string) => {
    const net = networks.find(n => n.id === network);
    return net ? `${net.name}` : network;
  };

  const handleNext = () => {
    updateData({ activeWallets: wallets });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Add Multiple Active Wallets</h2>
        <p className="text-white/60">
          Connect and verify ownership of multiple wallets through cryptographic signatures. 
          Switch wallet accounts in your extension to add different addresses.
        </p>
      </div>

      {/* Add New Wallet Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-400" />
            Add Active Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connect and Verify Wallet */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
              <Signature className="w-4 h-4" />
              Connect & Verify Wallet Ownership
            </h4>
            <p className="text-blue-200/80 text-sm mb-4">
              Connect your wallet and sign a message to prove ownership. This ensures secure wallet verification.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <Label htmlFor="walletName" className="text-white/80 text-sm">
                  Wallet Name
                </Label>
                <Input
                  id="walletName"
                  placeholder="e.g., Main Trading Wallet"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <ConnectButton.Custom>
                  {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
                    const connected = mounted && account && chain;
                    
                    return (
                      <Button
                        onClick={connected ? openAccountModal : openConnectModal}
                        variant="outline"
                        className="bg-blue-600/10 border-blue-600/30 hover:bg-blue-600/20 text-blue-300 hover:text-blue-200"
                      >
                        {connected ? (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            {account?.displayName} • {chain?.name}
                          </>
                        ) : (
                          <>
                            <Link className="w-4 h-4 mr-2" />
                            Connect Wallet
                          </>
                        )}
                      </Button>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
              
              {isConnected && connectedAddress && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-green-300 text-sm font-medium mb-1">Ready to Sign</div>
                      <div className="text-green-200/80 text-sm">
                        <span className="text-green-300">Active Account: </span>
                        <span className="font-mono">{formatWalletAddress(connectedAddress, false)}</span>
                      </div>
                      <div className="text-green-200/60 text-xs mt-1">
                        Network: {getCurrentNetworkInfo().name}
                      </div>
                    </div>
                    <div className="text-xs text-green-300 bg-green-500/10 px-2 py-1 rounded">
                      ✓ Connected
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={addWalletWithSignature}
                disabled={!isConnected || !newWalletName.trim() || isSigningMessage}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isSigningMessage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Requesting Signature...
                  </>
                ) : (
                  <>
                    <Signature className="w-4 h-4 mr-2" />
                    Sign & Add Current Wallet Account
                  </>
                )}
              </Button>
              
              {isConnected && (
                <div className="text-center">
                  <p className="text-white/50 text-xs">
                    💡 To add a different wallet account, switch accounts in your wallet extension first, then click sign
                  </p>
                </div>
              )}
            </div>
            
            {!isConnected && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Please connect your wallet first to add it for monitoring
                </p>
              </div>
            )}
          </div>

          {/* Information Section */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              How Multi-Wallet Verification Works
            </h4>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex gap-2">
                <span className="text-purple-400">1.</span>
                <span>Connect your wallet using the Connect Wallet button</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400">2.</span>
                <span>Enter a name for your wallet (for identification)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400">3.</span>
                <span>Sign a verification message to prove you own the wallet</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400">4.</span>
                <span>To add another wallet, switch accounts in your wallet extension and repeat</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
              🔒 Message signing is free and proves wallet ownership without exposing private keys
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Wallets List */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-400" />
            Your Active Wallets ({wallets.length})
          </CardTitle>
          {wallets.length > 0 && (
            <p className="text-white/50 text-sm">
              All wallets verified through cryptographic signatures
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {wallets.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No wallets added yet</p>
              <p className="text-white/40 text-sm">Add your first wallet to start monitoring transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium">{wallet.name}</h4>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                          {getNetworkDisplay(wallet.network)}
                        </span>
                        {wallet.signature && (
                          <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white/60 text-sm font-mono">
                          {showAddresses[wallet.id] ? wallet.address : maskAddress(wallet.address)}
                        </span>
                        <Button
                          onClick={() => toggleAddressVisibility(wallet.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-white/40 hover:text-white/60"
                        >
                          {showAddresses[wallet.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          onClick={() => copyAddress(wallet.address, wallet.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-white/40 hover:text-white/60"
                        >
                          {copiedAddresses[wallet.id] ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </Button>
                        <Button
                          onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-white/40 hover:text-white/60"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">Balance:</span>
                        <span className="text-white">{wallet.balance}</span>
                        {wallet.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      {wallet.verifiedAt && (
                        <div className="text-xs text-white/40 mt-1">
                          Verified: {new Date(wallet.verifiedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => removeWallet(wallet.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {wallets.length > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <p className="text-green-300 text-sm">
                    🎉 You have {wallets.length} verified wallet{wallets.length !== 1 ? 's' : ''} ready for monitoring!
                  </p>
                  <p className="text-green-200/70 text-xs mt-1">
                    You can add more wallets anytime by switching accounts and signing again
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        {wallets.length === 0 ? (
          <div className="text-center w-full">
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-yellow-300 text-sm font-medium">No Wallets Added</p>
                <p className="text-yellow-200/80 text-sm">
                  Add at least one wallet to continue with the onboarding process.
                </p>
              </div>
            </div>
            <Button
              onClick={handleNext}
              disabled
              className="bg-gray-600 text-gray-400 cursor-not-allowed"
            >
              Continue (Add a wallet first)
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            Continue to Final Step
          </Button>
        )}
      </div>
    </div>
  );
}

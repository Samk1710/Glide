"use client";

import React from 'react';
import Background from '@/components/Background';
import Header from '@/components/Header';
import AgentDashboard from '@/components/AgentDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black relative">
      <Background />
      <Header />
      
      <main className="relative z-10 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AgentDashboard />
        </div>
      </main>
    </div>
  );
}
        toast.error('Failed to connect agent: ' + result.error);
      }
    } catch (error) {
      toast.error('Error connecting agent: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateNew = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_wallet' })
      });

      const result = await response.json();
      
      if (result.success) {
        setAgentAddress(result.data.address);
        toast.success('New agent created successfully!');
        
        // Show private key to user
        toast.info('Private key: ' + result.data.privateKey, { 
          duration: 10000,
          description: 'Save this securely - you won\'t see it again!'
        });
      } else {
        toast.error('Failed to create agent: ' + result.error);
      }
    } catch (error) {
      toast.error('Error creating agent: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background Component */}
      <Background color="red" />

      {/* Header */}
      <Header />

      {/* Dashboard Content */}
      <div className="relative z-20 min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {!agentAddress ? (
            /* Agent Setup */
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Setup Your Airdrop Agent</h1>
                <p className="text-white/80">Connect or create an AI agent to start hunting airdrops</p>
              </div>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bot className="w-6 h-6 text-red-400" />
                    Agent Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create New Agent */}
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Create New Agent</h3>
                    <p className="text-white/70 text-sm mb-4">
                      Generate a fresh agent wallet with advanced airdrop hunting capabilities
                    </p>
                    <Button
                      onClick={handleCreateNew}
                      disabled={isConnecting}
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      {isConnecting ? 'Creating...' : 'Create New Agent'}
                    </Button>
                  </div>

                  {/* Connect Existing Agent */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Connect Existing Agent</h3>
                    <p className="text-white/70 text-sm mb-4">
                      Import your existing agent wallet using its private key
                    </p>
                    
                    <div className="space-y-3">
                      <Input
                        type="password"
                        value={privateKeyInput}
                        onChange={(e) => setPrivateKeyInput(e.target.value)}
                        placeholder="Enter private key (0x...)"
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      />
                      
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-400 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium text-sm">Security Notice</span>
                        </div>
                        <p className="text-yellow-200/80 text-xs">
                          Your private key is encrypted and stored securely. Never share it with anyone.
                        </p>
                      </div>

                      <Button
                        onClick={handleConnectExisting}
                        disabled={isConnecting || !privateKeyInput.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        {isConnecting ? 'Connecting...' : 'Connect Agent'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Agent Dashboard */
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Airdrop Agent Dashboard</h1>
                <p className="text-white/80">Agent Address: {agentAddress}</p>
              </div>
              
              <AgentDashboard agentAddress={agentAddress} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

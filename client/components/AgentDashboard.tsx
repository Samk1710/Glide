"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Wallet, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  LogOut,
  Settings,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEnhancedAgent } from '@/hooks/useEnhancedAgent';

interface AirdropRecommendation {
  airdrop: {
    slug: string;
    name: string;
    category: string;
    primary_chain: string;
    estimates: {
      expected_value_usd_range: [number, number];
      probability: 'low' | 'medium' | 'high';
    };
  };
  eligibility: {
    isEligible: boolean;
    score: number;
    estimatedValue: number;
  };
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

interface AgentActivity {
  timestamp: string;
  type: 'analysis' | 'enrollment' | 'notification' | 'error';
  airdropSlug?: string;
  message: string;
  txHash?: string;
}

export default function AgentDashboard() {
  const {
    session,
    isLoading: sessionLoading,
    error: sessionError,
    getBalance,
    clearSession
  } = useAgentSession();

  const { profile, refreshProfile } = useUserProfile();
  
  const {
    loading: agentLoading,
    error: agentError,
    userStatus,
    getUserStatus,
    analyzeAirdrops,
    monitorTelegram,
    generateDailyReport
  } = useEnhancedAgent();
  
  const [agentBalance, setAgentBalance] = useState('0');
  const [recommendations, setRecommendations] = useState<AirdropRecommendation[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyReport, setDailyReport] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load user status and profile
      await Promise.all([
        getUserStatus(),
        refreshProfile()
      ]);

      // Load agent balance if wallet is connected
      if (session.isConnected && session.address) {
        await loadAgentData();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session.isConnected && session.address) {
      loadAgentData();
      // Set up periodic updates
      const interval = setInterval(loadAgentData, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session.isConnected, session.address]);

  const loadAgentData = async () => {
    try {
      await Promise.all([
        loadBalance(),
        loadActivities(),
        loadRecommendations()
      ]);
    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBalance = async () => {
    if (!session.address) return;
    
    try {
      const balance = await getBalance();
      setAgentBalance(balance);
    } catch (error) {
      console.error('Failed to load balance:', error);
      toast.error('Failed to load wallet balance');
    }
  };

  const loadActivities = async () => {
    if (!session.address) return;
    
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_activities', agentAddress: session.address })
      });
      
      const result = await response.json();
      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_airdrops', agentAddress: session.address })
      });
      const result = await response.json();
      if (result.success) {
        setRecommendations(result.data);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const handleAnalyzeAirdrops = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeAirdrops();
      
      if (result) {
        // Convert analysis result to recommendations format
        const newRecommendations: AirdropRecommendation[] = result.potentialAirdrops?.map((airdrop: any) => ({
          airdrop: {
            slug: airdrop.slug || `airdrop_${Date.now()}`,
            name: airdrop.name || 'Unknown Airdrop',
            category: airdrop.category || 'DeFi',
            primary_chain: airdrop.network || 'ethereum',
            estimates: {
              expected_value_usd_range: [airdrop.minValue || 0, airdrop.maxValue || 100],
              probability: airdrop.probability || 'medium'
            }
          },
          eligibility: {
            isEligible: airdrop.isEligible || false,
            score: airdrop.score || 0,
            estimatedValue: airdrop.estimatedValue || 0
          },
          priority: airdrop.priority || 'medium',
          actionRequired: airdrop.actionRequired || false
        })) || [];

        setRecommendations(newRecommendations);

        // Add activity log
        const newActivity: AgentActivity = {
          timestamp: new Date().toISOString(),
          type: 'analysis',
          message: `Analyzed ${result.walletsAnalyzed} wallets across ${result.networks?.length || 0} networks. Found ${newRecommendations.length} potential airdrops.`
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);

        toast.success(`Analysis completed! Found ${newRecommendations.length} potential airdrops.`);
      } else {
        toast.error('Analysis failed - no data returned');
      }
    } catch (error) {
      console.error('Airdrop analysis error:', error);
      toast.error('Failed to analyze airdrops');
      
      // Add error activity
      const errorActivity: AgentActivity = {
        timestamp: new Date().toISOString(),
        type: 'error',
        message: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      setActivities(prev => [errorActivity, ...prev.slice(0, 9)]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDailyReport = async () => {
    try {
      const report = await generateDailyReport();
      if (report) {
        setDailyReport(report);
        toast.success('Daily report generated successfully');
        
        // Add activity log
        const newActivity: AgentActivity = {
          timestamp: new Date().toISOString(),
          type: 'analysis',
          message: `Generated daily report: ${report.summary.activeWallets} active wallets, ${report.summary.monitoredChannels} monitored channels`
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Daily report error:', error);
      toast.error('Failed to generate daily report');
    }
  };

  const handleMonitorTelegram = async () => {
    try {
      const result = await monitorTelegram();
      if (result) {
        toast.success(`Monitoring ${result.channels?.length || 0} Telegram channels`);
        
        // Add activity log
        const newActivity: AgentActivity = {
          timestamp: new Date().toISOString(),
          type: 'notification',
          message: `Telegram monitoring active: ${result.channels?.length || 0} channels, ${result.keywords?.length || 0} keywords`
        };
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Telegram monitoring error:', error);
      toast.error('Failed to monitor Telegram channels');
    }
  };

  const handleAutoEnroll = async () => {
    setIsEnrolling(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_enroll', agentAddress: session.address })
      });
      const result = await response.json();
      
      if (result.success) {
        const { enrolled, failed } = result.data;
        if (enrolled.length > 0) {
          toast.success(`Successfully enrolled in ${enrolled.length} airdrop(s)`);
        }
        if (failed.length > 0) {
          toast.error(`Failed to enroll in ${failed.length} airdrop(s)`);
        }
        await loadActivities();
      } else {
        toast.error('Auto-enrollment failed');
      }
    } catch (error) {
      toast.error('Error during auto-enrollment');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) return;

    setIsChatting(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'chat', 
          agentAddress: session.address, 
          message: chatMessage 
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setChatResponse(result.data.response);
        setChatMessage('');
      } else {
        toast.error('Chat failed');
      }
    } catch (error) {
      toast.error('Error chatting with agent');
    } finally {
      setIsChatting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'analysis': return <TrendingUp className="w-4 h-4" />;
      case 'enrollment': return <Zap className="w-4 h-4" />;
      case 'notification': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleLogout = async () => {
    try {
      await clearSession();
      toast.success('Logged out successfully');
      // Redirect to onboarding
      window.location.href = '/onboarding';
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Show loading state while session is loading
  if (sessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading agent dashboard...</span>
        </div>
      </div>
    );
  }

  // Show error if session failed to load or no session exists
  if (sessionError || !session.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold">No Active Agent Session</h3>
          <p className="text-white/60 mt-1">
            {sessionError || "Please create or import an agent wallet to continue."}
          </p>
          <Button 
            onClick={() => window.location.href = '/onboarding'} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Go to Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Status Header */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-red-400" />
              Airdrop Agent Dashboard
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Active</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Wallet Balance</span>
              </div>
              <p className="text-2xl font-bold text-white">{parseFloat(agentBalance).toFixed(4)} AVAX</p>
              <p className="text-sm text-blue-200/80">Agent Wallet</p>
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Opportunities</span>
              </div>
              <p className="text-2xl font-bold text-white">{recommendations.length}</p>
              <p className="text-sm text-green-200/80">Airdrops Found</p>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Activities</span>
              </div>
              <p className="text-2xl font-bold text-white">{activities.length}</p>
              <p className="text-sm text-purple-200/80">Recent Actions</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleAnalyzeAirdrops}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Airdrops'}
            </Button>
            
            <Button
              onClick={handleAutoEnroll}
              disabled={isEnrolling || recommendations.filter(r => r.eligibility.isEligible).length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isEnrolling ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
              {isEnrolling ? 'Enrolling...' : 'Auto Enroll'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Airdrop Recommendations */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Airdrop Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recommendations available</p>
                <p className="text-sm">Click "Analyze Airdrops" to get started</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-semibold">{rec.airdrop.name}</h4>
                      <p className="text-white/60 text-sm">{rec.airdrop.category} • {rec.airdrop.primary_chain}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getPriorityColor(rec.priority)} text-white text-xs`}>
                        {rec.priority}
                      </Badge>
                      {rec.eligibility.isEligible && (
                        <Badge className="bg-green-600 text-white text-xs">
                          Eligible
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Score:</span>
                      <span className="text-white ml-2">{rec.eligibility.score}%</span>
                    </div>
                    <div>
                      <span className="text-white/60">Est. Value:</span>
                      <span className="text-white ml-2">${rec.eligibility.estimatedValue.toFixed(0)}</span>
                    </div>
                  </div>

                  {rec.actionRequired && (
                    <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                      <p className="text-yellow-400 text-xs">Action required to become eligible</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Agent Activities */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activities yet</p>
              </div>
            ) : (
              activities.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`p-1 rounded ${
                    activity.type === 'error' ? 'bg-red-500/20 text-red-400' :
                    activity.type === 'enrollment' ? 'bg-green-500/20 text-green-400' :
                    activity.type === 'analysis' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{activity.message}</p>
                    {activity.txHash && (
                      <p className="text-blue-400 text-xs mt-1">
                        TX: {activity.txHash.slice(0, 10)}...
                      </p>
                    )}
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Chat with Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {chatResponse && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-400 font-medium mb-2">Agent Response:</p>
              <p className="text-white text-sm whitespace-pre-wrap">{chatResponse}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask your agent about airdrops, wallets, or strategies..."
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
            />
            <Button
              onClick={handleChat}
              disabled={isChatting || !chatMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isChatting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

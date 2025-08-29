"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Background from '@/components/Background';
import Header from '@/components/Header';
import { 
  Activity, 
  TrendingUp, 
  Wallet, 
  MessageSquare, 
  Settings,
  BarChart3,
  Users,
  DollarSign,
  Eye,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background Component */}
      <Background color="red" />

      {/* Header */}
      <Header />

      {/* Dashboard Content */}
      <div className="relative z-20 min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">AI Agent Dashboard</h1>
            <p className="text-white/80">Monitor your agent's performance and activity</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Total Value</p>
                    <p className="text-white text-2xl font-bold">$12,456</p>
                    <p className="text-green-400 text-sm">+12.5% ↗</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Active Trades</p>
                    <p className="text-white text-2xl font-bold">8</p>
                    <p className="text-green-400 text-sm">3 profitable</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Chat Rooms</p>
                    <p className="text-white text-2xl font-bold">5</p>
                    <p className="text-purple-400 text-sm">All monitored</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-sm border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-300 text-sm font-medium">Agent Status</p>
                    <p className="text-white text-2xl font-bold">Active</p>
                    <p className="text-green-400 text-sm">98% uptime</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Activity */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Bought 100 USDC</p>
                        <p className="text-white/60 text-xs">2 minutes ago</p>
                      </div>
                    </div>
                    <span className="text-green-400 text-sm">+$100</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Telegram alert processed</p>
                        <p className="text-white/60 text-xs">5 minutes ago</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div>
                        <p className="text-white text-sm font-medium">Portfolio rebalanced</p>
                        <p className="text-white/60 text-xs">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Portfolio Overview */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Portfolio Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">₿</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Bitcoin</p>
                        <p className="text-white/60 text-sm">0.25 BTC</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white">$8,500</p>
                      <p className="text-green-400 text-sm">+5.2%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Ξ</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">Ethereum</p>
                        <p className="text-white/60 text-sm">2.5 ETH</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white">$3,200</p>
                      <p className="text-red-400 text-sm">-2.1%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">$</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">USDC</p>
                        <p className="text-white/60 text-sm">756 USDC</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white">$756</p>
                      <p className="text-white/60 text-sm">0.0%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-400" />
                  Agent Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Configure Trading Rules
                </Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Update Risk Limits
                </Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Manage Notifications
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-400" />
                  Wallet Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Add New Wallet
                </Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                  View All Wallets
                </Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Security Settings
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/telegram" className="w-full">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    View Telegram Dashboard
                  </Button>
                </Link>
                <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Export Reports
                </Button>
                <Button variant="outline" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Alert History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

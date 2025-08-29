"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Background from '@/components/Background';
import Header from '@/components/Header';
import TelegramStatus from '@/components/TelegramStatus';
import { 
  MessageSquare, 
  Users, 
  Phone, 
  Shield, 
  Send,
  ChevronRight,
  Hash,
  Clock,
  User,
  RefreshCw,
  LogOut,
  TestTube
} from 'lucide-react';

interface TelegramUser {
  id: string;
  first_name: string;
  last_name?: string;
  phone: string;
}

interface ChatRoom {
  id: string;
  name?: string;
  title?: string;
  type: 'group' | 'channel' | 'private';
  members?: number;
  memberCount?: number;
}

interface TelegramMessage {
  id: number;
  message: string;
  fromId?: number;
  date: number;
  chatId: number;
  chatTitle?: string;
  fromName?: string;
}

export default function TelegramPage() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'authenticated'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRealMode, setIsRealMode] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('telegram_user');
    const savedSession = localStorage.getItem('telegram_session');
    
    if (savedUser && savedSession) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setStep('authenticated');
        loadChatRooms();
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('telegram_user');
        localStorage.removeItem('telegram_session');
      }
    }
  }, []);

  // Auto-refresh messages every 30 seconds when a chat is selected
  useEffect(() => {
    if (selectedChat && isAuthenticated) {
      const interval = setInterval(() => {
        loadMessages(selectedChat, true); // Silent refresh
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [selectedChat, isAuthenticated]);

  const sendOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendOtp',
          phoneNumber: phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPhoneCodeHash(data.phoneCodeHash);
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyOtp',
          phoneNumber: phoneNumber,
          otpCode: otpCode,
          phoneCodeHash: phoneCodeHash,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setStep('authenticated');
        
        // Save session to localStorage
        localStorage.setItem('telegram_user', JSON.stringify(data.user));
        localStorage.setItem('telegram_session', data.session || 'authenticated');
        
        loadChatRooms();
      } else {
        setError(data.message || 'Invalid OTP code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadChatRooms = async () => {
    setLoadingChats(true);
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getChatRooms' }),
      });

      const data = await response.json();
      if (data.success) {
        setChatRooms(data.chats || data.chatRooms || []);
        setIsRealMode(data.isRealMode || false);
      }
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const testMessages = async () => {
    if (!selectedChat) return;
    
    setLoadingMessages(true);
    try {
      const response = await fetch('/api/test-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: selectedChat.id }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to load test messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadMessages = async (chatRoom: ChatRoom, silent: boolean = false) => {
    setSelectedChat(chatRoom);
    if (!silent) {
      setLoadingMessages(true);
      setMessages([]);
    }

    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getMessages',
          chatId: chatRoom.id,
          limit: 50,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      if (!silent) {
        setLoadingMessages(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('telegram_user');
    localStorage.removeItem('telegram_session');
    setUser(null);
    setIsAuthenticated(false);
    setStep('phone');
    setChatRooms([]);
    setSelectedChat(null);
    setMessages([]);
    setPhoneNumber('');
    setOtpCode('');
    setPhoneCodeHash('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Background color="blue" />
      <Header />

      <div className="relative z-20 min-h-screen pt-28 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Telegram Dashboard</h1>
              <p className="text-white/80">
                {isAuthenticated 
                  ? `Connected as ${user?.first_name} ${user?.last_name || ''}` 
                  : 'Connect your Telegram account to view groups and messages'
                }
              </p>
            </div>
            {isAuthenticated && (
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>

          {/* Authentication Section */}
          {!isAuthenticated && (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  {step === 'phone' ? 'Login to Telegram' : 'Enter Verification Code'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 'phone' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-white/80 text-sm">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      />
                    </div>
                    <Button 
                      onClick={sendOtp}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Phone className="w-4 h-4 mr-2" />}
                      Send Verification Code
                    </Button>
                  </>
                )}

                {step === 'otp' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-white/80 text-sm">Verification Code</label>
                      <Input
                        type="text"
                        placeholder="Enter the code from Telegram"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      />
                    </div>
                    <Button 
                      onClick={verifyOtp}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                      Verify Code
                    </Button>
                    <Button 
                      onClick={() => setStep('phone')}
                      variant="outline"
                      className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      Back to Phone Number
                    </Button>
                  </>
                )}

                {error && (
                  <div className="text-red-400 text-sm text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Main Dashboard - Only show when authenticated */}
          {isAuthenticated && (
            <div className="space-y-6">
              {/* Status Component */}
              <TelegramStatus 
                isConnected={isAuthenticated}
                isRealMode={isRealMode}
                userInfo={user}
              />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Rooms List */}
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Chat Rooms ({chatRooms.length})
                  </CardTitle>
                  <Button
                    onClick={loadChatRooms}
                    disabled={loadingChats}
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    {loadingChats ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {loadingChats ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-white/60" />
                    </div>
                  ) : chatRooms.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 text-sm">No chat rooms found</p>
                      <Button onClick={loadChatRooms} size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    chatRooms.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => loadMessages(chat)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedChat?.id === chat.id
                            ? 'bg-blue-500/20 border-blue-500/40'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {chat.type === 'channel' ? (
                                <Hash className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Users className="w-4 h-4 text-green-400" />
                              )}
                              <h3 className="text-white font-medium text-sm truncate">
                                {chat.name || chat.title || `Chat ${chat.id}`}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs">
                                {chat.type}
                              </Badge>
                              {(chat.members || chat.memberCount) && (
                                <span className="text-white/60 text-xs">
                                  {chat.members || chat.memberCount} members
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/40" />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Messages Panel */}
              <div className="lg:col-span-2">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Send className="w-5 h-5 text-green-400" />
                      {selectedChat ? (
                        <>Messages from {selectedChat.name || selectedChat.title || `Chat ${selectedChat.id}`}</>
                      ) : (
                        'Select a chat room to view messages'
                      )}
                    </CardTitle>
                    {selectedChat && lastRefresh && (
                      <div className="text-white/60 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last updated: {lastRefresh.toLocaleTimeString()}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {!selectedChat ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">Select a chat room from the left to view messages</p>
                      </div>
                    ) : loadingMessages ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-white/60" />
                        <span className="ml-3 text-white/60">Loading messages...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12">
                        <Send className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No messages found in this chat</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className="p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-400" />
                                <span className="text-white/80 text-sm font-medium">
                                  {message.fromName || `User ${message.fromId || 'Unknown'}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-white/50 text-xs">
                                <Clock className="w-3 h-3" />
                                {formatDate(message.date)}
                              </div>
                            </div>
                            <p className="text-white text-sm leading-relaxed">
                              {message.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Test Messages Button */}
                    {selectedChat && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <Button
                          onClick={testMessages}
                          disabled={loadingMessages}
                          variant="outline"
                          className="bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30"
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          {loadingMessages ? 'Loading...' : 'Test Messages'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

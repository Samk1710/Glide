"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, Shield, Check, X, Plus, Trash2, AlertTriangle, Users, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface TelegramStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function TelegramStep({ data, updateData, onNext }: TelegramStepProps) {
  const [phoneNumber, setPhoneNumber] = useState(data.telegram?.phoneNumber || '');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(data.telegram?.isVerified || false);
  const [selectedChatRooms, setSelectedChatRooms] = useState(data.telegram?.selectedChatRooms || []);
  const [newChatRoom, setNewChatRoom] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [userSession, setUserSession] = useState(data.telegram?.session || '');
  const [availableChatRooms, setAvailableChatRooms] = useState([]);
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  // Auto-fetch chats if already verified
  useEffect(() => {
    if (isVerified && userSession && availableChatRooms.length === 0) {
      fetchAvailableChats(userSession);
    }
  }, [isVerified, userSession]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.warning('Please enter a valid phone number with country code (e.g., +1234567890)');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      console.log('🔄 Sending OTP to:', phoneNumber);
      
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send-otp',
          phoneNumber
        }),
      });
      
      const result = await response.json();
      console.log('OTP Send Result:', result);
      
      if (result.success) {
        setIsOtpSent(true);
        setPhoneCodeHash(result.phoneCodeHash);
        toast.success('Verification code sent! Please check your Telegram account for the verification code and enter it below.');
      } else {
        toast.error(`${result.message} - Error Type: ${result.errorType || 'Unknown'}`);
        console.error('OTP send failed:', result);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please check your internet connection and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 5 || otpCode.length > 6) {
      toast.warning('Please enter the complete verification code (5-6 digits)');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      console.log('🔄 Verifying OTP:', otpCode);
      
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify-otp',
          phoneNumber,
          otpCode,
          phoneCodeHash
        }),
      });
      
      const result = await response.json();
      console.log('OTP Verify Result:', result);
      
      if (result.success) {
        setIsVerified(true);
        setUserSession(result.session);
        setUserInfo(result.user);
        
        // Immediately fetch available chats
        await fetchAvailableChats(result.session);
        
        toast.success(`🎉 Phone number verified successfully! Welcome ${result.user?.firstName || 'User'}! You can now select chat rooms to monitor.`);
      } else {
        toast.error(`${result.message} - Please check your code and try again.`);
        console.error('OTP verification failed:', result);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchAvailableChats = async (session: string) => {
    try {
      console.log('🔄 Fetching available chats...');
      
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-chats',
          session
        }),
      });
      
      const result = await response.json();
      console.log('Chats fetch result:', result);
      
      if (result.success) {
        setAvailableChatRooms(result.chats);
        console.log(`✅ Loaded ${result.chats.length} available chats`);
      } else {
        console.error('Failed to fetch chats:', result);
        toast.error(`Could not load chat rooms: ${result.message}`);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.warning('Failed to load chat rooms. You can still continue and add them manually.');
    }
  };

  const addChatRoom = () => {
    if (newChatRoom.trim()) {
      const newRoom = {
        id: Date.now().toString(),
        name: newChatRoom.trim(),
        members: 0,
        type: 'manual'
      };
      setSelectedChatRooms([...selectedChatRooms, newRoom]);
      setNewChatRoom('');
    }
  };

  const removeChatRoom = (roomId: string) => {
    setSelectedChatRooms(selectedChatRooms.filter((room: any) => room.id !== roomId));
  };

  const toggleChatRoomSelection = (room: any) => {
    const isSelected = selectedChatRooms.some((selected: any) => selected.id === room.id);
    
    if (isSelected) {
      removeChatRoom(room.id);
    } else {
      setSelectedChatRooms([...selectedChatRooms, room]);
    }
  };

  const handleNext = () => {
    if (!isVerified) {
      toast.warning('Please verify your phone number first');
      return;
    }
    
    if (selectedChatRooms.length === 0) {
      toast.warning('Please select at least one chat room to monitor');
      return;
    }

    updateData({
      telegram: {
        phoneNumber,
        isVerified,
        session: userSession,
        selectedChatRooms,
        userInfo
      }
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Connect Your Telegram</h2>
        <p className="text-white/60">
          Authenticate with your phone number to access and monitor Telegram chat rooms
        </p>
      </div>

      {/* Phone Verification Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-400" />
            Phone Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isVerified ? (
            <>
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/80">
                  Phone Number (with country code)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isOtpSent}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <p className="text-white/40 text-xs">
                  Include country code (e.g., +1 for US, +91 for India)
                </p>
              </div>

              {/* Send OTP Button */}
              {!isOtpSent ? (
                <Button
                  onClick={handleSendOtp}
                  disabled={isConnecting || !phoneNumber}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isConnecting ? 'Sending...' : 'Send Verification Code'}
                </Button>
              ) : (
                <>
                  {/* OTP Input */}
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-white/80">
                      Verification Code (5-6 digits)
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="12345"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 text-center text-lg tracking-widest"
                    />
                    <p className="text-white/40 text-xs">
                      Check your Telegram for the verification code
                    </p>
                  </div>

                  {/* Verify OTP Button */}
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={isConnecting || otpCode.length < 5 || otpCode.length > 6}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isConnecting ? 'Verifying...' : 'Verify Code'}
                  </Button>

                  {/* Resend OTP */}
                  <Button
                    onClick={async () => {
                      setIsOtpSent(false);
                      setOtpCode('');
                      setPhoneCodeHash('');
                      // Automatically resend OTP
                      await handleSendOtp();
                    }}
                    variant="outline"
                    className="w-full text-white/60 border-white/20 hover:bg-white/5"
                  >
                    Resend Code
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {/* Verification Success */}
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-400" />
                  <div>
                    <h4 className="text-green-300 font-medium">Phone Verified Successfully!</h4>
                    <p className="text-green-200/80 text-sm">
                      {userInfo?.firstName && `Welcome, ${userInfo.firstName}! `}
                      Your account: {phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Chat Rooms Selection */}
      {isVerified && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Select Chat Rooms to Monitor
            </CardTitle>
            <p className="text-white/50 text-sm">
              Choose which Telegram groups/channels you want to monitor for trading signals
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Available Chat Rooms */}
            {availableChatRooms.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Available Chat Rooms ({availableChatRooms.length})
                </h4>
                <div className="grid gap-2">
                  {availableChatRooms.map((room: any) => {
                    const isSelected = selectedChatRooms.some((selected: any) => selected.id === room.id);
                    return (
                      <div
                        key={room.id}
                        onClick={() => toggleChatRoomSelection(room)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-purple-500 border-purple-500' 
                                : 'border-white/30'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-xs opacity-60">
                                {room.members ? `${room.members.toLocaleString()} members` : 'Group'} • {room.type}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Custom Chat Room */}
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Custom Chat Room
              </h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter chat room name or @username"
                  value={newChatRoom}
                  onChange={(e) => setNewChatRoom(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={addChatRoom}
                  disabled={!newChatRoom.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Chat Rooms */}
            {selectedChatRooms.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Selected Chat Rooms ({selectedChatRooms.length})
                </h4>
                <div className="grid gap-2">
                  {selectedChatRooms.map((room: any) => (
                    <div
                      key={room.id}
                      className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <div>
                            <div className="text-purple-200 font-medium">{room.name}</div>
                            <div className="text-purple-300/60 text-xs">
                              {room.type === 'manual' ? 'Custom' : `${room.members?.toLocaleString() || '0'} members`}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeChatRoom(room.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/70">
          <div className="flex gap-2">
            <span className="text-green-400">🔐</span>
            <span>Your phone number is used only for Telegram authentication</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-400">👁️</span>
            <span>We only read messages from selected chat rooms</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-400">🛡️</span>
            <span>All data is processed securely and not shared with third parties</span>
          </div>
          <div className="flex gap-2">
            <span className="text-green-400">❌</span>
            <span>We cannot send messages or access your private conversations</span>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        {!isVerified ? (
          <div className="text-center w-full">
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-yellow-300 text-sm font-medium">Phone Verification Required</p>
                <p className="text-yellow-200/80 text-sm">
                  Please verify your phone number to continue.
                </p>
              </div>
            </div>
            <Button
              onClick={handleNext}
              disabled
              className="bg-gray-600 text-gray-400 cursor-not-allowed"
            >
              Continue (Verify phone first)
            </Button>
          </div>
        ) : selectedChatRooms.length === 0 ? (
          <div className="text-center w-full">
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-yellow-300 text-sm font-medium">No Chat Rooms Selected</p>
                <p className="text-yellow-200/80 text-sm">
                  Please select at least one chat room to monitor.
                </p>
              </div>
            </div>
            <Button
              onClick={handleNext}
              disabled
              className="bg-gray-600 text-gray-400 cursor-not-allowed"
            >
              Continue (Select chat rooms first)
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            Continue to Active Wallets
          </Button>
        )}
      </div>
    </div>
  );
}

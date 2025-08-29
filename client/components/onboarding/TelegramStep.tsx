"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, Shield, Check, X, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface TelegramStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

export default function TelegramStep({ data, updateData, onNext }: TelegramStepProps) {
  const [phoneNumber, setPhoneNumber] = useState(data.telegram?.phoneNumber || '');
  const [otpCode, setOtpCode] = useState(data.telegram?.otpCode || '');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(data.telegram?.isVerified || false);
  const [selectedChatRooms, setSelectedChatRooms] = useState(data.telegram?.selectedChatRooms || []);
  const [newChatRoom, setNewChatRoom] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [developmentOtp, setDevelopmentOtp] = useState('');

  // Mock chat rooms data - replace with actual Telegram API integration
  const [availableChatRooms, setAvailableChatRooms] = useState([
    { id: '1', name: 'Crypto Trading Signals', members: 15420, type: 'channel' },
    { id: '2', name: 'DeFi Discussion', members: 8932, type: 'group' },
    { id: '3', name: 'NFT Alpha', members: 23145, type: 'channel' },
    { id: '4', name: 'Web3 Developers', members: 5678, type: 'group' },
  ]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    setIsConnecting(true);
    
    try {
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
      
      if (result.success) {
        setIsOtpSent(true);
        // No development OTP needed for real integration
        setDevelopmentOtp('');
      } else {
        // Show setup instructions if bot is not configured
        if (result.instructions) {
          let instructionText = 'Setup Required:\n\n';
          Object.entries(result.instructions).forEach(([key, value]) => {
            instructionText += `${key}: ${value}\n`;
          });
          alert(instructionText);
        } else if (result.botInstructions) {
          let instructionText = 'Bot Registration Required:\n\n';
          Object.entries(result.botInstructions).forEach(([key, value]) => {
            instructionText += `${key}: ${value}\n`;
          });
          alert(instructionText);
        } else {
          alert(result.message || 'Failed to send OTP');
        }
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify-otp',
          phoneNumber,
          otpCode
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.verified) {
        setIsVerified(true);
        // Fetch available chat rooms after verification
        fetchChatRooms();
      } else {
        alert(result.message || 'Invalid OTP code');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Failed to verify OTP. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get-chats',
          phoneNumber
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.chats) {
        // Update available chat rooms with fetched data
        setAvailableChatRooms(result.chats);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
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
      setSelectedChatRooms(selectedChatRooms.filter((selected: any) => selected.id !== room.id));
    } else {
      setSelectedChatRooms([...selectedChatRooms, room]);
    }
  };

  const handleContinue = () => {
    updateData({
      telegram: {
        phoneNumber,
        otpCode,
        isVerified,
        selectedChatRooms
      }
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Telegram Connection Section */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            Connect Telegram Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isVerified ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/80">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    disabled={isOtpSent}
                  />
                  <Button
                    onClick={handleSendOtp}
                    disabled={isOtpSent || isConnecting}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-24"
                  >
                    {isConnecting ? 'Sending...' : isOtpSent ? 'Sent' : 'Send OTP'}
                  </Button>
                </div>
              </div>

              {isOtpSent && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label htmlFor="otp" className="text-white/80">
                    Enter OTP Code
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                    />
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={isConnecting}
                      className="bg-green-600 hover:bg-green-700 text-white min-w-24"
                    >
                      {isConnecting ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  
                  {developmentOtp && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium text-sm">Development Mode</span>
                      </div>
                      <p className="text-yellow-200/80 text-sm mb-2">
                        Since no Telegram Bot is configured, use this OTP:
                      </p>
                      <div className="font-mono text-lg text-yellow-300 bg-yellow-500/20 px-3 py-2 rounded border border-yellow-500/30">
                        {developmentOtp}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-white/60 text-sm">
                    We sent a 6-digit code to your phone. It may take a few minutes to arrive.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <Check className="w-4 h-4" />
                <span className="font-medium">Telegram Connected Successfully</span>
              </div>
              <p className="text-green-200/80 text-sm">
                Phone: {phoneNumber} • Status: Verified
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Rooms Selection */}
      {isVerified && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Select Chat Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/60 text-sm">
              Choose which Telegram chats your agent should monitor for relevant information.
            </p>

            {/* Available Chat Rooms */}
            <div className="space-y-2">
              <h4 className="text-white font-medium">Available Chats</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableChatRooms.map((room) => {
                  const isSelected = selectedChatRooms.some((selected: any) => selected.id === room.id);
                  return (
                    <div
                      key={room.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-purple-500/20 border-purple-500/40' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => toggleChatRoomSelection(room)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{room.name}</p>
                          <p className="text-white/60 text-sm">
                            {room.members.toLocaleString()} members • {room.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Chat Room */}
            <div className="space-y-2">
              <h4 className="text-white font-medium">Add Custom Chat</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter chat name or @username"
                  value={newChatRoom}
                  onChange={(e) => setNewChatRoom(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <Button
                  onClick={addChatRoom}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Selected Chat Rooms */}
            {selectedChatRooms.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-medium">Selected Chats ({selectedChatRooms.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedChatRooms.map((room: any) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-2 bg-purple-500/10 border border-purple-500/20 rounded"
                    >
                      <span className="text-white text-sm">{room.name}</span>
                      <Button
                        onClick={() => removeChatRoom(room.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-400 font-medium text-sm mb-1">Privacy & Security</p>
              <ul className="text-yellow-200/80 text-sm space-y-1">
                <li>• Your agent will only read messages from selected chats</li>
                <li>• No personal messages or private chats are accessed</li>
                <li>• All data is encrypted and processed securely</li>
                <li>• You can revoke access at any time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

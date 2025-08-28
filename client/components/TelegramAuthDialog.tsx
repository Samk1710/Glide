"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { telegramService, AuthState } from '@/services/telegram';

interface TelegramAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TelegramAuthDialog({ open, onOpenChange, onSuccess }: TelegramAuthDialogProps) {
  const [authState, setAuthState] = useState<AuthState>({ step: 'phone' });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      const currentState = telegramService.getAuthState();
      setAuthState(currentState);
      setError(null);
      setPhoneNumber('');
      setOtpCode('');
      setPassword('');
    }
  }, [open]);

  useEffect(() => {
    // Cooldown timer for resend OTP
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await telegramService.sendOTP(phoneNumber);
      if (result.success) {
        setAuthState({ step: 'otp', phone: phoneNumber, isCodeSent: true });
        setResendCooldown(60); // 60 second cooldown
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 5) {
      setError('Please enter the 5-digit verification code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await telegramService.verifyOTP(otpCode);
      if (result.success) {
        if (result.needsPassword) {
          setAuthState({ step: 'password', needsPassword: true });
        } else {
          setAuthState({ step: 'completed' });
          onSuccess();
          onOpenChange(false);
        }
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      setError('Please enter your 2FA password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await telegramService.verify2FA(password);
      if (result.success) {
        setAuthState({ step: 'completed' });
        onSuccess();
        onOpenChange(false);
      } else {
        setError(result.error || 'Invalid password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await telegramService.resendOTP();
      if (result.success) {
        setResendCooldown(60);
        setError(null);
      } else {
        setError(result.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    telegramService.resetAuth();
    setAuthState({ step: 'phone' });
    setError(null);
    setPhoneNumber('');
    setOtpCode('');
    setPassword('');
  };

  const getStepIcon = () => {
    switch (authState.step) {
      case 'phone':
        return <Phone className="w-6 h-6 text-blue-500" />;
      case 'otp':
        return <Shield className="w-6 h-6 text-yellow-500" />;
      case 'password':
        return <Lock className="w-6 h-6 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (authState.step) {
      case 'phone':
        return 'Connect Your Telegram';
      case 'otp':
        return 'Enter Verification Code';
      case 'password':
        return '2FA Authentication';
      case 'completed':
        return 'Successfully Connected!';
      case 'error':
        return 'Authentication Error';
      default:
        return 'Telegram Authentication';
    }
  };

  const getStepDescription = () => {
    switch (authState.step) {
      case 'phone':
        return 'Enter your phone number to receive a verification code';
      case 'otp':
        return `We sent a verification code to ${authState.phone}. Check your Telegram app or SMS.`;
      case 'password':
        return 'Your account has 2FA enabled. Please enter your password.';
      case 'completed':
        return 'Your Telegram account has been successfully connected!';
      case 'error':
        return 'There was an issue with the authentication process.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black text-white border-white/20">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            {getStepIcon()}
            <DialogTitle className="text-xl">{getStepTitle()}</DialogTitle>
          </div>
          <DialogDescription className="text-white/70">
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Phone Number Step */}
          {authState.step === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/90">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  disabled={isLoading}
                />
                <p className="text-xs text-white/60">
                  Include country code (e.g., +1 for US, +44 for UK)
                </p>
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </div>
          )}

          {/* OTP Verification Step */}
          {authState.step === 'otp' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-white/90">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="12345"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg tracking-widest"
                  disabled={isLoading}
                  maxLength={5}
                />
                <p className="text-xs text-white/60">
                  Enter the 5-digit code sent to your phone or Telegram app
                </p>
                {/* Demo hint */}
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertDescription className="text-yellow-200 text-xs">
                    <strong>Demo Mode:</strong> Check the browser console for the generated OTP code
                  </AlertDescription>
                </Alert>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otpCode.length !== 5}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
                <Button
                  onClick={handleResendOTP}
                  disabled={isLoading || resendCooldown > 0}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Resend'}
                </Button>
              </div>
              <Button
                onClick={handleReset}
                variant="ghost"
                className="w-full text-white/60 hover:text-white hover:bg-white/5"
              >
                Use Different Number
              </Button>
            </div>
          )}

          {/* 2FA Password Step */}
          {authState.step === 'password' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  2FA Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your 2FA password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  disabled={isLoading}
                />
                <p className="text-xs text-white/60">
                  This is the password you set up for two-factor authentication
                </p>
                {/* Demo hint */}
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertDescription className="text-yellow-200 text-xs">
                    <strong>Demo Mode:</strong> Enter any password with at least 4 characters
                  </AlertDescription>
                </Alert>
              </div>
              <Button
                onClick={handleVerifyPassword}
                disabled={isLoading || !password.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Password'
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="ghost"
                className="w-full text-white/60 hover:text-white hover:bg-white/5"
              >
                Start Over
              </Button>
            </div>
          )}

          {/* Error Step */}
          {authState.step === 'error' && (
            <div className="space-y-4 text-center">
              <p className="text-white/70">
                {authState.error || 'An unexpected error occurred during authentication.'}
              </p>
              <Button
                onClick={handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

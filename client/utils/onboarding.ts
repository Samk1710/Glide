import { ValidationResult, WalletData } from '@/types/onboarding';

// Wallet address validation
export const validateWalletAddress = (address: string, network: string): ValidationResult => {
  if (!address.trim()) {
    return { isValid: false, error: 'Address is required' };
  }

  // Solana address validation
  if (network === 'solana') {
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaAddressRegex.test(address)) {
      return { isValid: false, error: 'Invalid Solana address format' };
    }
    return { isValid: true };
  }

  // Ethereum-based networks validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethAddressRegex.test(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }

  return { isValid: true };
};

// Phone number validation
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  if (!phoneNumber.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Basic international phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phoneNumber.replace(/[\s-()]/g, ''))) {
    return { isValid: false, error: 'Invalid phone number format' };
  }

  return { isValid: true };
};

// OTP validation
export const validateOTP = (otp: string): ValidationResult => {
  if (!otp.trim()) {
    return { isValid: false, error: 'OTP is required' };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { isValid: false, error: 'OTP must be 6 digits' };
  }

  return { isValid: true };
};

// Check if wallet address already exists
export const isDuplicateWallet = (address: string, wallets: WalletData[]): boolean => {
  return wallets.some(wallet => wallet.address.toLowerCase() === address.toLowerCase());
};

// Format wallet address for display
export const formatWalletAddress = (address: string, showFull = false): string => {
  if (showFull || address.length < 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

// Local storage utilities for onboarding data
export const saveOnboardingProgress = (data: any): void => {
  try {
    localStorage.setItem('glide-onboarding-progress', JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save onboarding progress:', err);
  }
};

export const loadOnboardingProgress = (): any => {
  try {
    const saved = localStorage.getItem('glide-onboarding-progress');
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error('Failed to load onboarding progress:', err);
    return null;
  }
};

export const clearOnboardingProgress = (): void => {
  try {
    localStorage.removeItem('glide-onboarding-progress');
  } catch (err) {
    console.error('Failed to clear onboarding progress:', err);
  }
};

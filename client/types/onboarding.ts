// Onboarding related types
export interface OnboardingData {
  agentWallet: {
    restrictions: string;
    notes: string;
    isConnected: boolean;
  };
  telegram: {
    phoneNumber: string;
    isVerified: boolean;
    otpCode: string;
    selectedChatRooms: ChatRoom[];
  };
  activeWallets: WalletData[];
}

export interface ChatRoom {
  id: string;
  name: string;
  members: number;
  type: 'channel' | 'group' | 'manual';
}

export interface WalletData {
  id: string;
  address: string;
  name: string;
  network: string;
  isValid: boolean;
  balance: string;
  signature?: string;
  verificationMessage?: string;
  verifiedAt?: number;
}

export interface StepComponentProps {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
}

export interface Network {
  id: string;
  name: string;
  symbol: string;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Step configuration
export interface OnboardingStep {
  id: number;
  title: string;
  component: React.ComponentType<StepComponentProps>;
  isRequired: boolean;
}

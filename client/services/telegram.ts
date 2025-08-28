// Telegram authentication service with OTP support
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  photo_url?: string;
}

export interface AuthState {
  step: 'phone' | 'otp' | 'password' | 'completed' | 'error';
  phone?: string;
  isCodeSent?: boolean;
  needsPassword?: boolean;
  error?: string;
}

class TelegramService {
  private authState: AuthState = { step: 'phone' };
  private currentUser: TelegramUser | null = null;
  private sessionData: any = null;
  private otpCode: string | null = null;

  constructor() {
    // Check for existing session
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('telegram_user');
      const savedSession = localStorage.getItem('telegram_session');
      
      if (savedUser && savedSession) {
        this.currentUser = JSON.parse(savedUser);
        this.sessionData = JSON.parse(savedSession);
        this.authState = { step: 'completed' };
      }
    }
  }

  // Step 1: Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate phone number format
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // In a real implementation, this would call Telegram's API
      // For demo purposes, we'll simulate the OTP sending process
      
      // Generate a random 5-digit OTP for demo
      this.otpCode = Math.floor(10000 + Math.random() * 90000).toString();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would integrate with Telegram's MTProto API
      // or use a backend service that handles Telegram authentication
      
      this.authState = {
        step: 'otp',
        phone: phoneNumber,
        isCodeSent: true
      };

      // For demo purposes, show the OTP code in console
      console.log(`Demo OTP Code: ${this.otpCode}`);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      this.authState = {
        step: 'error',
        error: errorMessage
      };
      return { success: false, error: errorMessage };
    }
  }

  // Step 2: Verify OTP code
  async verifyOTP(code: string): Promise<{ success: boolean; needsPassword?: boolean; error?: string }> {
    try {
      if (!code || code.length !== 5) {
        return { success: false, error: 'OTP must be 5 digits' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // For demo: check against generated OTP
      if (code === this.otpCode) {
        // Simulate checking if 2FA password is needed (20% chance for demo)
        const needsPassword = Math.random() < 0.2;
        
        if (needsPassword) {
          this.authState = {
            step: 'password',
            phone: this.authState.phone,
            needsPassword: true
          };
          return { success: true, needsPassword: true };
        } else {
          // Complete authentication
          return await this.completeAuthentication();
        }
      } else {
        return { success: false, error: 'Invalid OTP code' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      this.authState = {
        step: 'error',
        error: errorMessage
      };
      return { success: false, error: errorMessage };
    }
  }

  // Step 3: Verify 2FA password (if needed)
  async verify2FA(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!password) {
        return { success: false, error: 'Password is required' };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // For demo: accept any password that's at least 4 characters
      if (password.length >= 4) {
        return await this.completeAuthentication();
      } else {
        return { success: false, error: 'Invalid password' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify password';
      return { success: false, error: errorMessage };
    }
  }

  // Complete the authentication process
  private async completeAuthentication(): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate mock user data
      const userData: TelegramUser = {
        id: Math.floor(Math.random() * 1000000000),
        first_name: "Demo",
        last_name: "User",
        username: "demo_user_" + Math.floor(Math.random() * 1000),
        phone_number: this.authState.phone,
        photo_url: `https://ui-avatars.com/api/?name=Demo+User&background=0088cc&color=fff&size=128&rounded=true`
      };

      this.currentUser = userData;
      this.sessionData = {
        sessionId: Math.random().toString(36).substring(7),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      this.authState = { step: 'completed' };

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('telegram_user', JSON.stringify(userData));
        localStorage.setItem('telegram_session', JSON.stringify(this.sessionData));
        localStorage.setItem('telegram_authenticated', 'true');
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete authentication';
      this.authState = { step: 'error', error: errorMessage };
      return { success: false, error: errorMessage };
    }
  }

  // Resend OTP
  async resendOTP(): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.phone) {
      return { success: false, error: 'No phone number found' };
    }
    return await this.sendOTP(this.authState.phone);
  }

  // Get current authentication state
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Get current user
  getCurrentUser(): TelegramUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authState.step === 'completed' && this.currentUser !== null;
  }

  // Logout
  async logout(): Promise<void> {
    this.currentUser = null;
    this.sessionData = null;
    this.authState = { step: 'phone' };
    this.otpCode = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('telegram_user');
      localStorage.removeItem('telegram_session');
      localStorage.removeItem('telegram_authenticated');
    }
  }

  // Reset authentication state (for retry)
  resetAuth(): void {
    this.authState = { step: 'phone' };
    this.otpCode = null;
  }

  // Legacy methods for compatibility
  async connect(): Promise<boolean> {
    // This method is now handled by the step-by-step process
    return this.isAuthenticated();
  }

  async getUserInfo(): Promise<TelegramUser | null> {
    return this.getCurrentUser();
  }

  async disconnect(): Promise<void> {
    return this.logout();
  }

  isConnected(): boolean {
    return this.isAuthenticated();
  }

  async checkExistingSession(): Promise<boolean> {
    return this.isAuthenticated();
  }
}

export const telegramService = new TelegramService();

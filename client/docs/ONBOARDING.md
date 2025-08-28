# Glide Agent Onboarding System

A comprehensive multi-step onboarding system for setting up AI agents with wallet connections, Telegram integration, and transaction monitoring.

## Features

### 🔗 Agent Wallet Setup
- **Wallet Connection**: Connect a dedicated wallet for your AI agent
- **Security Restrictions**: Set transaction limits and security rules
- **Funding Information**: Clear guidance on how to fund the agent wallet
- **Real-time Status**: Visual indicators for wallet connection status

### 📱 Telegram Integration
- **Phone Verification**: OTP-based phone number verification
- **Chat Room Selection**: Choose which Telegram chats to monitor
- **Real-time Chat Fetching**: Automatically fetch user's available chats
- **Custom Chat Addition**: Manually add specific chat rooms or channels

### 💰 Active Wallet Monitoring
- **Multi-Network Support**: Ethereum, Polygon, BSC, Arbitrum, Optimism, Solana
- **Real-time Balances**: Fetch and display current wallet balances
- **Address Validation**: Automatic validation for different network types
- **Privacy Controls**: Show/hide wallet addresses with masking

### ✅ Progress Tracking
- **Auto-save Progress**: Automatically saves onboarding progress to localStorage
- **Step Navigation**: Navigate between steps with validation
- **Completion Summary**: Overview of all configured settings

## Multi-Step Flow

### Step 1: Agent Wallet Setup
```typescript
interface AgentWalletData {
  restrictions: string;
  notes: string;
  isConnected: boolean;
}
```

- Connect wallet for agent use
- Define transaction restrictions
- Add security notes
- View funding instructions

### Step 2: Telegram Integration
```typescript
interface TelegramData {
  phoneNumber: string;
  isVerified: boolean;
  otpCode: string;
  selectedChatRooms: ChatRoom[];
}
```

- Verify phone number with OTP
- Select chat rooms to monitor
- Add custom chats manually
- Privacy and security information

### Step 3: Active Wallets
```typescript
interface WalletData {
  id: string;
  address: string;
  name: string;
  network: string;
  balance?: string;
  isValid: boolean;
}
```

- Add multiple wallets to monitor
- Validate addresses for different networks
- Fetch real-time balances
- Copy/hide addresses for privacy

### Step 4: Completion
- Setup summary with status indicators
- Next steps guidance
- Dashboard launch button

## API Endpoints

### Telegram Integration
- `POST /api/telegram` - Handle OTP sending, verification, and chat fetching

### Wallet Balance
- `GET /api/wallet-balance` - Fetch balance for a single wallet
- `POST /api/wallet-balance` - Fetch balances for multiple wallets

## Components Structure

```
/components/onboarding/
├── AgentWalletStep.tsx     # Wallet connection and setup
├── TelegramStep.tsx        # Phone verification and chat selection
├── ActiveWalletsStep.tsx   # Wallet monitoring setup
└── CompletionStep.tsx      # Final summary and completion
```

## Utilities

```
/utils/onboarding.ts        # Validation and utility functions
/types/onboarding.ts        # TypeScript interfaces
```

### Key Utilities
- `validateWalletAddress()` - Validate addresses for different networks
- `validatePhoneNumber()` - Phone number format validation
- `validateOTP()` - OTP format validation
- `formatWalletAddress()` - Address display formatting
- `saveOnboardingProgress()` - Local storage management

## Security Features

### Wallet Security
- Address format validation
- Transaction restriction settings
- Private key safety warnings
- Network-specific validation

### Privacy Protection
- Address masking/revealing controls
- Copy to clipboard functionality
- OTP-based phone verification
- Secure data handling

### Data Persistence
- Local storage for progress saving
- No sensitive data stored permanently
- Easy progress clearing functionality

## Usage

1. **Import the onboarding page**:
   ```tsx
   import OnboardingPage from '/app/onboarding/page';
   ```

2. **Navigate to onboarding**:
   ```tsx
   <Link href="/onboarding">Setup Agent</Link>
   ```

3. **Access from main navigation**:
   - Header link: "Setup Agent"
   - Hero section button: "Setup Agent"

## Customization

### Theming
The onboarding system follows the main app theme:
- Dark mode support
- Red accent color (`bg-red-600`)
- Glass-morphism effects (`backdrop-blur-lg`)
- Gradient backgrounds

### Network Configuration
Add new networks in `ActiveWalletsStep.tsx`:
```typescript
const networks = [
  { id: 'new-network', name: 'New Network', symbol: 'NEW' },
  // ... existing networks
];
```

### Validation Rules
Customize validation in `/utils/onboarding.ts`:
```typescript
export const validateWalletAddress = (address: string, network: string) => {
  // Add custom validation logic
};
```

## Development

### Running the Application
```bash
npm run dev
```

### Testing the Onboarding Flow
1. Navigate to `http://localhost:3000`
2. Click "Setup Agent" in header or hero section
3. Follow the multi-step process
4. Test API integrations with mock data

### API Integration
Replace mock APIs with real integrations:
- Telegram Bot API for actual OTP and chat fetching
- Blockchain APIs (Alchemy, Infura) for real balance data
- Wallet connection libraries for actual wallet integration

## Future Enhancements

- [ ] Real Telegram Bot API integration
- [ ] Advanced transaction monitoring
- [ ] Multi-language support
- [ ] Enhanced security features
- [ ] Mobile responsiveness improvements
- [ ] Bulk wallet import functionality
- [ ] Advanced chat filtering options
- [ ] Real-time balance updates via WebSocket

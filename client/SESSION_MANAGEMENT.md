# Agent Session Management System

This system provides persistent agent wallet sessions using secure encryption and local storage.

## Architecture

### Components

1. **AgentSession Model** (`/lib/models/AgentSession.ts`)
   - MongoDB model for storing encrypted session data
   - Includes metadata for security tracking

2. **PrivateKeyEncryption** (`/lib/utils/encryption.ts`)
   - Secure AES-256-GCM encryption for private keys
   - Salt-based key derivation (PBKDF2)
   - Device fingerprinting and IP hashing

3. **AgentSessionManager** (`/lib/utils/session-manager.ts`)
   - Central session management class
   - Handles creation, restoration, and cleanup

4. **AgentWalletManager** (`/lib/agent/wallet-manager.ts`)
   - Updated to integrate with session persistence
   - Automatic session restoration

5. **useAgentSession Hook** (`/hooks/useAgentSession.ts`)
   - Client-side React hook for session management
   - Real-time session status and operations

## Security Features

### Encryption
- **Algorithm**: AES-256-GCM with PBKDF2 key derivation
- **Salt Generation**: Cryptographically secure random bytes
- **Session Passwords**: Unique per-session encryption keys
- **Key Stretching**: 10,000 PBKDF2 iterations

### Privacy Protection
- **IP Hashing**: User IP addresses are hashed with secret salt
- **Device Fingerprinting**: Browser/device identification
- **Session Expiry**: Automatic cleanup after 90 days
- **Memory Security**: Private keys only in memory during use

### Storage Strategy
- **Database**: Encrypted private keys with salt
- **Local Storage**: Session ID and temporary decryption key
- **No Plaintext**: Private keys never stored in plaintext

## How It Works

### Session Creation
1. User creates or imports wallet
2. System generates:
   - Unique session ID
   - Cryptographic salt (256-bit)
   - Session password (256-bit)
3. Private key encrypted with session password + salt
4. Encrypted data stored in database
5. Session info stored in browser localStorage

### Session Restoration
1. Browser loads session info from localStorage
2. System validates session ID in database
3. Private key decrypted using stored session password
4. Wallet restored to memory for agent operations
5. Session timestamp updated

### Session Security
- **Expiry**: Sessions auto-expire after 7 days of inactivity
- **Extension**: Active sessions automatically extended every 30 minutes
- **Cleanup**: Database cleanup removes expired sessions
- **Validation**: Session integrity checked on each use

## Usage Examples

### Using the Hook
```typescript
import { useAgentSession } from '@/hooks/useAgentSession';

function MyComponent() {
  const { 
    session, 
    isLoading, 
    createWallet, 
    importWallet, 
    clearSession 
  } = useAgentSession();

  if (session.isConnected) {
    return <div>Wallet: {session.address}</div>;
  }

  return (
    <button onClick={() => createWallet()}>
      Create Wallet
    </button>
  );
}
```

### Direct Session Management
```typescript
import AgentSessionManager from '@/lib/utils/session-manager';

// Create session
const { sessionId, success } = await AgentSessionManager.createSession(
  privateKey, 
  walletAddress, 
  userId, 
  chainId
);

// Restore session
const session = await AgentSessionManager.getSession(userId);

// Clear session
await AgentSessionManager.clearSession(userId, sessionId);
```

### API Integration
```typescript
// Check session status
const response = await fetch('/api/agent?action=session_status');

// Restore from session
const response = await fetch('/api/agent', {
  method: 'POST',
  body: JSON.stringify({ action: 'restore_session' })
});
```

## Database Schema

### AgentSession Collection
```typescript
{
  userId: string;           // User identifier
  agentAddress: string;     // Wallet address (indexed)
  saltedPrivateKey: string; // Encrypted private key
  salt: string;             // Encryption salt
  sessionId: string;        // Unique session ID (indexed)
  chainId: number;          // Blockchain chain ID
  createdAt: Date;          // Session creation time
  lastActiveAt: Date;       // Last activity timestamp
  isActive: boolean;        // Session status
  metadata: {
    userAgent?: string;     // Browser identification
    ipHash?: string;        // Hashed IP address
    deviceFingerprint?: string; // Device fingerprint
  };
}
```

## Configuration

### Environment Variables
```bash
# Security (Required)
IP_HASH_SECRET=your_random_secret_here

# Database (Required)
MONGODB_URI=mongodb://localhost:27017/glide-agent

# API Keys (Required)
NEXT_PUBLIC_API_KEY=your_0xgasless_api_key
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
```

### Database Indexes
- `{ userId: 1, isActive: 1 }` - User active sessions
- `{ sessionId: 1, isActive: 1 }` - Session lookup
- `{ agentAddress: 1 }` - Unique wallet constraint
- `{ createdAt: 1 }` - TTL index (90 days)

## Security Considerations

### What's Protected
- ✅ Private keys encrypted at rest
- ✅ Session isolation per user
- ✅ Automatic session expiry
- ✅ IP address privacy
- ✅ Device tracking prevention

### Potential Risks
- ⚠️ Client-side session storage (localStorage)
- ⚠️ Session hijacking if device compromised
- ⚠️ Key exposure during memory operations
- ⚠️ Dependency on browser security

### Best Practices
1. **Regular Cleanup**: Run session cleanup maintenance
2. **Key Rotation**: Rotate encryption secrets periodically
3. **Monitoring**: Track session creation/access patterns
4. **Backup Strategy**: Secure backup of session data
5. **User Education**: Inform users about session security

## Maintenance

### Session Cleanup
```typescript
// Remove expired sessions
const cleanedCount = await AgentSessionManager.cleanupExpiredSessions();
console.log(`Cleaned up ${cleanedCount} expired sessions`);
```

### User Session Management
```typescript
// Get user's active sessions
const sessions = await AgentSessionManager.getUserSessions(userId);

// Force clear all user sessions
await AgentSession.updateMany(
  { userId, isActive: true },
  { isActive: false, lastActiveAt: new Date() }
);
```

## Troubleshooting

### Common Issues

**Session Not Restoring**
- Check localStorage for session data
- Verify database connection
- Check session expiry status
- Validate environment variables

**Encryption Errors**
- Verify salt generation
- Check key derivation parameters
- Validate session password format
- Ensure crypto module availability

**Database Errors**
- Check MongoDB connection
- Verify collection indexes
- Check document schema compliance
- Monitor database disk space

**Performance Issues**
- Add database indexes for queries
- Implement session caching
- Optimize encryption operations
- Batch database operations

### Debugging
```typescript
// Enable session debugging
localStorage.setItem('debug-sessions', 'true');

// Check session status
const session = await AgentSessionManager.getSession(userId);
console.log('Session status:', {
  hasSession: !!session.sessionId,
  address: session.agentAddress,
  chainId: session.chainId,
  expiresAt: new Date(Date.now() + 7*24*60*60*1000)
});
```

## Future Enhancements

1. **Multi-Device Sync**: Session sharing across devices
2. **Biometric Auth**: Hardware security key integration  
3. **Session Analytics**: Usage patterns and security metrics
4. **Backup/Recovery**: Encrypted session backups
5. **Advanced Cleanup**: Smart session lifecycle management

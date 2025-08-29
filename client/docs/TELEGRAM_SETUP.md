# Telegram Bot Integration Setup

## Quick Setup for Real Telegram OTP

To enable real Telegram OTP functionality, follow these steps:

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Start a chat and send `/newbot`
3. Follow the instructions to create your bot
4. Copy the Bot Token (looks like: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`)

### 2. Configure Environment Variables

Create or update your `.env.local` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=development
```

### 3. Database Setup (Optional)

For production, you should store user data in a database:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE,
  telegram_chat_id BIGINT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Implementation Steps

#### A. User Registration Flow
1. User provides phone number
2. They start your bot on Telegram
3. Bot stores their chat_id with phone number
4. Send OTP via bot message

#### B. Code Changes Needed

Update `/app/api/telegram/route.ts`:

```typescript
// Add database connection
import { getUserByChatId, updateUserVerification } from '@/lib/database';

// In send-otp action:
const user = await getUserByPhoneNumber(phoneNumber);
if (user && user.telegram_chat_id) {
  await sendTelegramMessage(user.telegram_chat_id, `Your Glide verification code is: ${otp}`);
}
```

### 5. Development Mode

Currently, the system works in development mode:
- Shows OTP in the UI for testing
- Uses in-memory storage for OTPs
- No real Telegram messages sent

### 6. Production Checklist

- [ ] Set up Telegram Bot
- [ ] Configure environment variables
- [ ] Set up user database
- [ ] Implement phone-to-chat-ID mapping
- [ ] Handle bot blocking/unblocking
- [ ] Add rate limiting
- [ ] Set up monitoring

### 7. Alternative: SMS Gateway

If Telegram integration is complex, consider using SMS:

```typescript
// Using Twilio SMS
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  body: `Your Glide verification code is: ${otp}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phoneNumber
});
```

## Current Status

- ✅ OTP generation and validation working
- ✅ Development mode with visible OTP
- ✅ UI ready for real integration
- ⏳ Real Telegram Bot API (needs setup)
- ⏳ User database integration (optional)

The system is fully functional in development mode and ready for production integration.

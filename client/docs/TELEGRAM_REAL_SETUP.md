# 📱 Real Telegram OTP Integration Setup Guide

Follow these steps to get real Telegram OTP messages working:

## Step 1: Create Your Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Send `/newbot`** command
3. **Choose a name** for your bot (e.g., "Glide Verification Bot")
4. **Choose a username** for your bot (must end with 'bot', e.g., "glide_verify_bot")
5. **Copy the Bot Token** (looks like: `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`)

## Step 2: Configure Environment Variables

Create `.env.local` file in your project root:

```env
# Add your bot token here
TELEGRAM_BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ

# Other environment variables
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key
```

## Step 3: Set Up the Bot Registration System

### Option A: Simple Registration (Recommended)

1. **Start your bot** by searching for its username on Telegram
2. **Send `/start`** to your bot
3. **Send your phone number** in international format (e.g., `+918583089117`)
4. **Bot will confirm** your registration

### Option B: Advanced Bot Script (Optional)

Run the included bot script for more features:

```bash
# Install telegram bot package globally
npm install -g node-telegram-bot-api

# Edit telegram-bot.js with your token
# Then run the bot
node telegram-bot.js
```

## Step 4: Test the Integration

1. **Restart your Next.js server**:
   ```bash
   npm run dev
   ```

2. **Go to onboarding page**: `http://localhost:3000/onboarding`

3. **Navigate to Telegram step**

4. **Enter your registered phone number**

5. **Click "Send OTP"**

6. **Check your Telegram** for the OTP message! 🎉

## Step 5: Registration Process for Users

### For your users to receive OTPs:

1. **They search for your bot** on Telegram (using the username you created)
2. **They send `/start`** to the bot
3. **They send their phone number** in international format
4. **Bot confirms registration**
5. **Now they can receive OTPs** in the onboarding flow!

## Troubleshooting

### "Bot not configured" error?
- ✅ Check `.env.local` has `TELEGRAM_BOT_TOKEN`
- ✅ Restart your Next.js server
- ✅ Make sure token is correct from @BotFather

### "Phone number not registered" error?
- ✅ User must start the bot first
- ✅ User must send their phone number to the bot
- ✅ Phone number format must match exactly (include country code)

### OTP not arriving?
- ✅ Check bot token is valid
- ✅ User has started the bot
- ✅ Phone number is registered correctly
- ✅ Check server logs for errors

## Security Notes

- 🔐 **Never share your bot token** publicly
- 🔐 **Use environment variables** for the token
- 🔐 **In production**, use a database instead of in-memory storage
- 🔐 **Add rate limiting** to prevent spam

## Production Considerations

For production deployment:

1. **Use a database** to store user registrations
2. **Add rate limiting** for OTP requests
3. **Implement user verification** (optional)
4. **Set up monitoring** for bot health
5. **Handle bot blocking/unblocking** gracefully

## Example Bot Messages

When working correctly, users will see:

**Registration:**
```
👋 Hello! Welcome to Glide Bot.

To verify your phone number for Glide, please send your phone number in international format.

Example: +1234567890
```

**OTP Message:**
```
🔐 Glide Verification Code

Your verification code is: 123456

This code will expire in 5 minutes.

Do not share this code with anyone.
```

**Success:**
```
✅ Phone Number Verified

Your phone number has been successfully verified for Glide!

You can now proceed with the setup.
```

## Ready to Test! 🚀

After setting up:
1. ✅ Bot created with @BotFather
2. ✅ Token added to `.env.local`
3. ✅ Server restarted
4. ✅ You registered your phone with the bot
5. ✅ Test the onboarding flow

You should now receive real Telegram messages with OTP codes! 📱✨

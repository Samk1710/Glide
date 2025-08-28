import { NextRequest, NextResponse } from 'next/server';
import { userRegistrations } from '../telegram-register/route';

// Real Telegram Bot API integration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Store OTP codes temporarily (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expiry: number }>();

// Simple function to send message via Telegram Bot API
async function sendTelegramMessage(chatId: number, message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('Telegram Bot Token not configured');
  }
  
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Telegram API error: ${error.description || response.statusText}`);
  }
  
  return response.json();
}

// Function to get chat ID by phone number
function getChatIdByPhoneNumber(phoneNumber: string): number | null {
  return userRegistrations.get(phoneNumber) || null;
}

export async function POST(request: NextRequest) {
  try {
    const { action, phoneNumber, otpCode, chatId } = await request.json();

    if (action === 'register-user') {
      // This endpoint allows users to register their chat ID with phone number
      // Users would send a message to your bot with their phone number
      if (!phoneNumber || !chatId) {
        return NextResponse.json({
          success: false,
          message: 'Phone number and chat ID are required'
        }, { status: 400 });
      }

      userRegistrations.set(phoneNumber, chatId);
      
      return NextResponse.json({
        success: true,
        message: 'User registered successfully'
      });
    }

    if (action === 'send-otp') {
      if (!TELEGRAM_BOT_TOKEN) {
        console.log('Telegram Bot Token not configured, using mock OTP');
        
        // For development without bot token, show instructions
        return NextResponse.json({
          success: false,
          message: 'Telegram Bot not configured. Please follow setup instructions.',
          instructions: {
            step1: 'Create a bot with @BotFather on Telegram',
            step2: 'Set TELEGRAM_BOT_TOKEN in your .env.local file',
            step3: 'Start your bot and send /start command',
            step4: 'Register your phone number with the bot'
          }
        }, { status: 400 });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Get user's chat ID
      const userChatId = getChatIdByPhoneNumber(phoneNumber);
      
      if (!userChatId) {
        return NextResponse.json({
          success: false,
          message: 'Phone number not registered. Please start the bot first and register your phone number.',
          botInstructions: {
            step1: `Search for your bot on Telegram`,
            step2: 'Send /start command to the bot',
            step3: 'Follow bot instructions to register your phone number'
          }
        }, { status: 400 });
      }

      try {
        // Store OTP with expiry (5 minutes)
        otpStore.set(phoneNumber, { 
          code: otp, 
          expiry: Date.now() + 5 * 60 * 1000
        });
        
        // Send OTP via Telegram Bot
        await sendTelegramMessage(userChatId, 
          `🔐 *Glide Verification Code*\n\nYour verification code is: *${otp}*\n\nThis code will expire in 5 minutes.\n\n_Do not share this code with anyone._`
        );
        
        console.log(`OTP sent to Telegram chat ${userChatId} for phone ${phoneNumber}`);
        
        return NextResponse.json({
          success: true,
          message: 'OTP sent to your Telegram account successfully'
        });
        
      } catch (error) {
        console.error('Error sending OTP via Telegram:', error);
        return NextResponse.json({
          success: false,
          message: 'Failed to send OTP. Please make sure you have started the bot on Telegram.'
        }, { status: 500 });
      }
    }

    if (action === 'verify-otp') {
      const storedOtp = otpStore.get(phoneNumber);
      
      if (!storedOtp) {
        return NextResponse.json({
          success: false,
          message: 'No OTP found for this phone number. Please request a new OTP.'
        }, { status: 400 });
      }
      
      if (Date.now() > storedOtp.expiry) {
        otpStore.delete(phoneNumber);
        return NextResponse.json({
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        }, { status: 400 });
      }
      
      if (otpCode !== storedOtp.code) {
        return NextResponse.json({
          success: false,
          message: 'Invalid OTP code. Please check and try again.'
        }, { status: 400 });
      }
      
      // OTP verified successfully
      otpStore.delete(phoneNumber);
      
      // Send confirmation message
      const userChatId = getChatIdByPhoneNumber(phoneNumber);
      if (userChatId) {
        try {
          await sendTelegramMessage(userChatId, 
            `✅ *Phone Number Verified*\n\nYour phone number has been successfully verified for Glide!\n\nYou can now proceed with the setup.`
          );
        } catch (error) {
          console.error('Error sending confirmation message:', error);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Phone number verified successfully',
        verified: true
      });
    }

    if (action === 'get-chats') {
      // Mock chats for now - real implementation would require special permissions
      const mockChats = [
        { id: '1', name: 'Crypto Trading Signals', members: 15420, type: 'channel' },
        { id: '2', name: 'DeFi Discussion', members: 8932, type: 'group' },
        { id: '3', name: 'NFT Alpha', members: 23145, type: 'channel' },
        { id: '4', name: 'Web3 Developers', members: 5678, type: 'group' },
        { id: '5', name: 'Solana Ecosystem', members: 12890, type: 'channel' },
      ];
      
      return NextResponse.json({
        success: true,
        chats: mockChats
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('Telegram API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

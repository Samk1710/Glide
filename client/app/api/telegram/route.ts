import { NextRequest, NextResponse } from 'next/server';
import telegramClientService from '@/lib/telegram-client';

export async function POST(request: NextRequest) {
  try {
    const { action, phoneNumber, code, otpCode, phoneCodeHash } = await request.json();

    console.log(`📱 Telegram API called with action: ${action}`);

    // Handle both 'code' and 'otpCode' parameters
    const actualCode = code || otpCode;

    switch (action) {
      case 'sendOtp':
      case 'send-otp':
        if (!phoneNumber) {
          return NextResponse.json(
            { success: false, error: 'Phone number is required' },
            { status: 400 }
          );
        }

        console.log(`🔄 Sending OTP to ${phoneNumber}...`);
        const result = await telegramClientService.sendCode(phoneNumber);
        
        if (result.success) {
          console.log('✅ OTP sent successfully to', phoneNumber);
          return NextResponse.json({
            success: true,
            phoneCodeHash: result.phoneCodeHash,
            message: result.error || 'OTP sent successfully - check your Telegram app!',
          });
        } else {
          console.error('❌ Failed to send OTP:', result.error);
          return NextResponse.json(
            { 
              success: false, 
              message: result.error || 'Failed to send OTP',
              errorType: 'SendError'
            },
            { status: 500 }
          );
        }

      case 'verifyOtp':
      case 'verify-otp':
        if (!phoneNumber || !actualCode) {
          return NextResponse.json(
            { success: false, error: 'Phone number and code are required' },
            { status: 400 }
          );
        }

        console.log(`🔐 Verifying OTP for ${phoneNumber}`);
        
        // For our implementation, we'll use the phone number as phoneCodeHash if not provided
        const hashToUse = phoneCodeHash || `hash_for_${phoneNumber.replace(/[^\d]/g, '')}`;
        const verifyResult = await telegramClientService.verifyCode(phoneNumber, actualCode, hashToUse);
        
        if (verifyResult.success) {
          console.log('✅ OTP verification successful for', phoneNumber);
          
          // Generate a more persistent session token
          const sessionToken = `session_${phoneNumber.replace(/[^\d]/g, '')}_${Date.now()}`;
          
          return NextResponse.json({
            success: true,
            user: verifyResult.user,
            session: sessionToken,
            message: 'Authentication successful',
          });
        } else {
          console.error('❌ OTP verification failed:', verifyResult.error);
          return NextResponse.json(
            { success: false, message: verifyResult.error || 'Invalid OTP' },
            { status: 400 }
          );
        }

      case 'getChatRooms':
      case 'get-chats':
        console.log('💬 Fetching user chat rooms...');
        const chatRooms = await telegramClientService.getChatRooms();
        
        console.log(`✅ Retrieved ${chatRooms.length} chat rooms`);
        return NextResponse.json({
          success: true,
          chats: chatRooms.map(room => ({
            id: room.id,
            name: room.title, // Map title to name for compatibility
            title: room.title,
            type: room.type,
            members: room.memberCount || 0,
            memberCount: room.memberCount || 0,
          })),
          chatRooms: chatRooms, // Keep original format too
          isRealMode: true, // Now it's always real mode
        });

      case 'startMonitoring':
        const { chatRoomIds } = await request.json();
        
        if (!chatRoomIds || !Array.isArray(chatRoomIds)) {
          return NextResponse.json(
            { success: false, error: 'Chat room IDs are required' },
            { status: 400 }
          );
        }

        console.log('👀 Starting chat room monitoring...');
        const monitoringStarted = await telegramClientService.startMonitoring(chatRoomIds);
        
        if (monitoringStarted) {
          console.log('✅ Chat room monitoring started successfully');
          return NextResponse.json({
            success: true,
            message: 'Monitoring started successfully',
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Failed to start monitoring' },
            { status: 500 }
          );
        }

      case 'getMessages':
        const requestData = await request.json();
        const { chatId, limit = 50 } = requestData;
        
        if (!chatId) {
          return NextResponse.json(
            { success: false, error: 'Chat ID is required' },
            { status: 400 }
          );
        }

        console.log(`📨 Fetching messages from chat ${chatId}`);
        const messages = await telegramClientService.getMessages(chatId, limit);
        
        console.log(`✅ Retrieved ${messages.length} messages`);
        return NextResponse.json({
          success: true,
          messages: messages,
        });

      case 'validateSession':
        // Simple session validation - in production, you'd want more robust validation
        const { session } = await request.json();
        
        if (session && session.startsWith('session_')) {
          return NextResponse.json({
            success: true,
            valid: true,
            message: 'Session is valid',
          });
        } else {
          return NextResponse.json({
            success: false,
            valid: false,
            message: 'Invalid session',
          });
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Telegram API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'Telegram API',
    timestamp: new Date().toISOString(),
  });
}

import { NextRequest, NextResponse } from 'next/server';
import telegramClientService from '@/lib/telegram-client';

export async function POST(request: NextRequest) {
  try {
    const { action, phoneNumber, code, phoneCodeHash } = await request.json();

    console.log(`📱 Telegram API called with action: ${action}`);

    switch (action) {
      case 'sendOtp':
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
            message: result.error || 'OTP sent successfully',
          });
        } else {
          console.error('❌ Failed to send OTP:', result.error);
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to send OTP' },
            { status: 500 }
          );
        }

      case 'verifyOtp':
        if (!phoneNumber || !code || !phoneCodeHash) {
          return NextResponse.json(
            { success: false, error: 'Phone number, code, and phone code hash are required' },
            { status: 400 }
          );
        }

        console.log(`🔐 Verifying OTP for ${phoneNumber}`);
        const verifyResult = await telegramClientService.verifyCode(phoneNumber, code, phoneCodeHash);
        
        if (verifyResult.success) {
          console.log('✅ OTP verification successful for', phoneNumber);
          return NextResponse.json({
            success: true,
            user: verifyResult.user,
            message: 'Authentication successful',
          });
        } else {
          console.error('❌ OTP verification failed:', verifyResult.error);
          return NextResponse.json(
            { success: false, error: verifyResult.error || 'Invalid OTP' },
            { status: 400 }
          );
        }

      case 'getChatRooms':
        console.log('💬 Fetching user chat rooms...');
        const chatRooms = await telegramClientService.getChatRooms();
        
        console.log(`✅ Retrieved ${chatRooms.length} chat rooms`);
        return NextResponse.json({
          success: true,
          chatRooms: chatRooms,
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

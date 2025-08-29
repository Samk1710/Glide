import { NextRequest, NextResponse } from 'next/server';
import telegramClientService from '@/lib/telegram-client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get('phone');
  const action = searchParams.get('action');

  // If action is 'status', return the Telegram connection status
  if (action === 'status') {
    try {
      const status = await telegramClientService.getConnectionStatus();
      return NextResponse.json({
        success: true,
        isConnected: status.isConnected,
        userInfo: status.userInfo,
        error: status.error,
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        isConnected: false,
        error: 'Failed to get status',
      });
    }
  }

  if (!phoneNumber) {
    return NextResponse.json(
      { error: 'Phone number is required' },
      { status: 400 }
    );
  }

  // Get the stored OTP for debugging
  const otp = telegramClientService.getStoredOtp(phoneNumber);

  if (!otp) {
    return NextResponse.json(
      { error: 'No OTP found for this phone number' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    phone: phoneNumber,
    otp: otp,
    message: 'This is your OTP code for development',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'cleanup') {
      telegramClientService.cleanupExpiredOtps();
      return NextResponse.json({
        success: true,
        message: 'Expired OTPs cleaned up',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import UserProfileManager from '../../../../lib/utils/user-profile-manager';

// PUT - Update telegram session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionString, phoneNumber } = body;

    if (!userId || !sessionString) {
      return NextResponse.json({
        success: false,
        error: 'User ID and session string are required'
      }, { status: 400 });
    }

    const success = await UserProfileManager.updateTelegramSession(
      userId,
      sessionString,
      phoneNumber
    );

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update telegram session'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram session updated successfully'
    });
  } catch (error) {
    console.error('Error updating telegram session:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

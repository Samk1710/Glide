import { NextRequest, NextResponse } from 'next/server';
import UserProfileManager from '../../../../lib/utils/user-profile-manager';

// PUT - Update selected channels
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, channels } = body;

    if (!userId || !Array.isArray(channels)) {
      return NextResponse.json({
        success: false,
        error: 'User ID and channels array are required'
      }, { status: 400 });
    }

    const success = await UserProfileManager.updateSelectedChannels(userId, channels);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update selected channels'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Selected channels updated successfully'
    });
  } catch (error) {
    console.error('Error updating selected channels:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

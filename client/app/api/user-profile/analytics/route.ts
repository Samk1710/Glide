import { NextRequest, NextResponse } from 'next/server';
import UserProfileManager from '../../../../lib/utils/user-profile-manager';

// PUT - Update analytics data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, analytics } = body;

    if (!userId || !analytics) {
      return NextResponse.json({
        success: false,
        error: 'User ID and analytics data are required'
      }, { status: 400 });
    }

    const success = await UserProfileManager.updateAnalytics(userId, analytics);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update analytics'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics updated successfully'
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

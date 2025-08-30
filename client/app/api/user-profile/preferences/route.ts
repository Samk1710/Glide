import { NextRequest, NextResponse } from 'next/server';
import UserProfileManager from '../../../../lib/utils/user-profile-manager';

// PUT - Update agent preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json({
        success: false,
        error: 'User ID and preferences are required'
      }, { status: 400 });
    }

    const success = await UserProfileManager.updateAgentPreferences(userId, preferences);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update agent preferences'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Agent preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating agent preferences:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

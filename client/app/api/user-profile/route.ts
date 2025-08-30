import { NextRequest, NextResponse } from 'next/server';
import UserProfileManager from '../../../lib/utils/user-profile-manager';
import { headers } from 'next/headers';

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const profile = await UserProfileManager.getUserProfile(userId);

    if (!profile) {
      return NextResponse.json({
        success: false,
        error: 'Profile not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Create or update user profile with onboarding data
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = headersList.get('x-real-ip');
    const clientIP = forwarded || realIP || '127.0.0.1';

    const body = await request.json();
    const { userId, onboardingData, metadata } = body;

    if (!userId || !onboardingData) {
      return NextResponse.json({
        success: false,
        error: 'User ID and onboarding data are required'
      }, { status: 400 });
    }

    // Add server-side metadata
    const serverMetadata = {
      userAgent,
      ipAddress: clientIP.split(',')[0].trim(),
      ...metadata
    };

    const profile = await UserProfileManager.saveOnboardingData(
      userId,
      onboardingData,
      serverMetadata
    );

    return NextResponse.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('Error saving user profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save user profile'
    }, { status: 500 });
  }
}

// PUT - Update specific profile fields
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updateType, data } = body;

    if (!userId || !updateType || !data) {
      return NextResponse.json({
        success: false,
        error: 'User ID, update type, and data are required'
      }, { status: 400 });
    }

    let success = false;

    switch (updateType) {
      case 'agentPreferences':
        success = await UserProfileManager.updateAgentPreferences(userId, data);
        break;
      case 'analytics':
        success = await UserProfileManager.updateAnalytics(userId, data);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid update type'
        }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update profile'
      }, { status: 500 });
    }

    // Return updated profile
    const updatedProfile = await UserProfileManager.getUserProfile(userId);

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Delete user profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const success = await UserProfileManager.deleteUserProfile(userId);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete profile'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

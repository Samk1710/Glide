import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import EnhancedAgentManager from '../../../lib/utils/enhanced-agent-manager';

// POST - Execute agent actions with user context
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    
    const body = await request.json();
    const { userId, action, params } = body;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action is required'
      }, { status: 400 });
    }

    // Initialize agent context with user profile data
    const context = await EnhancedAgentManager.initializeAgentContext(userId);
    
    if (!context) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize agent context. User profile may not exist.'
      }, { status: 404 });
    }

    // Execute the requested action
    const result = await EnhancedAgentManager.executeAgentAction(context, action, params);

    return NextResponse.json({
      success: true,
      data: result,
      context: {
        userId: context.userId,
        onboardingCompleted: context.profile.onboardingCompleted,
        agentWalletConnected: context.walletInfo.agentWallet?.isConnected || false,
        telegramConnected: context.telegramPreferences?.isConnected || false,
        activeWalletsCount: context.walletInfo.activeWallets.length
      }
    });
  } catch (error) {
    console.error('Error executing enhanced agent action:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// GET - Get user status and agent readiness
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

    const status = await EnhancedAgentManager.getUserStatus(userId);

    if (status.error) {
      return NextResponse.json({
        success: false,
        error: status.error
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting user status:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update user preferences
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

    const success = await EnhancedAgentManager.updateUserPreferences(userId, preferences);

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update preferences'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

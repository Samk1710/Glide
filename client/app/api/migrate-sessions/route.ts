import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import AgentSession from '@/lib/models/AgentSession';

export async function POST(request: Request) {
  try {
    const { oldUserId, newUserId } = await request.json();
    
    if (!oldUserId || !newUserId) {
      return NextResponse.json(
        { error: 'Both oldUserId and newUserId are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const result = await AgentSession.updateMany(
      { userId: oldUserId },
      { $set: { userId: newUserId } }
    );
    
    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} sessions from ${oldUserId} to ${newUserId}`
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate sessions' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import AgentSession from '@/lib/models/AgentSession';

export async function GET() {
  try {
    await dbConnect();
    
    const sessions = await AgentSession.find({}).limit(20).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      sessions: sessions.map(session => ({
        userId: session.userId,
        agentAddress: session.agentAddress,
        isActive: session.isActive,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt
      }))
    });
  } catch (error) {
    console.error('Debug sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

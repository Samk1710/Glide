import { NextRequest, NextResponse } from 'next/server';
import { TelegramAirdropMonitor } from '@/lib/agent/telegram-monitor';

export const dynamic = 'force-dynamic';

// Store monitor instances (in production, use Redis or database)
const monitorInstances = new Map<string, TelegramAirdropMonitor>();

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json();

    switch (action) {
      case 'connect': {
        const { apiId, apiHash, phoneNumber, phoneCode, stringSession } = data;
        
        if (!apiId || !apiHash || !phoneNumber) {
          return NextResponse.json(
            { error: 'API ID, API Hash, and phone number are required' },
            { status: 400 }
          );
        }

        const monitor = new TelegramAirdropMonitor({
          apiId: parseInt(apiId),
          apiHash,
          phoneNumber,
          stringSession
        });

        const result = await monitor.connect(phoneNumber, phoneCode);
        
        if (result.success) {
          monitorInstances.set(phoneNumber, monitor);
        }
        
        return NextResponse.json({
          success: result.success,
          data: result
        });
      }

      case 'add_channel': {
        const { phoneNumber, channelUsername } = data;
        
        if (!phoneNumber || !channelUsername) {
          return NextResponse.json(
            { error: 'Phone number and channel username are required' },
            { status: 400 }
          );
        }

        const monitor = monitorInstances.get(phoneNumber);
        if (!monitor) {
          return NextResponse.json(
            { error: 'Telegram monitor not found. Please connect first.' },
            { status: 404 }
          );
        }

        const channel = await monitor.addChannelToMonitor(channelUsername);
        
        return NextResponse.json({
          success: true,
          data: channel
        });
      }

      case 'get_channels': {
        const { phoneNumber } = data;
        
        if (!phoneNumber) {
          return NextResponse.json(
            { error: 'Phone number is required' },
            { status: 400 }
          );
        }

        const monitor = monitorInstances.get(phoneNumber);
        if (!monitor) {
          return NextResponse.json(
            { error: 'Telegram monitor not found' },
            { status: 404 }
          );
        }

        const channels = monitor.getMonitoredChannels();
        
        return NextResponse.json({
          success: true,
          data: channels
        });
      }

      case 'get_signals': {
        const { phoneNumber, limit } = data;
        
        if (!phoneNumber) {
          return NextResponse.json(
            { error: 'Phone number is required' },
            { status: 400 }
          );
        }

        const monitor = monitorInstances.get(phoneNumber);
        if (!monitor) {
          return NextResponse.json(
            { error: 'Telegram monitor not found' },
            { status: 404 }
          );
        }

        const signals = monitor.getRecentSignals(limit || 50);
        
        return NextResponse.json({
          success: true,
          data: signals
        });
      }

      case 'disconnect': {
        const { phoneNumber } = data;
        
        if (!phoneNumber) {
          return NextResponse.json(
            { error: 'Phone number is required' },
            { status: 400 }
          );
        }

        const monitor = monitorInstances.get(phoneNumber);
        if (monitor) {
          await monitor.disconnect();
          monitorInstances.delete(phoneNumber);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Disconnected from Telegram'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Telegram monitor API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list_monitors': {
        const phoneNumbers = Array.from(monitorInstances.keys());
        return NextResponse.json({
          success: true,
          data: { phoneNumbers }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Telegram monitor API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

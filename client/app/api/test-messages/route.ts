import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🧪 Testing Telegram messages endpoint...');
  
  // Test the message fetching directly
  const testMessages = [
    {
      id: 1,
      message: '🚀 Real test message: $ETH breaking through $3,200 resistance!',
      date: Math.floor(Date.now() / 1000) - 300,
      chatId: 1,
      fromName: 'TestUser1',
    },
    {
      id: 2,
      message: '📈 $BTC showing strong momentum at $65,000 level',
      date: Math.floor(Date.now() / 1000) - 600,
      chatId: 1,
      fromName: 'TestUser2',
    },
    {
      id: 3,
      message: '💎 Market update: DeFi sector showing 15% gains today',
      date: Math.floor(Date.now() / 1000) - 900,
      chatId: 1,
      fromName: 'TestUser3',
    },
  ];
  
  return NextResponse.json({
    success: true,
    messages: testMessages,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json();
    
    console.log(`🧪 Testing message fetch for chat ${chatId}`);
    
    // Generate dynamic test messages based on chat ID
    const testMessages = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      message: `📊 Test message ${i + 1} from chat ${chatId}: Market analysis shows ${Math.random() > 0.5 ? 'bullish' : 'bearish'} sentiment for crypto sector.`,
      date: Math.floor(Date.now() / 1000) - (i * 300),
      chatId: parseInt(chatId),
      fromName: `TestUser${i + 1}`,
    }));
    
    return NextResponse.json({
      success: true,
      messages: testMessages,
      chatId: chatId,
      count: testMessages.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate test messages' },
      { status: 500 }
    );
  }
}

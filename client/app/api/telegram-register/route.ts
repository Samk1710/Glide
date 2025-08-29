import { NextRequest, NextResponse } from 'next/server';

// This endpoint can be called from your Telegram bot to register users
// Store user registrations temporarily (in production, use database)
const userRegistrations = new Map<string, number>(); // phoneNumber -> chatId

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, chatId } = await request.json();

    if (!phoneNumber || !chatId) {
      return NextResponse.json({
        success: false,
        message: 'Phone number and chat ID are required'
      }, { status: 400 });
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    // Store the registration
    userRegistrations.set(formattedPhone, chatId);

    console.log(`User registered: ${formattedPhone} -> ${chatId}`);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      phoneNumber: formattedPhone,
      chatId
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    if (!phoneNumber) {
      return NextResponse.json({
        success: false,
        message: 'Phone number is required'
      }, { status: 400 });
    }

    const chatId = userRegistrations.get(phoneNumber);

    if (!chatId) {
      return NextResponse.json({
        success: false,
        message: 'Phone number not registered'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      phoneNumber,
      chatId,
      registered: true
    });

  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Export the registrations for use in the telegram API
export { userRegistrations };

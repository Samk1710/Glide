#!/bin/bash

# Glide Telegram OTP Setup Script
echo "🚀 Setting up Glide Telegram OTP Integration"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.template .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and add your TELEGRAM_BOT_TOKEN"
    echo ""
    echo "To get a bot token:"
    echo "1. Open Telegram and search for @BotFather"
    echo "2. Send /newbot command"
    echo "3. Follow instructions to create your bot"
    echo "4. Copy the token and paste it in .env.local"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🤖 Quick Telegram Bot Test:"
echo ""
echo "1. Edit .env.local and add your TELEGRAM_BOT_TOKEN"
echo "2. Start your bot on Telegram:"
echo "   - Search for your bot by username"
echo "   - Send /start command"
echo "   - Send your phone number (e.g., +918583089117)"
echo "3. Run: npm run dev"
echo "4. Go to: http://localhost:3000/onboarding"
echo "5. Test the Telegram OTP flow!"
echo ""
echo "📚 For detailed setup instructions, see:"
echo "   docs/TELEGRAM_REAL_SETUP.md"
echo ""
echo "🎉 Setup complete! Happy coding!"

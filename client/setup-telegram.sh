#!/bin/bash

# Glide - Telegram Integration Setup Script
# ==========================================

echo "🚀 Setting up Telegram Integration for Glide..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    touch .env.local
fi

echo -e "${BLUE}📋 Telegram API Setup Instructions:${NC}"
echo ""
echo -e "${GREEN}Step 1: Get Telegram API Credentials${NC}"
echo "  1. Visit: https://my.telegram.org/auth"
echo "  2. Log in with your Telegram account"
echo "  3. Click 'API Development Tools'"
echo "  4. Create a new application:"
echo "     - App title: 'Glide Trading Assistant'"
echo "     - Short name: 'glide-trading'"
echo "     - Platform: 'Web'"
echo "     - Description: 'Crypto trading signal monitoring'"
echo ""

echo -e "${GREEN}Step 2: Copy Your Credentials${NC}"
echo "  After creating the app, you'll get:"
echo "  - API ID (numbers, like: 1234567)"
echo "  - API Hash (letters and numbers, like: abcdef1234567890)"
echo ""

# Get API ID
while true; do
    echo -e "${BLUE}Enter your Telegram API ID:${NC}"
    read -r API_ID
    if [[ "$API_ID" =~ ^[0-9]+$ ]] && [ ${#API_ID} -ge 6 ]; then
        break
    else
        echo -e "${RED}❌ Invalid API ID. It should be a number with at least 6 digits.${NC}"
    fi
done

# Get API Hash
while true; do
    echo -e "${BLUE}Enter your Telegram API Hash:${NC}"
    read -r API_HASH
    if [ ${#API_HASH} -eq 32 ]; then
        break
    else
        echo -e "${RED}❌ Invalid API Hash. It should be exactly 32 characters long.${NC}"
    fi
done

# Optional Bot Token
echo -e "${BLUE}Enter your Telegram Bot Token (optional, press Enter to skip):${NC}"
echo "  Get from @BotFather if you want additional bot features"
read -r BOT_TOKEN

# Update .env.local
echo ""
echo -e "${YELLOW}📝 Updating .env.local file...${NC}"

# Remove existing Telegram entries
sed -i '/NEXT_PUBLIC_TELEGRAM_API_ID/d' .env.local
sed -i '/NEXT_PUBLIC_TELEGRAM_API_HASH/d' .env.local
sed -i '/TELEGRAM_BOT_TOKEN/d' .env.local

# Add new entries
echo "" >> .env.local
echo "# Telegram API Configuration" >> .env.local
echo "NEXT_PUBLIC_TELEGRAM_API_ID=$API_ID" >> .env.local
echo "NEXT_PUBLIC_TELEGRAM_API_HASH=$API_HASH" >> .env.local

if [ ! -z "$BOT_TOKEN" ]; then
    echo "TELEGRAM_BOT_TOKEN=$BOT_TOKEN" >> .env.local
fi

echo ""
echo -e "${GREEN}✅ Telegram API configuration completed!${NC}"
echo ""
echo -e "${BLUE}🧪 Testing the configuration...${NC}"

# Start dev server to test
echo "Starting development server..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test the API endpoint
echo "Testing Telegram API endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/telegram)

if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "405" ]; then
    echo -e "${GREEN}✅ Telegram API endpoint is working!${NC}"
else
    echo -e "${RED}❌ API endpoint test failed (HTTP $RESPONSE)${NC}"
fi

# Stop the test server
kill $SERVER_PID 2>/dev/null

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📱 How to use:${NC}"
echo "  1. Run: npm run dev"
echo "  2. Go to: http://localhost:3000/onboarding"
echo "  3. Navigate to the Telegram step"
echo "  4. Enter your phone number with country code (+1234567890)"
echo "  5. Check Telegram for the verification code"
echo "  6. Select chat rooms to monitor"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  - Your API credentials are stored securely in .env.local"
echo "  - Never share or commit your API credentials"
echo "  - The app can only read messages from selected chat rooms"
echo "  - All authentication is handled securely"
echo ""
echo -e "${GREEN}Happy Trading! 📈${NC}"

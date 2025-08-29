#!/bin/bash

echo "🔧 TESTING FIXED TELEGRAM API 🔧"
echo "================================"
echo ""

# Test 1: Send OTP
echo "📱 Testing send-otp action..."
RESPONSE1=$(curl -s -X POST http://localhost:3000/api/telegram \
  -H "Content-Type: application/json" \
  -d '{"action": "send-otp", "phoneNumber": "+918583089117"}')

echo "Response:"
echo "$RESPONSE1" | jq . 2>/dev/null || echo "$RESPONSE1"
echo ""

# Extract phoneCodeHash and OTP code from response
PHONE_CODE_HASH=$(echo "$RESPONSE1" | jq -r '.phoneCodeHash' 2>/dev/null)
OTP_CODE=$(echo "$RESPONSE1" | grep -o '[0-9]\{6\}' | head -1 || echo "123456")

echo "📝 Extracted:"
echo "  phoneCodeHash: $PHONE_CODE_HASH"
echo "  OTP Code: $OTP_CODE"
echo ""

# Test 2: Verify OTP (using otpCode parameter like frontend)
echo "🔐 Testing verify-otp action..."
RESPONSE2=$(curl -s -X POST http://localhost:3000/api/telegram \
  -H "Content-Type: application/json" \
  -d "{\"action\": \"verify-otp\", \"phoneNumber\": \"+918583089117\", \"otpCode\": \"$OTP_CODE\", \"phoneCodeHash\": \"$PHONE_CODE_HASH\"}")

echo "Response:"
echo "$RESPONSE2" | jq . 2>/dev/null || echo "$RESPONSE2"
echo ""

# Test 3: Get Chat Rooms
echo "💬 Testing get-chats action..."
RESPONSE3=$(curl -s -X POST http://localhost:3000/api/telegram \
  -H "Content-Type: application/json" \
  -d '{"action": "get-chats", "session": "test_session"}')

echo "Response:"
echo "$RESPONSE3" | jq . 2>/dev/null || echo "$RESPONSE3"
echo ""

echo "✅ API TESTING COMPLETE!"
echo ""
echo "🌐 You can now test in browser:"
echo "  http://localhost:3000/test-otp.html"
echo "  http://localhost:3000/onboarding"

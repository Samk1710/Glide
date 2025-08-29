# Telegram API Configuration Instructions
# =============================================

# Step 1: Get Telegram API Credentials
# Visit: https://my.telegram.org/auth
# 1. Log in with your Telegram account
# 2. Click "API Development Tools" 
# 3. Create new application:
#    - App title: "Glide Trading Assistant"
#    - Short name: "glide-trading"
#    - Platform: "Web"
#    - Description: "Crypto trading signal monitoring application"

# Replace these with your actual API credentials:
NEXT_PUBLIC_TELEGRAM_API_ID=1234567
NEXT_PUBLIC_TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890

# Optional: For bot features (get from @BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCDEF1234567890abcdef1234567890

# =============================================
# PRODUCTION NOTES:
# - API_ID and API_HASH are required for user authentication
# - These allow the app to authenticate users with phone/OTP
# - Bot token is optional for additional features
# - Keep these credentials secure and never commit to public repos
# =============================================

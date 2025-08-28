// Telegram Bot Setup Script
// This is a Node.js script to help you set up your Telegram bot

const TelegramBot = require('node-telegram-bot-api');

// Replace with your bot token from @BotFather
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';

// In-memory storage (in production, use a database)
const userRegistrations = new Map();

// Create bot instance
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log('Glide Telegram Bot is starting...');

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';
  
  bot.sendMessage(chatId, 
    `👋 Hello ${firstName}! Welcome to Glide Bot.\n\n` +
    `To verify your phone number for Glide, please send your phone number in international format.\n\n` +
    `Example: +1234567890\n\n` +
    `Or use the button below to share your contact:`,
    {
      reply_markup: {
        keyboard: [
          [{
            text: '📱 Share Contact',
            request_contact: true
          }]
        ],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    }
  );
});

// Handle contact sharing
bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const phoneNumber = msg.contact.phone_number;
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  
  // Store the mapping
  userRegistrations.set(formattedPhone, chatId);
  
  console.log(`Registered: ${formattedPhone} -> ${chatId}`);
  
  bot.sendMessage(chatId, 
    `✅ Thank you! Your phone number ${formattedPhone} has been registered.\n\n` +
    `You can now use this phone number for OTP verification on Glide.\n\n` +
    `You will receive verification codes in this chat when needed.`,
    {
      reply_markup: {
        remove_keyboard: true
      }
    }
  );
});

// Handle text messages (phone numbers)
bot.on('message', (msg) => {
  // Skip if it's a contact or command
  if (msg.contact || (msg.text && msg.text.startsWith('/'))) {
    return;
  }
  
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Check if it looks like a phone number
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (phoneRegex.test(text)) {
    const formattedPhone = text.startsWith('+') ? text : `+${text}`;
    
    // Store the mapping
    userRegistrations.set(formattedPhone, chatId);
    
    console.log(`Registered: ${formattedPhone} -> ${chatId}`);
    
    bot.sendMessage(chatId, 
      `✅ Thank you! Your phone number ${formattedPhone} has been registered.\n\n` +
      `You can now use this phone number for OTP verification on Glide.\n\n` +
      `You will receive verification codes in this chat when needed.`
    );
  } else {
    bot.sendMessage(chatId, 
      `Please send a valid phone number in international format (e.g., +1234567890) or use the "Share Contact" button.`
    );
  }
});

// Handle /list command (for debugging)
bot.onText(/\/list/, (msg) => {
  const chatId = msg.chat.id;
  
  if (userRegistrations.size === 0) {
    bot.sendMessage(chatId, 'No registered users yet.');
    return;
  }
  
  let list = 'Registered users:\n\n';
  for (const [phone, id] of userRegistrations.entries()) {
    list += `${phone} -> ${id}\n`;
  }
  
  bot.sendMessage(chatId, list);
});

// Handle errors
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

// API endpoint to get chat ID by phone number
function getChatIdByPhone(phoneNumber) {
  return userRegistrations.get(phoneNumber);
}

// Export for use in your Next.js API
module.exports = {
  getChatIdByPhone,
  userRegistrations
};

console.log('Bot is ready! Users can now send /start to register their phone numbers.');

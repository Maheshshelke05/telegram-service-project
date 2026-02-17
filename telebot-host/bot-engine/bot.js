const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error('No TELEGRAM_TOKEN provided');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bot is running successfully');
});

bot.on('message', (msg) => {
  // simple echo for debugging
  if (msg.text && msg.text !== '/start') {
    bot.sendMessage(msg.chat.id, `You said: ${msg.text}`);
  }
});

console.log('Bot started');

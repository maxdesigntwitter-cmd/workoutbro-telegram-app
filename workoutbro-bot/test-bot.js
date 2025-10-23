const { Telegraf } = require('telegraf');
require('dotenv').config();

console.log('Bot token:', process.env.BOT_TOKEN ? 'Present' : 'Missing');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  console.log('Start command received from user:', ctx.from.id);
  ctx.reply('Привет! Бот работает!');
});

bot.on('text', (ctx) => {
  console.log('Text message received:', ctx.message.text);
  ctx.reply('Получил ваше сообщение: ' + ctx.message.text);
});

console.log('Starting bot...');
bot.launch()
  .then(() => {
    console.log('✅ Bot started successfully!');
  })
  .catch((error) => {
    console.error('❌ Bot failed to start:', error);
  });

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


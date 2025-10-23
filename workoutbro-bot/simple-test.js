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
  ctx.reply('Получил: ' + ctx.message.text);
});

console.log('Starting simple test bot...');
bot.launch()
  .then(() => {
    console.log('✅ Simple test bot started!');
  })
  .catch((error) => {
    console.error('❌ Bot failed to start:', error);
  });


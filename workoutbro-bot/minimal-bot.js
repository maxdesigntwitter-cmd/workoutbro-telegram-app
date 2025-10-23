const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  console.log('Start command received from user:', ctx.from.id);
  ctx.reply('Привет! Бот работает!');
});

bot.on('text', (ctx) => {
  console.log('Text message received:', ctx.message.text);
  ctx.reply('Получил: ' + ctx.message.text);
});

console.log('Starting minimal bot...');
bot.launch()
  .then(() => {
    console.log('✅ Minimal bot started!');
  })
  .catch((error) => {
    console.error('❌ Bot failed:', error);
  });


const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

async function testAdminNotification() {
  const adminId = 285485174;
  const testUserId = 285485174; // Используем ваш ID для теста
  
  const applicationMessage = `📝 **Тестовая заявка PRO MODE**\n\n👤 **Пользователь:** @testuser (ID: ${testUserId})\n\n📋 **Данные заявки:**\n\n1️⃣ **Фитнес уровень:** Новичок (менее 6 месяцев)\n2️⃣ **Частота тренировок:** 3-4 раза в неделю\n3️⃣ **Цели:** Набор массы\n4️⃣ **Опыт:** Зал с тренером\n5️⃣ **Особенности:** Нет ограничений\n\n💬 **Связаться с пользователем:** [Написать](tg://user?id=${testUserId})`;
  
  try {
    const result = await bot.telegram.sendMessage(adminId, applicationMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💬 Написать пользователю', url: `tg://user?id=${testUserId}` }],
          [{ text: '✅ Одобрить заявку', callback_data: `approve_${testUserId}` }],
          [{ text: '❌ Отклонить заявку', callback_data: `reject_${testUserId}` }]
        ]
      }
    });
    console.log('✅ Тестовая заявка отправлена админу! Message ID:', result.message_id);
  } catch (error) {
    console.log('❌ Ошибка отправки:', error.message);
  }
}

testAdminNotification();

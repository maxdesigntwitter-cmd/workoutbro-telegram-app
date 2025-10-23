const { Telegraf } = require('telegraf');
require('dotenv').config();

// Отдельный бот для уведомлений админу
const adminBot = new Telegraf(process.env.BOT_TOKEN);

// Функция отправки заявки админу
async function sendApplicationToAdmin(userId, username, answers) {
  const adminId = 285485174; // Ваш Telegram ID
  const applicationMessage = `📝 **Новая заявка PRO MODE**\n\n👤 **Пользователь:** @${username} (ID: ${userId})\n\n📋 **Данные заявки:**\n\n1️⃣ **Фитнес уровень:** ${answers.question_1}\n2️⃣ **Частота тренировок:** ${answers.question_2}\n3️⃣ **Цели:** ${answers.question_3}\n4️⃣ **Опыт:** ${answers.question_4}\n5️⃣ **Особенности:** ${answers.question_5}\n\n💬 **Связаться с пользователем:** [Написать](tg://user?id=${userId})`;
  
  try {
    const result = await adminBot.telegram.sendMessage(adminId, applicationMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '💬 Написать пользователю', url: `tg://user?id=${userId}` }],
          [{ text: '✅ Одобрить заявку', callback_data: `approve_${userId}` }],
          [{ text: '❌ Отклонить заявку', callback_data: `reject_${userId}` }]
        ]
      }
    });
    console.log(`✅ Admin notification sent for user ${userId}, message ID: ${result.message_id}`);
    return true;
  } catch (error) {
    console.log(`❌ Error sending admin notification for user ${userId}:`, error.message);
    return false;
  }
}

// Экспортируем функцию
module.exports = { sendApplicationToAdmin };


// Функция отправки заявки админу через HTTP
async function sendApplicationToAdmin(userId, username, answers) {
  const adminId = 285485174; // Ваш ID как админа
  const botToken = '8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik';
  
  console.log(`Sending application to admin ID: ${adminId}`);
  console.log(`From user ID: ${userId}`);
  
  const applicationMessage = `📝 **Новая заявка PRO MODE**\n\n👤 **Пользователь:** @${username} (ID: ${userId})\n\n📋 **Данные заявки:**\n\n1️⃣ **Фитнес уровень:** ${answers.question_1}\n2️⃣ **Частота тренировок:** ${answers.question_2}\n3️⃣ **Цели:** ${answers.question_3}\n4️⃣ **Опыт:** ${answers.question_4}\n5️⃣ **Особенности:** ${answers.question_5}\n\n💬 **Связаться с пользователем:** [Написать](tg://user?id=${userId})`;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '💬 Написать пользователю', url: `tg://user?id=${userId}` }],
      [{ text: '✅ Одобрить заявку', callback_data: `approve_${userId}` }],
      [{ text: '❌ Отклонить заявку', callback_data: `reject_${userId}` }]
    ]
  };
  
  const payload = {
    chat_id: adminId, // Отправляем админу
    text: applicationMessage,
    parse_mode: 'Markdown',
    reply_markup: keyboard
  };
  
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log(`✅ Admin notification sent for user ${userId}, message ID: ${result.result.message_id}`);
      return true;
    } else {
      console.log(`❌ Error sending admin notification: ${result.description}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error sending admin notification: ${error.message}`);
    return false;
  }
}

module.exports = { sendApplicationToAdmin };

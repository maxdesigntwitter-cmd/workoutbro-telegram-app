require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Тексты
const TEXTS = {
  WELCOME: 'Привет! Я WorkoutBro Bot. Выбери свой путь:',
  FREE_COMMUNITY: '💪 **Бесплатное сообщество**\n\nЭто открытый канал WorkoutBro: мини-гайды, разборы и вызовы.\n\nХочешь систему и поддержку — загляни в клуб!',
  CLUB_LEVELS: '🏆 **Закрытый клуб**\n\nВыберите уровень доступа:',
  BASE_DESCRIPTION: '💪 **BASE MODE**\n\n• Доступ к материалам и постам\n• Без комментариев\n• Базовая поддержка\n\n💰 **Цена:** 990₽/месяц',
  BRO_DESCRIPTION: '🔥 **BRO MODE**\n\n• Все из BASE\n• Комментарии и чат\n• Расширенная поддержка\n\n💰 **Цена:** 1990₽/месяц',
  PRO_DESCRIPTION: '👑 **PRO MODE**\n\n• Индивидуальная программа\n• Персональное ведение тренером\n• Максимальная поддержка\n\n💰 **Цена:** По заявке'
};

// Клавиатуры
const KEYBOARDS = {
  MAIN_MENU: {
    inline_keyboard: [
      [{ text: '💪 Бесплатное\nсообщество', callback_data: 'free_community' }],
      [{ text: '🏆 Закрытый клуб', callback_data: 'paid_club' }]
    ]
  },
  FREE_COMMUNITY: {
    inline_keyboard: [
      [{ text: '👉 Перейти в канал', url: 'https://t.me/yourworkoutbro' }],
      [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
    ]
  },
  CLUB_LEVELS: {
    inline_keyboard: [
      [{ text: '💪 BASE', callback_data: 'level_base' }],
      [{ text: '🔥 BRO', callback_data: 'level_bro' }],
      [{ text: '👑 PRO', callback_data: 'level_pro' }],
      [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
    ]
  },
  BASE_PAYMENT: {
    inline_keyboard: [
      [{ text: '💳 Оплатить', url: 'https://t.me/tribute/app?startapp=sEo4' }],
      [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
    ]
  },
  BRO_PAYMENT: {
    inline_keyboard: [
      [{ text: '💳 Оплатить', url: 'https://t.me/tribute/app?startapp=sEoi' }],
      [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
    ]
  },
  PRO_APPLICATION: {
    inline_keyboard: [
      [{ text: '📝 Оставить заявку', callback_data: 'pro_application' }],
      [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
    ]
  },
  PRO_QUESTIONS: {
    inline_keyboard: [
      [{ text: '🏋️ Новичок (менее 6 месяцев)', callback_data: 'pro_q1_novice' }],
      [{ text: '💪 Средний (6 месяцев – 2 года)', callback_data: 'pro_q1_intermediate' }],
      [{ text: '🔥 Продвинутый (более 2 лет)', callback_data: 'pro_q1_advanced' }],
      [{ text: '✏️ Свой ответ', callback_data: 'pro_q1_custom' }],
      [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
    ]
  }
};

// Функция отправки заявки админу
async function sendProApplicationToAdmin(userId, username, answers) {
  const adminId = 285485174;
  const botToken = '8209346537:AAGKLa-x1zZR0Htp-DlOVjVvUx0L81b8aik';
  
  const applicationMessage = `📝 **Новая заявка PRO MODE**\n\n👤 **Пользователь:** @${username} (ID: ${userId})\n\n📋 **Данные заявки:**\n\n1️⃣ **Фитнес уровень:** ${answers.level}\n2️⃣ **Частота тренировок:** ${answers.frequency}\n3️⃣ **Цели:** ${answers.goals}\n4️⃣ **Опыт:** ${answers.experience}\n5️⃣ **Особенности:** ${answers.special}\n\n💬 **Связаться с пользователем:** [Написать](tg://user?id=${userId})`;
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '💬 Написать пользователю', url: `tg://user?id=${userId}` }],
      [{ text: '✅ Одобрить заявку', callback_data: `approve_${userId}` }],
      [{ text: '❌ Отклонить заявку', callback_data: `reject_${userId}` }]
    ]
  };
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: adminId,
        text: applicationMessage,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      })
    });
    
    const result = await response.json();
    
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

// Команда /start
bot.start(async (ctx) => {
  console.log(`User ${ctx.from.id} started bot`);
  try {
    await ctx.reply(TEXTS.WELCOME, {
      reply_markup: KEYBOARDS.MAIN_MENU,
      parse_mode: 'Markdown'
    });
    console.log(`Reply sent to user ${ctx.from.id}`);
  } catch (error) {
    console.log(`Error sending reply to user ${ctx.from.id}:`, error.message);
  }
});

// Команда /pro_application
bot.command('pro_application', (ctx) => {
  console.log(`User ${ctx.from.id} requested PRO application`);
  ctx.reply('📝 **Заявка на PRO MODE**\n\n**Вопрос 1/5:**\n\n🏋️ **Какой у вас фитнес уровень?**', {
    reply_markup: KEYBOARDS.PRO_QUESTIONS,
    parse_mode: 'Markdown'
  });
});

// Обработчик callback_query
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.from.id;
  const username = ctx.from.username || 'без username';
  
  console.log(`Callback received: ${data} from user ${userId}`);
  
  await ctx.answerCbQuery();
  
  try {
    switch (data) {
      case 'free_community':
        await ctx.editMessageText(TEXTS.FREE_COMMUNITY, {
          reply_markup: KEYBOARDS.FREE_COMMUNITY,
          parse_mode: 'Markdown'
        });
        break;
        
      case 'paid_club':
        await ctx.editMessageText(TEXTS.CLUB_LEVELS, {
          reply_markup: KEYBOARDS.CLUB_LEVELS,
          parse_mode: 'Markdown'
        });
        break;
        
      case 'level_base':
        await ctx.editMessageText(TEXTS.BASE_DESCRIPTION, {
          reply_markup: KEYBOARDS.BASE_PAYMENT,
          parse_mode: 'Markdown'
        });
        break;
        
      case 'level_bro':
        await ctx.editMessageText(TEXTS.BRO_DESCRIPTION, {
          reply_markup: KEYBOARDS.BRO_PAYMENT,
          parse_mode: 'Markdown'
        });
        break;
        
      case 'level_pro':
        await ctx.editMessageText(TEXTS.PRO_DESCRIPTION, {
          reply_markup: KEYBOARDS.PRO_APPLICATION,
          parse_mode: 'Markdown'
        });
        break;
        
      case 'pro_application':
        await ctx.editMessageText('📝 **Заявка на PRO MODE**\n\n**Вопрос 1/5:**\n\n🏋️ **Какой у вас фитнес уровень?**', {
          reply_markup: KEYBOARDS.PRO_QUESTIONS,
          parse_mode: 'Markdown'
        });
        break;
        
      // Обработка ответов на вопросы PRO заявки
      case 'pro_q1_novice':
        await handleProAnswer(ctx, 1, 'Новичок (менее 6 месяцев)');
        break;
        
      case 'pro_q1_intermediate':
        await handleProAnswer(ctx, 1, 'Средний (6 месяцев – 2 года)');
        break;
        
      case 'pro_q1_advanced':
        await handleProAnswer(ctx, 1, 'Продвинутый (более 2 лет)');
        break;
        
      case 'pro_q1_custom':
        await ctx.editMessageText('✏️ **Свой ответ на вопрос 1/5:**\n\n🏋️ **Какой у вас фитнес уровень?**\n\nНапишите ваш ответ в чат:', {
          reply_markup: {
            inline_keyboard: [
              [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
            ]
          },
          parse_mode: 'Markdown'
        });
        break;
        
      case 'back_to_main':
        await ctx.editMessageText(TEXTS.WELCOME, {
          reply_markup: KEYBOARDS.MAIN_MENU,
          parse_mode: 'Markdown'
        });
        break;
        
      // Обработка админских действий
      case data.startsWith('approve_') ? data : null:
        const approveUserId = data.split('_')[1];
        await ctx.editMessageText(`✅ **Заявка одобрена!**\n\nПользователь ${approveUserId} получил доступ к PRO MODE.`);
        break;
        
      case data.startsWith('reject_') ? data : null:
        const rejectUserId = data.split('_')[1];
        await ctx.editMessageText(`❌ **Заявка отклонена**\n\nПользователь ${rejectUserId} получил уведомление об отклонении.`);
        break;
    }
  } catch (error) {
    console.log(`Error handling callback ${data}:`, error.message);
  }
});

// Функция обработки ответов PRO заявки
async function handleProAnswer(ctx, step, answer) {
  const userId = ctx.from.id;
  const username = ctx.from.username || 'без username';
  
  console.log(`Processing step ${step} for user ${userId}, answer: ${answer}`);
  
  // Создаем простую заявку с одним ответом
  const application = {
    level: answer,
    frequency: 'Не указано',
    goals: 'Не указано',
    experience: 'Не указано',
    special: 'Не указано'
  };
  
  // Отправляем заявку админу
  const success = await sendProApplicationToAdmin(userId, username, application);
  
  if (success) {
    await ctx.editMessageText(
      '✅ **Заявка на PRO MODE отправлена!**\n\nСпасибо за заявку! Мы рассмотрим её и свяжемся с вами в ближайшее время.\n\n📞 **Связь:** @workoutbro_support',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
  } else {
    await ctx.editMessageText(
      '❌ **Ошибка отправки заявки**\n\nПопробуйте позже или свяжитесь с поддержкой.\n\n📞 **Связь:** @workoutbro_support',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
  }
}

// Обработчик текстовых сообщений для пользовательских ответов
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  console.log(`Text message from user ${userId}: ${text}`);
  
  // Простая заявка с пользовательским ответом
  const username = ctx.from.username || 'без username';
  const application = {
    level: text,
    frequency: 'Не указано',
    goals: 'Не указано',
    experience: 'Не указано',
    special: 'Не указано'
  };
  
  // Отправляем заявку админу
  const success = await sendProApplicationToAdmin(userId, username, application);
  
  if (success) {
    await ctx.reply(
      '✅ **Заявка на PRO MODE отправлена!**\n\nСпасибо за заявку! Мы рассмотрим её и свяжемся с вами в ближайшее время.\n\n📞 **Связь:** @workoutbro_support',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
  } else {
    await ctx.reply(
      '❌ **Ошибка отправки заявки**\n\nПопробуйте позже или свяжитесь с поддержкой.\n\n📞 **Связь:** @workoutbro_support',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
  }
});

console.log('Starting simple PRO bot...');
bot.launch()
  .then(() => {
    console.log('✅ Simple PRO bot started!');
  })
  .catch((error) => {
    console.error('❌ Bot failed:', error);
    process.exit(1);
  });

// Обработка завершения процесса
process.on('SIGINT', () => {
  console.log('Bot stopped');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});


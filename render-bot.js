require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Middleware для парсинга JSON
app.use(express.json());

// Тексты
const TEXTS = {
  WELCOME: '🏋️‍♂️ <b>Привет! Я WorkoutBro Bot</b>\n\nЯ твой персональный помощник в мире фитнеса! 💪\n\n🎯 <b>Что я умею:</b>\n• Помогаю выбрать подходящий уровень тренировок\n• Предоставляю доступ к эксклюзивным программам\n• Связываю с профессиональными тренерами\n• Создаю персональные планы тренировок\n\n🚀 <b>Выбери свой путь к идеальному телу:</b>',
  FREE_COMMUNITY: '💪 <b>Бесплатное сообщество</b>\n\n🎉 <b>Добро пожаловать в открытое сообщество WorkoutBro!</b>\n\n📚 <b>Что тебя ждет:</b>\n• Мини-гайды по тренировкам\n• Разборы упражнений\n• Мотивационные вызовы\n• Советы по питанию\n• Общение с единомышленниками\n\n🔥 <b>Хочешь больше?</b>\nПереходи в закрытый клуб за персональными программами и поддержкой тренеров!',
  CLUB_LEVELS: '🏆 <b>Закрытый клуб WorkoutBro</b>\n\n🎯 <b>Твой путь к идеальному телу начинается здесь!</b>\n\n💎 <b>Что получаешь в клубе:</b>\n• Расширенные программы тренировок\n• Прямое общение с тренерами\n• Эксклюзивные материалы\n• Поддержка 24/7\n• Мотивирующее сообщество\n\n🚀 <b>Выбери свой уровень:</b>',
  BASE_DESCRIPTION: '💪 <b>BASE MODE</b>\n\n🎯 <b>Идеально для начинающих</b>\n\n✅ <b>Что включено:</b>\n• Доступ к базовым программам тренировок\n• Материалы по питанию\n• Видео-разборы упражнений\n• Еженедельные чек-листы\n• Базовая поддержка в чате\n\n💰 <b>Цена:</b> 990₽/месяц\n\n🔥 <b>Начни свой путь к здоровому образу жизни!</b>',
  BRO_DESCRIPTION: '🔥 <b>BRO MODE</b>\n\n💪 <b>Для тех, кто готов к серьезным результатам</b>\n\n✅ <b>Все из BASE + дополнительно:</b>\n• Расширенные программы тренировок\n• Прямое общение с тренерами\n• Групповые чаты и обсуждения\n• Персональные рекомендации\n• Приоритетная поддержка\n• Эксклюзивные материалы\n\n💰 <b>Цена:</b> 1990₽/месяц\n\n🚀 <b>Достигай целей вместе с нами!</b>',
  PRO_DESCRIPTION: '👑 <b>PRO MODE</b>\n\n🏆 <b>Максимальный уровень поддержки</b>\n\n✅ <b>Индивидуальный подход:</b>\n• Персональная программа тренировок\n• 1-на-1 общение с тренером\n• Адаптация под твои цели и ограничения\n• Корректировка программы в реальном времени\n• Максимальная поддержка и мотивация\n• Эксклюзивные материалы и советы\n\n💰 <b>Цена:</b> По заявке\n\n🎯 <b>Твой персональный путь к успеху!</b>'
};

// Клавиатуры
const KEYBOARDS = {
  MAIN_MENU: {
    inline_keyboard: [
      [{ text: '💪 Бесплатное сообщество\nГайды и советы', callback_data: 'free_community' }],
      [{ text: '🏆 Закрытый клуб\nПерсональные программы', callback_data: 'paid_club' }]
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
      [{ text: '💪 BASE\nБазовые программы', callback_data: 'level_base' }],
      [{ text: '🔥 BRO\nРасширенные + чат', callback_data: 'level_bro' }],
      [{ text: '👑 PRO\nПерсональный тренер', callback_data: 'level_pro' }],
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
  const adminId = 6517942046;
  const botToken = process.env.BOT_TOKEN;
  
  // Экранируем специальные символы для HTML
  const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };
  
  const applicationMessage = `📝 <b>Новая заявка PRO MODE</b>\n\n👤 <b>Пользователь:</b> @${escapeHtml(username)} (ID: ${userId})\n\n📋 <b>Данные заявки:</b>\n\n1️⃣ <b>Фитнес уровень:</b> ${escapeHtml(answers.question_1)}\n2️⃣ <b>Частота тренировок:</b> ${escapeHtml(answers.question_2)}\n3️⃣ <b>Цели:</b> ${escapeHtml(answers.question_3)}\n4️⃣ <b>Место тренировок:</b> ${escapeHtml(answers.question_4)}\n5️⃣ <b>Особенности:</b> ${escapeHtml(answers.question_5)}\n\n💬 <b>Связаться с пользователем:</b> <a href="tg://user?id=${userId}">Написать</a>`;
  
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
        parse_mode: 'HTML',
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
      parse_mode: 'HTML'
    });
    console.log(`Reply sent to user ${ctx.from.id}`);
  } catch (error) {
    console.log(`Error sending reply to user ${ctx.from.id}:`, error.message);
  }
});

// Команда /pro_application
bot.command('pro_application', async (ctx) => {
  console.log(`User ${ctx.from.id} requested PRO application`);
  try {
    await ctx.reply('📝 **Заявка на PRO MODE**\n\n**Вопрос 1/5:**\n\n🏋️ **Какой у вас фитнес уровень?**', {
      reply_markup: KEYBOARDS.PRO_QUESTIONS,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.log(`Error sending PRO application to user ${ctx.from.id}:`, error.message);
  }
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
          parse_mode: 'HTML'
        });
        break;
        
      case 'paid_club':
        await ctx.editMessageText(TEXTS.CLUB_LEVELS, {
          reply_markup: KEYBOARDS.CLUB_LEVELS,
          parse_mode: 'HTML'
        });
        break;
        
      case 'level_base':
        await ctx.editMessageText(TEXTS.BASE_DESCRIPTION, {
          reply_markup: KEYBOARDS.BASE_PAYMENT,
          parse_mode: 'HTML'
        });
        break;
        
      case 'level_bro':
        await ctx.editMessageText(TEXTS.BRO_DESCRIPTION, {
          reply_markup: KEYBOARDS.BRO_PAYMENT,
          parse_mode: 'HTML'
        });
        break;
        
      case 'level_pro':
        await ctx.editMessageText(TEXTS.PRO_DESCRIPTION, {
          reply_markup: KEYBOARDS.PRO_APPLICATION,
          parse_mode: 'HTML'
        });
        break;
        
      case 'pro_application':
        await ctx.editMessageText('📝 **Заявка на PRO MODE**\n\n**Вопрос 1/5:**\n\n🏋️ **Какой у вас фитнес уровень?**', {
          reply_markup: KEYBOARDS.PRO_QUESTIONS,
          parse_mode: 'HTML'
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
        try {
          // Устанавливаем флаг ожидания пользовательского ответа
          let userState = userStates.get(userId);
          if (!userState) {
            userState = { step: 1, answers: {} };
            userStates.set(userId, userState);
          }
          userState.waitingForCustomAnswer = 1;
          console.log(`User ${userId} selected custom answer for question 1. UserState:`, userState);
          
          await ctx.editMessageText('✏️ <b>Свой ответ на вопрос 1/5:</b>\n\n🏋️ <b>Какой у вас фитнес уровень?</b>\n\nНапишите ваш ответ в чат:', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
              ]
            },
            parse_mode: 'HTML'
          });
        } catch (error) {
          console.log(`Error handling pro_q1_custom for user ${userId}:`, error.message);
        }
        break;
        
      // Вопрос 2 - частота тренировок
      case 'pro_q2_1_2':
        await handleProAnswer(ctx, 2, '1-2 раза в неделю');
        break;
      case 'pro_q2_3_4':
        await handleProAnswer(ctx, 2, '3-4 раза в неделю');
        break;
      case 'pro_q2_5_6':
        await handleProAnswer(ctx, 2, '5-6 раз в неделю');
        break;
      case 'pro_q2_daily':
        await handleProAnswer(ctx, 2, 'Ежедневно');
        break;
      case 'pro_q2_custom':
        try {
          userState = userStates.get(userId);
          if (!userState) {
            userState = { step: 2, answers: {} };
            userStates.set(userId, userState);
          }
          userState.waitingForCustomAnswer = 2;
          console.log(`User ${userId} selected custom answer for question 2. UserState:`, userState);
          
          await ctx.editMessageText('✏️ <b>Свой ответ на вопрос 2/5:</b>\n\n📅 <b>Как часто вы тренируетесь?</b>\n\nНапишите ваш ответ в чат:', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
              ]
            },
            parse_mode: 'HTML'
          });
        } catch (error) {
          console.log(`Error handling pro_q2_custom for user ${userId}:`, error.message);
        }
        break;
        
      // Вопрос 3 - цели
      case 'pro_q3_mass':
        await handleProAnswer(ctx, 3, 'Набор массы');
        break;
      case 'pro_q3_weight_loss':
        await handleProAnswer(ctx, 3, 'Похудение');
        break;
      case 'pro_q3_strength':
        await handleProAnswer(ctx, 3, 'Сила');
        break;
      case 'pro_q3_endurance':
        await handleProAnswer(ctx, 3, 'Выносливость');
        break;
      case 'pro_q3_custom':
        try {
          userState = userStates.get(userId);
          if (!userState) {
            userState = { step: 3, answers: {} };
            userStates.set(userId, userState);
          }
          userState.waitingForCustomAnswer = 3;
          console.log(`User ${userId} selected custom answer for question 3. UserState:`, userState);
          
          await ctx.editMessageText('✏️ <b>Свой ответ на вопрос 3/5:</b>\n\n🎯 <b>Какие у вас цели?</b>\n\nНапишите ваш ответ в чат:', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
              ]
            },
            parse_mode: 'HTML'
          });
        } catch (error) {
          console.log(`Error handling pro_q3_custom for user ${userId}:`, error.message);
        }
        break;
        
      // Вопрос 4 - место тренировок
      case 'pro_q4_home':
        await handleProAnswer(ctx, 4, 'Дома');
        break;
      case 'pro_q4_gym':
        await handleProAnswer(ctx, 4, 'В зале');
        break;
      case 'pro_q4_trainer':
        await handleProAnswer(ctx, 4, 'С тренером');
        break;
      case 'pro_q4_outdoor':
        await handleProAnswer(ctx, 4, 'На улице');
        break;
      case 'pro_q4_custom':
        try {
          userState = userStates.get(userId);
          if (!userState) {
            userState = { step: 4, answers: {} };
            userStates.set(userId, userState);
          }
          userState.waitingForCustomAnswer = 4;
          console.log(`User ${userId} selected custom answer for question 4. UserState:`, userState);
          
          await ctx.editMessageText('✏️ <b>Свой ответ на вопрос 4/5:</b>\n\n🏋️ <b>Где вы тренируетесь?</b>\n\nНапишите ваш ответ в чат:', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
              ]
            },
            parse_mode: 'HTML'
          });
        } catch (error) {
          console.log(`Error handling pro_q4_custom for user ${userId}:`, error.message);
        }
        break;
        
      // Вопрос 5 - ограничения
      case 'pro_q5_none':
        await handleProAnswer(ctx, 5, 'Нет ограничений');
        break;
      case 'pro_q5_injuries':
        await handleProAnswer(ctx, 5, 'Есть травмы');
        break;
      case 'pro_q5_time':
        await handleProAnswer(ctx, 5, 'Ограниченное время');
        break;
      case 'pro_q5_home_only':
        await handleProAnswer(ctx, 5, 'Только дома');
        break;
      case 'pro_q5_custom':
        try {
          userState = userStates.get(userId);
          if (!userState) {
            userState = { step: 5, answers: {} };
            userStates.set(userId, userState);
          }
          userState.waitingForCustomAnswer = 5;
          console.log(`User ${userId} selected custom answer for question 5. UserState:`, userState);
          
          await ctx.editMessageText('✏️ <b>Свой ответ на вопрос 5/5:</b>\n\n⚠️ <b>Есть ли ограничения или особенности?</b>\n\nНапишите ваш ответ в чат:', {
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
              ]
            },
            parse_mode: 'HTML'
          });
        } catch (error) {
          console.log(`Error handling pro_q5_custom for user ${userId}:`, error.message);
        }
        break;
        
      case 'back_to_main':
        await ctx.editMessageText(TEXTS.WELCOME, {
          reply_markup: KEYBOARDS.MAIN_MENU,
          parse_mode: 'HTML'
        });
        break;
        
      // Обработка админских действий
      case data.startsWith('approve_') ? data : null:
        const approveUserId = data.split('_')[1];
        await ctx.editMessageText(`✅ **Заявка одобрена!**\n\nПользователь ${approveUserId} получил доступ к PRO MODE.`);
        
        // Отправляем уведомление пользователю
        try {
          await bot.telegram.sendMessage(approveUserId, 
            '🎉 <b>Поздравляем! Ваша заявка на PRO MODE одобрена!</b>\n\n' +
            '✅ Вы получили доступ к персональной программе и коучингу.\n\n' +
            '📞 <b>Связь с тренером:</b> @workoutbro_support\n\n' +
            '🏠 <b>Главное меню:</b> /start',
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
                ]
              }
            }
          );
          console.log(`✅ Approval notification sent to user ${approveUserId}`);
        } catch (error) {
          console.log(`❌ Error sending approval notification to user ${approveUserId}:`, error.message);
        }
        break;
        
      case data.startsWith('reject_') ? data : null:
        const rejectUserId = data.split('_')[1];
        await ctx.editMessageText(`❌ **Заявка отклонена**\n\nПользователь ${rejectUserId} получил уведомление об отклонении.`);
        
        // Отправляем уведомление пользователю
        try {
          await bot.telegram.sendMessage(rejectUserId, 
            '😔 <b>Ваша заявка на PRO MODE отклонена</b>\n\n' +
            'К сожалению, в данный момент мы не можем предоставить вам доступ к PRO MODE.\n\n' +
            '💡 <b>Рекомендуем:</b>\n' +
            '• Попробовать BASE или BRO уровни\n' +
            '• Подать заявку повторно через некоторое время\n\n' +
            '📞 <b>Вопросы:</b> @workoutbro_support\n\n' +
            '🏠 <b>Главное меню:</b> /start',
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
                ]
              }
            }
          );
          console.log(`✅ Rejection notification sent to user ${rejectUserId}`);
        } catch (error) {
          console.log(`❌ Error sending rejection notification to user ${rejectUserId}:`, error.message);
        }
        break;
    }
  } catch (error) {
    console.log(`Error handling callback ${data}:`, error.message);
  }
});

// Хранилище состояний пользователей для заявок PRO
const userStates = new Map();

// Функция обработки ответов PRO заявки
async function handleProAnswer(ctx, step, answer) {
  const userId = ctx.from.id;
  const username = ctx.from.username || 'без username';
  
  console.log(`Processing step ${step} for user ${userId}, answer: ${answer}`);
  
  // Получаем или создаем состояние пользователя
  let userState = userStates.get(userId);
  if (!userState) {
    userState = {
      step: 1,
      answers: {}
    };
    userStates.set(userId, userState);
    console.log(`Created new user state for user ${userId}`);
  }
  
  // Сохраняем ответ
  userState.answers[`question_${step}`] = answer;
  userState.step = step + 1;
  
  console.log(`Updated user state for user ${userId}:`, userState);
  
  // Если это не последний вопрос, показываем следующий
  if (step < 5) {
    console.log(`Showing next question ${step + 1} for user ${userId}`);
    await showNextQuestion(ctx, step + 1);
  } else {
    console.log(`Completing application for user ${userId}`);
    // Завершаем заявку
    await completeProApplication(ctx, userState.answers);
    userStates.delete(userId);
  }
}

// Функция показа следующего вопроса
async function showNextQuestion(ctx, step) {
  const userId = ctx.from.id;
  const userState = userStates.get(userId);
  
  if (!userState) {
    console.log(`No user state found for user ${userId}`);
    return;
  }
  
  const questions = {
    2: {
      text: `✅ <b>Фитнес уровень:</b> ${userState.answers.question_1}\n\n<b>Вопрос 2/5:</b>\n\n📅 <b>Как часто вы тренируетесь?</b>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '🏃 1-2 раза в неделю', callback_data: 'pro_q2_1_2' }],
          [{ text: '💪 3-4 раза в неделю', callback_data: 'pro_q2_3_4' }],
          [{ text: '🔥 5-6 раз в неделю', callback_data: 'pro_q2_5_6' }],
          [{ text: '📅 Ежедневно', callback_data: 'pro_q2_daily' }],
          [{ text: '✏️ Свой ответ', callback_data: 'pro_q2_custom' }],
          [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
        ]
      }
    },
    3: {
      text: `✅ <b>Фитнес уровень:</b> ${userState.answers.question_1}\n✅ <b>Частота тренировок:</b> ${userState.answers.question_2}\n\n<b>Вопрос 3/5:</b>\n\n🎯 <b>Какие у вас цели?</b>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '💪 Набор массы', callback_data: 'pro_q3_mass' }],
          [{ text: '🔥 Похудение', callback_data: 'pro_q3_weight_loss' }],
          [{ text: '💪 Сила', callback_data: 'pro_q3_strength' }],
          [{ text: '🏃 Выносливость', callback_data: 'pro_q3_endurance' }],
          [{ text: '✏️ Свой ответ', callback_data: 'pro_q3_custom' }],
          [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
        ]
      }
    },
    4: {
      text: `✅ <b>Фитнес уровень:</b> ${userState.answers.question_1}\n✅ <b>Частота тренировок:</b> ${userState.answers.question_2}\n✅ <b>Цели:</b> ${userState.answers.question_3}\n\n<b>Вопрос 4/5:</b>\n\n🏋️ <b>Где вы тренируетесь?</b>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '🏠 Дома', callback_data: 'pro_q4_home' }],
          [{ text: '🏋️ В зале', callback_data: 'pro_q4_gym' }],
          [{ text: '👨‍🏫 С тренером', callback_data: 'pro_q4_trainer' }],
          [{ text: '🌳 На улице', callback_data: 'pro_q4_outdoor' }],
          [{ text: '✏️ Свой ответ', callback_data: 'pro_q4_custom' }],
          [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
        ]
      }
    },
    5: {
      text: `✅ <b>Фитнес уровень:</b> ${userState.answers.question_1}\n✅ <b>Частота тренировок:</b> ${userState.answers.question_2}\n✅ <b>Цели:</b> ${userState.answers.question_3}\n✅ <b>Место тренировок:</b> ${userState.answers.question_4}\n\n<b>Вопрос 5/5:</b>\n\n⚠️ <b>Есть ли ограничения или особенности?</b>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '✅ Нет ограничений', callback_data: 'pro_q5_none' }],
          [{ text: '🩹 Есть травмы', callback_data: 'pro_q5_injuries' }],
          [{ text: '⏰ Ограниченное время', callback_data: 'pro_q5_time' }],
          [{ text: '🏠 Только дома', callback_data: 'pro_q5_home_only' }],
          [{ text: '✏️ Свой ответ', callback_data: 'pro_q5_custom' }],
          [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
        ]
      }
    }
  };
  
  const question = questions[step];
  if (question) {
    await ctx.editMessageText(question.text, {
      reply_markup: question.keyboard,
      parse_mode: 'HTML'
    });
  } else {
    console.log(`No question found for step ${step}`);
  }
}

// Функция показа следующего вопроса для текстовых ответов
async function showNextQuestionForText(ctx, step) {
  const userId = ctx.from.id;
  const userState = userStates.get(userId);
  
  if (!userState) {
    console.log(`No user state found for user ${userId}`);
    return;
  }
  
  const questions = {
    2: {
      text: `✅ <b>Фитнес уровень:</b> ${userState.answers.question_1}\n\n<b>Вопрос 2/5:</b>\n\n📅 <b>Как часто вы тренируетесь?</b>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '🏃 1-2 раза в неделю', callback_data: 'pro_q2_1_2' }],
          [{ text: '💪 3-4 раза в неделю', callback_data: 'pro_q2_3_4' }],
          [{ text: '🔥 5-6 раз в неделю', callback_data: 'pro_q2_5_6' }],
          [{ text: '📅 Ежедневно', callback_data: 'pro_q2_daily' }],
          [{ text: '✏️ Свой ответ', callback_data: 'pro_q2_custom' }],
          [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
        ]
      }
    },
    3: {
      text: `✅ <b>Фитнес уровень:</b> ${userState.answers.question_1}\n✅ <b>Частота тренировок:</b> ${userState.answers.question_2}\n\n<b>Вопрос 3/5:</b>\n\n🎯 <b>Какие у вас цели?</b>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '💪 Набор массы', callback_data: 'pro_q3_mass' }],
          [{ text: '🔥 Похудение', callback_data: 'pro_q3_weight_loss' }],
          [{ text: '💪 Сила', callback_data: 'pro_q3_strength' }],
          [{ text: '🏃 Выносливость', callback_data: 'pro_q3_endurance' }],
          [{ text: '✏️ Свой ответ', callback_data: 'pro_q3_custom' }],
          [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
        ]
      }
    },
    4: {
      text: `✅ <b>Фитнес уровень:</b> ${userState.answers.question_1}\n✅ <b>Частота тренировок:</b> ${userState.answers.question_2}\n✅ <b>Цели:</b> ${userState.answers.question_3}\n\n<b>Вопрос 4/5:</b>\n\n🏋️ <b>Где вы тренируетесь?</b>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '🏠 Дома', callback_data: 'pro_q4_home' }],
          [{ text: '🏋️ В зале', callback_data: 'pro_q4_gym' }],
          [{ text: '👨‍🏫 С тренером', callback_data: 'pro_q4_trainer' }],
          [{ text: '🌳 На улице', callback_data: 'pro_q4_outdoor' }],
          [{ text: '✏️ Свой ответ', callback_data: 'pro_q4_custom' }],
          [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
        ]
      }
    },
    5: {
      text: `✅ <b>Фитнес уровень:</b> ${userState.answers.question_1}\n✅ <b>Частота тренировок:</b> ${userState.answers.question_2}\n✅ <b>Цели:</b> ${userState.answers.question_3}\n✅ <b>Место тренировок:</b> ${userState.answers.question_4}\n\n<b>Вопрос 5/5:</b>\n\n⚠️ <b>Есть ли ограничения или особенности?</b>`,
      keyboard: {
        inline_keyboard: [
          [{ text: '✅ Нет ограничений', callback_data: 'pro_q5_none' }],
          [{ text: '🩹 Есть травмы', callback_data: 'pro_q5_injuries' }],
          [{ text: '⏰ Ограниченное время', callback_data: 'pro_q5_time' }],
          [{ text: '🏠 Только дома', callback_data: 'pro_q5_home_only' }],
          [{ text: '✏️ Свой ответ', callback_data: 'pro_q5_custom' }],
          [{ text: '❌ Отменить', callback_data: 'back_to_main' }]
        ]
      }
    }
  };
  
  const question = questions[step];
  if (question) {
    await ctx.reply(question.text, {
      reply_markup: question.keyboard,
      parse_mode: 'HTML'
    });
    console.log(`Sent question ${step} to user ${userId} via reply`);
  } else {
    console.log(`No question found for step ${step}`);
  }
}

// Функция завершения заявки
async function completeProApplication(ctx, answers) {
  const userId = ctx.from.id;
  const username = ctx.from.username || 'без username';
  
  console.log(`Completing application for user ${userId}:`, answers);
  
  try {
    // Отправляем заявку админу
    console.log(`Sending application to admin for user ${userId}`);
    const success = await sendProApplicationToAdmin(userId, username, answers);
    
    if (success) {
      console.log(`Application sent successfully for user ${userId}`);
      await ctx.reply(
        '✅ <b>Заявка на PRO MODE отправлена!</b>\n\nСпасибо за заявку! Мы рассмотрим её и свяжемся с вами в ближайшее время.\n\n📞 <b>Связь:</b> @workoutbro_support',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
            ]
          },
          parse_mode: 'HTML'
        }
      );
    } else {
      console.log(`Failed to send application for user ${userId}`);
      await ctx.reply(
        '❌ <b>Ошибка отправки заявки</b>\n\nПопробуйте позже или свяжитесь с поддержкой.\n\n📞 <b>Связь:</b> @workoutbro_support',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
            ]
          },
          parse_mode: 'HTML'
        }
      );
    }
  } catch (error) {
    console.log(`Error in completeProApplication for user ${userId}:`, error.message);
    await ctx.reply(
      '❌ <b>Ошибка отправки заявки</b>\n\nПопробуйте позже или свяжитесь с поддержкой.\n\n📞 <b>Связь:</b> @workoutbro_support',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'HTML'
      }
    );
  }
}

// Обработчик текстовых сообщений для пользовательских ответов
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  
  console.log(`Text message from user ${userId}: ${text}`);
  
  // Проверяем, заполняет ли пользователь заявку
  const userState = userStates.get(userId);
  console.log(`User ${userId} text message. UserState:`, userState);
  
  if (userState && userState.waitingForCustomAnswer) {
    const step = userState.waitingForCustomAnswer;
    userState.answers[`question_${step}`] = text;
    userState.waitingForCustomAnswer = null;
    userState.step = step + 1;
    
    console.log(`User ${userId} answered question ${step} with custom text: ${text}`);
    console.log(`Updated userState:`, userState);
    
    // Переходим к следующему вопросу
    if (step < 5) {
      console.log(`Moving to next question ${step + 1} for user ${userId}`);
      await showNextQuestionForText(ctx, step + 1);
    } else {
      console.log(`Completing application for user ${userId}`);
      // Завершаем заявку
      await completeProApplication(ctx, userState.answers);
      userStates.delete(userId);
    }
    return;
  }
  
  // Если пользователь не в процессе заполнения заявки, игнорируем сообщение
  console.log(`User ${userId} is not filling application, ignoring message`);
});

// Настройка webhook
const PORT = process.env.PORT || 3000;

// Middleware для webhook
app.use(bot.webhookCallback('/webhook'));

// Главная страница
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'WorkoutBro Bot',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 WorkoutBro Bot started on port ${PORT}`);
  console.log(`📡 Webhook endpoint: /webhook`);
  console.log(`🌐 Health check: /health`);
});

// Настройка webhook для Render
const webhookUrl = process.env.RENDER_EXTERNAL_URL || process.env.WEBHOOK_URL;
if (webhookUrl) {
  bot.telegram.setWebhook(`${webhookUrl}/webhook`)
    .then(() => {
      console.log(`✅ Webhook установлен: ${webhookUrl}/webhook`);
    })
    .catch((error) => {
      console.error('❌ Ошибка установки webhook:', error);
    });
} else {
  console.log('⚠️  Webhook URL не найден, используйте polling режим');
  // Fallback на polling если webhook не настроен
  bot.launch()
    .then(() => {
      console.log('✅ Bot started with polling');
    })
    .catch((error) => {
      console.error('❌ Bot failed:', error);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  bot.stop('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  bot.stop('SIGINT');
  process.exit(0);
});

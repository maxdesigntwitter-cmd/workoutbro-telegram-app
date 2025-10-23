const { Telegraf } = require('telegraf');
const { sendApplicationToAdmin } = require('./send-to-admin');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Простые тексты
const TEXTS = {
  WELCOME: `Привет, бро! 👋

Я WorkoutBro Bot. Помогу тренироваться с умом, без хаоса и догадок.

Выбери свой путь:`
};

// Клавиатуры
const KEYBOARDS = {
  MAIN_MENU: {
    inline_keyboard: [
      [{ text: '💪 Бесплатное сообщество', callback_data: 'free_community' }],
      [{ text: '🔥 Закрытый клуб', callback_data: 'paid_club' }]
    ]
  }
};

bot.start((ctx) => {
  console.log('Start command received from user:', ctx.from.id);
  ctx.reply(TEXTS.WELCOME, {
    reply_markup: KEYBOARDS.MAIN_MENU,
    parse_mode: 'Markdown'
  });
});

bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  const userId = ctx.from.id;
  console.log(`Callback received: ${data} from user ${userId}`);
  
  ctx.answerCbQuery();
  
  switch (data) {
    case 'free_community':
      ctx.editMessageText('💪 **Бесплатное сообщество**\n\nЭто открытый канал WorkoutBro: мини-гайды, разборы и вызовы.\n\nХочешь систему и поддержку — загляни в клуб!', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '👉 Перейти в канал', url: 'https://t.me/yourworkoutbro' }],
            [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      break;
      
    case 'paid_club':
      ctx.editMessageText('🔥 **Закрытый клуб WorkoutBro**\n\n**BASE MODE** — доступ к программам и материалам (без комментариев)\n**BRO MODE** — + комментарии и закрытый чат\n**PRO MODE** — индивидуальная программа и ведение тренером', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'BASE MODE', callback_data: 'level_base' }],
            [{ text: 'BRO MODE', callback_data: 'level_bro' }],
            [{ text: 'PRO MODE', callback_data: 'level_pro' }],
            [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      break;
      
    case 'back_to_main':
      ctx.editMessageText(TEXTS.WELCOME, {
        reply_markup: KEYBOARDS.MAIN_MENU,
        parse_mode: 'Markdown'
      });
      break;
      
    case 'level_base':
      ctx.editMessageText('🔥 **BASE MODE**\n\nДоступ к программам и материалам (без комментариев)\n\n🚀 **Оплатить** → Tribute', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Оплатить', url: 'https://t.me/tribute/app?startapp=sEo4' }],
            [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      break;
      
    case 'level_bro':
      ctx.editMessageText('🔥 **BRO MODE**\n\nВсё из BASE + комментарии и закрытый чат\n\n🚀 **Оплатить** → Tribute', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💳 Оплатить', url: 'https://t.me/tribute/app?startapp=sEoi' }],
            [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      break;
      
    case 'level_pro':
      // Инициализируем заявку пользователя
      const userId = ctx.from.id;
      userStates.set(userId, {
        step: 1,
        answers: {}
      });
      console.log(`Initialized PRO application for user ${userId}`);
      
      ctx.editMessageText('👑 **PRO MODE**\n\nИндивидуальная программа и ведение тренером\n\n📝 **Заполнить заявку**', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📝 Начать заявку', callback_data: 'pro_application' }],
            [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      break;
      
    case 'pro_application':
      ctx.editMessageText('📝 **Заявка на PRO MODE**\n\nОтлично! Давайте заполним заявку по шагам.\n\n**Вопрос 1/5:**\n\n🏋️ **Какой у вас фитнес уровень?**', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🟢 Новичок (менее 6 месяцев)', callback_data: 'pro_answer_1_novice' }],
            [{ text: '🟡 Средний (6 месяцев - 2 года)', callback_data: 'pro_answer_1_intermediate' }],
            [{ text: '🔴 Продвинутый (более 2 лет)', callback_data: 'pro_answer_1_advanced' }],
            [{ text: '✏️ Свой ответ', callback_data: 'pro_answer_1_custom' }],
            [{ text: '❌ Отменить заявку', callback_data: 'cancel_pro_application' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      break;
      
    case 'cancel_pro_application':
      ctx.editMessageText('❌ **Заявка отменена**\n\nВы можете начать заново в любое время.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        },
        parse_mode: 'Markdown'
      });
      break;
      
    // Обработчики ответов на заявку PRO
    case 'pro_answer_1_novice':
      await handleProAnswer(ctx, 1, 'Новичок (менее 6 месяцев)');
      break;
      
    case 'pro_answer_1_intermediate':
      await handleProAnswer(ctx, 1, 'Средний (6 месяцев - 2 года)');
      break;
      
    case 'pro_answer_1_advanced':
      await handleProAnswer(ctx, 1, 'Продвинутый (более 2 лет)');
      break;
      
    case 'pro_answer_1_custom':
      await handleProCustomAnswer(ctx, 1, '🏋️ **Какой у вас фитнес уровень?**');
      break;
      
    // Вопрос 2 - частота тренировок
    case 'pro_answer_2_1-2':
      await handleProAnswer(ctx, 2, '1-2 раза в неделю');
      break;
      
    case 'pro_answer_2_3-4':
      await handleProAnswer(ctx, 2, '3-4 раза в неделю');
      break;
      
    case 'pro_answer_2_5+':
      await handleProAnswer(ctx, 2, '5+ раз в неделю');
      break;
      
    case 'pro_answer_2_custom':
      await handleProCustomAnswer(ctx, 2, '⏰ **Сколько вы занимаетесь?**');
      break;
      
    // Вопрос 3 - цели
    case 'pro_answer_3_mass':
      await handleProAnswer(ctx, 3, 'Набор массы');
      break;
      
    case 'pro_answer_3_weight_loss':
      await handleProAnswer(ctx, 3, 'Похудение');
      break;
      
    case 'pro_answer_3_maintenance':
      await handleProAnswer(ctx, 3, 'Поддержание формы');
      break;
      
    case 'pro_answer_3_strength':
      await handleProAnswer(ctx, 3, 'Увеличение силы');
      break;
      
    case 'pro_answer_3_custom':
      await handleProCustomAnswer(ctx, 3, '🎯 **Какие у вас цели?**');
      break;
      
    // Вопрос 4 - опыт
    case 'pro_answer_4_home':
      await handleProAnswer(ctx, 4, 'Домашние тренировки');
      break;
      
    case 'pro_answer_4_gym_trainer':
      await handleProAnswer(ctx, 4, 'Зал с тренером');
      break;
      
    case 'pro_answer_4_gym_alone':
      await handleProAnswer(ctx, 4, 'Зал самостоятельно');
      break;
      
    case 'pro_answer_4_cardio':
      await handleProAnswer(ctx, 4, 'Только кардио');
      break;
      
    case 'pro_answer_4_custom':
      await handleProCustomAnswer(ctx, 4, '💪 **Опыт тренировок:**');
      break;
      
    // Вопрос 5 - особенности (завершение заявки)
    case 'pro_answer_5_none':
      await handleProAnswer(ctx, 5, 'Нет ограничений');
      break;
      
    case 'pro_answer_5_injuries':
      await handleProAnswer(ctx, 5, 'Есть травмы');
      break;
      
    case 'pro_answer_5_time':
      await handleProAnswer(ctx, 5, 'Ограниченное время');
      break;
      
    case 'pro_answer_5_home_only':
      await handleProAnswer(ctx, 5, 'Только дома');
      break;
      
    case 'pro_answer_5_custom':
      await handleProCustomAnswer(ctx, 5, '⚠️ **Особенности и ограничения:**');
      break;
      
    // Обработка кнопок отмены
    case 'cancel_pro_application':
      userStates.delete(ctx.from.id);
      await ctx.editMessageText(
        '❌ **Заявка отменена**\n\nВы можете начать заново в любое время.',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
            ]
          },
          parse_mode: 'Markdown'
        }
      );
      break;
  }
});

// Обработчик текстовых сообщений для заявок PRO
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates.get(userId);
  
  console.log(`Text message from user ${userId}:`, ctx.message.text);
  console.log('User state:', userState);
  
  if (!userState) {
    console.log('No user state, ignoring message');
    return; // Пользователь не заполняет заявку
  }
  
  const text = ctx.message.text;
  
  // Если пользователь ждет ввода пользовательского ответа
  if (userState.waitingForCustomAnswer) {
    const step = userState.waitingForCustomAnswer;
    console.log(`Processing custom answer for step ${step}: ${text}`);
    
    userState.answers[`question_${step}`] = text;
    userState.waitingForCustomAnswer = null;
    userState.step = step + 1;
    
    // Переходим к следующему вопросу
    await handleProAnswer(ctx, step, text);
    return;
  }
  
  console.log('No waiting for custom answer, ignoring message');
});

// Хранилище состояний пользователей для заявок PRO
const userStates = new Map();

// Функция обработки ответов PRO заявки
async function handleProAnswer(ctx, step, answer) {
  const userId = ctx.from.id;
  let userState = userStates.get(userId);
  
  if (!userState) {
    // Создаем новое состояние для пользователя
    userState = {
      step: step + 1,
      answers: { [`question_${step}`]: answer }
    };
    userStates.set(userId, userState);
  } else {
    userState.answers[`question_${step}`] = answer;
    userState.step = step + 1;
  }
  
  console.log(`Processing step ${step} for user ${userId}, answer: ${answer}`);
  console.log('Current user state:', userState);
  
  try {
    switch (step) {
      case 1:
        await ctx.editMessageText(
          `✅ **Фитнес уровень:** ${answer}\n\n**Вопрос 2/5:**\n\n⏰ **Сколько вы занимаетесь?**`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🟢 1-2 раза в неделю', callback_data: 'pro_answer_2_1-2' }],
                [{ text: '🟡 3-4 раза в неделю', callback_data: 'pro_answer_2_3-4' }],
                [{ text: '🔴 5+ раз в неделю', callback_data: 'pro_answer_2_5+' }],
                [{ text: '✏️ Свой ответ', callback_data: 'pro_answer_2_custom' }],
                [{ text: '❌ Отменить заявку', callback_data: 'cancel_pro_application' }]
              ]
            },
            parse_mode: 'Markdown'
          }
        );
        break;
        
      case 2:
        await ctx.editMessageText(
          `✅ **Частота тренировок:** ${answer}\n\n**Вопрос 3/5:**\n\n🎯 **Какие у вас цели?**`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '💪 Набор массы', callback_data: 'pro_answer_3_mass' }],
                [{ text: '🔥 Похудение', callback_data: 'pro_answer_3_weight_loss' }],
                [{ text: '⚖️ Поддержание формы', callback_data: 'pro_answer_3_maintenance' }],
                [{ text: '💪 Увеличение силы', callback_data: 'pro_answer_3_strength' }],
                [{ text: '✏️ Свой ответ', callback_data: 'pro_answer_3_custom' }],
                [{ text: '❌ Отменить заявку', callback_data: 'cancel_pro_application' }]
              ]
            },
            parse_mode: 'Markdown'
          }
        );
        break;
        
      case 3:
        await ctx.editMessageText(
          `✅ **Цели:** ${answer}\n\n**Вопрос 4/5:**\n\n💪 **Опыт тренировок:**`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🏠 Домашние тренировки', callback_data: 'pro_answer_4_home' }],
                [{ text: '🏋️ Зал с тренером', callback_data: 'pro_answer_4_gym_trainer' }],
                [{ text: '🏋️ Зал самостоятельно', callback_data: 'pro_answer_4_gym_alone' }],
                [{ text: '🏃 Только кардио', callback_data: 'pro_answer_4_cardio' }],
                [{ text: '✏️ Свой ответ', callback_data: 'pro_answer_4_custom' }],
                [{ text: '❌ Отменить заявку', callback_data: 'cancel_pro_application' }]
              ]
            },
            parse_mode: 'Markdown'
          }
        );
        break;
        
      case 4:
        await ctx.editMessageText(
          `✅ **Опыт:** ${answer}\n\n**Вопрос 5/5:**\n\n⚠️ **Особенности и ограничения:**`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '✅ Нет ограничений', callback_data: 'pro_answer_5_none' }],
                [{ text: '🩹 Есть травмы', callback_data: 'pro_answer_5_injuries' }],
                [{ text: '⏰ Ограниченное время', callback_data: 'pro_answer_5_time' }],
                [{ text: '🏠 Только дома', callback_data: 'pro_answer_5_home_only' }],
                [{ text: '✏️ Свой ответ', callback_data: 'pro_answer_5_custom' }],
                [{ text: '❌ Отменить заявку', callback_data: 'cancel_pro_application' }]
              ]
            },
            parse_mode: 'Markdown'
          }
        );
        break;
        
      case 5:
        // Завершение заявки
        await handleProApplicationComplete(ctx, answer);
        break;
    }
  } catch (error) {
    console.log(`Error processing PRO application step ${step}:`, error.message);
  }
}

// Функция для обработки пользовательского ввода
async function handleProCustomAnswer(ctx, step, question) {
  const userId = ctx.from.id;
  const userState = userStates.get(userId);
  
  if (!userState) {
    userStates.set(userId, {
      step: step,
      answers: {},
      waitingForCustomAnswer: step
    });
  } else {
    userState.waitingForCustomAnswer = step;
  }
  
  await ctx.editMessageText(
    `✏️ **Свой ответ на вопрос ${step}/5:**\n\n${question}\n\nНапишите ваш ответ в чат:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '❌ Отменить заявку', callback_data: 'cancel_pro_application' }]
        ]
      },
      parse_mode: 'Markdown'
    }
  );
}

// Функция обработки завершения заявки PRO
async function handleProApplicationComplete(ctx, lastAnswer) {
  const userId = ctx.from.id;
  const username = ctx.from.username || 'без username';
  const userState = userStates.get(userId);
  
  console.log(`Processing application completion for user ${userId}`);
  console.log('User state:', userState);
  
  if (!userState) {
    console.log('No user state found, returning');
    return;
  }
  
  // Сохраняем последний ответ
  userState.answers[`question_5`] = lastAnswer;
  
  console.log('Final answers:', userState.answers);
  
  // Определяем админа (не отправляем заявку самому пользователю)
  const adminId = 285485174; // Ваш ID как админа
  const isAdmin = userId === adminId;
  
  console.log(`User ${userId} is admin: ${isAdmin}`);
  
  if (isAdmin) {
    // Если заявку подает сам админ (для тестирования), отправляем ему же
    console.log('Admin is submitting application for testing - sending to admin');
  } else {
    // Отправляем заявку админу
    console.log('Regular user submitting application - sending to admin');
  }
  
  // Отправляем уведомление админу через HTTP
  console.log('Attempting to send admin notification via HTTP...');
  
  const success = await sendApplicationToAdmin(userId, username, userState.answers);
  
  if (success) {
    console.log(`✅ Admin notification sent successfully for user ${userId}`);
  } else {
    console.log(`❌ Failed to send admin notification for user ${userId}`);
  }
  
  // Отправляем подтверждение пользователю
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
  
  // Очищаем состояние
  userStates.delete(userId);
  console.log('User state cleared');
}

console.log('Starting step-by-step bot...');
bot.launch()
  .then(() => {
    console.log('✅ Step-by-step bot started!');
  })
  .catch((error) => {
    console.error('❌ Bot failed:', error);
  });

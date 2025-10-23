const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Хранилище состояний пользователей для заявок PRO
const userStates = new Map();

// Простые тексты
const TEXTS = {
  WELCOME: `Привет, бро! 👋

Я WorkoutBro Bot. Помогу тренироваться с умом, без хаоса и догадок.

Выбери свой путь:`,
  
  FREE_COMMUNITY: `💪 **Бесплатное сообщество**

Это открытый канал WorkoutBro: мини-гайды, разборы и вызовы.

Хочешь систему и поддержку — загляни в клуб!`,
  
  CLUB_DESCRIPTION: `🔥 **Закрытый клуб WorkoutBro**

**BASE MODE** — доступ к программам и материалам (без комментариев)
**BRO MODE** — + комментарии и закрытый чат  
**PRO MODE** — индивидуальная программа и ведение тренером`,
  
  SUPPORT: `🆘 **Поддержка**

Вопрос по доступу/оплате/технике?

📧 Email: support@workoutbro.ru
👤 Менеджер: @workoutbro_support`
};

// Клавиатуры
const KEYBOARDS = {
  MAIN_MENU: {
    inline_keyboard: [
      [{ text: '💪 Бесплатное сообщество', callback_data: 'free_community' }],
      [{ text: '🔥 Закрытый клуб', callback_data: 'paid_club' }]
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
      [{ text: 'BASE MODE', callback_data: 'level_base' }],
      [{ text: 'BRO MODE', callback_data: 'level_bro' }],
      [{ text: 'PRO MODE', callback_data: 'level_pro' }],
      [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
    ]
  }
};

// Обработчик /start
bot.start(async (ctx) => {
  try {
    console.log(`User ${ctx.from.id} started the bot`);
    await ctx.reply(TEXTS.WELCOME, {
      reply_markup: KEYBOARDS.MAIN_MENU,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.log(`Error sending message to user ${ctx.from.id}:`, error.message);
  }
});

// Обработчик текстовых сообщений для заявок PRO
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const userState = userStates.get(userId);
  
  if (!userState) return; // Пользователь не заполняет заявку
  
  const text = ctx.message.text;
  
  // Если пользователь ждет ввода пользовательского ответа
  if (userState.waitingForCustomAnswer) {
    const step = userState.waitingForCustomAnswer;
    userState.answers[`question_${step}`] = text;
    userState.waitingForCustomAnswer = null;
    userState.step = step + 1;
    
    // Переходим к следующему вопросу
    await handleProAnswer(ctx, step, text);
    return;
  }
  
  // Старая логика (если что-то пошло не так)
  userState.answers[`question_${userState.step}`] = text;
  
  try {
    switch (userState.step) {
      case 1:
        userState.step = 2;
        await ctx.reply(
          `✅ **Фитнес уровень:** ${text}\n\n**Вопрос 2/5:**\n\n⏰ **Сколько вы занимаетесь?**`,
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
        userState.step = 3;
        await ctx.reply(
          `✅ **Частота тренировок:** ${text}\n\n**Вопрос 3/5:**\n\n🎯 **Какие у вас цели?**`,
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
        userState.step = 4;
        await ctx.reply(
          `✅ **Цели:** ${text}\n\n**Вопрос 4/5:**\n\n💪 **Опыт тренировок:**`,
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
        userState.step = 5;
        await ctx.reply(
          `✅ **Опыт:** ${text}\n\n**Вопрос 5/5:**\n\n⚠️ **Особенности и ограничения:**`,
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
        // Завершение заявки - простое сообщение пользователю
        const userMessage = `✅ **Заявка на PRO MODE отправлена!**\n\nСпасибо за заполнение заявки! Мы рассмотрим ваши данные в течение 24 часов и свяжемся с вами для обсуждения персональной программы.\n\nСпасибо за интерес к PRO MODE! 🚀`;
        
        await ctx.reply(userMessage, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
            ]
          }
        });
        
        // Отправляем заявку в поддержку
        console.log(`PRO Application from user ${userId}:`, userState.answers);
        
        // Отправляем уведомление админу
        const adminId = 285485174; // Ваш Telegram ID
        const applicationMessage = `📝 **Новая заявка PRO MODE**\n\n👤 **Пользователь:** @${ctx.from.username || 'без username'} (ID: ${userId})\n\n📋 **Данные заявки:**\n\n1️⃣ **Фитнес уровень:** ${userState.answers.question_1}\n2️⃣ **Частота тренировок:** ${userState.answers.question_2}\n3️⃣ **Цели:** ${userState.answers.question_3}\n4️⃣ **Опыт:** ${userState.answers.question_4}\n5️⃣ **Особенности:** ${text}\n\n💬 **Связаться с пользователем:** [Написать](tg://user?id=${userId})`;
        
        try {
          await bot.telegram.sendMessage(adminId, applicationMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '💬 Написать пользователю', url: `tg://user?id=${userId}` }],
                [{ text: '✅ Одобрить заявку', callback_data: `approve_${userId}` }],
                [{ text: '❌ Отклонить заявку', callback_data: `reject_${userId}` }]
              ]
            }
          });
          console.log(`Admin notification sent for user ${userId}`);
        } catch (error) {
          console.log('Error sending admin notification:', error.message);
        }
        
        userStates.delete(userId);
        break;
    }
  } catch (error) {
    console.log(`Error processing PRO application step ${userState.step}:`, error.message);
  }
});

// Обработчик callback'ов
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  
  ctx.answerCbQuery();
  
  switch (data) {
    case 'free_community':
      ctx.editMessageText(TEXTS.FREE_COMMUNITY, {
        reply_markup: KEYBOARDS.FREE_COMMUNITY,
        parse_mode: 'Markdown'
      });
      break;
      
    case 'paid_club':
      ctx.editMessageText(TEXTS.CLUB_DESCRIPTION, {
        reply_markup: KEYBOARDS.CLUB_LEVELS,
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
      ctx.editMessageText(
        `🔥 **BASE MODE**\n\n${getLevelDescription('BASE')}\n\n🚀 **Оплатить** → Tribute`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Оплатить', url: 'https://t.me/tribute/app?startapp=sEo4' }],
              [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
            ]
          },
          parse_mode: 'Markdown'
        }
      );
      break;
      
    case 'level_bro':
      ctx.editMessageText(
        `🔥 **BRO MODE**\n\n${getLevelDescription('BRO')}\n\n🚀 **Оплатить** → Tribute`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Оплатить', url: 'https://t.me/tribute/app?startapp=sEoi' }],
              [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
            ]
          },
          parse_mode: 'Markdown'
        }
      );
      break;
      
    case 'level_pro':
      ctx.editMessageText(
        `👑 **PRO MODE**\n\n${getLevelDescription('PRO')}\n\n📝 **Заполнить заявку**`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📝 Начать заявку', callback_data: 'pro_application' }],
              [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
            ]
          },
          parse_mode: 'Markdown'
        }
      );
      break;
      
      
    case 'pro_application':
      // Инициализируем заявку пользователя
      const userId = ctx.from.id;
      userStates.set(userId, {
        step: 1,
        answers: {}
      });
      
      ctx.editMessageText(
        `📝 **Заявка на PRO MODE**\n\nОтлично! Давайте заполним заявку по шагам.\n\n**Вопрос 1/5:**\n\n🏋️ **Какой у вас фитнес уровень?**`,
        {
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
        }
      );
      break;
      
    case 'cancel_pro_application':
      userStates.delete(ctx.from.id);
      ctx.editMessageText(
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
      
    // Обработчики ответов на вопросы PRO заявки
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
      
    // Обработчики для остальных вопросов
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
      
    default:
      // Обработчики для админа
      if (data.startsWith('approve_')) {
        const approveUserId = data.replace('approve_', '');
        await ctx.editMessageText(
          `✅ **Заявка одобрена!**\n\nПользователь ID: ${approveUserId}\n\nЗаявка была одобрена.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '💬 Написать пользователю', url: `tg://user?id=${approveUserId}` }]
              ]
            },
            parse_mode: 'Markdown'
          }
        );
        
        // Уведомляем пользователя об одобрении
        try {
          await bot.telegram.sendMessage(approveUserId, 
            `🎉 **Отличные новости!**\n\nВаша заявка на PRO MODE была одобрена!\n\nМы свяжемся с вами в ближайшее время для обсуждения персональной программы.\n\nСпасибо за выбор WorkoutBro! 💪`,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
          console.log('Error notifying user about approval:', error.message);
        }
      } else if (data.startsWith('reject_')) {
        const rejectUserId = data.replace('reject_', '');
        await ctx.editMessageText(
          `❌ **Заявка отклонена**\n\nПользователь ID: ${rejectUserId}\n\nЗаявка была отклонена.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '💬 Написать пользователю', url: `tg://user?id=${rejectUserId}` }]
              ]
            },
            parse_mode: 'Markdown'
          }
        );
        
        // Уведомляем пользователя об отклонении
        try {
          await bot.telegram.sendMessage(rejectUserId, 
            `📝 **По поводу вашей заявки**\n\nК сожалению, ваша заявка на PRO MODE не может быть одобрена в данный момент.\n\nВозможно, стоит попробовать BASE или BRO MODE, которые также предлагают отличные программы тренировок.\n\nЕсли у вас есть вопросы, обращайтесь в поддержку: /support`,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
          console.log('Error notifying user about rejection:', error.message);
        }
      }
      break;
      
    case 'payment_confirmed':
      ctx.editMessageText(
        '✅ **Оплата получена!**\n\nСпасибо за покупку! Ваш доступ будет активирован в течение 5 минут.\n\nЕсли у вас есть вопросы, обратитесь в поддержку: /support',
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

// Команды
bot.command('club', (ctx) => {
  ctx.reply(TEXTS.CLUB_DESCRIPTION, {
    reply_markup: KEYBOARDS.CLUB_LEVELS,
    parse_mode: 'Markdown'
  });
});

bot.command('support', (ctx) => {
  ctx.reply(TEXTS.SUPPORT, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '📧 Написать в поддержку', url: 'mailto:support@workoutbro.ru' }],
        [{ text: '💬 Telegram поддержка', url: 'https://t.me/workoutbro_support' }],
        [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
      ]
    }
  });
});

bot.command('materials', (ctx) => {
  ctx.reply(
    `📚 **Материалы WorkoutBro**\n\nВыбери категорию:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📋 Программы', callback_data: 'materials_programs' }],
          [{ text: '🔄 Восстановление', callback_data: 'materials_recovery' }],
          [{ text: '🍎 Питание', callback_data: 'materials_nutrition' }],
          [{ text: '❓ FAQ', callback_data: 'materials_faq' }],
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
        ]
      },
      parse_mode: 'Markdown'
    }
  );
});

// Обработчик материалов
bot.on('callback_query', (ctx) => {
  const data = ctx.callbackQuery.data;
  
  if (data.startsWith('materials_')) {
    const category = data.replace('materials_', '');
    const categoryNames = {
      'programs': 'Программы',
      'recovery': 'Восстановление', 
      'nutrition': 'Питание',
      'faq': 'FAQ'
    };
    
    ctx.answerCbQuery();
    ctx.editMessageText(
      `📚 **${categoryNames[category]}**\n\n• 21-дневная база\n• Программа для новичков\n• Продвинутые техники\n\nДля доступа к материалам оформите подписку: /club`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад к материалам', callback_data: 'back_to_materials' }]
          ]
        },
        parse_mode: 'Markdown'
      }
    );
  }
});

// Функция описания уровней
function getLevelDescription(level) {
  switch (level) {
    case 'BASE':
      return 'Доступ к программам и материалам (без комментариев)';
    case 'BRO':
      return 'Всё из BASE + комментарии и закрытый чат';
    case 'PRO':
      return 'Индивидуальная программа и ведение тренером';
    default:
      return '';
  }
}

// Функция обработки ответов PRO заявки
async function handleProAnswer(ctx, step, answer) {
  const userId = ctx.from.id;
  const userState = userStates.get(userId);
  
  if (!userState) return;
  
  userState.answers[`question_${step}`] = answer;
  userState.step = step + 1;
  
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
        // Завершение заявки - простое сообщение пользователю
        const userMessage = `✅ **Заявка на PRO MODE отправлена!**\n\nСпасибо за заполнение заявки! Мы рассмотрим ваши данные в течение 24 часов и свяжемся с вами для обсуждения персональной программы.\n\nСпасибо за интерес к PRO MODE! 🚀`;
        
        await ctx.editMessageText(userMessage, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
            ]
          }
        });
        
        // Отправляем заявку в поддержку
        console.log(`PRO Application from user ${userId}:`, userState.answers);
        
        // Отправляем уведомление в Telegram (замените на ваш ID)
        const adminId = 285485174; // Ваш Telegram ID
        console.log(`Attempting to send admin notification for user ${userId}`);
        
        const applicationMessage = `📝 **Новая заявка PRO MODE**\n\n👤 **Пользователь:** ID: ${userId}\n\n📋 **Данные заявки:**\n\n1️⃣ **Фитнес уровень:** ${userState.answers.question_1}\n2️⃣ **Частота тренировок:** ${userState.answers.question_2}\n3️⃣ **Цели:** ${userState.answers.question_3}\n4️⃣ **Опыт:** ${userState.answers.question_4}\n5️⃣ **Особенности:** ${answer}\n\n💬 **Связаться с пользователем:** [Написать](tg://user?id=${userId})`;
        
        try {
          const result = await bot.telegram.sendMessage(adminId, applicationMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '💬 Написать пользователю', url: `tg://user?id=${userId}` }],
                [{ text: '✅ Одобрить заявку', callback_data: `approve_${userId}` }],
                [{ text: '❌ Отклонить заявку', callback_data: `reject_${userId}` }]
              ]
            }
          });
          console.log(`✅ Admin notification sent successfully for user ${userId}, message ID: ${result.message_id}`);
        } catch (error) {
          console.log(`❌ Error sending admin notification for user ${userId}:`, error.message);
        }
        
        // Очищаем состояние
        userStates.delete(userId);
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
  
  if (!userState) return;
  
  userState.waitingForCustomAnswer = step;
  
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

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь в поддержку /support');
});

// Запуск бота
console.log('🚀 Запуск WorkoutBro Bot...');
bot.launch();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

console.log('✅ WorkoutBro Bot запущен успешно!');

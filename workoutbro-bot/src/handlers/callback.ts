import { Context } from 'telegraf';
import { TEXTS, KEYBOARDS } from '../config';
import { db } from '../services/database';
import { logger } from '../utils/logger';
import { UserLevel } from '../types';

export async function callbackHandler(ctx: Context) {
  try {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      return;
    }

    const user = await db.getUserByTelegramId(ctx.from!.id);
    if (!user) {
      await ctx.answerCbQuery('Пользователь не найден');
      return;
    }

    const data = ctx.callbackQuery.data;
    
    // Answer callback query to remove loading state
    await ctx.answerCbQuery();

    switch (data) {
      case 'free_community':
        await handleFreeCommunity(ctx, user);
        break;
        
      case 'paid_club':
        await handlePaidClub(ctx, user);
        break;
        
      case 'back_to_main':
        await handleBackToMain(ctx, user);
        break;
        
      case 'level_base':
      case 'level_bro':
      case 'level_pro':
        await handleLevelSelection(ctx, user, data);
        break;
        
      case 'subscribe':
        await handleSubscribe(ctx, user);
        break;
        
      case 'materials_programs':
      case 'materials_recovery':
      case 'materials_nutrition':
      case 'materials_faq':
        await handleMaterials(ctx, user, data);
        break;
        
      case 'upgrade_bro':
      case 'upgrade_pro':
        await handleUpgrade(ctx, user, data);
        break;
        
      case 'retention_accept':
        await handleRetentionAccept(ctx, user);
        break;
        
      case 'retention_decline':
        await handleRetentionDecline(ctx, user);
        break;
        
      default:
        logger.warn(`Unknown callback data: ${data}`);
    }
  } catch (error) {
    logger.error('Callback handler error:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

async function handleFreeCommunity(ctx: Context, user: any) {
  await ctx.editMessageText(TEXTS.FREE_COMMUNITY, {
    reply_markup: KEYBOARDS.FREE_COMMUNITY,
    parse_mode: 'Markdown',
  });
  
  await db.logUserAction(user.id, 'free_community_selected', user.level);
}

async function handlePaidClub(ctx: Context, user: any) {
  await ctx.editMessageText(TEXTS.CLUB_DESCRIPTION, {
    reply_markup: KEYBOARDS.CLUB_LEVELS,
    parse_mode: 'Markdown',
  });
  
  await db.logUserAction(user.id, 'paid_club_selected', user.level);
}

async function handleBackToMain(ctx: Context, user: any) {
  await ctx.editMessageText(TEXTS.WELCOME, {
    reply_markup: KEYBOARDS.MAIN_MENU,
    parse_mode: 'Markdown',
  });
}

async function handleLevelSelection(ctx: Context, user: any, data: string) {
  const levelMap: Record<string, UserLevel> = {
    'level_base': UserLevel.BASE,
    'level_bro': UserLevel.BRO,
    'level_pro': UserLevel.PRO,
  };
  
  const selectedLevel = levelMap[data];
  const levelNames: Record<string, string> = {
    'BASE': 'BASE MODE',
    'BRO': 'BRO MODE',
    'PRO': 'PRO MODE',
  };
  
  const message = `🔥 **${levelNames[selectedLevel]}**

${getLevelDescription(selectedLevel)}

🚀 **Оформить доступ** → Tribute`;

  await ctx.editMessageText(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 Оформить доступ', callback_data: 'subscribe' }],
        [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
      ]
    },
    parse_mode: 'Markdown',
  });
  
  await db.logUserAction(user.id, 'level_selected', user.level, { selectedLevel });
}

async function handleSubscribe(ctx: Context, user: any) {
  // TODO: Integrate with Tribute
  const tributeUrl = 'https://tribute.to/workoutbro'; // Replace with actual Tribute URL
  
  await ctx.editMessageText(
    `🚀 **Оформление доступа**

Переходи по ссылке для оплаты:
${tributeUrl}

После оплаты нажми "Я оплатил" для активации доступа.`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 Оплатить', url: tributeUrl }],
          [{ text: '✅ Я оплатил', callback_data: 'payment_confirmed' }],
          [{ text: '⬅️ Назад', callback_data: 'paid_club' }]
        ]
      },
      parse_mode: 'Markdown',
    }
  );
  
  await db.logUserAction(user.id, 'subscribe_initiated', user.level);
}

async function handleMaterials(ctx: Context, user: any, data: string) {
  const categoryMap: Record<string, string> = {
    'materials_programs': 'Программы',
    'materials_recovery': 'Восстановление',
    'materials_nutrition': 'Питание',
    'materials_faq': 'FAQ',
  };
  
  const category = categoryMap[data];
  
  // TODO: Get actual materials from database
  const materials = [
    { title: '21-дневная база', url: 'https://example.com/base' },
    { title: 'Программа для новичков', url: 'https://example.com/beginner' },
  ];
  
  let message = `📚 **${category}**\n\n`;
  
  materials.forEach((material, index) => {
    message += `${index + 1}. [${material.title}](${material.url})\n`;
  });
  
  await ctx.editMessageText(message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Назад к материалам', callback_data: 'back_to_materials' }]
      ]
    },
    parse_mode: 'Markdown',
  });
  
  await db.logUserAction(user.id, 'materials_accessed', user.level, { category });
}

async function handleUpgrade(ctx: Context, user: any, data: string) {
  const upgradeMap: Record<string, string> = {
    'upgrade_bro': 'BASE → BRO',
    'upgrade_pro': 'BRO → PRO',
  };
  
  const upgrade = upgradeMap[data];
  
  await ctx.editMessageText(
    `⬆️ **Апгрейд: ${upgrade}**

Сравни уровни и выбери подходящий:

**BASE MODE** — доступ к программам и материалам
**BRO MODE** — + комментарии и закрытый чат
**PRO MODE** — индивидуальная программа и ведение

🚀 **Оформить апгрейд** → Tribute`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Оформить апгрейд', callback_data: 'subscribe' }],
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
        ]
      },
      parse_mode: 'Markdown',
    }
  );
  
  await db.logUserAction(user.id, 'upgrade_initiated', user.level, { upgrade });
}

async function handleRetentionAccept(ctx: Context, user: any) {
  // TODO: Process retention offer acceptance
  await ctx.editMessageText(
    '🎉 Отлично! Твой доступ продлен со скидкой. Спасибо, что остаешься с нами!',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
        ]
      }
    }
  );
  
  await db.logUserAction(user.id, 'retention_accepted', user.level);
}

async function handleRetentionDecline(ctx: Context, user: any) {
  await ctx.editMessageText(
    '😢 Жаль, что ты уходишь. Если передумаешь, мы всегда рады видеть тебя снова!',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
        ]
      }
    }
  );
  
  await db.logUserAction(user.id, 'retention_declined', user.level);
}

function getLevelDescription(level: UserLevel): string {
  switch (level) {
    case UserLevel.BASE:
      return 'Доступ к программам и материалам (без комментариев)';
    case UserLevel.BRO:
      return 'Всё из BASE + комментарии и закрытый чат';
    case UserLevel.PRO:
      return 'Индивидуальная программа и ведение тренером';
    default:
      return '';
  }
}

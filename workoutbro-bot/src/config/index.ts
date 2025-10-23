import { config } from 'dotenv';
import { BotConfig } from '../types';

config();

export const botConfig: BotConfig = {
  botToken: process.env.BOT_TOKEN || '',
  webhookUrl: process.env.WEBHOOK_URL,
  webhookSecret: process.env.WEBHOOK_SECRET,
  databaseUrl: process.env.DATABASE_URL || '',
  tributeApiKey: process.env.TRIBUTE_API_KEY,
  tributeWebhookSecret: process.env.TRIBUTE_WEBHOOK_SECRET,
  freeChannelId: process.env.FREE_CHANNEL_ID || '',
  baseChannelId: process.env.BASE_CHANNEL_ID || '',
  broChatId: process.env.BRO_CHAT_ID || '',
  proChatId: process.env.PRO_CHAT_ID || '',
  adminTelegramIds: process.env.ADMIN_TELEGRAM_IDS?.split(',').map(Number) || [],
  logLevel: process.env.LOG_LEVEL || 'info',
  logChatId: process.env.LOG_CHAT_ID,
  retentionDiscountPercent: parseInt(process.env.RETENTION_DISCOUNT_PERCENT || '30'),
  retentionDaysBeforeExpire: parseInt(process.env.RETENTION_DAYS_BEFORE_EXPIRE || '3'),
};

// Validation
if (!botConfig.botToken) {
  throw new Error('BOT_TOKEN is required');
}

if (!botConfig.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export const TEXTS = {
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

  BASE_WELCOME: `🎉 **Добро пожаловать в WorkoutBro Club!**

Ты активировал **BASE MODE** — LEVEL 1.

Вот твой доступ: {inviteLink}

💡 **Совет:** открой раздел /materials и начни с "21-дневной базы"

Готов к общению — апгрейднись до BRO!`,

  BRO_WELCOME: `🚀 **Добро пожаловать в BRO MODE!**

Ты получил доступ к закрытому чату и можешь комментировать посты.

Вот твой доступ: {inviteLink}

💬 Теперь ты можешь общаться с единомышленниками!`,

  PRO_WELCOME: `👑 **Добро пожаловать в PRO MODE!**

Ты получил персональную программу и ведение тренером.

Вот твой доступ: {inviteLink}

🎯 Твой персональный тренер свяжется с тобой в течение 24 часов!`,

  EXPIRY_REMINDER: `⏰ **Напоминание об окончании доступа**

Твой доступ истекает {expiryDate}

Хочешь продлить по стартовой цене? Нажми: Остаться за {price} ₽`,

  RETENTION_OFFER: `🎁 **Специальное предложение!**

Мы не хотим тебя терять! Останься с нами со скидкой {discount}%:

Оригинальная цена: {originalPrice} ₽
**Твоя цена: {discountedPrice} ₽**`,

  SUPPORT: `🆘 **Поддержка**

Вопрос по доступу/оплате/технике?

📧 Email: support@workoutbro.ru
👤 Менеджер: @workoutbro_support

Или используй команду /materials для FAQ`,

  MATERIALS: `📚 **Материалы WorkoutBro**

Выбери категорию:`,

  UPGRADE: `⬆️ **Апгрейд уровня**

Сравни уровни и выбери подходящий:`
};

export const KEYBOARDS = {
  MAIN_MENU: {
    inline_keyboard: [
      [
        { text: '💪 Бесплатное сообщество', callback_data: 'free_community' },
        { text: '🔥 Закрытый клуб', callback_data: 'paid_club' }
      ]
    ]
  },

  FREE_COMMUNITY: {
    inline_keyboard: [
      [{ text: '👉 Перейти в канал', url: 'https://t.me/workoutbro_free' }],
      [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
    ]
  },

  CLUB_LEVELS: {
    inline_keyboard: [
      [{ text: 'BASE MODE', callback_data: 'level_base' }],
      [{ text: 'BRO MODE', callback_data: 'level_bro' }],
      [{ text: 'PRO MODE', callback_data: 'level_pro' }],
      [{ text: '🚀 Оформить доступ', callback_data: 'subscribe' }],
      [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
    ]
  },

  MATERIALS: {
    inline_keyboard: [
      [{ text: '📋 Программы', callback_data: 'materials_programs' }],
      [{ text: '🔄 Восстановление', callback_data: 'materials_recovery' }],
      [{ text: '🍎 Питание', callback_data: 'materials_nutrition' }],
      [{ text: '❓ FAQ', callback_data: 'materials_faq' }],
      [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
    ]
  },

  UPGRADE: {
    inline_keyboard: [
      [{ text: 'BASE → BRO', callback_data: 'upgrade_bro' }],
      [{ text: 'BRO → PRO', callback_data: 'upgrade_pro' }],
      [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
    ]
  },

  RETENTION: {
    inline_keyboard: [
      [{ text: '✅ Остаться', callback_data: 'retention_accept' }],
      [{ text: '❌ Отказаться', callback_data: 'retention_decline' }]
    ]
  }
};


import { Context } from 'telegraf';
import { TEXTS, KEYBOARDS } from '../config';
import { db } from '../services/database';
import { logger } from '../utils/logger';
import { MaterialCategory, UserLevel } from '../types';

export const commandHandler = {
  async club(ctx: Context) {
    try {
      const user = await db.getUserByTelegramId(ctx.from!.id);
      if (!user) return;

      await ctx.reply(TEXTS.CLUB_DESCRIPTION, {
        reply_markup: KEYBOARDS.CLUB_LEVELS,
        parse_mode: 'Markdown',
      });

      await db.logUserAction(user.id, 'club_command', user.level);
    } catch (error) {
      logger.error('Club command error:', error);
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  },

  async upgrade(ctx: Context) {
    try {
      const user = await db.getUserByTelegramId(ctx.from!.id);
      if (!user) return;

      if (user.level === UserLevel.FREE) {
        await ctx.reply('Сначала оформи подписку через /club');
        return;
      }

      await ctx.reply(TEXTS.UPGRADE, {
        reply_markup: KEYBOARDS.UPGRADE,
        parse_mode: 'Markdown',
      });

      await db.logUserAction(user.id, 'upgrade_command', user.level);
    } catch (error) {
      logger.error('Upgrade command error:', error);
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  },

  async materials(ctx: Context) {
    try {
      const user = await db.getUserByTelegramId(ctx.from!.id);
      if (!user) return;

      await ctx.reply(TEXTS.MATERIALS, {
        reply_markup: KEYBOARDS.MATERIALS,
        parse_mode: 'Markdown',
      });

      await db.logUserAction(user.id, 'materials_command', user.level);
    } catch (error) {
      logger.error('Materials command error:', error);
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  },

  async status(ctx: Context) {
    try {
      const user = await db.getUserByTelegramId(ctx.from!.id);
      if (!user) return;

      const levelNames: Record<string, string> = {
        'FREE': 'FREE',
        'BASE': 'BASE MODE',
        'BRO': 'BRO MODE',
        'PRO': 'PRO MODE',
      };

      let statusMessage = `📊 **Твой статус**

**Уровень:** ${levelNames[user.level]}
**Дата регистрации:** ${user.createdAt.toLocaleDateString('ru-RU')}
**Последний вход:** ${user.lastSeen.toLocaleDateString('ru-RU')}`;

      if (user.expiresAt) {
        const isExpired = user.expiresAt < new Date();
        statusMessage += `\n**Доступ до:** ${user.expiresAt.toLocaleDateString('ru-RU')}`;
        
        if (isExpired) {
          statusMessage += '\n⚠️ **Доступ истек**';
        } else {
          const daysLeft = Math.ceil((user.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          statusMessage += `\n⏰ **Осталось дней:** ${daysLeft}`;
        }
      }

      await ctx.reply(statusMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        }
      });

      await db.logUserAction(user.id, 'status_command', user.level);
    } catch (error) {
      logger.error('Status command error:', error);
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  },

  async support(ctx: Context) {
    try {
      const user = await db.getUserByTelegramId(ctx.from!.id);
      if (!user) return;

      await ctx.reply(TEXTS.SUPPORT, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📧 Написать в поддержку', url: 'mailto:support@workoutbro.ru' }],
            [{ text: '💬 Telegram поддержка', url: 'https://t.me/workoutbro_support' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        }
      });

      await db.logUserAction(user.id, 'support_command', user.level);
    } catch (error) {
      logger.error('Support command error:', error);
      await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
  }
};

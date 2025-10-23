import { Context } from 'telegraf';
import { botConfig } from '../config';
import { db } from '../services/database';
import { logger } from '../utils/logger';
import { UserLevel } from '../types';

function isAdmin(userId: number): boolean {
  return botConfig.adminTelegramIds.includes(userId);
}

export const adminHandler = {
  async broadcast(ctx: Context) {
    try {
      if (!isAdmin(ctx.from!.id)) {
        await ctx.reply('❌ У вас нет прав администратора');
        return;
      }

      const message = ctx.message;
      if (!('text' in message!)) {
        await ctx.reply('Использование: /broadcast <текст сообщения>');
        return;
      }

      const text = message.text.replace('/broadcast ', '');
      if (!text) {
        await ctx.reply('Использование: /broadcast <текст сообщения>');
        return;
      }

      // TODO: Implement actual broadcast logic
      await ctx.reply(`📢 Рассылка подготовлена:\n\n${text}\n\nПодтвердить отправку?`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Отправить', callback_data: 'confirm_broadcast' }],
            [{ text: '❌ Отменить', callback_data: 'cancel_broadcast' }]
          ]
        }
      });

      logger.info(`Admin ${ctx.from!.id} prepared broadcast: ${text}`);
    } catch (error) {
      logger.error('Broadcast command error:', error);
      await ctx.reply('Произошла ошибка при подготовке рассылки.');
    }
  },

  async invite(ctx: Context) {
    try {
      if (!isAdmin(ctx.from!.id)) {
        await ctx.reply('❌ У вас нет прав администратора');
        return;
      }

      const message = ctx.message;
      if (!('text' in message!)) {
        await ctx.reply('Использование: /invite @username LEVEL');
        return;
      }

      const args = message.text.split(' ');
      if (args.length !== 3) {
        await ctx.reply('Использование: /invite @username LEVEL\n\nУровни: BASE, BRO, PRO');
        return;
      }

      const username = args[1].replace('@', '');
      const level = args[2].toUpperCase() as UserLevel;

      if (!Object.values(UserLevel).includes(level)) {
        await ctx.reply('Неверный уровень. Доступные: BASE, BRO, PRO');
        return;
      }

      // TODO: Find user by username and create invite link
      const inviteLink = await db.createInviteLink(level, undefined, undefined, 1);
      
      await ctx.reply(`🔗 Создана ссылка-приглашение для @${username} (${level}):\n\n${inviteLink.link}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 Скопировать ссылку', url: `https://t.me/share/url?url=${inviteLink.link}` }]
          ]
        }
      });

      logger.info(`Admin ${ctx.from!.id} created invite for @${username} (${level})`);
    } catch (error) {
      logger.error('Invite command error:', error);
      await ctx.reply('Произошла ошибка при создании приглашения.');
    }
  },

  async approve(ctx: Context) {
    try {
      if (!isAdmin(ctx.from!.id)) {
        await ctx.reply('❌ У вас нет прав администратора');
        return;
      }

      const message = ctx.message;
      if (!('text' in message!)) {
        await ctx.reply('Использование: /approve <subscription_id>');
        return;
      }

      const subscriptionId = message.text.replace('/approve ', '');
      if (!subscriptionId) {
        await ctx.reply('Использование: /approve <subscription_id>');
        return;
      }

      // TODO: Implement approval logic
      await ctx.reply(`✅ Подписка ${subscriptionId} подтверждена`);

      logger.info(`Admin ${ctx.from!.id} approved subscription: ${subscriptionId}`);
    } catch (error) {
      logger.error('Approve command error:', error);
      await ctx.reply('Произошла ошибка при подтверждении подписки.');
    }
  },

  async revoke(ctx: Context) {
    try {
      if (!isAdmin(ctx.from!.id)) {
        await ctx.reply('❌ У вас нет прав администратора');
        return;
      }

      const message = ctx.message;
      if (!('text' in message!)) {
        await ctx.reply('Использование: /revoke @username');
        return;
      }

      const username = message.text.replace('/revoke ', '').replace('@', '');
      if (!username) {
        await ctx.reply('Использование: /revoke @username');
        return;
      }

      // TODO: Implement revoke logic
      await ctx.reply(`🚫 Доступ для @${username} отозван`);

      logger.info(`Admin ${ctx.from!.id} revoked access for @${username}`);
    } catch (error) {
      logger.error('Revoke command error:', error);
      await ctx.reply('Произошла ошибка при отзыве доступа.');
    }
  },

  async stats(ctx: Context) {
    try {
      if (!isAdmin(ctx.from!.id)) {
        await ctx.reply('❌ У вас нет прав администратора');
        return;
      }

      const analytics = await db.getUserAnalytics();
      
      const statsMessage = `📊 **Статистика бота**

👥 **Пользователи:**
• Всего: ${analytics.totalUsers}
• Активных (30 дней): ${analytics.activeUsers}
• Новых сегодня: ${analytics.newUsersToday}

📈 **По уровням:**
• FREE: ${analytics.levelCounts[UserLevel.FREE] || 0}
• BASE: ${analytics.levelCounts[UserLevel.BASE] || 0}
• BRO: ${analytics.levelCounts[UserLevel.BRO] || 0}
• PRO: ${analytics.levelCounts[UserLevel.PRO] || 0}

🕐 Обновлено: ${new Date().toLocaleString('ru-RU')}`;

      await ctx.reply(statsMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Обновить', callback_data: 'refresh_stats' }]
          ]
        }
      });

      logger.info(`Admin ${ctx.from!.id} requested stats`);
    } catch (error) {
      logger.error('Stats command error:', error);
      await ctx.reply('Произошла ошибка при получении статистики.');
    }
  }
};

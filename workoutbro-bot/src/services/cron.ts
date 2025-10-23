import { CronJob } from 'cron';
import { botConfig } from '../config';
import { db } from '../services/database';
import { logger } from '../utils/logger';
import { UserLevel } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupCronJobs() {
  // Check for expiring subscriptions (daily at 10:00)
  new CronJob('0 10 * * *', async () => {
    try {
      await checkExpiringSubscriptions();
    } catch (error) {
      logger.error('Cron job error (expiring subscriptions):', error);
    }
  }, null, true, 'Europe/Moscow');

  // Check for expired subscriptions (daily at 11:00)
  new CronJob('0 11 * * *', async () => {
    try {
      await checkExpiredSubscriptions();
    } catch (error) {
      logger.error('Cron job error (expired subscriptions):', error);
    }
  }, null, true, 'Europe/Moscow');

  // Send onboarding messages (daily at 12:00)
  new CronJob('0 12 * * *', async () => {
    try {
      await sendOnboardingMessages();
    } catch (error) {
      logger.error('Cron job error (onboarding):', error);
    }
  }, null, true, 'Europe/Moscow');

  logger.info('Cron jobs initialized');
}

async function checkExpiringSubscriptions() {
  const expiringUsers = await db.getExpiringUsers(botConfig.retentionDaysBeforeExpire);
  
  for (const user of expiringUsers) {
    try {
      const daysLeft = Math.ceil((user.expiresAt!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      const message = `⏰ **Напоминание об окончании доступа**

Твой доступ истекает ${user.expiresAt!.toLocaleDateString('ru-RU')}

Осталось дней: ${daysLeft}

Хочешь продлить по стартовой цене? Нажми: Остаться за 350 ₽`;

      await sendMessageToUser(Number(user.telegramId), message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Остаться за 350 ₽', callback_data: 'retention_accept' }],
            [{ text: '❌ Отказаться', callback_data: 'retention_decline' }]
          ]
        }
      });

      await db.logUserAction(user.id, 'expiry_reminder_sent', user.level, { daysLeft });
      
    } catch (error) {
      logger.error(`Error sending expiry reminder to user ${user.id}:`, error);
    }
  }

  logger.info(`Sent expiry reminders to ${expiringUsers.length} users`);
}

async function checkExpiredSubscriptions() {
  const expiredUsers = await db.getExpiredUsers();
  
  for (const user of expiredUsers) {
    try {
      // Update user level to FREE
      await db.updateUserLevel(user.id, UserLevel.FREE);
      
      const message = `😢 **Доступ истек**

Твой доступ к WorkoutBro Club истек.

Вернуться в клуб со скидкой 30%? Нажми: Вернуться`;

      await sendMessageToUser(Number(user.telegramId), message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎁 Вернуться со скидкой', callback_data: 'retention_offer' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_main' }]
          ]
        }
      });

      await db.logUserAction(user.id, 'subscription_expired', UserLevel.FREE);
      
    } catch (error) {
      logger.error(`Error handling expired subscription for user ${user.id}:`, error);
    }
  }

  logger.info(`Processed ${expiredUsers.length} expired subscriptions`);
}

async function sendOnboardingMessages() {
  // Get users who joined in the last 7 days and haven't received onboarding
  const recentUsers = await db.getRecentUsers(7);
  
  for (const user of recentUsers) {
    try {
      const daysSinceJoin = Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      let message = '';
      let shouldSend = false;

      if (daysSinceJoin === 1) {
        message = `🎉 **Добро пожаловать в WorkoutBro!**

Как использовать бота:
• /materials — доступ к программам и гайдам
• /status — проверить свой уровень
• /support — помощь и поддержка

Начни с раздела "Программы" в /materials!`;
        shouldSend = true;
      } else if (daysSinceJoin === 3) {
        message = `💡 **Совет дня**

Знаешь что такое RPE (Rate of Perceived Exertion)?

Это шкала от 1 до 10 для оценки интенсивности тренировки:
• 1-3: Очень легко
• 4-6: Умеренно
• 7-8: Тяжело
• 9-10: Максимально

Используй RPE для контроля нагрузки!`;
        shouldSend = true;
      } else if (daysSinceJoin === 7) {
        message = `🚀 **Неделя с WorkoutBro!**

Как дела с тренировками? Есть вопросы?

• Задай вопрос в /support
• Изучи новые материалы в /materials
• Апгрейднись до BRO для общения с единомышленниками

Продолжай в том же духе! 💪`;
        shouldSend = true;
      }

      if (shouldSend) {
        await sendMessageToUser(user.telegramId, message);
        await db.logUserAction(user.id, 'onboarding_sent', user.level, { day: daysSinceJoin });
      }
      
    } catch (error) {
      logger.error(`Error sending onboarding to user ${user.id}:`, error);
    }
  }

  logger.info(`Sent onboarding messages to recent users`);
}

async function sendMessageToUser(telegramId: number, text: string, options?: any) {
  try {
    // TODO: Implement actual message sending using bot instance
    // This is a placeholder - in real implementation, you'd need access to bot instance
    logger.info(`Would send message to ${telegramId}: ${text}`);
  } catch (error) {
    logger.error(`Error sending message to user ${telegramId}:`, error);
  }
}

// Add this method to DatabaseService
declare module './database' {
  interface DatabaseService {
    getRecentUsers(days: number): Promise<any[]>;
  }
}

// Extend DatabaseService with getRecentUsers method
import { DatabaseService } from './database';

DatabaseService.prototype.getRecentUsers = async function(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return await prisma.user.findMany({
    where: {
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

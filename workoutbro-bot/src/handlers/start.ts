import { Context } from 'telegraf';
import { TEXTS, KEYBOARDS } from '../config';
import { db } from '../services/database';
import { logger } from '../utils/logger';

export async function startHandler(ctx: Context) {
  try {
    const user = await db.getUserByTelegramId(ctx.from!.id);
    
    if (!user) {
      logger.error('User not found after middleware');
      return;
    }

    // Log the start action
    await db.logUserAction(user.id, 'start_command', user.level, {
      startPayload: (ctx as any).startPayload,
      timestamp: new Date(),
    });

    // Send welcome message with main menu
    await ctx.reply(TEXTS.WELCOME, {
      reply_markup: KEYBOARDS.MAIN_MENU,
      parse_mode: 'Markdown',
    });

    logger.info(`User ${user.id} started the bot`);
  } catch (error) {
    logger.error('Start handler error:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

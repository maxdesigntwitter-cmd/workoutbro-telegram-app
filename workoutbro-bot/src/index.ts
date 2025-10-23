import { Telegraf, Context } from 'telegraf';
import { botConfig } from './config';
import { db } from './services/database';
import { logger } from './utils/logger';
import { startHandler } from './handlers/start';
import { callbackHandler } from './handlers/callback';
import { commandHandler } from './handlers/commands';
import { adminHandler } from './handlers/admin';
import { tributeWebhookHandler } from './handlers/webhooks';
import { setupCronJobs } from './services/cron';

const bot = new Telegraf(botConfig.botToken);

// Middleware
bot.use(async (ctx, next) => {
  try {
    // Log user activity
    if (ctx.from) {
      await db.createOrUpdateUser(ctx.from.id, {
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        source: (ctx as any).startPayload,
      });
    }
    
    await next();
  } catch (error) {
    logger.error('Middleware error:', error);
  }
});

// Error handling
bot.catch((err, ctx) => {
  logger.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь в поддержку /support');
});

// Handlers
bot.start(startHandler);
bot.on('callback_query', callbackHandler);
bot.command('club', commandHandler.club);
bot.command('upgrade', commandHandler.upgrade);
bot.command('materials', commandHandler.materials);
bot.command('status', commandHandler.status);
bot.command('support', commandHandler.support);

// Admin commands
bot.command('broadcast', adminHandler.broadcast);
bot.command('invite', adminHandler.invite);
bot.command('approve', adminHandler.approve);
bot.command('revoke', adminHandler.revoke);
bot.command('stats', adminHandler.stats);

// Webhook for Tribute
if (botConfig.webhookUrl) {
  bot.telegram.setWebhook(`${botConfig.webhookUrl}/webhook`);
  
  // Express server for webhooks
  const express = require('express');
  const app = express();
  
  app.use(express.json());
  
  app.post('/webhook', (req: any, res: any) => {
    if (req.body.message) {
      bot.handleUpdate(req.body);
    } else if (req.body.tribute) {
      tributeWebhookHandler(req.body);
    }
    res.status(200).send('OK');
  });
  
  app.listen(process.env.PORT || 3000, () => {
    logger.info('Webhook server started');
  });
} else {
  // Polling mode for development
  bot.launch();
  logger.info('Bot started in polling mode');
}

// Setup cron jobs
setupCronJobs();

// Graceful shutdown
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  db.disconnect();
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  db.disconnect();
});

logger.info('WorkoutBro Bot started successfully!');

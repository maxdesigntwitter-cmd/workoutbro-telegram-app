import { TributeWebhookData } from '../types';
import { db } from '../services/database';
import { logger } from '../utils/logger';
import { UserLevel, SubscriptionStatus } from '../types';

export async function tributeWebhookHandler(data: TributeWebhookData) {
  try {
    logger.info('Received Tribute webhook:', data);

    // TODO: Verify webhook signature for security
    
    const { subscription_id, user_id, status, level, start_date, end_date } = data;
    
    // Find user by external ID or other identifier
    // This depends on how Tribute sends user identification
    const user = await db.getUserByTelegramId(parseInt(user_id));
    
    if (!user) {
      logger.error(`User not found for Tribute ID: ${user_id}`);
      return;
    }

    const levelMap: Record<string, UserLevel> = {
      'base': UserLevel.BASE,
      'bro': UserLevel.BRO,
      'pro': UserLevel.PRO,
    };

    const subscriptionLevel = levelMap[level.toLowerCase()];
    if (!subscriptionLevel) {
      logger.error(`Unknown subscription level: ${level}`);
      return;
    }

    const statusMap: Record<string, SubscriptionStatus> = {
      'active': SubscriptionStatus.ACTIVE,
      'cancelled': SubscriptionStatus.CANCELLED,
      'expired': SubscriptionStatus.EXPIRED,
    };

    const subscriptionStatus = statusMap[status] || SubscriptionStatus.PENDING;

    // Create or update subscription
    await db.createSubscription({
      userId: user.id,
      level: subscriptionLevel,
      tributeId: subscription_id,
      amount: data.amount,
      currency: data.currency,
      startDate: new Date(start_date),
      endDate: new Date(end_date),
    });

    // Update user level if subscription is active
    if (subscriptionStatus === SubscriptionStatus.ACTIVE) {
      await db.updateUserLevel(user.id, subscriptionLevel, new Date(end_date));
      
      // Create invite link for the user
      const inviteLink = await db.createInviteLink(subscriptionLevel, user.id);
      
      // Log the action
      await db.logUserAction(user.id, 'subscription_activated', subscriptionLevel, {
        tributeId: subscription_id,
        inviteLink: inviteLink.link,
      });

      logger.info(`User ${user.id} subscription activated: ${subscriptionLevel}`);
    } else if (subscriptionStatus === SubscriptionStatus.EXPIRED || subscriptionStatus === SubscriptionStatus.CANCELLED) {
      // Handle subscription cancellation/expiration
      await db.updateUserLevel(user.id, UserLevel.FREE);
      
      await db.logUserAction(user.id, 'subscription_expired', UserLevel.FREE, {
        tributeId: subscription_id,
        reason: status,
      });

      logger.info(`User ${user.id} subscription ${status}: ${subscriptionLevel}`);
    }

  } catch (error) {
    logger.error('Tribute webhook error:', error);
  }
}

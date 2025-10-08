import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/database';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TelegramUser;
  userId?: number;
}

export const telegramAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      return res.status(401).json({
        success: false,
        message: 'Telegram init data is required'
      });
    }

    // Verify Telegram WebApp data
    const isValid = verifyTelegramWebAppData(initData);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Telegram data'
      });
    }

    // Parse user data
    const userData = parseTelegramInitData(initData);
    
    if (!userData.user) {
      return res.status(401).json({
        success: false,
        message: 'User data not found'
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegram_id: BigInt(userData.user.id) }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegram_id: BigInt(userData.user.id),
          username: userData.user.username || `user_${userData.user.id}`,
          first_name: userData.user.first_name,
          last_name: userData.user.last_name
        }
      });
    }

    // Add user to request
    req.user = userData.user;
    req.userId = user.id;

    return next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const optionalTelegramAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (initData) {
      const isValid = verifyTelegramWebAppData(initData);
      
      if (isValid) {
        const userData = parseTelegramInitData(initData);
        
        if (userData.user) {
          let user = await prisma.user.findUnique({
            where: { telegram_id: BigInt(userData.user.id) }
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                telegram_id: BigInt(userData.user.id),
                username: userData.user.username || `user_${userData.user.id}`,
                first_name: userData.user.first_name,
                last_name: userData.user.last_name
              }
            });
          }

          req.user = userData.user;
          req.userId = user.id;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional telegram auth error:', error);
    next(); // Continue without authentication
  }
};

function verifyTelegramWebAppData(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) return false;

    // Remove hash from params
    urlParams.delete('hash');
    
    // Sort parameters
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN || '')
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return false;
  }
}

function parseTelegramInitData(initData: string): { user?: TelegramUser; auth_date?: number; hash?: string } {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      return {
        user,
        auth_date: parseInt(urlParams.get('auth_date') || '0'),
        hash: urlParams.get('hash') || undefined
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error parsing Telegram init data:', error);
    return {};
  }
}

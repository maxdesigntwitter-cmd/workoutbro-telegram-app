import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/telegramAuth';

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { telegram_id, username } = req.body;

  if (!telegram_id || !username) {
    throw createError('Telegram ID and username are required', 400);
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { telegram_id: BigInt(telegram_id) }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegram_id: BigInt(telegram_id),
        username,
        first_name: req.user?.first_name,
        last_name: req.user?.last_name
      }
    });
  } else {
    // Update user info if needed
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        first_name: req.user?.first_name,
        last_name: req.user?.last_name
      }
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      telegram_id: user.telegram_id.toString(),
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      created_at: user.created_at
    },
    message: 'User authenticated successfully'
  });
});

export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: {
      user_workouts: {
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          workout: {
            include: {
              program: true
            }
          }
        }
      },
      measurements: {
        take: 5,
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Calculate stats
  const totalWorkouts = await prisma.userWorkout.count({
    where: { user_id: req.userId }
  });

  const totalVolume = await prisma.userWorkout.aggregate({
    where: { user_id: req.userId },
    _sum: { total_volume: true }
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        telegram_id: user.telegram_id.toString(),
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at
      },
      stats: {
        total_workouts: totalWorkouts,
        total_volume: totalVolume._sum.total_volume || 0,
        recent_workouts: user.user_workouts,
        recent_measurements: user.measurements
      }
    }
  });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const { username, first_name, last_name } = req.body;

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...(username && { username }),
      ...(first_name && { first_name }),
      ...(last_name && { last_name })
    }
  });

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      telegram_id: user.telegram_id.toString(),
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      updated_at: user.updated_at
    },
    message: 'Profile updated successfully'
  });
});

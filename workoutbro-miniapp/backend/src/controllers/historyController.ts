import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/telegramAuth';

export const getHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Verify user ID matches authenticated user
  if (parseInt(userId) !== req.userId) {
    throw createError('Unauthorized access to user data', 403);
  }

  const [userWorkouts, total] = await Promise.all([
    prisma.userWorkout.findMany({
      where: { user_id: req.userId },
      include: {
        workout: {
          include: {
            program: true
          }
        }
      },
      orderBy: { start_time: 'desc' },
      skip,
      take: limit
    }),
    prisma.userWorkout.count({
      where: { user_id: req.userId }
    })
  ]);

  res.status(200).json({
    success: true,
    data: {
      data: userWorkouts.map(workout => ({
        id: workout.id,
        user_id: workout.user_id,
        workout_id: workout.workout_id,
        start_time: workout.start_time,
        end_time: workout.end_time,
        total_volume: workout.total_volume,
        completed_exercises: workout.completed_exercises,
        workout: {
          id: workout.workout.id,
          day_name: workout.workout.day_name,
          program: {
            id: workout.workout.program.id,
            title: workout.workout.program.title,
            goal: workout.workout.program.goal
          }
        }
      })),
      total,
      page,
      limit,
      hasMore: skip + limit < total
    }
  });
});

export const getWorkoutStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const { userId } = req.params;

  // Verify user ID matches authenticated user
  if (parseInt(userId) !== req.userId) {
    throw createError('Unauthorized access to user data', 403);
  }

  const [
    totalWorkouts,
    totalVolume,
    totalExercises,
    avgWorkoutDuration,
    recentWorkouts,
    weeklyStats
  ] = await Promise.all([
    prisma.userWorkout.count({
      where: { user_id: req.userId }
    }),
    prisma.userWorkout.aggregate({
      where: { user_id: req.userId },
      _sum: { total_volume: true }
    }),
    prisma.userWorkout.aggregate({
      where: { user_id: req.userId },
      _sum: { completed_exercises: true }
    }),
    prisma.userWorkout.findMany({
      where: { 
        user_id: req.userId,
        end_time: { not: null }
      },
      select: {
        start_time: true,
        end_time: true
      }
    }),
    prisma.userWorkout.findMany({
      where: { user_id: req.userId },
      include: {
        workout: {
          include: {
            program: true
          }
        }
      },
      orderBy: { start_time: 'desc' },
      take: 5
    }),
    prisma.userWorkout.groupBy({
      by: ['start_time'],
      where: {
        user_id: req.userId,
        start_time: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      _count: { id: true },
      _sum: { total_volume: true }
    })
  ]);

  // Calculate average workout duration
  const durations = recentWorkouts
    .filter(w => w.end_time)
    .map(w => w.end_time!.getTime() - w.start_time.getTime());
  
  const avgDuration = durations.length > 0 
    ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      total_workouts: totalWorkouts,
      total_volume: totalVolume._sum.total_volume || 0,
      total_exercises: totalExercises._sum.completed_exercises || 0,
      avg_workout_duration_minutes: Math.round(avgDuration / (1000 * 60)),
      recent_workouts: recentWorkouts.map(workout => ({
        id: workout.id,
        start_time: workout.start_time,
        end_time: workout.end_time,
        total_volume: workout.total_volume,
        completed_exercises: workout.completed_exercises,
        workout: {
          day_name: workout.workout.day_name,
          program: {
            title: workout.workout.program.title
          }
        }
      })),
      weekly_stats: {
        workouts_this_week: weeklyStats.length,
        volume_this_week: weeklyStats.reduce((sum, stat) => sum + Number(stat._sum.total_volume || 0), 0)
      }
    }
  });
});

export const getWorkoutDetail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Valid workout ID is required', 400);
  }

  const userWorkout = await prisma.userWorkout.findFirst({
    where: { 
      id: parseInt(id),
      user_id: req.userId
    },
    include: {
      workout: {
        include: {
          program: true,
          exercises: {
            orderBy: { order_index: 'asc' }
          }
        }
      }
    }
  });

  if (!userWorkout) {
    throw createError('Workout not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: userWorkout.id,
      user_id: userWorkout.user_id,
      workout_id: userWorkout.workout_id,
      start_time: userWorkout.start_time,
      end_time: userWorkout.end_time,
      total_volume: userWorkout.total_volume,
      completed_exercises: userWorkout.completed_exercises,
      exercises_data: userWorkout.exercises_data,
      workout: {
        id: userWorkout.workout.id,
        day_name: userWorkout.workout.day_name,
        program: userWorkout.workout.program,
        exercises: userWorkout.workout.exercises.map(exercise => ({
          id: exercise.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          rest_time: exercise.rest_time,
          muscle_group: exercise.muscle_group,
          order_index: exercise.order_index
        }))
      }
    }
  });
});

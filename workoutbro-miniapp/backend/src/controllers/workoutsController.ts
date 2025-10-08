import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/telegramAuth';

export const getWorkouts = asyncHandler(async (req: Request, res: Response) => {
  const { programId } = req.params;

  if (!programId || isNaN(parseInt(programId))) {
    throw createError('Valid program ID is required', 400);
  }

  const workouts = await prisma.workout.findMany({
    where: { program_id: parseInt(programId) },
    include: {
      exercises: {
        orderBy: { order_index: 'asc' }
      }
    },
    orderBy: { order_index: 'asc' }
  });

  res.status(200).json({
    success: true,
    data: workouts.map(workout => ({
      id: workout.id,
      program_id: workout.program_id,
      day_name: workout.day_name,
      order_index: workout.order_index,
      exercises_count: workout.exercises.length,
      exercises: workout.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
        rest_time: exercise.rest_time,
        muscle_group: exercise.muscle_group,
        order_index: exercise.order_index
      }))
    }))
  });
});

export const getExercises = asyncHandler(async (req: Request, res: Response) => {
  const { workoutId } = req.params;

  if (!workoutId || isNaN(parseInt(workoutId))) {
    throw createError('Valid workout ID is required', 400);
  }

  const exercises = await prisma.exercise.findMany({
    where: { workout_id: parseInt(workoutId) },
    orderBy: { order_index: 'asc' }
  });

  res.status(200).json({
    success: true,
    data: exercises.map(exercise => ({
      id: exercise.id,
      workout_id: exercise.workout_id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      rest_time: exercise.rest_time,
      muscle_group: exercise.muscle_group,
      order_index: exercise.order_index
    }))
  });
});

export const startWorkout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const { user_id, workout_id } = req.body;

  if (!workout_id || isNaN(parseInt(workout_id))) {
    throw createError('Valid workout ID is required', 400);
  }

  // Verify workout exists
  const workout = await prisma.workout.findUnique({
    where: { id: parseInt(workout_id) }
  });

  if (!workout) {
    throw createError('Workout not found', 404);
  }

  // Create user workout session
  const userWorkout = await prisma.userWorkout.create({
    data: {
      user_id: req.userId,
      workout_id: parseInt(workout_id),
      start_time: new Date()
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

  res.status(201).json({
    success: true,
    data: {
      id: userWorkout.id,
      user_id: userWorkout.user_id,
      workout_id: userWorkout.workout_id,
      start_time: userWorkout.start_time,
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
    },
    message: 'Workout started successfully'
  });
});

export const finishWorkout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const { 
    user_workout_id, 
    total_volume, 
    completed_exercises, 
    exercises_data 
  } = req.body;

  if (!user_workout_id || isNaN(parseInt(user_workout_id))) {
    throw createError('Valid user workout ID is required', 400);
  }

  // Verify user workout exists and belongs to user
  const userWorkout = await prisma.userWorkout.findFirst({
    where: { 
      id: parseInt(user_workout_id),
      user_id: req.userId
    }
  });

  if (!userWorkout) {
    throw createError('Workout session not found', 404);
  }

  // Update user workout
  const updatedUserWorkout = await prisma.userWorkout.update({
    where: { id: parseInt(user_workout_id) },
    data: {
      end_time: new Date(),
      total_volume: total_volume || 0,
      completed_exercises: completed_exercises || 0,
      exercises_data: exercises_data || null
    },
    include: {
      workout: {
        include: {
          program: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      id: updatedUserWorkout.id,
      user_id: updatedUserWorkout.user_id,
      workout_id: updatedUserWorkout.workout_id,
      start_time: updatedUserWorkout.start_time,
      end_time: updatedUserWorkout.end_time,
      total_volume: updatedUserWorkout.total_volume,
      completed_exercises: updatedUserWorkout.completed_exercises,
      workout: {
        id: updatedUserWorkout.workout.id,
        day_name: updatedUserWorkout.workout.day_name,
        program: updatedUserWorkout.workout.program
      }
    },
    message: 'Workout finished successfully'
  });
});

export const getWorkoutSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Valid workout ID is required', 400);
  }

  const workout = await prisma.workout.findUnique({
    where: { id: parseInt(id) },
    include: {
      program: true,
      exercises: {
        orderBy: { order_index: 'asc' }
      }
    }
  });

  if (!workout) {
    throw createError('Workout not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      workout_id: workout.id,
      day_name: workout.day_name,
      program: workout.program,
      exercises: workout.exercises.map(exercise => ({
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
  });
});

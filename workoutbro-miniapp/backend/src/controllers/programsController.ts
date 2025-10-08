import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';

export const getPrograms = asyncHandler(async (req: Request, res: Response) => {
  const programs = await prisma.program.findMany({
    include: {
      workouts: {
        include: {
          exercises: true
        }
      }
    },
    orderBy: { created_at: 'asc' }
  });

  res.status(200).json({
    success: true,
    data: programs.map(program => ({
      id: program.id,
      title: program.title,
      description: program.description,
      goal: program.goal,
      duration_days: program.duration_days,
      image_url: program.image_url,
      workouts_count: program.workouts.length,
      total_exercises: program.workouts.reduce((total, workout) => total + workout.exercises.length, 0)
    }))
  });
});

export const getProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Valid program ID is required', 400);
  }

  const program = await prisma.program.findUnique({
    where: { id: parseInt(id) },
    include: {
      workouts: {
        include: {
          exercises: {
            orderBy: { order_index: 'asc' }
          }
        },
        orderBy: { order_index: 'asc' }
      }
    }
  });

  if (!program) {
    throw createError('Program not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      id: program.id,
      title: program.title,
      description: program.description,
      goal: program.goal,
      duration_days: program.duration_days,
      image_url: program.image_url,
      workouts: program.workouts.map(workout => ({
        id: workout.id,
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
    }
  });
});

export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, goal, duration_days, image_url, workouts } = req.body;

  if (!title || !description || !goal || !duration_days) {
    throw createError('Title, description, goal, and duration_days are required', 400);
  }

  const program = await prisma.program.create({
    data: {
      title,
      description,
      goal,
      duration_days,
      image_url,
      workouts: workouts ? {
        create: workouts.map((workout: any) => ({
          day_name: workout.day_name,
          order_index: workout.order_index,
          exercises: {
            create: workout.exercises?.map((exercise: any) => ({
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              rest_time: exercise.rest_time,
              muscle_group: exercise.muscle_group,
              order_index: exercise.order_index
            })) || []
          }
        }))
      } : undefined
    },
    include: {
      workouts: {
        include: {
          exercises: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: program,
    message: 'Program created successfully'
  });
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, goal, duration_days, image_url } = req.body;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Valid program ID is required', 400);
  }

  const program = await prisma.program.update({
    where: { id: parseInt(id) },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(goal && { goal }),
      ...(duration_days && { duration_days }),
      ...(image_url !== undefined && { image_url })
    }
  });

  res.status(200).json({
    success: true,
    data: program,
    message: 'Program updated successfully'
  });
});

export const deleteProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Valid program ID is required', 400);
  }

  await prisma.program.delete({
    where: { id: parseInt(id) }
  });

  res.status(200).json({
    success: true,
    message: 'Program deleted successfully'
  });
});

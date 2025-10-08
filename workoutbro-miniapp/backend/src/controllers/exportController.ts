import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/telegramAuth';

export const exportData = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.userId) {
    throw createError('User not authenticated', 401);
  }

  const { userId } = req.params;
  const format = req.query.format as string || 'csv';

  // Verify user ID matches authenticated user
  if (parseInt(userId) !== req.userId) {
    throw createError('Unauthorized access to user data', 403);
  }

  if (!['csv', 'pdf'].includes(format)) {
    throw createError('Invalid format. Supported formats: csv, pdf', 400);
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Get all user workouts
  const userWorkouts = await prisma.userWorkout.findMany({
    where: { user_id: req.userId },
    include: {
      workout: {
        include: {
          program: true,
          exercises: true
        }
      }
    },
    orderBy: { start_time: 'desc' }
  });

  // Get user measurements
  const measurements = await prisma.measurement.findMany({
    where: { user_id: req.userId },
    orderBy: { date: 'desc' }
  });

  if (format === 'csv') {
    await exportToCSV(res, user, userWorkouts, measurements);
  } else if (format === 'pdf') {
    // PDF export temporarily disabled
    throw createError('PDF export temporarily unavailable', 501);
  }
});

async function exportToCSV(
  res: Response, 
  user: any, 
  userWorkouts: any[], 
  measurements: any[]
) {
  // Create simple CSV manually
  const workoutHeaders = 'date,program,day,start_time,end_time,duration_minutes,total_volume,completed_exercises';
  const measurementHeaders = 'date,weight,body_fat,muscle,notes';
  
  const workoutRows = userWorkouts.map(workout => {
    const duration = workout.end_time 
      ? Math.round((workout.end_time.getTime() - workout.start_time.getTime()) / (1000 * 60))
      : 0;
    
    return [
      workout.start_time.toISOString().split('T')[0],
      `"${workout.workout.program.title}"`,
      `"${workout.workout.day_name}"`,
      workout.start_time.toISOString(),
      workout.end_time?.toISOString() || '',
      duration,
      workout.total_volume.toString(),
      workout.completed_exercises
    ].join(',');
  });

  const measurementRows = measurements.map(measurement => [
    measurement.date.toISOString().split('T')[0],
    measurement.weight.toString(),
    measurement.body_fat?.toString() || '',
    measurement.muscle?.toString() || '',
    `"${measurement.notes || ''}"`
  ].join(','));

  const csv = [
    `# WorkoutBro Export - ${user.username}`,
    `# Generated on: ${new Date().toISOString()}`,
    '',
    '# WORKOUTS',
    workoutHeaders,
    ...workoutRows,
    '',
    '# MEASUREMENTS',
    measurementHeaders,
    ...measurementRows
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="workoutbro-export-${user.username}-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
}


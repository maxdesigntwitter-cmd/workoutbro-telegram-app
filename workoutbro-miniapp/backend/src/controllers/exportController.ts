import { Request, Response } from 'express';
// @ts-ignore
import { Parser } from 'json2csv';
import puppeteer from 'puppeteer';
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
    await exportToPDF(res, user, userWorkouts, measurements);
  }
});

async function exportToCSV(
  res: Response, 
  user: any, 
  userWorkouts: any[], 
  measurements: any[]
) {
  // Prepare workout data for CSV
  const workoutData = userWorkouts.map(workout => ({
    date: workout.start_time.toISOString().split('T')[0],
    program: workout.workout.program.title,
    day: workout.workout.day_name,
    start_time: workout.start_time.toISOString(),
    end_time: workout.end_time?.toISOString() || '',
    duration_minutes: workout.end_time 
      ? Math.round((workout.end_time.getTime() - workout.start_time.getTime()) / (1000 * 60))
      : 0,
    total_volume: workout.total_volume.toString(),
    completed_exercises: workout.completed_exercises,
    exercises_data: JSON.stringify(workout.exercises_data)
  }));

  // Prepare measurement data for CSV
  const measurementData = measurements.map(measurement => ({
    date: measurement.date.toISOString().split('T')[0],
    weight: measurement.weight.toString(),
    body_fat: measurement.body_fat?.toString() || '',
    muscle: measurement.muscle?.toString() || '',
    notes: measurement.notes || ''
  }));

  // Create CSV files
  const workoutParser = new Parser({
    fields: [
      'date', 'program', 'day', 'start_time', 'end_time', 
      'duration_minutes', 'total_volume', 'completed_exercises', 'exercises_data'
    ]
  });

  const measurementParser = new Parser({
    fields: ['date', 'weight', 'body_fat', 'muscle', 'notes']
  });

  const workoutCSV = workoutParser.parse(workoutData);
  const measurementCSV = measurementParser.parse(measurementData);

  // Combine CSVs
  const combinedCSV = `# WorkoutBro Export - ${user.username}\n# Generated on: ${new Date().toISOString()}\n\n# WORKOUTS\n${workoutCSV}\n\n# MEASUREMENTS\n${measurementCSV}`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="workoutbro-export-${user.username}-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(combinedCSV);
}

async function exportToPDF(
  res: Response, 
  user: any, 
  userWorkouts: any[], 
  measurements: any[]
) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Generate HTML content
    const html = generatePDFHTML(user, userWorkouts, measurements);
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="workoutbro-export-${user.username}-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdf);
  } finally {
    await browser.close();
  }
}

function generatePDFHTML(user: any, userWorkouts: any[], measurements: any[]): string {
  const totalWorkouts = userWorkouts.length;
  const totalVolume = userWorkouts.reduce((sum, w) => sum + Number(w.total_volume), 0);
  const totalExercises = userWorkouts.reduce((sum, w) => sum + w.completed_exercises, 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>WorkoutBro Export - ${user.username}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .header h1 { color: #3B82F6; margin: 0; }
        .header p { margin: 5px 0; color: #666; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .stat { text-align: center; }
        .stat h3 { margin: 0; color: #3B82F6; }
        .stat p { margin: 5px 0; color: #666; }
        .section { margin: 30px 0; }
        .section h2 { color: #3B82F6; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #3B82F6; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>WorkoutBro Export</h1>
        <p>User: ${user.username} (${user.first_name} ${user.last_name || ''})</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="stats">
        <div class="stat">
          <h3>${totalWorkouts}</h3>
          <p>Total Workouts</p>
        </div>
        <div class="stat">
          <h3>${totalVolume.toLocaleString()}</h3>
          <p>Total Volume (kg)</p>
        </div>
        <div class="stat">
          <h3>${totalExercises}</h3>
          <p>Total Exercises</p>
        </div>
      </div>

      <div class="section">
        <h2>Workout History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Program</th>
              <th>Day</th>
              <th>Duration</th>
              <th>Volume</th>
              <th>Exercises</th>
            </tr>
          </thead>
          <tbody>
            ${userWorkouts.map(workout => `
              <tr>
                <td>${workout.start_time.toLocaleDateString()}</td>
                <td>${workout.workout.program.title}</td>
                <td>${workout.workout.day_name}</td>
                <td>${workout.end_time ? Math.round((workout.end_time.getTime() - workout.start_time.getTime()) / (1000 * 60)) : 0} min</td>
                <td>${workout.total_volume} kg</td>
                <td>${workout.completed_exercises}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${measurements.length > 0 ? `
        <div class="section">
          <h2>Measurements</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Body Fat</th>
                <th>Muscle</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${measurements.map(measurement => `
                <tr>
                  <td>${measurement.date.toLocaleDateString()}</td>
                  <td>${measurement.weight} kg</td>
                  <td>${measurement.body_fat ? measurement.body_fat + '%' : '-'}</td>
                  <td>${measurement.muscle ? measurement.muscle + ' kg' : '-'}</td>
                  <td>${measurement.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div class="footer">
        <p>Generated by WorkoutBro Telegram Mini App</p>
        <p>workoutbro.club</p>
      </div>
    </body>
    </html>
  `;
}

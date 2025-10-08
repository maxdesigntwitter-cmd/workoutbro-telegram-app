import { Router } from 'express';
import { 
  getWorkouts, 
  getExercises, 
  startWorkout, 
  finishWorkout,
  getWorkoutSession
} from '../controllers/workoutsController';
import { telegramAuth, optionalTelegramAuth } from '../middleware/telegramAuth';

const router = Router();

// Public routes
router.get('/:programId', optionalTelegramAuth, getWorkouts);
router.get('/:workoutId/exercises', optionalTelegramAuth, getExercises);
router.get('/session/:id', optionalTelegramAuth, getWorkoutSession);

// Protected routes
router.post('/start', telegramAuth, startWorkout);
router.post('/finish', telegramAuth, finishWorkout);

export default router;

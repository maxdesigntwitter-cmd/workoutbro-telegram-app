import { Router } from 'express';
import { 
  getHistory, 
  getWorkoutStats, 
  getWorkoutDetail 
} from '../controllers/historyController';
import { telegramAuth } from '../middleware/telegramAuth';

const router = Router();

// Protected routes
router.get('/:userId', telegramAuth, getHistory);
router.get('/:userId/stats', telegramAuth, getWorkoutStats);
router.get('/workout/:id', telegramAuth, getWorkoutDetail);

export default router;

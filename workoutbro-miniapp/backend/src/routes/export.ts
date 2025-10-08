import { Router } from 'express';
import { exportData } from '../controllers/exportController';
import { telegramAuth } from '../middleware/telegramAuth';

const router = Router();

// Protected routes
router.get('/:userId', telegramAuth, exportData);

export default router;

import { Router } from 'express';
import { login, getProfile, updateProfile } from '../controllers/authController';
import { telegramAuth, optionalTelegramAuth } from '../middleware/telegramAuth';

const router = Router();

// Public routes
router.post('/login', optionalTelegramAuth, login);

// Protected routes
router.get('/profile', telegramAuth, getProfile);
router.put('/profile', telegramAuth, updateProfile);

export default router;

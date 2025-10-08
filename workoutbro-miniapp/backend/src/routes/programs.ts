import { Router } from 'express';
import { 
  getPrograms, 
  getProgram, 
  createProgram, 
  updateProgram, 
  deleteProgram 
} from '../controllers/programsController';
import { optionalTelegramAuth } from '../middleware/telegramAuth';

const router = Router();

// Public routes
router.get('/', optionalTelegramAuth, getPrograms);
router.get('/:id', optionalTelegramAuth, getProgram);

// Admin routes (in production, add admin authentication)
router.post('/', optionalTelegramAuth, createProgram);
router.put('/:id', optionalTelegramAuth, updateProgram);
router.delete('/:id', optionalTelegramAuth, deleteProgram);

export default router;

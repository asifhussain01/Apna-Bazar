import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Publicly accessible for shop details, phone, hours, delivery policy
router.get('/', getSettings);

// Admin only configuration update
router.put('/', authenticateUser, requireAdmin, updateSettings);

export default router;

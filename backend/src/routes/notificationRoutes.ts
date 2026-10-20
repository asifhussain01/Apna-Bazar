import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, getNotifications);
router.put('/:id/read', authenticateUser, markAsRead);
router.put('/read-all', authenticateUser, markAllAsRead);

export default router;

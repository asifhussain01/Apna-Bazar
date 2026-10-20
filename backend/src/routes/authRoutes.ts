import { Router } from 'express';
import {
  register,
  registerAdmin,
  login,
  guestSession,
  getProfile,
  updateLanguage,
  addAddress,
  registerPushToken,
  deleteAccount
} from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/register-admin', authLimiter, registerAdmin);
router.post('/login', authLimiter, login);
router.post('/guest', authLimiter, guestSession);
router.get('/profile', authenticateUser, getProfile);
router.put('/language', authenticateUser, updateLanguage);
router.post('/address', authenticateUser, addAddress);
router.post('/push-token', authenticateUser, registerPushToken);
router.delete('/account', authenticateUser, deleteAccount);

export default router;

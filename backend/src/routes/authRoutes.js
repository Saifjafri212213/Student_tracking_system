import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  changePassword, 
  updateHandles,
  updateProfile
} from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.put('/profile', authenticateJWT, updateProfile);
router.post('/profile', authenticateJWT, updateProfile);
router.post('/change-password', authenticateJWT, changePassword);

export default router;


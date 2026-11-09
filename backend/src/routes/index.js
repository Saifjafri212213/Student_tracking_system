import express from 'express';
import leaderboardRoutes from './leaderboardRoutes.js';
import doubtRoutes from './doubtRoutes.js';
import authRoutes from './authRoutes.js';
import syncRoutes from './syncRoutes.js';
import contestRoutes from './contestRoutes.js';
import { updateHandles } from '../controllers/authController.js';
import { isDbConnected } from '../config/db.js';
import { config } from '../config/config.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      engine: 'MongoDB Atlas',
      connected: isDbConnected()
    },
    schedules: config.cronSchedules
  });
});

// Mount modules
router.use('/leaderboard', leaderboardRoutes);
router.use('/doubts', doubtRoutes);
router.use('/auth', authRoutes);
router.use('/sync', syncRoutes);
router.use('/contests', contestRoutes);

// User handles update endpoint
router.post('/user/handles', updateHandles);

export default router;


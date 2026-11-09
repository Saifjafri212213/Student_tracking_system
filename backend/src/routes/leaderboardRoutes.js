import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';

const router = express.Router();

router.get('/:platform', getLeaderboard);

export default router;


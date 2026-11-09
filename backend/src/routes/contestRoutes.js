import { Router } from 'express';
import { contestController } from '../controllers/contestController.js';

const router = Router();

// GET /api/contests - Retrieve upcoming competitive programming contests
router.get('/', contestController.getUpcomingContests);

export default router;


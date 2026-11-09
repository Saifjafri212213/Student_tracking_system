import express from 'express';
import { triggerSync } from '../controllers/syncController.js';

const router = express.Router();

router.post('/trigger/:platform', triggerSync);

export default router;


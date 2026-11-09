import express from 'express';
import { 
  getDoubts, 
  createDoubt, 
  postAnswer, 
  upvoteDoubt, 
  toggleResolve 
} from '../controllers/doubtController.js';
import { optionalAuthenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoubts);
router.post('/', optionalAuthenticateJWT, createDoubt);
router.post('/:id/answers', optionalAuthenticateJWT, postAnswer);
router.post('/:id/upvote', upvoteDoubt);
router.post('/:id/resolve', toggleResolve);

export default router;


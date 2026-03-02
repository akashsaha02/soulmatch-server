import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import * as successStoriesController from './success-stories.controller';

const router = Router();

router.post('/success-stories', verifyToken, successStoriesController.create);
router.get('/success-stories', successStoriesController.getAll);

export default router;

import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../../middleware/auth.middleware';
import * as adminController from './admin.controller';

const router = Router();

router.get('/admin/stats', verifyToken, verifyAdmin, adminController.getStats);

export default router;

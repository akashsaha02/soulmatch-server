import { Router } from 'express';
import * as authController from './auth.controller';

const router = Router();

router.post('/jwt', authController.createJwt);

export default router;

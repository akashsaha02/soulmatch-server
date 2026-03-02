import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import * as biodatasController from './biodatas.controller';

const router = Router();

router.get('/biodatas', biodatasController.getAll);
router.get('/biodatas/details/:id', verifyToken, biodatasController.getById);
router.get('/biodatas/:email', biodatasController.getByEmail);
router.post('/biodatas', verifyToken, biodatasController.createOrUpdate);

export default router;

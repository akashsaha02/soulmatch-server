import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../../middleware/auth.middleware';
import * as usersController from './users.controller';

const router = Router();

router.get('/users/admin/:email', verifyToken, usersController.checkAdmin);
router.get('/users/:email', verifyToken, usersController.getByEmail);
router.get('/users', verifyToken, verifyAdmin, usersController.getAll);
router.post('/users', usersController.create);
router.patch('/users/role/:id', verifyToken, verifyAdmin, usersController.updateRole);
router.delete('/users/:id', verifyToken, verifyAdmin, usersController.deleteUser);

export default router;

import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import * as favouritesController from './favourites.controller';

const router = Router();

router.get('/favourites', verifyToken, favouritesController.getByEmail);
router.post('/favourites', verifyToken, favouritesController.create);
router.delete('/favourites/:id', verifyToken, favouritesController.deleteById);

export default router;

import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../../middleware/auth.middleware';
import * as premiumRequestsController from './premium-requests.controller';

const router = Router();

// Admin list first (before :email param)
router.get(
  '/admin/request-premium',
  verifyToken,
  verifyAdmin,
  premiumRequestsController.getAll
);
router.get(
  '/request-premium/:email',
  verifyToken,
  premiumRequestsController.getByEmail
);
router.post('/request-premium/:id', verifyToken, premiumRequestsController.create);
router.patch(
  '/admin/premium-requests/:id/approve',
  verifyToken,
  verifyAdmin,
  premiumRequestsController.approve
);
router.delete(
  '/admin/premium-requests/:id',
  verifyToken,
  premiumRequestsController.deleteRequest
);

export default router;

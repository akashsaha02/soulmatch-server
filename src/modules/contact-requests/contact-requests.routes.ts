import { Router } from 'express';
import { verifyToken, verifyAdmin } from '../../middleware/auth.middleware';
import * as contactRequestsController from './contact-requests.controller';

const router = Router();

router.post('/payments', verifyToken, contactRequestsController.createPayment);
router.get('/contact-requests', verifyToken, contactRequestsController.getByEmail);
router.delete('/contact-requests/:id', verifyToken, contactRequestsController.deleteById);
router.patch(
  '/admin/contact-requests/:id',
  verifyToken,
  verifyAdmin,
  contactRequestsController.approve
);
router.get(
  '/admin/contact-requests',
  verifyToken,
  verifyAdmin,
  contactRequestsController.getAll
);

export default router;

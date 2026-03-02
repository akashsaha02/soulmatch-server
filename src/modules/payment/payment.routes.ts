import { Router } from 'express';
import { verifyToken } from '../../middleware/auth.middleware';
import * as paymentController from './payment.controller';

const router = Router();

router.post('/create-payment-intent', verifyToken, paymentController.createPaymentIntent);

export default router;

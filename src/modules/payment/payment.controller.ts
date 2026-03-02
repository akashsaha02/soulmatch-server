import type { Request, Response } from 'express';
import { paymentService } from './payment.service';

export async function createPaymentIntent(req: Request, res: Response): Promise<void> {
  const { price } = req.body;
  const { clientSecret } = await paymentService.createPaymentIntent(price);
  res.send({ clientSecret });
}

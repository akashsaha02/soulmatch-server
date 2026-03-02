import Stripe from 'stripe';
import { env } from '../../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const paymentService = {
  async createPaymentIntent(amount: number): Promise<{ clientSecret: string | null }> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    return { clientSecret: paymentIntent.client_secret };
  },
};

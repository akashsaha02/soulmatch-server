import 'dotenv/config';

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || '',
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  CORS_ORIGINS: [
    'http://localhost:5173',
    'https://soulmatch-b2923.web.app',
    'https://soulmatch-b2923.firebase.app',
  ],
};

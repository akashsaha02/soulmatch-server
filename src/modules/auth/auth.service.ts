import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export const authService = {
  createToken(payload: Record<string, unknown>): string {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  },
};

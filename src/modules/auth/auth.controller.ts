import type { Request, Response } from 'express';
import { authService } from './auth.service';

export async function createJwt(req: Request, res: Response): Promise<void> {
  const user = req.body;
  const token = authService.createToken(user);
  res.send({ token });
}

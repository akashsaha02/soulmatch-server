import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getCollections } from '../config/database';

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.headers.authorization) {
    res.status(401).send({ message: 'Unauthorized request' });
    return;
  }

  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    res.status(401).send({ message: 'Unauthorized request' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as { email: string };
    req.decoded = decoded;
    next();
  } catch {
    res.status(403).send({ message: 'Forbidden request' });
  }
}

export async function verifyAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const email = req.decoded?.email;
  if (!email) {
    res.status(403).send({ message: 'Forbidden request' });
    return;
  }

  const { users } = getCollections();
  const user = await users.findOne({ email });
  const isAdmin = user && (user as { role?: string }).role === 'admin';
  if (!isAdmin) {
    res.status(403).send({ message: 'Forbidden request' });
    return;
  }
  next();
}
